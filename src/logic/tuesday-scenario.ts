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
  lessonPlan: Array<{
    duration: string;
    title: string;
    detail: string;
  }>;
  evidence: Array<{
    label: string;
    observation: string;
    tone: "positive" | "watch";
  }>;
  mastery: {
    topic: string;
    score: number;
    status: string;
    nextReview: string;
    reason: string;
  };
  parentReport: string;
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
  lessonPlan: [
    {
      duration: "5 min",
      title: "Warm-up",
      detail: "Match three pairs of equivalent fractions from the previous session.",
    },
    {
      duration: "20 min",
      title: "Core teaching",
      detail: "Build common denominators visually before moving to the written method.",
    },
    {
      duration: "15 min",
      title: "Guided practice",
      detail: "Four problems that move from shared multiples to independent work.",
    },
    {
      duration: "5 min",
      title: "Mastery check",
      detail: "Explain why 1/3 + 1/4 cannot be solved by adding the denominators.",
    },
  ],
  evidence: [
    {
      label: "Breakthrough",
      observation: "Maya found 12 as a common denominator independently on problem three.",
      tone: "positive",
    },
    {
      label: "Still difficult",
      observation: "She added denominators directly when the final problem removed the visual model.",
      tone: "watch",
    },
  ],
  mastery: {
    topic: "Unlike denominators",
    score: 62,
    status: "Needs reinforcement",
    nextReview: "Review in 3 days",
    reason: "The method worked with support, but did not yet transfer to independent work.",
  },
  parentReport:
    "Maya made a real step forward today: by the third problem, she found 12 as a common denominator without a prompt. The method became harder when we removed the visual model, so we will revisit it briefly next session before moving on. Next, we will practise choosing common denominators independently.",
};
