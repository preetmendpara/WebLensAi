/**
 * The three providers, each reduced to one job: take a prompt, return
 * text, or throw. Rate limits and outages are signalled by throwing an
 * error with `retryable = true` so AIService can move down the chain.
 */

const TIMEOUT_MS = 30_000;

class ProviderError extends Error {
  constructor(message, retryable) {
    super(message);
    this.retryable = retryable;
  }
}

async function post(url, { headers, body }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // 429 and 5xx mean "try someone else"; 4xx means our request is wrong
      // and the next provider would reject it too.
      const retryable = res.status === 429 || res.status >= 500;
      throw new ProviderError(
        `HTTP ${res.status} ${text.slice(0, 200)}`,
        retryable,
      );
    }
    return res.json();
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    // Network failure or timeout: the provider is unreachable, move on.
    throw new ProviderError(err.name === "AbortError" ? "timeout" : err.message, true);
  } finally {
    clearTimeout(timer);
  }
}

/** OpenAI-compatible chat completions — used by both Groq and OpenAI. */
function chatCompletions({ name, url, model, keyEnv }) {
  return {
    name,
    model,
    get key() {
      return process.env[keyEnv];
    },
    async generate({ system, user }) {
      const data = await post(url, {
        headers: { authorization: `Bearer ${process.env[keyEnv]}` },
        body: {
          model,
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        },
      });
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new ProviderError("empty response", true);
      return text;
    },
  };
}

export const groq = chatCompletions({
  name: "groq",
  url: "https://api.groq.com/openai/v1/chat/completions",
  model: "openai/gpt-oss-120b",
  keyEnv: "GROQ_API_KEY",
});

export const openai = chatCompletions({
  name: "openai",
  url: "https://api.openai.com/v1/chat/completions",
  model: "gpt-4o-mini",
  keyEnv: "OPENAI_API_KEY",
});

export const gemini = {
  name: "gemini",
  model: "gemini-2.5-flash",
  get key() {
    return process.env.GEMINI_API_KEY;
  },
  async generate({ system, user }) {
    const data = await post(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
      {
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        },
      },
    );
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new ProviderError("empty response", true);
    return text;
  },
};
