# WebLens AI

**Analyze. Understand. Improve.**

A website quality analyzer that combines deterministic HTML analysis with generative AI. A rule engine inspects a page and produces scored findings; a language model then explains those findings, prioritises them and suggests code fixes.

The rule engine determines the score. The AI only interprets it. Analysis remains fully functional when no AI provider is reachable.

---

## Quick start

Requires Node.js 20+.

On Windows, run `start-weblens.bat`. It installs dependencies on first run, starts both processes and opens the browser once the client responds.

Manually, or on other platforms:

```bash
cd server && npm install && npm run dev
```

```bash
cd client && npm install && npm run dev
```

Client runs on port 5173 and proxies `/api` to the server on port 5174.

---

## Configuration

Server configuration lives in `server/.env`. Copy `server/.env.example` and populate it:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Primary AI provider (`gemini-3.5-flash-lite`) |
| `GROQ_API_KEY` | First fallback |
| `OPENAI_API_KEY` | Second fallback |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_KEY` | Service role key |
| `PORT` | API port (default `5174`) |

All credentials are server-side. The client bundle contains no keys and communicates only with the Express API. `server/.env` is gitignored.

---

## Architecture

```
client/                     React 19, Vite, Tailwind CSS v4
  src/
    components/ui/          Button, Input, Badge, Card, Tabs, CodeBlock
    components/report/      ScoreRing, CategoryBars, IssueCard, AIInsight, Roadmap
    components/analyzer/    AnalysisProgress
    pages/                  Home, Analyzer, Report, History, About
    animations/             GSAP helpers and motion safety wrappers
    services/api.js         API client
    styles/tokens.css       Design tokens

server/                     Express 5, ES modules
  src/
    services/analyzer/      Rule engine — no AI or database dependency
      checks/               seo, accessibility, structure, links, performance
      score.js              Category weighting and severity ordering
    services/ai/            Provider chain, prompt, output sanitisation
    services/db.js          Supabase access layer
    controllers/            Request handling and response shaping
    utils/safeFetch.js      URL validation, SSRF guard, response limits
```

---

## Scoring

Each category begins at 100 and loses a fixed penalty for every finding.

| Category | Weight |
| --- | --- |
| SEO | 25% |
| Accessibility | 25% |
| Structure | 20% |
| Links | 15% |
| Performance | 15% |

`overall = Σ(category × weight)`

Scoring is deterministic and receives no model input. Identical HTML always produces an identical score, and every deducted point maps to a named finding.

---

## AI layer

### Provider failover

Providers are attempted in a fixed order:

```
Gemini → Groq → OpenAI
```

A `429`, `4xx`, `5xx`, timeout or network failure advances to the next provider immediately without user intervention. If all providers are exhausted, the deterministic report is returned with AI insight marked unavailable.

One consolidated request is issued per analysis.

The primary model is `gemini-3.5-flash-lite`. It was chosen by benchmark: `gemini-2.5-flash` returned an equally complete report but averaged 13.4 s against 3.4 s, its default thinking budget accounting for the difference.

### Caching

`ai_insights.findings_hash` is a SHA-256 of the normalised findings — URL, category scores and the sorted set of issue ids — combined with an `INSIGHT_VERSION` constant. Re-analysing an unchanged page reuses the stored generation. Increment `INSIGHT_VERSION` when the prompt or report schema changes, otherwise cached rows in the previous format continue to be served.

### Output constraints

Model output is validated in `services/ai/chain.js` before storage:

- Roadmap steps are reconstructed from the findings, one step per finding. Steps that map to no finding are discarded.
- Step priority is derived from the rule engine's severity, not from model output.
- Roadmap ordering follows severity ranking, with steps renumbered afterwards.
- Issue ids in priorities, explanations and code fixes are validated against the findings. Unrecognised ids are dropped.
- Code fixes must show an actual change. A fix with an empty `before` or `after`, or one whose two sides are identical, is discarded.

---

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/analyze` | Run an analysis (SSE stream) |
| `GET` | `/api/analyses` | List previous analyses |
| `GET` | `/api/analyses/:id` | Retrieve a report with issues and AI insight |
| `GET` | `/api/analyses/:id/issues` | Retrieve issues only |
| `POST` | `/api/analyses/:id/ai` | Generate or return cached AI insight |
| `GET` | `/api/health` | Liveness and database status |

`POST /api/analyze` responds as a Server-Sent Events stream. Stage events are emitted as each analyzer stage begins; no progress is interpolated or estimated.

---

## Scope

WebLens analyses the static HTML returned by a single request. Specifically, it does not:

- Render the page or execute JavaScript, so client-side generated content is not analysed.
- Measure load time, Core Web Vitals or bandwidth. Performance findings are structural signals such as request counts, missing image dimensions and DOM size.
- Crawl the site. One URL is fetched per analysis.
- Verify that links resolve, so no link is reported as broken.
- Modify the target site. Suggested fixes are provided as text.

---

## Security

- Credentials are server-side only. No key or provider name is exposed to the client.
- `safeFetch` resolves the target host and rejects private, loopback, link-local and CGNAT ranges before connecting, and revalidates after every redirect.
- Responses are capped at 3 MB and 12 seconds, streamed against a byte ceiling rather than a declared `content-length`.
- Row Level Security is enabled on all tables with no policies. The API is served exclusively by Express using the service role key; the browser does not access PostgREST directly.
- Model output is sanitised before storage, so a fabricated finding cannot be presented alongside a measured one.

---

## Testing

```bash
cd server && npm test
```

Two suites run without network access:

- **Rule engine** — verifies detection across all categories against fixture HTML, and that the overall score matches the documented weighting.
- **AI failover** — verifies chain traversal on `429`/`4xx`/`5xx`, skipping of unconfigured providers, a `null` result when exhausted, and output sanitisation.

Live provider verification, which consumes API quota, is run separately:

```bash
cd server && npm run check:ai
```

This issues a real request to each configured provider and validates that the response is complete: summary length, priority and explanation counts, code fixes containing distinct before and after values, and no fabricated issue ids.

---

## Demo mode

Appending `?demo=1` to `/report/demo` or `/history` renders a pre-generated sample report, labelled as sample data in the interface. It is a presentation fallback for environments without network access. Standard analysis never falls back to it.

---

## Motion

- **GSAP** — score counters, ring progression, category bars, scroll reveals.
- **Motion** — component transitions, issue expansion, mobile navigation.
- **Lenis** — smooth page scrolling.

`animations/runAnimation.js` applies an animation's final state immediately under `prefers-reduced-motion` or while the document is hidden, and enforces a wall-clock deadline otherwise, so content is never left hidden or partially counted when frame delivery stalls. `useSmoothScroll` removes Lenis if its frame loop does not initialise within the first second, preserving native scrolling.

List entrances use CSS animation rather than JavaScript, as CSS animation time is wall-clock based and cannot strand an element mid-transition.
