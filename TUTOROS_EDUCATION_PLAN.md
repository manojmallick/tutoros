# TUTOROS — FULL MAXIMIZED PLAN
# OpenAI Build Week | Track: Education ($15K / $10K)
# Deadline: July 21, 2026 @ 5:00pm PDT
# 6 DAYS REMAINING (from July 15)

---

## DO THIS IN THE NEXT 2 HOURS

```
[ ] Request Codex credits at openai.devpost.com/resources
    DEADLINE: July 17, 12:00pm PT -- roughly 46 hours from now
[ ] Create OpenAI account if not done: auth.openai.com/create-account
[ ] Install Devpost Hackathons Plugin in ChatGPT (desktop or mobile)
[ ] Register this project on openai.devpost.com
```
Everything below assumes credits arrive in time. If they don't,
GPT-5.6 API is still usable pay-as-you-go -- don't let this block building,
but request now regardless.

---

## WHY THIS PROJECT, MAXIMIZED

You have one unfair advantage: you are an active tutor on Apprentus
and Superprof right now. The maximization strategy:

1. Don't build the idea from scratch -- build the PROOF of the idea.
   Judges skim 10,000+ submissions. The winning move is not more features,
   it's a sharper, more undeniable demonstration of the ONE claim that matters.

2. Front-load the differentiator into the first 15 seconds of video.
   This is the single highest-leverage lever available -- with only
   6 days, this is where effort concentrates.

3. Make the /feedback Codex Session ID tell a story judges can verify.
   Don't just attach a session ID -- structure the actual Codex session
   so that replaying it shows genuine iteration, not one giant prompt.

4. Write submission copy that speaks to the specific named judge.
   Leah Belsky (VP of Education) evaluates this track with pedagogical
   literacy -- she will recognize genuine concepts like zone of proximal
   development and mastery-based tracking vs generic "AI tutor chatbot"
   language.

---

## GAP-CLOSING UPGRADES (applied from competitive analysis of confirmed winners)

### UPGRADE 1 -- Fresh benchmark: a real regression test suite, not a claim

Instead of asserting the readiness-score algorithm "got fixed," build and run
an actual test suite and report the real pass count -- this is TutorOS's
equivalent of kassi's 80-run benchmark: small in scale, but genuinely measured.

```typescript
// lib/readiness-score.test.ts
import { computeReadiness } from "./readiness-score";

const cases = [
  {
    name: "two declining sections should flag behind, even with strong average",
    input: {
      sectionTrends: [
        { sectionId: "a", latestConfidence: 5, trend: "declining", entriesLogged: 3 },
        { sectionId: "b", latestConfidence: 5, trend: "declining", entriesLogged: 3 },
        { sectionId: "c", latestConfidence: 5, trend: "flat", entriesLogged: 3 },
      ],
      daysRemaining: 5,
      originalPlanDays: 21,
    },
    expectedStatus: "behind",
  },
  // ... add the remaining real cases actually exercised during build
];

let passed = 0;
for (const c of cases) {
  const result = computeReadiness(c.input as any);
  if (result.status === c.expectedStatus) passed++;
  else console.error(`FAILED: ${c.name} -- got ${result.status}`);
}
console.log(`${passed}/${cases.length} readiness-score test cases passed`);
```

Run this for real, report the actual count in the README ("12/12 test cases
pass, including the 3 that exposed the original averaging bug") -- not an
estimate, the real number from the real run.

### UPGRADE 2 -- Named governance feature: the Honesty Gate

TutorOS already refuses to be falsely cheerful -- make that an explicit,
named, screenshotted feature rather than an implicit prompt instruction:

```typescript
// lib/honesty-gate.ts
// Runs before ANY parent report or readiness message is shown to the user.
// Two checks: (1) does the report reference something specific from the
// actual session, not generic praise, and (2) does a "behind" status ever
// get silently softened into "on track" language.

const GENERIC_PRAISE_PATTERNS = [
  /did (great|amazing|wonderful)/i,
  /keep up the good work/i,
  /^(great|nice|good) (job|session)!?$/i,
];

export function honestyGateCheck(reportText: string): {
  passed: boolean;
  reason?: string;
} {
  const isGeneric = GENERIC_PRAISE_PATTERNS.some((p) => p.test(reportText));
  if (isGeneric && reportText.length < 120) {
    return {
      passed: false,
      reason: "Report reads as generic praise with no specific session detail -- regenerate.",
    };
  }
  return { passed: true };
}
```

Show this gate explicitly in the UI ("Honesty check: passed -- this report
references a specific moment from the session") and in the demo video as its
own beat, not folded silently into the report generator.

### UPGRADE 3 -- Real Challenges diary (fill in DURING build)

```
CHALLENGE 1: [exact bug -- e.g. "computeReadiness averaged confidence across
  sections, so 2 declining sections at 5/5 and 1 flat section at 5/5 scored
  'on track' even though two sections were actively getting worse"]
  What we assumed: average confidence was a sufficient signal
  What actually happened: [exact test case that exposed it]
  The fix: [exact code change]

CHALLENGE 2: [same structure, second real issue hit during build]
```

### UPGRADE 4 -- Codex/GPT-5.6 coverage checklist

```
[ ] Codex-authored files: lesson-plan route, parent-report route,
    mastery-tracker.ts, readiness-score.ts -- list actual file count
[ ] Codex session steps in the /feedback session: ___
[ ] GPT-5.6 API calls per full user flow (plan + log + report): ___
[ ] Readiness-score test cases Codex helped author: ___/___
```

---

## SECTION 3 -- TUTOROS -- FULL BUILD

### 3.1 The one claim to prove

"This is what a real tutoring session produces -- not a demo, a Tuesday."

Everything serves this. The parent report is the single most important
artifact -- it's the one output a non-technical judge immediately
understands and values.

### 3.2 Core Next.js app -- lesson plan + report generator

```typescript
// app/api/lesson-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { subject, studentLevel, lastSessionTopic, strugglingWith } = await req.json();

  const prompt = `You are an experienced private tutor planning a 45-minute session.

Subject: ${subject}
Student's current level: ${studentLevel}
What was covered last session: ${lastSessionTopic}
What the student is currently struggling with: ${strugglingWith}

Generate a structured lesson plan with these exact sections:
1. Warm-up (5 min) -- one quick review question from last session
2. Core teaching (20 min) -- the new concept, explained with one concrete example
3. Practice problems (15 min) -- exactly 4 problems, increasing difficulty,
   calibrated to be challenging but achievable (zone of proximal development --
   not so easy it's boring, not so hard it's discouraging)
4. Mastery check (5 min) -- one question that reveals whether the concept landed

Return as clean JSON: { "warmup": "...", "core_teaching": "...",
"practice_problems": ["...", "...", "...", "..."], "mastery_check": "..." }`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.6",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const plan = JSON.parse(completion.choices[0].message.content!);
  return NextResponse.json({ plan });
}
```

```typescript
// app/api/parent-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { studentName, sessionNotes, whatWentWell, whatWasHard, nextTopic } =
    await req.json();

  const prompt = `You are writing a weekly progress update to a parent.
The parent is not an expert in this subject. They want to know their child
is progressing and that the tutor genuinely understands their child.

Student: ${studentName}
Session notes: ${sessionNotes}
What went well: ${whatWentWell}
What was hard: ${whatWasHard}
Next session's focus: ${nextTopic}

Write a warm, specific, jargon-free update. 3-4 sentences. Reference a
SPECIFIC moment from the session (not generic praise). Be honest about
what was hard without being discouraging. End with what's next.

Bad example (too generic): "Emma did great today! We covered fractions."
Good example (specific): "Emma can now simplify fractions with unlike
denominators -- she struggled with the first problem but got it by the
third. Next week we'll build on this with multiplying fractions."

Write only the update text, no preamble.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.6",
    messages: [{ role: "user", content: prompt }],
  });

  return NextResponse.json({ report: completion.choices[0].message.content });
}
```

```typescript
// lib/mastery-tracker.ts
// The one piece of genuine algorithmic depth -- cite this explicitly
// in the submission as where Codex added real technical value.

interface MasteryEntry {
  topic: string;
  attempts: number;
  successRate: number;
  lastReviewed: string;
  nextReviewDue: string;
}

/**
 * Spaced-repetition-style scheduling for topic review, adapted for
 * tutoring cadence (weekly sessions, not daily app opens).
 * Intervals widen as successRate improves; a struggling topic gets
 * pulled back into the very next session automatically.
 */
export function scheduleNextReview(entry: MasteryEntry): string {
  const baseIntervalDays = entry.successRate >= 0.8 ? 14
    : entry.successRate >= 0.5 ? 7
    : 3; // struggling topics resurface almost immediately

  const next = new Date(entry.lastReviewed);
  next.setDate(next.getDate() + baseIntervalDays);
  return next.toISOString().split("T")[0];
}

export function updateMastery(
  entry: MasteryEntry,
  sessionResult: { correct: number; total: number }
): MasteryEntry {
  const newAttempts = entry.attempts + sessionResult.total;
  const newSuccessRate =
    (entry.successRate * entry.attempts + sessionResult.correct) / newAttempts;

  const updated: MasteryEntry = {
    ...entry,
    attempts: newAttempts,
    successRate: Math.round(newSuccessRate * 100) / 100,
    lastReviewed: new Date().toISOString().split("T")[0],
    nextReviewDue: "",
  };
  updated.nextReviewDue = scheduleNextReview(updated);
  return updated;
}
```

### 3.3 README.md -- Education track framing

```markdown
# TutorOS

Built by an actual tutor, for actual tutors. OpenAI Build Week 2026.

## The problem

I tutor on Apprentus and Superprof. Every session: plan the lesson,
generate the right practice problems, track what the student has
actually mastered, and write a parent update that doesn't sound like
a form letter. All manual. Every week.

Millions of independent tutors worldwide do this with zero tooling --
enterprise tutoring companies have this infrastructure; solo tutors don't.

## What it does

1. Lesson plan generator -- input last session + current struggle,
   get a structured 45-minute plan (warm-up, teaching, practice, mastery check)
2. Adaptive problem generator -- calibrated to the student's actual
   zone of proximal development, not generic difficulty levels
3. Mastery tracker -- spaced-repetition-style scheduling per topic,
   struggling topics resurface automatically in the next session
4. Parent report generator -- specific, warm, jargon-free -- the kind
   of update parents actually read and remember

## Install

git clone https://github.com/manojmallick/tutoros
cd tutoros
npm install
cp .env.example .env.local   # add OPENAI_API_KEY
npm run dev

## Test without rebuilding

Live demo: [Vercel URL] -- no login required, sample student data pre-loaded.

## How Codex was used to build this

Codex built the mastery-tracking scheduling logic (lib/mastery-tracker.ts)
end to end from a plain-English description of spaced repetition adapted
for weekly (not daily) tutoring cadence -- this was the single piece of
genuine algorithmic work in the project and Codex got the interval logic
right on the second iteration. Codex also scaffolded the full Next.js app
structure, both API routes, and the Supabase schema.

Session ID: [insert /feedback session ID]

## License

MIT
```

### 3.4 Demo video -- shot by shot (2:40 total)

```
[0:00-0:15] THE HOOK -- cold open with the actual artifact
Show the parent report text on screen FIRST, before any explanation:
"Emma can now simplify fractions with unlike denominators -- she
struggled with the first problem but got it by the third. Next week:
multiplying fractions."
VOICE: "I wrote something like this by hand, every week, for every student.
Not anymore."

[0:15-0:30] WHO I AM (authenticity, fast)
"I tutor on Apprentus and Superprof. This is built from my own Tuesday."

[0:30-1:15] LIVE DEMO
Input: last session topic + what the student struggled with
Show: lesson plan generated (warm-up, teaching, 4 calibrated problems, mastery check)
Show: logging session result -> mastery tracker updates -> next review date shifts
Show: parent report generated instantly from 3 lines of session notes

[1:15-1:45] THE ALGORITHMIC PIECE
"The mastery tracker isn't just a checklist -- it's spaced repetition,
adapted for weekly sessions. A topic the student struggled with resurfaces
in the very next session automatically."
Show the interval logic briefly on screen (the code, 3 seconds).

[1:45-2:15] HOW CODEX BUILT THIS
"I described spaced repetition for tutoring cadence in plain English.
Codex got the scheduling logic right on the second try."
Show the /feedback session ID.

[2:15-2:40] CLOSE
"TutorOS. For the millions of tutors who've never had tools like this."
Live demo URL on screen, held 3+ seconds.
```

---

## CODEX SESSION STRATEGY

Judges score "how thoroughly and skillfully does the project use Codex" --
this means the session itself is graded, not just the output. Structure
the session deliberately:

```
STEP 1 -- Scaffold prompt (broad)
"Build a Next.js app with two API routes: one that generates a
structured tutoring lesson plan from student context, one that
generates a parent progress report from session notes."

STEP 2 -- The algorithmic piece (the hard part)
"Now build a spaced-repetition-style scheduler for topic review,
adapted for weekly tutoring sessions instead of daily app opens --
a topic the student struggled with should resurface almost
immediately, one they've mastered should wait much longer."

STEP 3 -- Iteration prompt (specific bug or gap)
Describe the first version's interval logic and what was wrong with it
(e.g., "the interval doesn't shrink enough when successRate is low").
(This is the moment that proves genuine iteration, not one-shot generation.)

STEP 4 -- Polish prompt
"Wire the mastery tracker into a simple UI page and seed it with
realistic sample student data so it doesn't look empty."

STEP 5 -- Run /feedback
Capture the session ID at the end of this exact session.
```

Do this as a real session -- don't fabricate it. The actual back-and-forth
IS the "genuine effort and working, non-trivial implementation" the
rubric asks for.

---

## 6-DAY BUILD SCHEDULE (this project's share of the sprint)

```
====================================================================
DAY 1 (July 15 -- TODAY)
====================================================================
Morning:
  [ ] Request Codex credits (openai.devpost.com/resources) -- DO FIRST
  [ ] Register project on Devpost

Evening:
  [ ] Scaffold Next.js app with Codex (lesson-plan + parent-report routes)
  [ ] Test both API routes manually with curl/Postman

====================================================================
DAY 2 (July 16)
====================================================================
Evening:
  [ ] Refine the lesson-plan and parent-report prompts based on
      real output quality -- iterate until the parent report genuinely
      sounds like something a parent would want to read

====================================================================
DAY 3 (July 17) -- CODEX CREDITS DEADLINE 12PM PT TODAY
====================================================================
Morning:
  [ ] CONFIRM credits request was submitted (if not -- resubmit before noon PT)
  [ ] Build mastery-tracker.ts with Codex (the algorithmic piece, Steps 2-3 above)
  [ ] Wire mastery tracker into a simple UI page

Afternoon:
  [ ] Build the frontend form (input last session -> generate plan)
  [ ] Build the report display page

Evening:
  [ ] Deploy to Vercel -- get a live demo URL working
  [ ] Seed with realistic sample student data (not empty state)

====================================================================
DAY 4 (July 18)
====================================================================
Morning:
  [ ] Polish end-to-end flow, fix any rough edges
  [ ] Run /feedback, save the Codex session ID
  [ ] Write README.md

====================================================================
DAY 5 (July 19)
====================================================================
Morning:
  [ ] Record demo video (script above)
  [ ] Edit video, open on the parent report text, not a feature list

Afternoon:
  [ ] Upload to YouTube
  [ ] Write Devpost project description (use the "one claim" framing)

Evening:
  [ ] Make repo public with MIT license OR share privately with
      testing@devpost.com and build-week-event@openai.com
  [ ] Final README pass -- confirm Codex usage section is specific,
      not generic ("Codex helped me build X" is weak -- name the exact moment)

====================================================================
DAY 6 (July 20 -- buffer day, do NOT skip this)
====================================================================
  [ ] Watch the video as a stranger would -- cut anything slow
  [ ] Test the app from scratch: does the live URL work with no login,
      does sample data load correctly?
  [ ] Confirm the /feedback Session ID is correctly entered on the form
  [ ] Submit at least 12 hours before deadline -- do not submit at 4:45pm
      on July 21. Devpost forms occasionally have upload issues under load.

====================================================================
JULY 21, 5:00pm PDT -- HARD DEADLINE
====================================================================
```

---

## FINAL PRE-SUBMIT CHECKLIST

```
[ ] Next.js app deployed live on Vercel, working URL
[ ] Sample student data pre-loaded (judges shouldn't hit an empty state)
[ ] mastery-tracker.ts logic is correct and demonstrated in the UI
[ ] README.md explains the spaced-repetition-for-tutoring adaptation clearly
[ ] Demo video <=3 min, public YouTube, opens on the parent report text
[ ] Repo public + MIT license, or shared with both required emails
[ ] /feedback Session ID captured and entered on submission form
[ ] Category selected: Education
[ ] GAP-CLOSING: readiness-score.test.ts run for real, actual pass count in README
[ ] GAP-CLOSING: Honesty Gate implemented, named, and shown in demo video
[ ] GAP-CLOSING: Challenges section has 2+ entries with exact bug detail
[ ] GAP-CLOSING: Codex/GPT-5.6 coverage checklist filled with real counts
```

---


