# TutorOS

TutorOS turns what actually happened in a tutoring session into the next teaching decision,
the next lesson brief, and an evidence-grounded parent update. Version 0.7.0 adds a reproducible
12-case Evidence Integrity Benchmark to the judge-ready, no-login workflow.

## Evidence chain

1. Start with the previous lesson and the student&apos;s current struggle.
2. Shape a focused 45-minute lesson plan.
3. Capture concrete breakthroughs and difficulties during the session.
4. Turn that evidence into a mastery decision with a transparent review date.
5. Carry the decision into a five-minute retrieval task, support progression, next focus, mastery
   check, and honest parent update.

The public demo uses synthetic student data. Do not enter real student or minor data into this
foundation build.

## 90-second judge walkthrough

1. Read Maya’s parent update in the first viewport and note the visible Honesty Gate proof.
2. Open **See the 12/12 benchmark** and inspect the named mastery, report-integrity, and provenance
   checks. The score is calculated from production logic and can be reproduced with `pnpm benchmark`.
3. Select **Start 90-second demo**, then inspect the preloaded 45-minute lesson plan.
4. In **Session evidence**, change Attempt 4 from Incorrect to Correct and select **Update mastery
   decision**. The evidence score becomes 85%, the status becomes Secure, and review moves from
   2026-07-17 to 2026-07-28.
5. Open **Next session** to see the brief change from model-prompt-independent remediation to
   independent retrieval, transfer, and stretch. Its review target and breakthrough remain linked
   to the exact attempt observations; **Generate next lesson with GPT-5.6** is optional.
6. Follow **Copy update** to the final artifact. The existing safe sample remains available without
   credentials; **Generate parent update** is another optional live GPT-5.6 action.
7. Select **Reset demo** to restore Maya’s original plan, four attempts, 60% mastery decision,
   three-day next-session brief, report text, and passed Honesty Gate.

The spark-marked generation actions require `OPENAI_API_KEY`. All other steps—including editing
evidence, deterministic mastery scheduling, reviewing source traces, copying the report, and
resetting the walkthrough—work without credentials. Editing evidence marks the brief stale until
mastery is recomputed, so an old generated lesson cannot be mistaken for the current decision.

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

The next-session brief is also deterministic and schema-validated. It selects the latest difficult
attempt as the retrieval target (or the latest attempt after a secure session), retains the latest
independent breakthrough as provenance, and differentiates the support sequence for Needs
reinforcement, Developing, and Secure decisions. Its optional GPT-5.6 action reuses the validated
lesson-plan endpoint; an API failure never replaces the credential-free brief.

The Evidence Integrity Benchmark runs 12 named synthetic adversarial fixtures through those same
production functions: four mastery-scheduling checks, four Honesty Gate checks, and four
closed-loop provenance checks. It records expected and observed behavior for every case, derives
its category totals from the results, and fails the benchmark command if any regression appears.
It is a product regression suite, not a claim that TutorOS is a validated learning-science model.

## Verify

The current suite contains 51 passing tests, including the 12/12 benchmark contract, mastery
boundaries and rollover, next-session differentiation and provenance, Honesty Gate regressions,
both API routes, and deployment URL normalization.

```bash
pnpm typecheck
pnpm lint
pnpm benchmark
pnpm test
pnpm build
```

## Project structure

- `app/` — Next.js page, layout, global styles, and metadata routes.
- `app/api/lesson-plan/` and `app/api/parent-report/` — validated server-only GPT-5.6 endpoints.
- `src/logic/` — TutorOS domain model, next-session engine, benchmark runner, fixtures, and tests.
- `lib/seo/` — shared metadata and structured-data helpers.
- `TUTOROS_EDUCATION_PLAN.md` — hackathon product and delivery plan.

## Deploy

Push to a Vercel-linked Git repository or run `vercel deploy`. Set
`NEXT_PUBLIC_SITE_URL` to the deployed canonical URL and `OPENAI_API_KEY` to enable the two live
GPT-5.6 endpoints across three UI actions. Without a configured canonical URL, metadata truthfully
falls back to `http://localhost:3000` rather than publishing an example domain.
