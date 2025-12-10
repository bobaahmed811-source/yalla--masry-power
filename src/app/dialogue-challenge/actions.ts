
'use server';
/**
 * @fileOverview Server actions for the Dialogue Challenge feature.
 */

import { evaluateDialogue } from '@/ai/flows/dialogue-evaluation-flow';
import { z } from 'zod';

const InputSchema = z.object({
  userAnswer: z.string(),
  choiceType: z.enum(['correct', 'wrong', 'good', 'excellent']),
});

/**
 * Server action to get an evaluation for a user's dialogue choice.
 * @param values The user's answer and the type of choice made.
 * @returns A promise that resolves to the AI's evaluation.
 */
export async function getDialogueEvaluation(values: z.infer<typeof InputSchema>) {
  const validatedFields = InputSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  const { userAnswer, choiceType } = validatedFields.data;

  try {
    const result = await evaluateDialogue({ userAnswer, choiceType });
    return { success: result };
  } catch (error) {
    console.error('Error getting dialogue evaluation:', error);
    return { error: 'Failed to get evaluation from the AI. Please try again.' };
  }
}
