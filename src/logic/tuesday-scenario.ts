import type { LessonPlan } from "./lesson-plan";
import type { SessionEvidence } from "./mastery";
import type { ParentReportDraft } from "./parent-report";

export type WorkflowStage = {
  id: string;
  number: string;
  title: string;
  description: string;
};

export type TuesdayScenario = {
  isSynthetic: true;
  student: {
    name: string;
    initials: string;
    level: string;
    subject: string;
  };
  session: {
    durationMinutes: number;
    lastTopic: string;
    currentFocus: string;
    currentStruggle: string;
  };
  lessonPlan: LessonPlan;
  evidence: SessionEvidence;
  parentReport: ParentReportDraft;
};

export const workflowStages: WorkflowStage[] = [
  {
    id: "plan",
    number: "01",
    title: "Plan the session",
    description: "Turn the last lesson and current struggle into a focused 45-minute plan.",
  },
  {
    id: "evidence",
    number: "02",
    title: "Capture evidence",
    description: "Record the moments that reveal what landed and what still needs support.",
  },
  {
    id: "mastery",
    number: "03",
    title: "Decide what is next",
    description: "Use observed performance to schedule the right topic at the right time.",
  },
  {
    id: "report",
    number: "04",
    title: "Update the parent",
    description: "Create a warm, honest update grounded in the session—not generic praise.",
  },
];

export const tuesdayScenario: TuesdayScenario = {
  isSynthetic: true,
  student: {
    name: "Maya",
    initials: "MK",
    level: "Year 8",
    subject: "Mathematics",
  },
  session: {
    durationMinutes: 45,
    lastTopic: "Equivalent fractions",
    currentFocus: "Adding fractions with unlike denominators",
    currentStruggle: "Finding a common denominator without a prompt",
  },
  lessonPlan: {
    warmup: {
      minutes: 5,
      title: "Reconnect with equivalent fractions",
      activity: "Match three pairs of equivalent fractions from the previous session.",
      successSignal: "Maya explains why each pair represents the same quantity.",
    },
    coreTeaching: {
      minutes: 20,
      title: "Build a common unit",
      explanation: "Build common denominators visually before moving to the written method.",
      concreteExample: "Compare thirds and fourths on fraction bars, then rename both in twelfths.",
    },
    practice: {
      minutes: 15,
      title: "Move from models to independence",
      problems: [
        {
          prompt: "Use fraction bars to solve 1/3 + 1/6.",
          difficulty: "supported",
          successSignal: "Renames one third as two sixths before adding.",
        },
        {
          prompt: "Solve 1/4 + 1/6 using a shared multiples list.",
          difficulty: "guided",
          successSignal: "Selects 12 and converts both fractions accurately.",
        },
        {
          prompt: "Solve 2/3 + 1/4 without a visual model.",
          difficulty: "independent",
          successSignal: "Finds 12 and explains each conversion without prompting.",
        },
        {
          prompt: "A recipe uses 3/4 cup oats and 2/3 cup nuts. How much is that altogether?",
          difficulty: "stretch",
          successSignal: "Models the context, solves accurately, and checks reasonableness.",
        },
      ],
    },
    masteryCheck: {
      minutes: 5,
      title: "Explain the method",
      question: "Why can 1/3 + 1/4 not be solved by adding the denominators?",
      lookFor: "Maya explains that the pieces must be the same size before they can be combined.",
    },
    totalMinutes: 45,
  },
  evidence: {
    topic: "Unlike denominators",
    reviewedOn: "2026-07-14",
    attempts: [
      {
        id: "practice-1",
        prompt: "Use fraction bars to solve 1/3 + 1/6.",
        outcome: "correct",
        support: "modeled",
        observation: "Renamed one third as two sixths after seeing the model.",
      },
      {
        id: "practice-2",
        prompt: "Solve 1/4 + 1/6 using a shared multiples list.",
        outcome: "correct",
        support: "prompted",
        observation: "Selected 12 after one prompt to compare the lists.",
      },
      {
        id: "practice-3",
        prompt: "Solve 2/3 + 1/4 without a visual model.",
        outcome: "correct",
        support: "independent",
        observation: "Found 12 as a common denominator independently.",
      },
      {
        id: "practice-4",
        prompt: "A recipe uses 3/4 cup oats and 2/3 cup nuts. How much altogether?",
        outcome: "incorrect",
        support: "independent",
        observation: "Added denominators directly after the visual model was removed.",
      },
    ],
  },
  parentReport: {
    text: "Maya made a real step forward today: by the third problem, she found 12 as a common denominator without a prompt. The method became harder when we removed the visual model, so we will revisit it briefly next session before moving on. Next, we will practise choosing common denominators independently.",
    referencedAttemptIds: ["practice-3", "practice-4"],
  },
};
