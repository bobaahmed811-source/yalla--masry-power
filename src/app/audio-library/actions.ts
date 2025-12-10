
'use server';

import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { z } from 'zod';

const InputSchema = z.object({
  text: z.string(),
});

/**
 * Server action to get audio for a given text.
 * It uses a Genkit flow to convert text to speech.
 * This includes retry logic for robustness.
 */
export async function getSpeechAudio(values: z.infer<typeof InputSchema>) {
  const validatedFields = InputSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  const { text } = validatedFields.data;

  // Implement retry logic for robustness
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add a slight variation to the prompt to avoid strict cache hits if issues persist
      const modifiedText = `${text}`;
      const result = await textToSpeech({ text: modifiedText, voice: 'Zeus' }); // Using a different voice for variety
      return { success: result.audio };
    } catch (error) {
      console.error(`Attempt ${attempt} failed for TTS with text "${text}":`, error);
      if (attempt === maxRetries) {
        return { error: 'Failed to get audio from the AI after multiple attempts. Please try again.' };
      }
      // Optional: add a small delay before retrying
      await new Promise(res => setTimeout(res, 500 * attempt));
    }
  }
  return { error: 'An unknown error occurred during audio generation.' };
}
