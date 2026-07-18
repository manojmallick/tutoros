# TutorOS

TutorOS turns what actually happened in a tutoring session into the next teaching decision
and an evidence-grounded parent update. Version 0.2.0 adds a GPT-5.6 lesson-plan vertical
slice to the responsive, no-login walkthrough built around a synthetic Tuesday session.

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

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Project structure

- `app/` — Next.js page, layout, global styles, and metadata routes.
- `app/api/lesson-plan/` — validated server-only GPT-5.6 generation endpoint.
- `src/logic/` — TutorOS domain model, synthetic scenario, and unit tests.
- `lib/seo/` — shared metadata and structured-data helpers.
- `TUTOROS_EDUCATION_PLAN.md` — hackathon product and delivery plan.

## Deploy

Push to a Vercel-linked Git repository or run `vercel deploy`. Set
`NEXT_PUBLIC_SITE_URL` to the deployed canonical URL.
