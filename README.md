# WebLens AI

**Analyze. Understand. Improve.**

A deterministic website analysis engine enhanced by generative AI.

Enter a public URL. WebLens fetches the page, applies a fixed set of technical
checks, scores it across five categories, and then asks a language model to
explain the findings, prioritise them and suggest code fixes.

The distinction that drives the whole architecture: **the rule engine
determines the score, the AI only explains it.** The application remains fully
useful when no AI provider is reachable.

---

## Running it

Two processes. Both need to be running.

```bash
cd server && npm install && npm run dev
```

```bash
cd client && npm install && npm run dev
```

The client dev server proxies `/api` to the backend, so open
<http://localhost:5173>.

### Environment

Server secrets live in `server/.env` and never reach the browser. Copy
`server/.env.example` and fill it in:

```
GROQ_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
PORT=5174
```

`server/.env` is gitignored. The client has no secrets of any kind — it only
ever talks to the Express API.

### Tests

```bash
cd server && npm test
```

Runs two suites: the rule engine against fixture HTML (a broken page is detected
across every category, a clean page raises nothing serious, the overall score
equals the documented weighting), and the AI failover chain against stub
providers (it walks on 429/4xx/5xx, skips unconfigured providers, returns null
when exhausted, and drops any issue id the model invented).

---

## Architecture

```
client/                     React 19 + Vite + Tailwind v4
  src/
    components/ui/          Button, Input, Badge, Card, Tabs, CodeBlock…
    components/report/      ScoreRing, CategoryBars, IssueCard, AIInsight, Roadmap
    components/analyzer/    AnalysisProgress
    components/home/        HeroReport
    pages/                  Home, Analyzer, Report, History, About
    animations/             GSAP helpers + the runAnimation safety wrapper
    services/api.js         The only place the client talks to the server
    demo/                   Pre-generated sample report (competition fallback)
    styles/tokens.css       The entire design system

server/                     Express 5, ES modules
  src/
    services/analyzer/      The rule engine — pure, no AI, no database
      checks/               seo, accessibility, structure, links, performance
      score.js              Weighting and severity ordering
      analyzer.test.js      Self-check
    services/ai/            Provider chain, prompt, sanitising
    services/db.js          Supabase access (the only module that touches it)
    controllers/            Request handling and response shaping
    utils/safeFetch.js      SSRF guard + byte cap + redirect re-validation
```

### Scoring

Each category starts at 100 and loses a fixed penalty per issue found.

| Category      | Weight |
| ------------- | ------ |
| SEO           | 25%    |
| Accessibility | 25%    |
| Structure     | 20%    |
| Links         | 15%    |
| Performance   | 15%    |

`overall = Σ(category × weight)`. No randomness, no model input. The same HTML
always produces the same number, and every point lost traces to a named issue.

### AI failover

Three providers in a fixed order:

```
Groq  →  Gemini  →  OpenAI
```

On a `429`, a `5xx`, a timeout or a network failure, the request moves to the
next provider immediately. The user is never asked to retry. If all three are
exhausted, the deterministic report is returned with an honest banner saying
AI insight is unavailable.

One AI request per analysis — never per issue or per card.

### What the AI is not allowed to do

Prompting alone does not hold a model to a contract, so the constraints are
enforced in `services/ai/chain.js` after every generation:

- **Roadmap steps are rebuilt from the findings.** One step per real finding,
  no more. A model that pads a two-issue report into a five-step plan with
  "run an SEO crawl" and "add Twitter Card tags" has those steps discarded —
  they map to no finding.
- **Priority is derived from the rule engine's severity**, never taken from
  the model. A `low` finding renders as low priority no matter how urgent the
  model wanted to sound.
- **Ordering follows the engine's severity ranking**, and steps are renumbered
  afterwards.
- **Every issue id is checked.** Invented ids in priorities, explanations or
  code fixes are dropped before storage, so a fabricated finding can never
  appear beside a measured one.
- A category scoring 100 is described as "no problems found", never
  "perfect" — the checks are a fixed list, not an exhaustive audit.

### AI caching

`ai_insights.findings_hash` is a SHA-256 of the normalised findings (URL,
category scores and the sorted set of issue ids) plus an `INSIGHT_VERSION`
constant — bump it whenever the prompt or report shape changes, or cached rows
in the old format are served indefinitely. Re-analysing an unchanged
site reuses the stored generation and costs nothing. A site that genuinely
changed produces different findings and regenerates.

### Progress reporting

`POST /api/analyze` responds as a Server-Sent Events stream. Each stage event
is emitted by the analyzer as that stage actually begins — there is no timer
and no interpolated percentage. If a stage is slow, the UI sits on it.

### API

| Method | Path                      | Purpose                               |
| ------ | ------------------------- | ------------------------------------- |
| `POST` | `/api/analyze`            | Run an analysis (SSE stream)          |
| `GET`  | `/api/analyses`           | History list                          |
| `GET`  | `/api/analyses/:id`       | One report, with issues and AI        |
| `GET`  | `/api/analyses/:id/issues`| Issues only                           |
| `POST` | `/api/analyses/:id/ai`    | Generate or fetch cached AI insight   |
| `GET`  | `/api/health`             | Liveness and database status          |

---

## What WebLens does not do

Stated plainly because an analyzer that overclaims is worse than no analyzer:

- It does not render the page or execute JavaScript. Content injected by
  client-side scripts is not analyzed.
- It does not measure load time or Core Web Vitals. Performance findings are
  **structural signals** — script counts, missing dimensions, DOM size — and
  are labelled as such throughout the UI.
- It does not crawl. One URL per analysis.
- It does not check whether links resolve, so it never claims a link is broken.
- It never modifies your site. Suggested fixes are text to copy.

---

## Security

- All keys are server-side. The client bundle contains no secret and no
  provider name.
- `safeFetch` resolves the target host and rejects private, loopback,
  link-local and CGNAT ranges before connecting, and re-validates after every
  redirect — a public host cannot redirect the fetcher to `127.0.0.1`.
- Responses are capped at 3 MB and 12 seconds, streamed with a byte ceiling
  rather than trusting `content-length`.
- Row Level Security is enabled on all tables with no policies. The API is
  served exclusively by Express using the service role key; the browser never
  talks to PostgREST.
- Model output is sanitised before storage: any issue id the model invented is
  dropped, so the UI cannot display a fabricated finding.

---

## Demo mode

`?demo=1` on `/report/demo` or `/history` renders a pre-generated sample and
labels it as demo data on screen.

It exists as a reliability fallback for live demonstration when the venue
network, the target site or a provider is unavailable. Normal analysis never
silently falls back to it.

---

## Motion

Motion is used where it carries meaning, and every animated block is required
to survive its animation failing.

- **GSAP** — score count-up, the ring sweep, category bars, the hero sequence,
  scroll reveals.
- **Motion** — component transitions, issue expansion, filter changes, the
  mobile menu, list stagger.
- **Lenis** — smooth page scrolling only.

`animations/runAnimation.js` exists because animations must never be the reason
content is missing or wrong. It applies the finished state immediately under
`prefers-reduced-motion` or while the page is hidden, and enforces a wall-clock
deadline otherwise — a score still counting toward 82 but reading 8 after
several seconds is worse than no animation at all.

Smooth scrolling is likewise treated as an enhancement: `useSmoothScroll`
tears Lenis down automatically if the frame loop does not prove itself within
the first second, because a stalled scroll hijack leaves the page genuinely
unscrollable.
