# TutorOS 1.0 release and submission checklist

Checked items are verified in the repository or automated workflow. Unchecked items require a real
human action or an external state change.

## Product and engineering proof

- [x] Synthetic Maya data is preloaded; judges do not land on an empty state.
- [x] Mastery scheduling, independent-miss override, and review dates are visible in the UI.
- [x] Three-session trajectory recomputes only the editable Tuesday session.
- [x] Honesty Gate and revocable tutor sign-off are visible in the judge path.
- [x] Evidence Integrity Benchmark passes 12/12 production-logic cases.
- [x] Test suite passes 72/72 tests.
- [x] Deployment preflight, health contract, security headers, privacy page, and fallbacks exist.
- [x] MIT license is present.
- [x] README, challenge diary, submission copy, and <=3-minute demo script are prepared.
- [x] Vercel deployment is Ready and recorded as `https://tutoros-sand.vercel.app`.
- [ ] Public deployment smoke-tested without login and without `OPENAI_API_KEY`.
- [ ] The 1.0.0 release PR is reviewed and merged to `main`.
- [ ] Final production deployment smoke-tested after the release PR is merged.

## Human submission actions

- [ ] Record the demo using `DEMO_SCRIPT.md` and keep the final edit under three minutes.
- [ ] Upload the video publicly to YouTube and add the real URL to `SUBMISSION.md`.
- [ ] Run `/feedback` in the genuine Codex build task and add the returned Session ID.
- [ ] Confirm the Devpost project is registered under **Education**.
- [ ] Paste the reviewed project description from `SUBMISSION.md` into Devpost.
- [ ] Watch the public video and run the live URL as a stranger would.
- [ ] Submit at least 12 hours before the July 21, 2026 5:00pm PDT deadline.

## Post-deploy smoke commands

```bash
curl -i https://your-production-domain.example/api/health
curl -I https://your-production-domain.example/
```

Expected: health `200`, version `1.0.0`, benchmark `12/12`, credential-free demo `ready`, security
headers present, `/privacy` available, unknown route returns the designed `404`, and optional
generation returns an actionable `503` when no server key is configured.
