# TutorOS

TutorOS turns what actually happened in a tutoring session into the next teaching decision
and an evidence-grounded parent update. Version 0.4.0 links the editable session evidence and
deterministic mastery decision to a GPT-5.6 parent-report workflow with a named Honesty Gate.

## Evidence chain

1. Start with the previous lesson and the student&apos;s current struggle.
2. Shape a focused 45-minute lesson plan.
3. Capture concrete breakthroughs and difficulties during the session.
4. Turn that evidence into a mastery decision and an honest parent update.

The public demo uses synthetic student data. Do not enter real student or minor data into this
foundation build.

## Develop

Requirements: Node.js 24 and pnpm 10.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The editable synthetic sample works
without credentials. Add `OPENAI_API_KEY` to `.env.local` to generate new plans.

The key is read only by `POST /api/lesson-plan` on the server and is never sent to the browser.
The route uses the OpenAI Responses API, the `gpt-5.6` model alias, and Zod Structured Outputs
to produce a validated 45-minute plan with four increasing-difficulty practice problems.

`POST /api/parent-report` uses the same server-only Responses API pattern. It returns a validated
3-4 sentence draft plus the IDs of the session attempts used as evidence. The deterministic
Honesty Gate runs before that draft reaches the browser: it rejects unknown evidence, generic
praise, softened non-secure mastery, and reports that omit a recorded difficulty. The UI shows the
gate result and source observations explicitly, retains the last safe draft on failure, and keeps
the final wording editable for tutor review.

The session evidence panel records an outcome, support level, and observation for each practice
attempt. Its mastery scheduler is a transparent TutorOS product heuristic: it weights outcomes by
the support used, schedules developing evidence sooner, and forces a three-day review when recent
attempts decline or an independent attempt is incorrect. It is deterministic, runs entirely in the
browser, and uses the recorded ISO session date for UTC-safe review dates. It is not presented as a
validated learning-science model.

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Project structure

- `app/` — Next.js page, layout, global styles, and metadata routes.
- `app/api/lesson-plan/` and `app/api/parent-report/` — validated server-only GPT-5.6 endpoints.
- `src/logic/` — TutorOS domain model, synthetic scenario, and unit tests.
- `lib/seo/` — shared metadata and structured-data helpers.
- `TUTOROS_EDUCATION_PLAN.md` — hackathon product and delivery plan.

## Deploy

Push to a Vercel-linked Git repository or run `vercel deploy`. Set
`NEXT_PUBLIC_SITE_URL` to the deployed canonical URL.
