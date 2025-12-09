// This is an AI tutoring assistant that answers student questions about course material.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutoringAssistantInputSchema = z.object({
  question: z.string().describe('The student\'s question about the course material.'),
  courseMaterial: z.string().describe('The course material that the student is asking about.'),
});
export type AiTutoringAssistantInput = z.infer<typeof AiTutoringAssistantInputSchema>;

const AiTutoringAssistantOutputSchema = z.object({
  answer: z.string().describe('The AI assistant\'s answer to the student\'s question.'),
});
export type AiTutoringAssistantOutput = z.infer<typeof AiTutoringAssistantOutputSchema>;

export async function aiTutoringAssistant(input: AiTutoringAssistantInput): Promise<AiTutoringAssistantOutput> {
  return aiTutoringAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutoringAssistantPrompt',
  input: {schema: AiTutoringAssistantInputSchema},
  output: {schema: AiTutoringAssistantOutputSchema},
  prompt: `You are an AI tutoring assistant that answers student questions about course material.

  Course Material: {{{courseMaterial}}}

  Question: {{{question}}}

  Answer:`,
});

const aiTutoringAssistantFlow = ai.defineFlow(
  {
    name: 'aiTutoringAssistantFlow',
    inputSchema: AiTutoringAssistantInputSchema,
    outputSchema: AiTutoringAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
