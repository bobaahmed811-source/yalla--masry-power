'use server';
/**
 * @fileOverview An AI flow for generating short, 3-panel comic dialogues
 * in Egyptian Colloquial Arabic for children.
 *
 * - comicDialogFlow - A function that handles the dialogue generation process.
 * - ComicDialogInput - The input type for the comicDialogFlow function.
 * - ComicDialogOutput - The return type for the comicDialogFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ComicDialogInputSchema = z.object({
  scene: z
    .string()
    .describe(
      'A brief description of the scene for the comic. e.g., "A bustling vegetable market."'
    ),
});
export type ComicDialogInput = z.infer<typeof ComicDialogInputSchema>;

const ComicDialogOutputSchema = z.object({
  dialogue: z
    .array(z.string())
    .length(3)
    .describe('An array of exactly three strings, each representing a line of dialogue for a comic panel.'),
});
export type ComicDialogOutput = z.infer<typeof ComicDialogOutputSchema>;

/**
 * A server-side function to generate a 3-part comic dialogue.
 * @param input The scene description.
 * @returns A promise that resolves to an array of three dialogue lines.
 */
export async function comicDialogFlow(
  input: ComicDialogInput
): Promise<ComicDialogOutput> {
  const sceneDescriptions: Record<string, string> = {
    market: 'بين طفل صغير وبائع خضار في السوق، حول سعر الطماطم.',
    school: 'بين تلميذين عن الواجبات المدرسية أو اللعب في الفسحة.',
    family: 'بين أم وابنها حول طبق الكشري على مائدة العشاء.',
  };

  const fullScene =
    sceneDescriptions[input.scene] ||
    'A general conversation between two children.';

  const { output } = await ai.generate({
    prompt: `You are a scriptwriter specializing in comic books for children learning Egyptian Colloquial Arabic (ECA).
Your task is to generate a short, natural, and slightly humorous 3-line dialogue for the following scene: ${fullScene}

The dialogue must be entirely in Egyptian Colloquial Arabic (ECA), simple, and clear.
The output must be structured as an array of exactly three short sentences.`,
    output: {
      schema: ComicDialogOutputSchema,
    },
  });
  
  return output!;
}
