import { z } from "zod";

export const GenerationSourceSchema = z.enum(["live", "mock"]);

export type GenerationSource = z.infer<typeof GenerationSourceSchema>;

export const MOCK_GPT56_MODEL = "gpt-5.6";
