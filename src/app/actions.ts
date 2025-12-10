
"use server";

import { z } from "zod";
import { getTutorResponseFlow, AITutorInputSchema } from "@/ai/flows/tutor-flow";
import { getSpeechAudioFlow } from '@/ai/flows/speech-flow';


// Re-using the schema from the flow for consistency.
const InputSchema = AITutorInputSchema;

export async function getTutorResponse(values: z.infer<typeof InputSchema>) {
  try {
    const result = await getTutorResponseFlow(values);
    return { answer: result.answer };
  } catch (e: any) {
    console.error("Error in getTutorResponse action:", e);
    return { error: "Failed to get a response from the AI tutor. " + (e.message || "Please try again later.") };
  }
}

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
