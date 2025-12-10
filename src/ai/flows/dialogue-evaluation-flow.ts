
'use server';
/**
 * @fileOverview An AI flow for evaluating a student's dialogue choice in a scenario.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the evaluation flow
const DialogueEvaluationInputSchema = z.object({
  userAnswer: z.string().describe("The user's selected dialogue response."),
  choiceType: z
    .enum(['correct', 'wrong', 'good', 'excellent'])
    .describe('The pre-defined category of the user\'s choice.'),
});
export type DialogueEvaluationInput = z.infer<
  typeof DialogueEvaluationInputSchema
>;

// Output schema for the evaluation flow
const DialogueEvaluationOutputSchema = z.object({
  score: z.number().describe('The score awarded for the answer. Can be negative.'),
  feedback: z.string().describe('Constructive feedback for the user.'),
  nextId: z.number().describe('The ID of the next step in the dialogue scenario.'),
});
export type DialogueEvaluationOutput = z.infer<
  typeof DialogueEvaluationOutputSchema
>;

/**
 * A server-side function to evaluate a user's dialogue choice.
 * @param input The user's answer and the type of choice.
 * @returns A promise that resolves to an object containing score, feedback, and next step ID.
 */
export async function evaluateDialogue(
  input: DialogueEvaluationInput
): Promise<DialogueEvaluationOutput> {
  // In a real scenario, you would use a Genkit prompt here to get dynamic feedback.
  // For this prototype, we'll use a simulated logic based on the choice type.

  let score = 0;
  let feedback = '';
  let nextId = 0;

  switch (input.choiceType) {
    case 'excellent':
      score = 75;
      feedback =
        "أحسنت! الإجابة كانت كاملة ومهذبة جداً باستخدام 'شكراً جزيلاً'. لقد استخدمت لغة السوق اليومية بطلاقة. حصلت على مكافأة جودة التعبير!";
      nextId = 5;
      break;
    case 'good':
      score = 50;
      feedback =
        "إجابة صحيحة ومفهومة. لكن تذّكر أن استخدام كلمة 'شكراً' و 'اتفضل' يزيد من طلاقتك الاجتماعية في مصر. حصلت على نقاط الإجابة الصحيحة.";
      nextId = 5;
      break;
    case 'correct':
      score = 50;
      feedback =
        "إجابة صحيحة. لقد طلبت ما تريده بوضوح ولباقة باستخدام 'لو سمحت'.";
      nextId = 3;
      break;
    case 'wrong':
      score = -20;
      feedback =
        'توقفي! هذا السؤال غير مناسب في سياق شراء الطماطم. راجعِ مفردات الحوار في المتجر.';
      nextId = 2; // Return to the same question
      break;
    default:
      score = 0;
      feedback = 'حدث خطأ في تقييم الإجابة.';
      nextId = 2;
  }

  return { score, feedback, nextId };
}
