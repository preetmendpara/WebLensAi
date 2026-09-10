# WEBLENS AI — DESIGN SYSTEM

## WEBLENS DESIGN LAW

WebLens must NEVER look like a stereotypical AI-generated website.

No neon AI aesthetic.
No purple/blue glow overload.
No decorative gradients everywhere.
No excessive glassmorphism.
No random blobs.
No cyberpunk styling.
No unnecessary 3D objects.
No excessive rounded cards.
No giant gradient headings.
No visual noise.

The premium feel must come from:

- typography
- spacing
- hierarchy
- composition
- restraint
- interaction quality
- subtle motion
- excellent micro-interactions

**SUBTLE over FLASHY.**
**USEFUL over DECORATIVE.**
**POLISHED over COMPLICATED.**
**FAST over HEAVY.**
**REAL over AI-GENERATED-LOOKING.**

---

# 1. Design Personality

WebLens should feel:

- premium
- modern
- editorial
- technical
- minimal
- sophisticated
- confident
- calm
- precise
- developer-oriented

Design reference direction:

> Premium developer tool + modern editorial website + refined SaaS dashboard.

It should feel credible enough to be a real developer product.

---

# 2. Color System

Prefer a restrained palette.

### Base

- Background: white or warm white
- Primary text: near-black / charcoal
- Secondary text: muted gray
- Borders: subtle neutral gray
- Surface: very light neutral gray

Use ONE restrained brand accent.

Do not use multiple competing accent colors.

### Semantic colors

Use color primarily for meaning:

- Critical: red
- High: orange
- Medium: amber
- Low: blue/neutral
- Success: green

Semantic colors should be restrained.

Do not turn entire cards into saturated colored blocks.

Do not create glowing status indicators.

---

# 3. Gradients

Gradients are NOT a core part of WebLens.

Avoid:
- giant hero gradients
- purple-to-blue gradients
- neon gradients
- gradient borders
- glowing gradient buttons

If a gradient is ever used, it must be:
- subtle
- purposeful
- visually restrained

When in doubt, use a flat color instead.

---

# 4. Typography

Use a modern high-quality font.

Preferred choices:

1. Geist
2. Inter
3. Manrope
4. DM Sans
5. Plus Jakarta Sans

Choose one primary font and use it consistently.

Use a clear hierarchy:

Hero heading
→ supporting text
→ section heading
→ body
→ metadata

Avoid making every heading bold.

Use font weight intentionally.

---

# 5. Technical Typography

Use monospace typography for:

- URLs
- code
- selectors
- technical metrics
- HTTP information
- technical findings
- code diff sections

Possible font:

- Geist Mono
- JetBrains Mono
- IBM Plex Mono

Technical text should visually feel distinct from editorial copy.

---

# 6. Spacing

Use a consistent spacing scale.

Prefer generous whitespace.

The design should breathe.

Avoid:
- cramped cards
- excessive content density
- random padding values
- inconsistent gaps

Large sections should have clear vertical rhythm.

---

# 7. Layout

Use a strong grid.

Prefer:
- wide max-width containers
- clear alignment
- asymmetrical layouts where appropriate
- editorial compositions
- generous margins

Do not put every piece of information into a centered card.

Create visual rhythm through different layouts.

---

# 8. Cards

Cards should be used when they provide a clear grouping.

Do NOT make:
- everything a card
- cards inside cards inside cards
- every card heavily rounded
- cards with glowing borders

Preferred:
- subtle border
- restrained radius
- clean surface
- minimal shadow or no shadow

Some sections can simply use whitespace and dividers instead of cards.

---

# 9. Borders

Use subtle borders.

Borders should establish hierarchy, not decoration.

Avoid:
- bright borders
- gradient borders
- glowing borders
- thick outlines everywhere

---

# 10. Shadows

Use shadows sparingly.

Most WebLens components should not require a large shadow.

If a shadow is used:
- keep it soft
- keep it subtle
- use it to establish elevation

Do not use shadows as a replacement for good spacing.

---

# 11. Border Radius

Use moderate, consistent radii.

Avoid:
- huge pill shapes everywhere
- excessively rounded dashboards
- every element looking like a floating bubble

Buttons may use slightly rounded corners or pills when appropriate.

Cards should generally have a restrained radius.

---

# 12. Buttons

Buttons should feel tactile and premium.

Use:
- subtle hover state
- subtle press state
- focus state
- loading state
- disabled state

Use 21st.dev components selectively when they genuinely improve the design.

Avoid:
- neon glow
- giant gradients
- oversized shadows
- excessive shine effects

Primary CTA should be visually strong through typography, spacing and contrast.

---

# 13. Motion Philosophy

Motion is important, but motion must have purpose.

Every animation should answer:

> Why is this moving?

Good motion:
- score counts from 0 to final score
- issue cards stagger into view
- report sections reveal as the user scrolls
- charts animate on entry
- before/after code transitions
- navigation responds subtly to scroll
- buttons provide tactile feedback
- analysis stages transition smoothly

Bad motion:
- everything floating
- everything bouncing
- constant background movement
- random blobs
- huge parallax effects
- infinite spinning decorations
- animation for animation's sake

---

# 14. Animation Tools

Use the tools intentionally.

### GSAP

Use GSAP for:
- complex entrance sequences
- score/count animations
- scroll-driven effects
- advanced report transitions
- timeline-based animations

### Motion / Framer Motion

Use Motion for:
- component transitions
- modals
- dropdowns
- layout transitions
- hover interactions
- small state changes

### Lenis

Use Lenis for:
- smooth page scrolling

### 21st.dev

Use selected components when they fit the visual language.

Do NOT blindly import components because they are trendy.

---

# 15. Animation Timing

Prefer responsive motion.

Animations should generally feel:
- quick
- smooth
- controlled

Avoid slow cinematic animations for ordinary UI interactions.

Use easing intentionally.

Prefer transform/opacity animations for performance.

Avoid expensive continuous animations.

---

# 16. Reduced Motion

Respect:

`prefers-reduced-motion`

Users who request reduced motion should receive a simpler experience.

---

# 17. Landing Page

The landing page should feel editorial and premium.

### Hero

Large but controlled typography.

Example:

WEBLENS AI

Analyze.
Understand.
Improve.

Supporting copy beneath.

Primary CTA:
Analyze a Website

Secondary CTA:
See How It Works

Use a product interface visualization rather than generic AI imagery.

---

# 18. Hero Product Visualization

The hero can show a miniature WebLens report.

Example:

```text
WEBSITE HEALTH

82 / 100

SEO             86
Accessibility   74
Structure       91
Performance     78
```

Use subtle motion:
- values animate
- cards reveal
- tiny status changes

Do not use glowing neon dashboards.

---

# 19. How It Works Section

Show the two-engine concept.

```text
RULE ENGINE                 AI ENGINE

SEO                         Explanation
HTML                        Recommendations
Links                       Priorities
Accessibility               Suggested fixes
Structure                   Summary
Performance signals
```

Then:

```text
             FINAL REPORT
```

The relationship should be immediately understandable.

---

# 20. Analyzer Page

The analyzer should be focused.

Large URL input.

Clear CTA.

Avoid clutter.

When analysis begins, transition the interface into an analysis state.

Use a clean sequence:

Fetching
→ Parsing
→ Checking
→ Scoring
→ AI enhancement
→ Complete

Use real backend progress where possible.

---

# 21. Report Page

The report is the most important UI.

Hierarchy:

1. Website identity
2. Overall score
3. Category scores
4. AI summary
5. Issues
6. Recommendations
7. Suggested fixes
8. Improvement roadmap

The page should feel like a professional technical audit.

---

# 22. Score Visualization

Avoid generic glowing circular gauges.

Prefer:
- clean ring
- restrained progress indicator
- large numeric score
- horizontal bars
- elegant charts

The score should be visually important without becoming a gimmick.

---

# 23. Severity System

Use consistent semantic indicators.

Critical:
red

High:
orange

Medium:
amber

Low:
blue/neutral

Success:
green

Use small badges, icons or indicators.

Do not flood the UI with saturated colors.

---

# 24. Issue Cards

Each issue should clearly show:

- category
- severity
- title
- concise explanation
- evidence
- recommendation
- available AI action

Possible actions:

Explain
View Fix
Copy Fix

Keep interactions obvious.

---

# 25. AI Insight Section

AI should feel integrated, not bolted on.

Use a restrained visual distinction.

Do not:
- put a glowing robot icon everywhere
- use "AI MAGIC" labels
- animate sparkles around every AI feature
- make the AI section neon

Use language such as:

AI INSIGHT

or:

GENERATED ANALYSIS

Keep it professional.

---

# 26. Code Diff

Code should be highly readable.

Use:
- monospace font
- syntax highlighting
- clear Before / Suggested Fix labels
- copy button

The code block should look like a professional developer tool.

Avoid excessive colorful syntax highlighting.

---

# 27. Charts

Charts should communicate information.

Use:
- clean axes
- restrained labels
- subtle grid lines
- animation on entry

Do not make charts decorative.

---

# 28. History Page

History should feel like a developer tool.

Example:

```text
Website                  Score       Date

example.com              82          Sep 10
mysite.com               67          Sep 10
portfolio.dev            91          Sep 09
```

Use subtle row interactions.

Avoid excessive cards.

---

# 29. Mobile

Mobile is a first-class experience.

Do not simply shrink desktop.

On mobile:
- stack layouts
- simplify navigation
- preserve readable scores
- make code blocks horizontally scrollable
- make tables responsive
- maintain touch-friendly buttons

---

# 30. Accessibility

WebLens itself must have excellent accessibility.

Use:
- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- ARIA labels where needed
- reduced-motion support

An accessibility analyzer must not itself have poor accessibility.

---

# 31. Micro-interactions

Use subtle interactions for:
- buttons
- links
- tabs
- filters
- issue expansion
- copy code
- score reveal
- navigation
- hover states

Micro-interactions should reinforce the interface rather than distract from it.

---

# 32. Empty States

Empty states should be useful and concise.

Example:

"No analyses yet.

Enter a website URL to generate your first WebLens report."

Provide a clear CTA.

---

# 33. Loading States

Loading states should communicate progress.

Avoid generic:
"Loading..."

Prefer meaningful stages:

Fetching website
Analyzing HTML
Checking accessibility
Calculating score
Generating AI insights

Use skeletons or structured loading UI where appropriate.

---

# 34. Error States

Errors should feel calm and professional.

Example:

"We couldn't reach this website.

The site may be unavailable or blocking automated requests."

Then provide:
Try Again

For AI failure:

"Technical analysis completed. AI insights are temporarily unavailable."

---

# 35. Design Anti-Patterns

Never introduce these unless explicitly requested:

- neon purple
- neon blue
- cyberpunk
- glowing cards
- glowing text
- excessive gradients
- animated blobs
- star fields
- AI brain graphics
- robot illustrations
- excessive glassmorphism
- giant floating spheres
- excessive 3D
- random particles
- excessive pill UI
- huge shadows
- rainbow dashboards
- constant animation

---

# 36. Final Visual Test

Before finalizing a page, ask:

### Does it look like a generic AI-generated website?

If yes:
- remove decorative effects
- simplify colors
- improve typography
- improve spacing
- reduce rounded elements
- reduce gradients
- reduce animation
- strengthen hierarchy

### Does the design communicate the product?

If no:
- improve information hierarchy
- make the main action clearer
- show actual product UI
- reduce decorative content

### Does it feel premium without being flashy?

That is the target.

---

# 37. Product Design Principle

WebLens should communicate:

> Precision over spectacle.

The interface itself should embody the same philosophy as the product:

**Measure first. Explain clearly. Improve intelligently.**
