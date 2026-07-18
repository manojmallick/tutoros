import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { honestyGateCheck } from "./honesty-gate";
import {
  buildParentReportInput,
  PARENT_REPORT_INSTRUCTIONS,
  PARENT_REPORT_MODEL,
  ParentReportDraftSchema,
  type ParentReportGeneration,
  type ParentReportRequest,
} from "./parent-report";

export type ParentReportGenerator = (
  context: ParentReportRequest,
) => Promise<ParentReportGeneration>;

export type ParentReportGenerationErrorCode =
  | "missing_api_key"
  | "generation_refused"
  | "honesty_gate_failed"
  | "provider_failure";

export class ParentReportGenerationError extends Error {
  constructor(
    public readonly code: ParentReportGenerationErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ParentReportGenerationError";
  }
}

export const generateParentReport: ParentReportGenerator = async (context) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new ParentReportGenerationError(
      "missing_api_key",
      "Parent-report generation is not configured.",
    );
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.parse({
      model: PARENT_REPORT_MODEL,
      reasoning: { effort: "low" },
      instructions: PARENT_REPORT_INSTRUCTIONS,
      input: buildParentReportInput(context),
      max_output_tokens: 1_200,
      text: {
        verbosity: "low",
        format: zodTextFormat(ParentReportDraftSchema, "parent_report"),
      },
    });

    if (!response.output_parsed) {
      throw new ParentReportGenerationError(
        "generation_refused",
        "GPT-5.6 did not return a parent report for this session.",
      );
    }

    const honestyCheck = honestyGateCheck(response.output_parsed, context);

    if (!honestyCheck.passed) {
      throw new ParentReportGenerationError(
        "honesty_gate_failed",
        honestyCheck.reason,
      );
    }

    return {
      report: response.output_parsed,
      model: response.model,
      honestyCheck,
    };
  } catch (error) {
    if (error instanceof ParentReportGenerationError) throw error;

    throw new ParentReportGenerationError(
      "provider_failure",
      "GPT-5.6 parent-report generation failed.",
      { cause: error },
    );
  }
};
