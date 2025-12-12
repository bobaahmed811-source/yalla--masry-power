
'use server';
/**
 * @fileOverview Server actions for AI-related functionalities.
 */

import { getTutorResponseFlow, AITutorInputSchema } from "@/ai/flows/tutor-flow";
import { getSpeechAudioFlow } from '@/ai/flows/speech-flow';
import { getComicDialogueFlow, ComicDialogueInputSchema } from '@/ai/flows/comic-dialogue-flow';
import { getDialogueEvaluationFlow, DialogueEvaluationInputSchema } from '@/ai/flows/dialogue-evaluation-flow';
import { getStorytellerAudioFlow, StorytellerInputSchema } from '@/ai/flows/storyteller-flow';
import { getPronunciationAnalysisFlow, PronunciationAnalysisInputSchema } from '@/ai/flows/pronunciation-analysis-flow';
import { z } from 'zod';


/**
 * Server action to get a response from the AI Tutor.
 * @param values The course material and user question.
 * @returns A promise that resolves to the AI's answer or an error.
 */
export async function getTutorResponse(values: z.infer<typeof AITutorInputSchema>) {
  try {
    const result = await getTutorResponseFlow(values);
    return { answer: result.answer };
  } catch (e: any) {
    console.error("Error in getTutorResponse action:", e);
    return { error: "فشلت خدمة المعلم الذكي. قد تكون خدمات Google AI غير مفعلة. " + (e.message || "الرجاء المحاولة لاحقًا.") };
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
    return { error: "فشلت خدمة تحويل النص إلى صوت. قد تكون خدمات Google AI غير مفعلة. " + (e.message || "الرجاء المحاولة لاحقًا.") };
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
    return { error: "فشلت خدمة توليد الحوار. قد تكون خدمات Google AI غير مفعلة. " + (e.message || "الرجاء المحاولة لاحقًا.") };
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
    return { success: true, analysis: result };
  } catch (e: any)
   {
    console.error("Error in getDialogueEvaluation action:", e);
    return { error: "فشلت خدمة تقييم الحوار. قد تكون خدمات Google AI غير مفعلة. " + (e.message || "الرجاء المحاولة لاحقًا.") };
  }
}

/**
 * Server action to get a narrated story audio from the AI.
 * @param values The title and description of the artifact.
 * @returns A promise that resolves to the AI's generated audio.
 */
export async function getStorytellerAudio(values: z.infer<typeof StorytellerInputSchema>) {
    try {
        const result = await getStorytellerAudioFlow(values);
        return { success: true, media: result.media };
    } catch (e: any) {
        console.error("Error in getStorytellerAudio action:", e);
        return { error: "فشلت خدمة المرشد الصوتي. قد تكون خدمات Google AI غير مفعلة. " + (e.message || "الرجاء المحاولة لاحقًا.") };
    }
}

/**
 * Server action to get a pronunciation analysis from the AI.
 * @param values The audio data URI and the original text.
 * @returns A promise that resolves to the AI's analysis.
 */
export async function getPronunciationAnalysis(values: z.infer<typeof PronunciationAnalysisInputSchema>) {
    try {
        const result = await getPronunciationAnalysisFlow(values);
        return { success: true, analysis: result };
    } catch (e: any) {
        console.error("Error in getPronunciationAnalysis action:", e);
        return { error: "فشلت خدمة تحليل النطق. قد تكون خدمات Google AI غير مفعلة. " + (e.message || "الرجاء المحاولة لاحقًا.") };
    }
}
