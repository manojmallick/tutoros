# GPT-5.6 and Codex evidence

This document separates verified build-time model use from optional runtime model use and from the
credential-free fixtures shown in the public demo.

## Verified build-time evidence

| Field | Verified value |
|---|---|
| Codex `/feedback` Session ID | `019f74c8-b8f0-7be3-bb77-d619e28f77cb` |
| Project directory recorded by Codex | `/Users/manojmallick/Documents/tutorsOS` |
| Model recorded in the task metadata | `gpt-5.6-sol` |
| First recorded turn context | `2026-07-18T10:32:34.623Z` |
| Verification snapshot | 25 turn-context records through `2026-07-20T21:21:27.204Z`; every record names `gpt-5.6-sol` |

The session ID is the primary organizer-verifiable evidence and is entered into Devpost's required
`/feedback` field. The verification snapshot was derived from the local Codex session metadata,
not from application source code or a manually entered model label.

## What GPT-5.6 in Codex contributed

The task began with an education-product plan and used versioned issue-to-PR slices. GPT-5.6 in
Codex helped reason about and implement these concrete decisions:

| Slice | Verifiable repository artifact |
|---|---|
| Runnable foundation | PR #2 and merge `014991b` |
| GPT-5.6 lesson-plan structured-output adapter | PR #4 and merge `9643905` |
| Session evidence and deterministic mastery | PR #6 and merge `d60b7e6` |
| Evidence-grounded parent report and Honesty Gate | PR #8 and merge `8299830` |
| Judge-ready walkthrough | PR #10 and merge `5e2d2cb` |
| Closed-loop next-session provenance | PR #12 and merge `bc81f36` |
| Evidence Integrity Benchmark | PR #14 and merge `771ed7d` |
| Three-session trajectory and tutor sign-off | PR #16 and merge `e6d7e29` |
| Deployment candidate and submission release | PRs #18 and #20 |
| Credential-free, honestly labeled mock fallback | PR #22 and merge `c9990e8` |

## Runtime boundary

TutorOS has two server-only adapters that request `gpt-5.6` through the OpenAI Responses API when
`OPENAI_API_KEY` is present:

- `/api/lesson-plan` creates the initial or next-session structured lesson plan.
- `/api/parent-report` creates a structured evidence-cited report before the deterministic Honesty
  Gate runs.

The public deployment is intentionally credential-free. Its purple mock responses are deterministic
local fixtures with the same validated application schema. They are not ChatGPT responses, are not
OpenAI API output, and are never offered as evidence of a live model call.

## Reproduction and inspection

Judges can inspect the public artifacts without access to local Codex metadata:

- Repository history: `git log --merges --oneline --grep='Merge pull request'`
- Automated tests: `pnpm test`
- Evidence benchmark: `pnpm benchmark`
- Public no-key product path: <https://tutoros-sand.vercel.app>
- Session verification: use the `/feedback` Session ID above through the hackathon's organizer
  workflow.

Do not publish the full local Codex session JSONL. It contains conversation and tool history that is
not required for judging; the `/feedback` ID is the appropriate verification mechanism.
