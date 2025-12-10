'use server';
/**
 * @fileOverview Server actions for the Audio Library feature.
 */

import { getSpeechAudioFlow } from '@/ai/flows/speech-flow';

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
