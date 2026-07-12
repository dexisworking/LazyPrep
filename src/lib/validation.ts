import { z } from "zod";

/**
 * Zod schemas for the highest-risk server-action inputs. Server actions are
 * public HTTP endpoints, so validate the shape at the boundary as
 * defense-in-depth (generation code additionally clamps lengths/counts).
 */

/** Mock-test submission: one answer per question, null = skipped. */
export const mockAnswersSchema = z.array(z.number().int().min(0).nullable());

/** Checkpoint submission: selected option index per question id. */
export const checkpointAnswersSchema = z.array(
  z.object({
    questionId: z.string().min(1).max(64),
    selectedIdx: z.number().int(),
  }),
);

/** In-app feedback submission. */
export const feedbackSchema = z.object({
  type: z.enum(["bug", "idea", "other"]),
  message: z.string().trim().min(3).max(2000),
  url: z.string().max(500).optional(),
});

/** Course-generation questionnaire. Extra keys are ignored, not rejected. */
export const questionnaireSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  category: z.string().max(60).optional(),
  level: z.string().max(40).optional(),
  goal: z.string().max(1000).optional(),
  moduleCount: z.number().int().min(1).max(12).optional(),
  depth: z.string().max(40).optional(),
  focusTopics: z.string().max(1000).optional(),
  style: z.string().max(500).optional(),
});
