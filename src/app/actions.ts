"use server";

import { aiTutoringAssistant } from "@/ai/flows/ai-tutoring-assistant";
import { z } from "zod";

const InputSchema = z.object({
  courseMaterial: z.string(),
  question: z.string(),
});

export async function getTutorResponse(values: z.infer<typeof InputSchema>) {
  const validatedFields = InputSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }

  const { courseMaterial, question } = validatedFields.data;

  try {
    const result = await aiTutoringAssistant({ courseMaterial, question });
    return { success: result.answer };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get a response from the AI tutor. Please try again." };
  }
}
