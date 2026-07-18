# TutorOS

TutorOS turns what actually happened in a tutoring session into the next teaching decision
and an evidence-grounded parent update. Version 0.1.0 is the runnable product foundation: a
responsive, no-login walkthrough built around one clearly labeled synthetic Tuesday session.

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

Open [http://localhost:3000](http://localhost:3000). No OpenAI API key is required for v0.1.0.

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Project structure

- `app/` — Next.js page, layout, global styles, and metadata routes.
- `src/logic/` — TutorOS domain model, synthetic scenario, and unit tests.
- `lib/seo/` — shared metadata and structured-data helpers.
- `TUTOROS_EDUCATION_PLAN.md` — hackathon product and delivery plan.

## Deploy

Push to a Vercel-linked Git repository or run `vercel deploy`. Set
`NEXT_PUBLIC_SITE_URL` to the deployed canonical URL.
