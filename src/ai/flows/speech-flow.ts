'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) AI flow.
 *
 * This file defines the AI logic for a TTS agent that converts a given
 * string of text into playable audio.
 *
 * - getSpeechAudio: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

// Define input and output schemas
const SpeechInputSchema = z.string();
const SpeechOutputSchema = z.object({
  media: z.string().describe("The base64 encoded WAV audio data URI."),
});

type SpeechOutput = z.infer<typeof SpeechOutputSchema>;

/**
 * Converts raw PCM audio buffer to a base64 encoded WAV data URI.
 * @param pcmData The raw PCM audio data from the model.
 * @param channels Number of audio channels.
 * @param rate Sample rate.
 * @param sampleWidth Sample width in bytes.
 * @returns A promise that resolves to the base64 encoded WAV string.
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
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

/**
 * Defines the main Genkit flow for Text-to-Speech.
 * This flow takes a text query, generates audio using a TTS model,
 * converts it to WAV format, and returns it as a data URI.
 */
const speechFlow = ai.defineFlow(
  {
    name: 'speechFlow',
    inputSchema: SpeechInputSchema,
    outputSchema: SpeechOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A suitable voice
          },
        },
      },
      prompt: query,
    });

    if (!media) {
      throw new Error('No media was returned from the TTS model.');
    }

    // The model returns a data URI with raw PCM data, which we need to convert.
    const pcmAudioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(pcmAudioBuffer);

    return {
      media: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

/**
 * The server action wrapper for the TTS Genkit flow.
 * This function is called from the client-side to execute TTS.
 * @param text The text to convert to speech.
 * @returns The AI-generated audio as a data URI or an error.
 */
export async function getSpeechAudioFlow(text: string): Promise<SpeechOutput> {
  return await speechFlow(text);
}
