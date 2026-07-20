# TutorOS 1.1 — OpenAI Build Week submission package

## One claim

**This is what a real tutoring session produces—not a demo, a Tuesday.**

TutorOS turns observed session evidence into the next teaching decision, a traceable next-session
brief, and a parent update that an independent tutor can honestly stand behind.

## Paste-ready Devpost description

I tutor on Apprentus and Superprof. After every session I do the same invisible work: plan the next
lesson, choose practice at the right level, remember what the learner actually mastered, and write
a parent update that does not sound like a form letter. Independent tutors do this manually; large
tutoring organisations have systems for it.

TutorOS is evidence-grounded workflow infrastructure for that Tuesday-night job. The public demo
starts with a realistic 45-minute lesson plan, records four observable attempts, calculates a
transparent mastery decision, schedules the next review, and carries exact source observations into
a five-minute retrieval task and next-session support progression. It then creates an editable
parent update whose claims are linked to the session evidence.

The differentiator is governance. The named Honesty Gate rejects invented attempt IDs, generic
praise, misleading reassurance, and non-secure reports that omit a real difficulty. Tutor sign-off
recomputes the decision packet and keeps copy disabled until the current evidence, next-session
provenance, and parent wording agree. Any later edit revokes approval.

TutorOS also shows a three-session trajectory without manufacturing a smooth success story. Maya’s
synthetic history moves from 45% to 63%, then 60% with a recent independent transfer gap. Editing
the final attempt to correct changes only Tuesday to 85% Secure and moves review from three to
fourteen days.

This is measured, not claimed: a 12-case Evidence Integrity Benchmark runs against the production
mastery, Honesty Gate, and provenance functions, and all 12 cases pass. The repository has 74
passing tests, deployment preflight, a secret-safe health endpoint, security headers, privacy
guidance, and a credential-free judge path.

Codex with `gpt-5.6-sol` drove nine issue-to-PR iterations across the runnable foundation, GPT‑5.6 lesson-plan slice,
session evidence, parent reporting, judge flow, closed-loop next session, integrity benchmark,
learner trajectory and tutor sign-off, and deployment hardening. GPT‑5.6 powers three optional
generation actions through two validated server-only endpoints when a server API key is configured.
The public credential-free path uses visibly labeled local fixtures; they are not model output. The
core proof works without an API key.

## Category

Education

## Technical proof

- Next.js 16, React 19, TypeScript, Zod, Vitest, OpenAI Responses API.
- GPT‑5.6 structured outputs for lesson plans and evidence-grounded parent-report drafts.
- Deterministic mastery scheduler with decline and independent-miss overrides.
- 12/12 Evidence Integrity Benchmark: 4 mastery, 4 report integrity, 4 provenance.
- Three-session learner trajectory and revocable tutor sign-off.
- 74/74 tests, strict production preflight, `/api/health`, CSP, no-store APIs, privacy notice.

## Live links

- Vercel deployment: https://tutoros-sand.vercel.app
- Demo video: **HUMAN ACTION REQUIRED — add the public YouTube URL**
- Repository: https://github.com/manojmallick/tutoros
- Public judge path: https://tutoros-sand.vercel.app
- Devpost project: https://devpost.com/software/tutoros

## Devpost submission fields

| Field | Answer |
|---|---|
| Submitter Type | **HUMAN ACTION REQUIRED — Individual, Team of Individuals, or Organization** |
| Country of Residence | **HUMAN ACTION REQUIRED** |
| Category | Education |
| Repository | https://github.com/manojmallick/tutoros |
| Judge test link | https://tutoros-sand.vercel.app — no account, credential, or rebuild required; select **Start 90-second demo** |
| `/feedback` Session ID | `019f74c8-b8f0-7be3-bb77-d619e28f77cb` |

## Codex and GPT‑5.6 coverage — measured

| Measure | Result | Reproduce |
|---|---:|---|
| Issue-to-PR build iterations merged before 1.0 | 9 | `git log --merges --oneline --grep='Merge pull request'` |
| Tracked TypeScript/TSX files | 56 | `git ls-files '*.ts' '*.tsx' \| wc -l` |
| Production TypeScript/TSX files (excluding tests and `next-env.d.ts`) | 41 | `git ls-files '*.ts' '*.tsx' \| rg -v '(\\.test\\.|next-env\\.d\\.ts)' \| wc -l` |
| Test files | 14 | `git ls-files '*.test.ts' '*.test.tsx' \| wc -l` |
| Passing tests | 74/74 | `pnpm test` |
| Evidence benchmark | 12/12 | `pnpm benchmark` |
| Optional GPT‑5.6 calls in the complete live-generation flow | 3 | Initial plan + next-session plan + parent report |
| Server-only generation endpoints | 2 | `/api/lesson-plan`, `/api/parent-report` |
| Credential-free model calls | 0 | The preloaded judge path is deterministic |

## Values that must not be fabricated

- `/feedback` Codex Session ID: `019f74c8-b8f0-7be3-bb77-d619e28f77cb`
- Public YouTube demo URL: **HUMAN ACTION REQUIRED**
- Final Devpost submission confirmation: **HUMAN ACTION REQUIRED**
- Final live-URL smoke-test confirmation: **HUMAN ACTION REQUIRED**
