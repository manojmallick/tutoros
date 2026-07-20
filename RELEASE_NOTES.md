# TutorOS 1.1.0

TutorOS 1.1 adds an honest, credential-free generation path for the complete judge flow. When
`OPENAI_API_KEY` is absent, deterministic local fixtures return the same validated response shapes
as live GPT-5.6 generation and the interface clearly labels them as mock responses.

## Added

- Schema-valid mock lesson-plan and parent-report generation without an API key.
- Explicit `live` or `mock` source metadata on generated content.
- Purple mock-response highlighting and no-API-call notices throughout the closed loop.
- Route and logic coverage for both credential-free generation flows.

## Verification

- 12/12 production-logic Evidence Integrity Benchmark.
- 74/74 automated tests across 14 test files.
- Type checking, linting, and the production build.

## TutorOS 1.0.0

TutorOS 1.0 proves one connected claim: observed tutoring evidence should shape the next lesson and
the parent update, with a human tutor accountable for the final packet.

## Included

- Editable, validated 45-minute lesson plan with optional GPT‑5.6 generation.
- Session evidence log and transparent 3/7/14-day mastery scheduling.
- Closed-loop next-session retrieval brief with exact evidence provenance.
- Evidence-grounded parent update protected by the named Honesty Gate.
- Three-session learner trajectory with an honest recent-transfer-gap state.
- Revocable tutor sign-off that gates copying.
- 12/12 production-logic Evidence Integrity Benchmark and 72/72 tests.
- Credential-free public judge path, privacy notice, health endpoint, security headers, and
  deployment preflight.

## Release boundary

Vercel reports `https://tutoros-sand.vercel.app` as a Ready production deployment. A human still
needs to smoke-test the public flow after the release PR is merged. The public demo video, the
`/feedback` Session ID, and the final Devpost submission also remain explicit human actions.
