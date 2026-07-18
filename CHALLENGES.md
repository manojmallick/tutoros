# TutorOS — real engineering challenges

These are regressions and product-integrity risks encountered during the actual build. Each entry
names the assumption, the evidence that exposed it, and the shipped fix.

## 1. A strong average hid an independent miss

**Assumption:** A weighted average was enough to decide whether a topic could wait longer before
review.

**What exposed it:** Five independent correct attempts plus one independent incorrect attempt
produced an 83% score. A score-only classifier would call that Secure even though the learner had
just failed without support.

**Fix:** `calculateMasteryDecision` now treats an independent incorrect attempt as a governing
signal: status becomes Needs reinforcement and review returns in three days. The exact 83% case is
covered in `src/logic/mastery.test.ts` and the public Evidence Integrity Benchmark.

## 2. Edited evidence could leave downstream artifacts looking current

**Assumption:** Updating the mastery score was sufficient; the next lesson and parent report could
remain visible until regenerated.

**What exposed it:** In the judge flow, changing Attempt 4 altered mastery while the previous
next-session brief, report proof, and generated lesson preview still looked authoritative.

**Fix:** Evidence edits now mark the trajectory, brief, report, and tutor approval stale. Generated
next-lesson previews disappear until mastery is recomputed, and copy remains blocked until the
current packet is signed off. Browser verification exercises edit → stale → recompute → sign-off →
revocation → reset.

## 3. “Human review” risked becoming a decorative badge

**Assumption:** Showing an editable report and Honesty Gate result was enough to communicate tutor
control.

**What exposed it:** A user could still copy the parent update without proving that the current
evidence, next-session sources, and wording had been reviewed together.

**Fix:** `createTutorSignOff` deterministically recomputes the next-session brief, checks exact
provenance, runs the parent draft through the Honesty Gate, records the reviewed source IDs, and
unlocks copy only for that current packet. Any evidence or wording edit revokes approval.

## 4. A clean build was not the same as a deployable system

**Assumption:** Passing tests and `next build` meant the project was ready to publish.

**What exposed it:** The v0.8 audit found no health contract, no strict production URL check, no
global browser security policy, no public data-handling notice, and no benchmark step in CI.

**Fix:** v0.9 added `pnpm deployment:check`, a secret-safe `/api/health`, the real 12/12 benchmark in
CI, CSP and browser protections, no-store API responses, request-size limits, privacy/manifest/error
surfaces, and an operator smoke-test runbook.
