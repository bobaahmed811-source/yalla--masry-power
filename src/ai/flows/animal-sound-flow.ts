'use server';
/**
 * @fileOverview An AI flow for generating animal sounds.
 *
 * This file defines the AI logic for a Text-to-Speech (TTS) agent that
 * takes an animal's name in Arabic and generates a corresponding sound,
 * then converts it to a playable audio format.
 *
 * - AnimalSoundInputSchema: Zod schema for the flow's input.
 * - AnimalSoundOutputSchema: Zod schema for the flow's output.
 * - getAnimalSoundFlow: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

// === Schemas ===

export const AnimalSoundInputSchema = z.object({
  animalName: z.string().describe("The name of the animal in Arabic (e.g., 'قطة', 'كلب')."),
});
export type AnimalSoundInput = z.infer<typeof AnimalSoundInputSchema>;

export const AnimalSoundOutputSchema = z.object({
  audioDataUri: z.string().describe("The base64 encoded WAV audio data URI of the animal sound."),
});
export type AnimalSoundOutput = z.infer<typeof AnimalSoundOutputSchema>;

// === Utility Functions ===

/**
 * Converts raw PCM audio buffer to a base64 encoded WAV data URI.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

// === Main Flow ===

/**
 * Defines the main Genkit flow for generating animal sounds.
 */
const animalSoundFlow = ai.defineFlow(
  {
    name: 'animalSoundFlow',
    inputSchema: AnimalSoundInputSchema,
    outputSchema: AnimalSoundOutputSchema,
  },
  async ({ animalName }) => {
    // Step 1: Generate the animal sound using a specialized prompt.
    // We ask the model to generate the sound effect directly.
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        // We don't need a specific voice, as we're asking for a sound effect.
      },
      prompt: `Generate the sound of a ${animalName}.`,
    });

    if (!media || !media.url) {
      throw new Error('No media was returned from the TTS model for the animal sound.');
    }

    // Step 2: Convert the raw PCM audio data to WAV format.
    const pcmAudioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(pcmAudioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);


/**
 * The server action wrapper for the Genkit flow.
 * @param input The name of the animal.
 * @returns The AI-generated animal sound as a data URI.
 */
export async function getAnimalSoundFlow(input: AnimalSoundInput): Promise<AnimalSoundOutput> {
  return await animalSoundFlow(input);
}
