import {
  ParentReportGenerationError,
  generateParentReport,
  type ParentReportGenerator,
} from "@/src/logic/generate-parent-report";
import { calculateMasteryDecision } from "@/src/logic/mastery";
import { ParentReportRequestSchema } from "@/src/logic/parent-report";
import { declaredBodyTooLarge, noStoreJson } from "@/lib/http/api-response";

type RouteDependencies = {
  generate: ParentReportGenerator;
};

const defaultDependencies: RouteDependencies = {
  generate: generateParentReport,
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

export function createParentReportHandler(
  dependencies: RouteDependencies = defaultDependencies,
) {
  return async function parentReportHandler(request: Request) {
    if (declaredBodyTooLarge(request)) {
      return errorResponse(413, "request_too_large", "Keep parent-report requests below 32 KB.");
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "invalid_json", "Send a valid JSON request body.");
    }

    const parsed = ParentReportRequestSchema.safeParse(body);

    if (!parsed.success) {
      const fields = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          issue.path.join(".") || "request",
          issue.message,
        ]),
      );

      return errorResponse(
        422,
        "invalid_report_context",
        "Check the session evidence and try again.",
        fields,
      );
    }

    const context = {
      ...parsed.data,
      mastery: calculateMasteryDecision(parsed.data.evidence),
    };

    try {
      const result = await dependencies.generate(context);
      return noStoreJson(result);
    } catch (error) {
      if (error instanceof ParentReportGenerationError) {
        if (error.code === "generation_refused") {
          return errorResponse(
            422,
            error.code,
            "GPT-5.6 could not create a report from this session. Review the evidence and try again.",
          );
        }

        if (error.code === "honesty_gate_failed") {
          return errorResponse(
            422,
            error.code,
            `Honesty Gate blocked this draft: ${error.message}`,
          );
        }
      }

      return errorResponse(
        502,
        "provider_failure",
        "The parent-report service is temporarily unavailable. Your last safe report is unchanged—try again.",
      );
    }
  };
}

export const POST = createParentReportHandler();
