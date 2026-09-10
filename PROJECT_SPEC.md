# WEBLENS AI — PROJECT SPECIFICATION

## 1. Product

**Name:** WebLens AI  
**Tagline:** Analyze. Understand. Improve.

WebLens AI is an AI-powered website quality analyzer.

A user enters a public website URL. WebLens performs deterministic technical analysis first, then uses Generative AI to explain findings, prioritize problems, recommend improvements, and generate suggested code fixes.

### Core product loop

ANALYZE → DETECT → EXPLAIN → FIX → RE-ANALYZE → IMPROVE

---

## 2. Core Product Principle

WebLens is **not** “ChatGPT for websites.”

WebLens is:

> **A deterministic website analysis engine enhanced by Generative AI.**

The rule engine determines measurable findings and scores. AI interprets those findings.

The application must remain useful if the AI provider is unavailable.

---

## 3. Target Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Motion / Framer Motion
- GSAP
- Lenis
- Lucide React
- Recharts where charts add value
- Selected 21st.dev components where appropriate

### Backend
- Node.js
- Express
- Cheerio
- native fetch or Axios
- dotenv
- CORS

### Database
- PostgreSQL through Supabase

### AI
Use a provider abstraction so multiple providers can be configured.

Potential providers:
- Gemini
- Groq
- OpenRouter

AI must be optional from the core analysis perspective.

---

## 4. Main Pages

### `/`
Landing page

### `/analyze`
Website analyzer

### `/report/:id`
Detailed analysis report

### `/history`
Previous analyses

### `/about`
How WebLens works

Potential future:
### `/settings`

Do not build unnecessary authentication/settings unless needed.

---

## 5. Landing Page

The landing page should immediately communicate:

> Analyze. Understand. Improve.

Supporting message:

> An intelligent website quality analyzer that combines deterministic web analysis with Generative AI to help you understand and improve your website.

Primary CTA:
**Analyze a Website**

Secondary CTA:
**See How It Works**

Sections:
1. Hero
2. How WebLens Works
3. Rule Engine + AI Engine
4. Example Report
5. Key Features
6. Before / After improvement concept
7. Technology / trust section
8. Final CTA
9. Footer

Use product/UI visualization instead of generic AI imagery.

---

## 6. Analyzer

User enters a public URL.

Example:

`https://example.com`

Flow:

1. Validate URL
2. Submit to backend
3. Fetch website
4. Parse HTML
5. Run rule-based checks
6. Calculate category scores
7. Calculate overall score
8. Persist analysis
9. Run one consolidated AI enhancement request where available
10. Persist AI result
11. Return report

Analysis stages should communicate real progress where possible:

- Fetching website
- Analyzing HTML
- Checking SEO
- Checking accessibility
- Analyzing links
- Evaluating structure
- Calculating score
- Generating AI insights

Do not fake technical progress.

---

## 7. Rule-Based Analysis Engine

The rule engine must work independently of AI.

### SEO checks
- Title exists
- Title length
- Meta description
- Viewport meta
- Canonical URL
- Heading structure
- Robots information if available

### Accessibility checks
- Images missing alt
- Empty alt where inappropriate
- Form inputs without labels
- Buttons without accessible names where detectable
- Links without useful text where detectable

### HTML / Structure checks
- H1 existence
- Multiple H1s
- Heading hierarchy
- Semantic elements
- Document structure

### Links
- Internal links
- External links
- Malformed links
- Broken-link checks only if safely and reliably implemented

### Performance signals
- Image count
- Large-image indicators if measurable
- Script count
- Stylesheet count
- Excessive DOM size
- Resource counts

Never claim to measure something that the system does not actually measure.

---

## 8. Scoring

Use deterministic, explainable scoring.

Initial weighting:

- SEO: 25%
- Accessibility: 25%
- Structure: 20%
- Links: 15%
- Performance: 15%

Formula:

`overallScore = SEO * 0.25 + Accessibility * 0.25 + Structure * 0.20 + Links * 0.15 + Performance * 0.15`

Keep scoring utilities separate from UI.

The AI does not determine the raw score.

---

## 9. AI Engine

The AI receives structured findings, not unnecessary full-page HTML.

Input example:

```json
{
  "url": "example.com",
  "overallScore": 72,
  "categories": {
    "seo": 78,
    "accessibility": 64,
    "structure": 81,
    "links": 70,
    "performance": 73
  },
  "issues": [
    {
      "category": "Accessibility",
      "severity": "high",
      "issue": "3 images are missing alt attributes"
    }
  ]
}
```

AI generates:
1. Executive summary
2. Top priorities
3. Issue explanations
4. Recommendations
5. Suggested code fixes
6. Improvement roadmap

Prefer one consolidated AI request per analysis.

---

## 10. AI Provider Architecture

Create an abstraction such as:

```text
AIService
AIProvider
GeminiProvider
GroqProvider
OpenRouterProvider
```

Fallback strategy:

Primary provider
→ fallback provider
→ deterministic report without AI

If AI fails, the report must still work.

Handle rate limits gracefully.

Never expose API keys to the frontend.

---

## 11. Database

Use Supabase PostgreSQL.

Suggested tables:

### users
- id
- name
- email
- created_at

### analyses
- id
- user_id
- url
- overall_score
- seo_score
- accessibility_score
- structure_score
- links_score
- performance_score
- raw_results
- created_at

### issues
- id
- analysis_id
- category
- severity
- title
- description
- recommendation
- metadata

### ai_insights
- id
- analysis_id
- summary
- priorities
- recommendations
- code_fixes
- created_at

Use JSON/JSONB where appropriate.

Do not over-engineer.

---

## 12. API

Suggested REST endpoints:

```text
POST /api/analyze
GET /api/analyses
GET /api/analyses/:id
GET /api/analyses/:id/issues
POST /api/analyses/:id/ai
```

Keep routes/controllers/services separated.

Suggested backend:

```text
server/
  src/
    controllers/
    routes/
    services/
      analyzer/
      ai/
    utils/
    middleware/
    config/
    app.js
    server.js
```

---

## 13. Report

The report is the most important page.

Show:
- URL
- analysis timestamp
- overall score
- category scores
- AI executive summary
- prioritized issues
- recommendations
- suggested fixes
- improvement roadmap
- history/re-analysis information

Main score example:

`82 / 100`

Category examples:

```text
SEO             86
Accessibility   74
Structure       91
Links           88
Performance     78
```

---

## 14. AI Fix Experience

For code-fixable issues, show:

### Before

```html
<img src="/campus.jpg">
```

### Suggested Fix

```html
<img
  src="/campus.jpg"
  alt="Students working in the computer laboratory"
/>
```

Label these as **Suggested Fix**.

Never claim that WebLens automatically changed the user's website.

Include a copy-code interaction.

---

## 15. Improvement Loop

When the same website is analyzed again:

```text
Previous: 67
Current: 82
Improvement: +15
```

The product story is:

ANALYZE → FIX → RE-ANALYZE → IMPROVE

---

## 16. History

Store previous analyses.

Show:
- URL
- score
- date
- issue count
- AI availability

Users can open previous reports.

---

## 17. Demo Mode

Because this is a competition project, include a reliable demo mode.

Demo mode should provide a pre-generated realistic analysis and demonstrate:

- Analysis
- Score
- Issues
- AI summary
- Recommendations
- Code fixes
- History
- Before/after improvement

Normal URL analysis must remain real.

Demo mode exists as a competition reliability fallback.

---

## 18. Error Handling

Handle:
- Invalid URL
- Unreachable website
- Timeout
- Blocked website
- Malformed HTML
- AI unavailable
- AI rate limit
- Database failure
- Network failure

Never show raw stack traces.

If AI fails, show:

> AI insights are temporarily unavailable. Your technical analysis is still available.

---

## 19. Security

Never expose secrets in React.

Use server-side environment variables.

Example:

```env
AI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

Provide `.env.example`.

Never commit `.env`.

Validate/sanitize URLs.

Protect the URL-fetching service against obvious SSRF risks and prevent requests to internal/private network addresses.

---

## 20. Frontend Structure

Suggested:

```text
src/
  components/
    ui/
    layout/
    analyzer/
    report/
    charts/
  pages/
    Home.jsx
    Analyzer.jsx
    Report.jsx
    History.jsx
    About.jsx
  hooks/
  services/
  lib/
  utils/
  animations/
  styles/
```

Do not create giant components.

---

## 21. Reusable Components

Create reusable components such as:

- Navbar
- Hero
- URLInput
- AnalyzeButton
- AnalysisProgress
- ScoreCard
- CategoryScore
- IssueCard
- SeverityBadge
- AIInsight
- CodeDiff
- RecommendationCard
- ImprovementTimeline
- ScoreChart
- HistoryTable
- Footer

---

## 22. Competition Demo Flow

The product should naturally support a 3–5 minute presentation:

1. Landing page
2. Enter URL
3. Start analysis
4. Show analysis progress
5. Reveal score
6. Show category scores
7. Show detected issues
8. Show AI summary
9. Open an issue
10. Show AI explanation
11. Show suggested code fix
12. Show improvement plan
13. Show history
14. Demonstrate improvement/re-analysis concept

---

## 23. Development Priorities

Build in this order:

1. Working URL analyzer
2. Rule engine
3. Scoring
4. Backend API
5. Database
6. Beautiful report
7. AI summary
8. AI recommendations
9. AI code fixes
10. History
11. Demo mode
12. Motion polish
13. Responsive polish
14. Testing

Do not spend early time on unnecessary features.

---

## 24. Quality Bar

The result should feel like:

> A polished developer product that could be launched publicly.

Not:

> A college CRUD project.

It must be:
- functional
- responsive
- technically explainable
- visually polished
- AI-powered
- reliable
- easy to demonstrate
- easy to understand

---

## 25. Source of Truth

`PROJECT_SPEC.md` defines the product requirements.

`DESIGN_SYSTEM.md` defines visual/design requirements.

When implementing later features, do not silently contradict either document.

If a requirement is ambiguous, choose the simplest implementation that preserves the product concept and document the decision.
