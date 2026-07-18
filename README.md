# TutorOS

TutorOS turns what actually happened in a tutoring session into the next teaching decision,
the next lesson brief, and an evidence-grounded parent update. Version 1.0.0 packages the
judge-ready, no-login workflow with measured integrity, operational health, privacy guidance,
submission copy, and an artifact-first demo script.

## Evidence chain

1. Start with the previous lesson and the student&apos;s current struggle.
2. Shape a focused 45-minute lesson plan.
3. Capture concrete breakthroughs and difficulties during the session.
4. Turn that evidence into a mastery decision with a transparent review date.
5. Carry the decision into a five-minute retrieval task, support progression, next focus, mastery
   check, and honest parent update.
6. Require the tutor to review and sign off the current evidence, next step, and parent wording
   before the update can be copied.

The public demo uses synthetic student data. Do not enter real student or minor data into this
foundation build.

## 90-second judge walkthrough

1. Read Maya’s parent update in the first viewport and note the visible Honesty Gate proof.
2. Open **See the 12/12 benchmark** and inspect the named mastery, report-integrity, and provenance
   checks. The score is calculated from production logic and can be reproduced with `pnpm benchmark`.
3. Select **Start 90-second demo**, then inspect the preloaded 45-minute lesson plan.
4. Read **Three-session learner trajectory**: Maya moves from 45% to 63%, then 60% with a recent
   independent transfer gap rather than a falsely smooth improvement story.
5. In **Session evidence**, change Attempt 4 from Incorrect to Correct and select **Update mastery
   decision**. The latest trajectory point becomes 85% Secure, direction becomes Ready to extend,
   and review moves from 2026-07-17 to 2026-07-28.
6. Open **Next session** to see the brief change from model-prompt-independent remediation to
   independent retrieval, transfer, and stretch. Its review target and breakthrough remain linked
   to the exact attempt observations; **Generate next lesson with GPT-5.6** is optional.
7. Open **Tutor sign-off** and select **Review and sign off**. Only then does **Copy parent update**
   become available; no credentials are required for this governance check.
8. Change evidence or parent wording to see sign-off revoked, then select **Reset demo** to restore
   Maya’s original three-session trajectory, unsigned packet, report, and Honesty Gate state.

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

The learner trajectory accepts exactly three chronologically ordered session records and derives
every point through the same mastery scheduler used by the editable workspace. It reports score,
status, review interval, independent success, and support use without averaging away the latest
independent miss. The first two synthetic sessions remain fixed while Tuesday recomputes live.

Tutor sign-off is a deterministic integrity boundary, not a decorative approval badge. It
revalidates current evidence, recomputes the next-session brief and its exact sources, and runs the
parent wording through the Honesty Gate. Evidence or wording edits revoke approval, and the parent
update cannot be copied until the current packet is signed off.

The Evidence Integrity Benchmark runs 12 named synthetic adversarial fixtures through those same
production functions: four mastery-scheduling checks, four Honesty Gate checks, and four
closed-loop provenance checks. It records expected and observed behavior for every case, derives
its category totals from the results, and fails the benchmark command if any regression appears.
It is a product regression suite, not a claim that TutorOS is a validated learning-science model.

The submission release includes a no-store health contract, a strict canonical-URL preflight,
browser security headers, generation-request size limits, graceful fallback pages, and an explicit
privacy notice. The app remains useful without `OPENAI_API_KEY`; that credential enables only the
three optional spark-marked generation actions.

The release evidence is deliberately inspectable: [SUBMISSION.md](SUBMISSION.md) contains the
paste-ready project story and measured Codex/GPT-5.6 coverage, [CHALLENGES.md](CHALLENGES.md)
records four exact build problems and fixes, [DEMO_SCRIPT.md](DEMO_SCRIPT.md) keeps the recording
under three minutes, and [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) separates verified work from
human submission actions. The repository is provided under the [MIT License](LICENSE).

## Verify

The current suite contains 72 passing tests, including deployment readiness, health and security
contracts, API request hardening, three-session trajectory and sign-off boundaries, the 12/12
benchmark contract, mastery
boundaries and rollover, next-session differentiation and provenance, Honesty Gate regressions,
generation routes, and deployment URL normalization.

```bash
pnpm typecheck
pnpm lint
pnpm benchmark
pnpm test
pnpm build
```

For a production candidate environment, validate the final canonical URL separately:

```bash
NEXT_PUBLIC_SITE_URL=https://your-final-domain.example pnpm deployment:check
```

This command intentionally fails for missing, malformed, HTTP, credential-bearing, or local URLs.
It reports `OPENAI_API_KEY` as an optional capability and never prints its value.

## Project structure

- `app/` — Next.js page, layout, global styles, and metadata routes.
- `app/api/` — health plus validated, no-store server-only GPT-5.6 endpoints.
- `src/logic/` — domain model, trajectory and sign-off engines, benchmark, fixtures, and tests.
- `lib/deployment/` — production readiness and browser security contracts.
- `lib/seo/` — shared metadata and structured-data helpers.
- `TUTOROS_EDUCATION_PLAN.md` — hackathon product and delivery plan.
- `SUBMISSION.md` — paste-ready Education entry, measured coverage, and live links.
- `CHALLENGES.md` — real engineering challenge diary with exact fixes.
- `DEMO_SCRIPT.md` — artifact-first 2:45 recording script.
- `RELEASE_CHECKLIST.md` — verified release proof and remaining human actions.

## Deploy to Vercel

Current public deployment: [https://tutoros-sand.vercel.app](https://tutoros-sand.vercel.app).
Vercel reports the deployment as Ready; complete the human smoke checklist in
`RELEASE_CHECKLIST.md` before submitting it as the final judge URL.

1. Import this repository into Vercel as a Next.js project.
2. Set `NEXT_PUBLIC_SITE_URL` to the final public HTTPS URL for Production and Preview as
   appropriate. Do not use localhost or a placeholder URL for Production.
3. Optionally set the server-only `OPENAI_API_KEY` to enable the two generation endpoints across
   three UI actions. Never expose it with a `NEXT_PUBLIC_` prefix.
4. Run `pnpm deployment:check`, `pnpm benchmark`, and `pnpm build` against the candidate
   environment before promoting it.
5. Deploy through the linked Git branch or `vercel deploy`.

After deployment, verify:

```bash
curl -i https://your-final-domain.example/api/health
curl -I https://your-final-domain.example/
```

The health response should be `200`, show version `1.0.0`, report the real `12/12` Evidence
Integrity Benchmark, and describe live generation only as `configured` or
`optional_not_configured`. Confirm `/privacy`, `/manifest.webmanifest`, an unknown route, the
credential-free judge path, tutor sign-off, and mobile layout. Generation endpoints should return
an actionable `503` when the optional key is absent. The release documents claim only URLs that
were actually created; production promotion remains an explicit post-merge action.
