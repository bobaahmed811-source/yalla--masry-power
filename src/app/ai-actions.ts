
'use server';
/**
 * @fileOverview Server actions for AI-related functionalities.
 */

import { getSpeechAudioFlow } from '@/ai/flows/speech-flow';
import { getComicDialogueFlow, ComicDialogueInputSchema } from '@/ai/flows/comic-dialogue-flow';
import { getDialogueEvaluationFlow, DialogueEvaluationInputSchema } from '@/ai/flows/dialogue-evaluation-flow';
import { z } from 'zod';


/**
 * Server action to get audio for a given text string.
 * It uses a Genkit flow to generate the audio.
 * @param text The text to convert to speech.
 * @returns A promise that resolves to the generated audio media or an error.
 */
export async function getSpeechAudio(text: string) {
  try {
    const result = await getSpeechAudioFlow(text);
    return { success: true, media: result.media };
  } catch (e: any) {
    console.error("Error in getSpeechAudio action:", e);
    return { error: "Failed to get audio from the AI. " + (e.message || "Please try again later.") };
  }
}


/**
 * Server action to get a comic dialogue from the AI.
 * It uses a Genkit flow to generate the dialogue based on a scene description.
 * @param values The scene identifier.
 * @returns A promise that resolves to the generated dialogue or an error.
 */
export async function getComicDialog(values: z.infer<typeof ComicDialogueInputSchema>) {
  try {
    const result = await getComicDialogueFlow(values);
    return { success: true, dialogue: result.dialogue };
  } catch (e: any) {
    console.error("Error in getComicDialog action:", e);
    return { error: "Failed to get dialogue from the AI. " + (e.message || "Please try again later.") };
  }
}


/**
 * Server action to get an evaluation for a user's dialogue choice.
 * @param values The user's answer and the type of choice made.
 * @returns A promise that resolves to the AI's evaluation.
 */
export async function getDialogueEvaluation(values: z.infer<typeof DialogueEvaluationInputSchema>) {
  try {
    const result = await getDialogueEvaluationFlow(values);
    return { success: result };
  } catch (e: any) {
    console.error("Error in getDialogueEvaluation action:", e);
    return { error: "Failed to get evaluation from the AI. " + (e.message || "Please try again later.") };
  }
}
