import {
  generateLessonPlan,
  LessonPlanGenerationError,
  type LessonPlanGenerator,
} from "@/src/logic/generate-lesson-plan";
import { LessonPlanRequestSchema } from "@/src/logic/lesson-plan";
import { declaredBodyTooLarge, noStoreJson } from "@/lib/http/api-response";

type RouteDependencies = {
  generate: LessonPlanGenerator;
};

const defaultDependencies: RouteDependencies = {
  generate: generateLessonPlan,
};

function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  return noStoreJson(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status },
  );
}

export function createLessonPlanHandler(
  dependencies: RouteDependencies = defaultDependencies,
) {
  return async function lessonPlanHandler(request: Request) {
    if (declaredBodyTooLarge(request)) {
      return errorResponse(413, "request_too_large", "Keep lesson-plan requests below 32 KB.");
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "invalid_json", "Send a valid JSON request body.");
    }

    const parsed = LessonPlanRequestSchema.safeParse(body);

    if (!parsed.success) {
      const fields = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          issue.path.join(".") || "request",
          issue.message,
        ]),
      );

      return errorResponse(
        422,
        "invalid_context",
        "Check the highlighted tutoring context and try again.",
        fields,
      );
    }

    try {
      const result = await dependencies.generate(parsed.data);
      return noStoreJson(result);
    } catch (error) {
      if (error instanceof LessonPlanGenerationError) {
        if (error.code === "generation_refused") {
          return errorResponse(
            422,
            error.code,
            "GPT-5.6 could not create a plan from this context. Revise the inputs and try again.",
          );
        }
      }

      return errorResponse(
        502,
        "provider_failure",
        "The lesson-plan service is temporarily unavailable. Your context is still here—try again.",
      );
    }
  };
}

export const POST = createLessonPlanHandler();
