import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  buildLessonPlanInput,
  LESSON_PLAN_INSTRUCTIONS,
  LESSON_PLAN_MODEL,
  LessonPlanSchema,
  type LessonPlan,
  type LessonPlanRequest,
} from "./lesson-plan";

export type LessonPlanGeneration = {
  plan: LessonPlan;
  model: string;
};

export type LessonPlanGenerator = (
  context: LessonPlanRequest,
) => Promise<LessonPlanGeneration>;

export type LessonPlanGenerationErrorCode =
  | "missing_api_key"
  | "generation_refused"
  | "provider_failure";

export class LessonPlanGenerationError extends Error {
  constructor(
    public readonly code: LessonPlanGenerationErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "LessonPlanGenerationError";
  }
}

export const generateLessonPlan: LessonPlanGenerator = async (context) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new LessonPlanGenerationError(
      "missing_api_key",
      "Lesson-plan generation is not configured.",
    );
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.parse({
      model: LESSON_PLAN_MODEL,
      reasoning: { effort: "low" },
      instructions: LESSON_PLAN_INSTRUCTIONS,
      input: buildLessonPlanInput(context),
      max_output_tokens: 3_500,
      text: {
        verbosity: "medium",
        format: zodTextFormat(LessonPlanSchema, "lesson_plan"),
      },
    });

    if (!response.output_parsed) {
      throw new LessonPlanGenerationError(
        "generation_refused",
        "GPT-5.6 did not return a lesson plan for this context.",
      );
    }

    return {
      plan: response.output_parsed,
      model: response.model,
    };
  } catch (error) {
    if (error instanceof LessonPlanGenerationError) {
      throw error;
    }

    throw new LessonPlanGenerationError(
      "provider_failure",
      "GPT-5.6 lesson-plan generation failed.",
      { cause: error },
    );
  }
};
