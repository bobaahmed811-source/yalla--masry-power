
import os
import textwrap

# A dictionary where keys are file paths and values are their content.
# This single file holds the entire project structure.
PROJECT_FILES = {
    ".env": "",
    "README.md": "# Firebase Studio\\n\\nThis is a NextJS starter project in Firebase Studio. \\n\\nTo get started, take a look at src/app/page.tsx.\\n",
    "components.json": '''
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
''',
    "firestore.rules": '''
/**
 * This ruleset enforces a strict, user-centric security model for an EdTech platform,
 * designed for rapid prototyping with a focus on authorization over data validation.
 *
 * Core Philosophy:
 * The security model is built on the principle of "Authorization Independence". Access control
 * decisions are made using data denormalized directly onto the documents being secured,
 * avoiding slow and costly `get()` calls. This ensures rules are performant and scalable.
 * The default posture is to deny access unless explicitly granted.
 *
 */
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --------------------------------
    // Helper Functions
    // --------------------------------
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isExistingOwner(userId) { return isOwner(userId) && resource != null; }
    function isSenderOrReceiver() { return isSignedIn() && (request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.receiverId); }

    // --------------------------------
    // User Data
    // --------------------------------
    match /users/{userId} {
      allow get: if isOwner(userId);
      allow list: if false;
      allow create: if isOwner(userId) && request.resource.data.id == userId;
      allow update: if isExistingOwner(userId) && request.resource.data.id == resource.data.id;
      allow delete: if isExistingOwner(userId);
    }

    match /users/{userId}/progress/{progressId} {
      allow get, list: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.userId == userId;
      allow update: if isExistingOwner(userId) && request.resource.data.userId == resource.data.userId;
      allow delete: if isExistingOwner(userId);
    }

    match /users/{userId}/ai_interactions/{interactionId} {
      allow get, list: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.userId == userId;
      allow update: if isExistingOwner(userId) && request.resource.data.userId == resource.data.userId;
      allow delete: if isExistingOwner(userId);
    }
    
    match /artifacts/{appId}/users/{userId}/comic_performances/{performanceId} {
      allow get, list, update, delete: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.userId == userId;
    }
    
    // --------------------------------
    // Public & Admin-Managed Content
    // --------------------------------

    // Publicly readable content
    match /courses/{courseId} { allow get, list: if true; allow write: if false; /* TODO: Admin/Instructor only */ }
    match /products/{productId} { allow get, list: if true; allow write: if isSignedIn(); /* DANGER: For prototyping only */ }
    match /books/{bookId} { allow get, list: if true; allow write: if isSignedIn(); /* DANGER: For prototyping only */ }
    match /hadiths/{hadithId} { allow get, list: if true; allow write: if isSignedIn(); /* DANGER: For prototyping only */ }
    match /phrases/{phraseId} { allow get, list: if true; allow write: if isSignedIn(); /* DANGER: For prototyping only */ }
    match /adventure_challenges/{challengeId} { allow get, list: if true; allow write: if isSignedIn(); /* DANGER: For prototyping only */ }
    
    // Course content - should require enrollment
    match /courses/{courseId}/{subcollection}/{docId} {
       allow get, list: if isSignedIn(); // TODO: Grant access based on a user enrollment check.
       allow write: if false; // TODO: Grant access to course instructors/admins.
    }
    
    match /quizzes/{quizId}/questions/{questionId} {
      allow get, list: if false; // TODO: Grant access based on user enrollment in the parent course.
      allow write: if false; // TODO: Grant access to course instructors/admins.
    }

    // Instructor profiles and their reviews
    match /instructors/{instructorId} {
      allow get, list: if true;
      allow write: if isSignedIn(); // DANGER: For prototyping, allows any signed-in user to manage instructors.
    }
    match /instructors/{instructorId}/reviews/{reviewId} {
      allow get, list: if true;
      allow create: if isSignedIn() && request.resource.data.studentId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // --------------------------------
    // Collaborative & Transactional Data
    // --------------------------------

    // Private messages between two users
    match /messages/{messageId} {
      allow get: if isSenderOrReceiver();
      allow list: if false;
      allow create: if isSignedIn() && request.resource.data.senderId == request.auth.uid;
      allow update: if resource != null && isOwner(resource.data.senderId) && request.resource.data.senderId == resource.data.senderId;
      allow delete: if resource != null && isSenderOrReceiver();
    }
    
    // Public community chat
    match /community_messages/{messageId} {
      allow get, list: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.senderId == request.auth.uid;
      allow update, delete: if false;
    }

    // Purchase records
    match /artifacts/{appId}/public/data/digital_purchases/{purchaseId} {
      allow get, list: if resource != null && isOwner(resource.data.userId);
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // TODO: Allow backend/admin roles to update status.
    }
  }
}
''',
    "next.config.ts": '''
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // We are NOT using static export anymore. This allows for server-side logic.
  // output: 'export', // THIS LINE IS REMOVED
  
  // Disable TypeScript and ESLint checks during build on Vercel
  // This helps prevent build failures due to linting or type issues not critical for deployment.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuration for next/image to allow images from external domains.
  images: {
    // Unoptimized is only needed for static export. We can remove it, but it's safe to keep.
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// CRITICAL: This line exports the configuration so Vercel can use it.
export default nextConfig;
''',
    "package.json": '''
{
  "name": "yalla-masry",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "@genkit-ai/google-genai": "1.20.0",
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.4.5",
    "embla-carousel-react": "^8.1.5",
    "firebase": "^10.12.2",
    "genkit": "1.20.0",
    "lucide-react": "^0.400.0",
    "next": "14.2.4",
    "react": "18.3.1",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "18.3.1",
    "react-hook-form": "^7.51.5",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",
    "three": "^0.165.0",
    "wav": "^1.0.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.14.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.165.0",
    "@types/wav": "^1.0.3",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.4",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5"
  }
}
''',
    "tailwind.config.ts": '''
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['"PT Sans"', 'sans-serif'],
        headline: ['"PT Sans"', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
''',
    "tsconfig.json": '''
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
''',
    "vercel.json": '''
{
  "builds": [
    {
      "src": "next.config.ts",
      "use": "@vercel/nextjs"
    }
  ],
  "functions": {
    "src/app/**/*.ts": {
      "maxDuration": 120
    }
  }
}
''',
    "src/devDependencies.ts": '''
{
    "@types/wav": "^1.0.3"
}
''',
    "src/ai/index.ts": '''
'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance and configures it with the necessary plugins.
 * It exports a singleton `ai` object that should be used across the application for any AI-related tasks.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Genkit AI instance with Google AI plugin.
// This configuration allows Genkit to use Google's generative models.
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  // Log metadata and streaming events for debugging purposes in a development environment.
  logSinks: [],
  // Enable tracing to monitor and debug flows.
  traceStore: 'local',
  // Allow running flows in a development environment without explicit environment checks.
  flowStateStore: 'local',
});
''',
    "src/ai/flows/comic-dialogue-flow.ts": '''
'use server';
/**
 * @fileOverview An AI flow for generating a short comic dialogue.
 *
 * This file defines the AI logic for a dialogue generation agent that creates
 * a simple, 3-line conversation in Egyptian Arabic based on a given scene.
 *
 * - ComicDialogueInputSchema: The Zod schema for the flow's input.
 * - ComicDialogueOutputSchema: The Zod schema for the flow's output.
 * - getComicDialogueFlow: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';

// Define the input schema for the comic dialogue flow.
export const ComicDialogueInputSchema = z.object({
  scene: z.string().describe("The scene for the dialogue (e.g., 'market', 'school')."),
});
export type ComicDialogueInput = z.infer<typeof ComicDialogueInputSchema>;

// Define the output schema for the comic dialogue flow.
export const ComicDialogueOutputSchema = z.object({
  dialogue: z.array(z.string()).length(3).describe('A three-line dialogue in Egyptian Arabic.'),
});
export type ComicDialogueOutput = z.infer<typeof ComicDialogueOutputSchema>;

/**
 * Defines a Genkit prompt for generating the comic dialogue.
 * The prompt instructs the AI to create a short, simple, and potentially funny
 * dialogue in Egyptian Arabic suitable for the provided scene.
 */
const dialoguePrompt = ai.definePrompt({
  name: 'comicDialoguePrompt',
  input: { schema: ComicDialogueInputSchema },
  output: { schema: ComicDialogueOutputSchema },
  prompt: `You are a creative writer specializing in short, simple, and funny dialogues in Egyptian Arabic.
Your task is to write a 3-line dialogue for a comic strip.
The scene is: A "{{scene}}" in Egypt.

- The dialogue must be exactly 3 lines long.
- The language must be simple, modern Egyptian Colloquial Arabic.
- The dialogue should be suitable for a beginner learner.
- Make it a little bit humorous or charming if possible.

Example for scene "market":
- "بكام التفاح ده يا عمو؟"
- "كيلو التفاح بعشرين جنيه يا ست الكل."
- "غالي أوي! خلاص هاخد كيلو خيار."

Your response must be in the specified JSON format, with the dialogue as an array of 3 strings.`,
});

/**
 * Defines the main Genkit flow for generating the comic dialogue.
 * This flow takes the scene, calls the prompt, and returns the generated dialogue.
 */
const comicDialogueFlow = ai.defineFlow(
  {
    name: 'comicDialogueFlow',
    inputSchema: ComicDialogueInputSchema,
    outputSchema: ComicDialogueOutputSchema,
  },
  async (input) => {
    const { output } = await dialoguePrompt(input);
    return output!;
  }
);

/**
 * The server action wrapper for the Genkit flow.
 * This function is called from the client-side to execute the dialogue generation.
 * @param input The scene for which to generate a dialogue.
 * @returns The AI-generated dialogue.
 */
export async function getComicDialogueFlow(input: ComicDialogueInput): Promise<ComicDialogueOutput> {
    return await comicDialogueFlow(input);
}
''',
    "src/ai/flows/dialogue-evaluation-flow.ts": '''
'use server';
/**
 * @fileOverview An AI flow for evaluating a user's choice in a dialogue challenge.
 *
 * This file defines the AI logic for a dialogue evaluation agent that provides
 * feedback and a score based on a student's answer in a conversational scenario.
 *
 * - DialogueEvaluationInputSchema: The Zod schema for the flow's input.
 * - DialogueEvaluationOutputSchema: The Zod schema for the flow's output.
 * - getDialogueEvaluationFlow: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';

// Define the input schema for the dialogue evaluation flow.
export const DialogueEvaluationInputSchema = z.object({
  userAnswer: z.string().describe("The user's selected answer in the dialogue."),
  choiceType: z
    .enum(['correct', 'wrong', 'good', 'excellent'])
    .describe('The pre-determined category of the user\\'s choice.'),
});
export type DialogueEvaluationInput = z.infer<typeof DialogueEvaluationInputSchema>;

// Define the output schema for the dialogue evaluation flow.
export const DialogueEvaluationOutputSchema = z.object({
  score: z.number().describe('The score awarded for the answer, can be positive or negative.'),
  feedback: z.string().describe('Constructive feedback for the user about their answer.'),
  isPositive: z.boolean().describe('Whether the feedback is generally positive or negative.'),
});
export type DialogueEvaluationOutput = z.infer<typeof DialogueEvaluationOutputSchema>;

/**
 * Defines a Genkit prompt for the dialogue evaluation.
 * The prompt instructs the AI to act as a friendly Egyptian Arabic teacher,
 * providing a score and feedback based on the correctness and politeness of the answer.
 */
const evaluationPrompt = ai.definePrompt({
  name: 'dialogueEvaluationPrompt',
  input: { schema: DialogueEvaluationInputSchema },
  output: { schema: DialogueEvaluationOutputSchema },
  prompt: `You are a friendly and encouraging Egyptian Arabic teacher.
Your role is to evaluate a student's answer in a dialogue scenario.
The student's answer is: "{{userAnswer}}".
This answer has been categorized as: "{{choiceType}}".

Based on the choiceType, provide a score and constructive feedback in Arabic.
- If 'excellent': Give a high score (e.g., 75 points) and praise the user for a perfect, polite, and natural response. Explain *why* it's excellent. Set isPositive to true.
- If 'good': Give a decent score (e.g., 50 points). Acknowledge the answer is correct but suggest a more polite or natural alternative. Set isPositive to true.
- If 'correct': Give a standard score (e.g., 50 points). Confirm the answer is correct and briefly explain why. Set isPositive to true.
- If 'wrong': Give a negative score (e.g., -20 points). Explain why the answer is wrong in the context of the dialogue and gently correct the user. Set isPositive to false.

Keep the feedback concise, friendly, and encouraging. Address the user directly.
Example for 'good': "إجابة صحيحة ومفهومة. لكن تذكّر أن استخدام كلمة 'شكراً' يزيد من طلاقتك الاجتماعية في مصر. حصلت على نقاط الإجابة الصحيحة."

Your response must be in the specified JSON format.`,
});

/**
 * Defines the main Genkit flow for dialogue evaluation.
 * This flow takes the user's answer and choice type, calls the prompt,
 * and returns the generated evaluation.
 */
const dialogueEvaluationFlow = ai.defineFlow(
  {
    name: 'dialogueEvaluationFlow',
    inputSchema: DialogueEvaluationInputSchema,
    outputSchema: DialogueEvaluationOutputSchema,
  },
  async (input) => {
    const { output } = await evaluationPrompt(input);
    return output!;
  }
);

/**
 * The server action wrapper for the Genkit flow.
 * This function is called from the client-side to execute the dialogue evaluation.
 * @param input The user's answer and the type of choice made.
 * @returns The AI-generated evaluation (score and feedback).
 */
export async function getDialogueEvaluationFlow(input: DialogueEvaluationInput): Promise<DialogueEvaluationOutput> {
    return await dialogueEvaluationFlow(input);
}
''',
    "src/ai/flows/pronunciation-analysis-flow.ts": '''
'use server';
/**
 * @fileOverview An AI flow for analyzing user pronunciation.
 *
 * This file defines the AI logic for a pronunciation analysis agent. It takes
 * a user's audio recording and the original text, converts the audio to text,
 * and then provides feedback on the accuracy of the pronunciation.
 *
 * - PronunciationAnalysisInputSchema: Zod schema for the flow's input.
 * - PronunciationAnalysisOutputSchema: Zod schema for the flow's output.
 * - getPronunciationAnalysisFlow: The main server action that invokes the flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';
import { media, prompt } from 'genkit/experimental';
import * as ffmpeg from '@ffmpeg-installer/ffmpeg';
import { run } from 'genkit/tools';

// === Schemas ===

export const PronunciationAnalysisInputSchema = z.object({
  userAudio: z
    .string()
    .describe(
      "A user's audio recording as a data URI (e.g., 'data:audio/webm;base64,...')."
    ),
  originalText: z.string().describe('The original text the user was trying to say.'),
});
export type PronunciationAnalysisInput = z.infer<typeof PronunciationAnalysisInputSchema>;

export const PronunciationAnalysisOutputSchema = z.object({
  evaluation: z.enum(['correct', 'incorrect', 'unclear']).describe("The AI's evaluation of the pronunciation."),
  feedback: z.string().describe('Constructive feedback for the user.'),
});
export type PronunciationAnalysisOutput = z.infer<typeof PronunciationAnalysisOutputSchema>;


// === Prompts ===

/**
 * Prompt to evaluate the transcribed text against the original text.
 */
const analysisPrompt = ai.definePrompt({
  name: 'pronunciationAnalysisPrompt',
  input: {
    schema: z.object({
      transcribedText: z.string(),
      originalText: z.string(),
    }),
  },
  output: { schema: PronunciationAnalysisOutputSchema },
  prompt: `You are an expert Egyptian Arabic teacher evaluating a student's pronunciation.
You have the original text and a transcription of the student's speech.
Your task is to compare them and provide feedback.

Original Text: "{{originalText}}"
Student's (Transcribed) Text: "{{transcribedText}}"

- If the transcribed text is a very close match to the original text (minor variations in wording are acceptable), set 'evaluation' to 'correct' and provide encouraging feedback.
- If the transcribed text is significantly different, set 'evaluation' to 'incorrect' and explain the mistake gently. Point out the difference.
- If the transcribed text is garbled, empty, or makes no sense, set 'evaluation' to 'unclear' and ask the student to try speaking more clearly.
- Keep feedback concise and encouraging, in Arabic.

Example for 'correct': "ممتاز! نطقك سليم ومطابق للنص."
Example for 'incorrect': "محاولة جيدة! يبدو أنك قلت '{{transcribedText}}' بدلاً من '{{originalText}}'. حاول مرة أخرى."
Example for 'unclear': "عفواً، لم أتمكن من سماعك بوضوح. هل يمكنك التسجيل مرة أخرى بصوت أعلى؟"

Your response must be in the specified JSON format.`,
});


// === Main Flow ===

/**
 * The main Genkit flow for analyzing pronunciation.
 */
const pronunciationAnalysisFlow = ai.defineFlow(
  {
    name: 'pronunciationAnalysisFlow',
    inputSchema: PronunciationAnalysisInputSchema,
    outputSchema: PronunciationAnalysisOutputSchema,
  },
  async (input) => {
    
    // Step 1: Transcribe the user's audio to text.
    const transcribed = await run('transcribeAudio', async () => {
      const { text } = await prompt(
        {
          text: 'Transcribe this audio of a person speaking Egyptian Arabic.',
          media: [await media.fromDataUri(input.userAudio)],
        },
        {
          model: 'googleai/gemini-1.5-flash',
          config: { temperature: 0.1 },
        }
      );
      return text() || '';
    });
    
    // Step 2: Evaluate the transcribed text against the original.
    const { output } = await analysisPrompt({
      originalText: input.originalText,
      transcribedText: transcribed,
    });
    return output!;
  }
);


/**
 * The server action wrapper for the Genkit flow.
 * @param input The user's audio and original text.
 * @returns The AI-generated analysis.
 */
export async function getPronunciationAnalysisFlow(input: PronunciationAnalysisInput): Promise<PronunciationAnalysisOutput> {
  return await pronunciationAnalysisFlow(input);
}
''',
    "src/ai/flows/speech-flow.ts": '''
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
''',
    "src/ai/flows/storyteller-flow.ts": '''
'use server';
/**
 * @fileOverview An AI flow for narrating a museum artifact's story.
 *
 * This file defines the AI logic for a storyteller agent that takes an artifact's
 * title and description and generates a compelling narrative, then converts
 * that narrative into speech.
 *
 * - StorytellerInputSchema: Zod schema for the flow's input.
 * - StorytellerOutputSchema: Zod schema for the flow's output.
 * - getStorytellerAudioFlow: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

// === Schemas ===

export const StorytellerInputSchema = z.object({
  title: z.string().describe("The title of the artifact."),
  description: z.string().describe("A brief description of the artifact."),
});
export type StorytellerInput = z.infer<typeof StorytellerInputSchema>;

const NarrativeOutputSchema = z.object({
    narrative: z.string().describe("A compelling, story-like narrative about the artifact in Arabic, suitable for a museum audio guide."),
});

const SpeechOutputSchema = z.object({
  media: z.string().describe("The base64 encoded WAV audio data URI of the narrative."),
});
export type SpeechOutput = z.infer<typeof SpeechOutputSchema>;

// === Prompts ===

/**
 * Prompt to generate a compelling narrative from a simple description.
 */
const narrativePrompt = ai.definePrompt({
  name: 'storytellerNarrativePrompt',
  input: { schema: StorytellerInputSchema },
  output: { schema: NarrativeOutputSchema },
  prompt: `You are a master storyteller and expert Egyptologist, creating an audio guide for a world-class museum.
Your task is to take the following artifact information and expand it into a short, engaging, and captivating narrative in Arabic.
Make it sound professional, awe-inspiring, and educational.

Artifact Title: "{{title}}"
Artifact Description: "{{description}}"

- Start with an intriguing hook.
- Weave the description into a story.
- Use rich, descriptive language.
- Keep the narrative concise (2-3 sentences).
- The language must be formal Arabic, clear and easy to understand.
- DO NOT add any titles or labels, just the narrative text.

Example:
Input: { title: "قناع توت عنخ آمون", description: "أشهر قطعة أثرية في العالم. مصنوع من الذهب الخالص ومطعم بالأحجار الكريمة." }
Output: { "narrative": "تأملوا في عظمة الفن الملكي. هذا هو قناع الملك الشاب، توت عنخ آمون، تحفة فنية لا مثيل لها، صُنعت من أحد عشر كيلوغرامًا من الذهب الخالص ورُصّعت بأندر الأحجار الكريمة لتحمي الفرعون في رحلته الأبدية." }

Your response must be in the specified JSON format.`,
});

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

// === Flows ===

/**
 * Main Genkit flow to generate the storyteller audio.
 * This flow first generates a narrative, then converts it to speech.
 */
const storytellerAudioFlow = ai.defineFlow(
  {
    name: 'storytellerAudioFlow',
    inputSchema: StorytellerInputSchema,
    outputSchema: SpeechOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the narrative text.
    const narrativeResponse = await narrativePrompt(input);
    const narrative = narrativeResponse.output?.narrative;

    if (!narrative) {
      throw new Error('Failed to generate a narrative for the artifact.');
    }

    // Step 2: Convert the narrative to speech.
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Arcturus' }, // A deep, authoritative voice
          },
        },
      },
      prompt: narrative,
    });

    if (!media) {
      throw new Error('No media was returned from the TTS model.');
    }

    // Step 3: Convert the raw PCM audio to WAV format.
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
 * The server action wrapper for the Genkit flow.
 * @param input The artifact's title and description.
 * @returns The AI-generated audio as a data URI.
 */
export async function getStorytellerAudioFlow(input: StorytellerInput): Promise<SpeechOutput> {
    return await storytellerAudioFlow(input);
}
''',
    "src/ai/flows/tutor-flow.ts": '''
'use server';
/**
 * @fileOverview A "smart tutor" AI flow for the Yalla Masry Academy.
 *
 * This file defines the AI logic for a tutoring agent that answers student questions
 * based on a provided piece of course material (context).
 *
 * - AITutorInput: The Zod schema for the flow's input (course material and question).
 * - AITutorOutput: The Zod schema for the flow's output (the AI-generated answer).
 * - getTutorResponseFlow: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';

// Define the input schema for the AI tutor flow.
export const AITutorInputSchema = z.object({
  courseMaterial: z.string().describe('The course material or text to be analyzed.'),
  question: z.string().describe('The user’s question about the course material.'),
});
export type AITutorInput = z.infer<typeof AITutorInputSchema>;

// Define the output schema for the AI tutor flow.
export const AITutorOutputSchema = z.object({
  answer: z.string().describe('The AI tutor’s answer to the question.'),
});
export type AITutorOutput = z.infer<typeof AITutorOutputSchema>;

/**
 * Defines a Genkit prompt for the AI tutor.
 * The prompt instructs the AI to act as an expert in Egyptian Colloquial Arabic
 * and answer questions strictly based on the provided context.
 */
const tutorPrompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: AITutorInputSchema },
  output: { schema: AITutorOutputSchema },
  prompt: `You are an expert AI tutor for the Yalla Masry Academy, specializing in Egyptian Colloquial Arabic.
Your role is to answer student questions based *only* on the provided course material (context).
Do not use any external knowledge. If the answer is not in the context, politely state that.

Context (Course Material):
"""
{{{courseMaterial}}}
"""

Student's Question:
"""
{{{question}}}
"""

Answer the student's question based on the context above.`,
});

/**
 * Defines the main Genkit flow for the AI tutor.
 * This flow takes the course material and question, calls the prompt,
 * and returns the generated answer.
 */
const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: AITutorInputSchema,
    outputSchema: AITutorOutputSchema,
  },
  async (input) => {
    const { output } = await tutorPrompt(input);
    return output!;
  }
);


/**
 * The server action wrapper for the Genkit flow.
 * This function is called from the client-side to execute the AI tutor logic.
 * @param input The course material and the user's question.
 * @returns The AI-generated answer.
 */
export async function getTutorResponseFlow(input: AITutorInput): Promise<AITutorOutput> {
    return await tutorFlow(input);
}
''',
    "src/app/globals.css": '''
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 231 55% 95%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 231 48% 48%;
    --primary-foreground: 0 0% 98%;
    --secondary: 231 48% 90%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 231 48% 90%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 16 100% 70%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 231 48% 88%;
    --input: 231 48% 88%;
    --ring: 231 48% 48%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 231 48% 48%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 16 100% 70%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 231 48% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Yalla Masry Academy Styles */
body { font-family: 'El Messiri', sans-serif; background-color: #0d284e; }
:root {
    --nile-blue: #0b4e8d;
    --gold-accent: #FFD700;
    --sand-ochre: #d6b876;
    --dark-granite: #2a2a2a;
    --nile-dark: #0d284e;
}

.royal-title { font-family: 'Cairo', sans-serif; font-weight: 900; color: var(--gold-accent); }
.bg-nile-dark { background-color: #0d284e; }
.bg-nile { background-color: var(--nile-blue); }

.dashboard-card {
    background: linear-gradient(145deg, #1c3d6d, #0d284e);
    border: 2px solid var(--gold-accent);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
}

.stat-card {
    background-color: #17365e;
    border-bottom: 4px solid var(--sand-ochre);
    transition: transform 0.3s, background-color 0.3s;
}
.stat-card:hover {
    background-color: #23487f;
    transform: translateY(-5px);
}

.progress-bar-royal {
    height: 12px;
    background-color: #4b6992;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--gold-accent);
}
.progress-fill-royal {
    height: 100%;
    width: 0%;
    background-color: var(--gold-accent);
    transition: width 0.6s ease-out;
}

.cta-button {
    background-color: var(--gold-accent);
    color: var(--dark-granite);
    font-family: 'Cairo', sans-serif;
    font-weight: 900;
    transition: background-color 0.3s, transform 0.3s;
}
.cta-button:hover:not(:disabled) {
    background-color: #e5b800;
    transform: translateY(-2px);
}
.cta-button:disabled {
    background-color: #7a7a7a;
    cursor: not-allowed;
    transform: none;
    opacity: 0.5;
}


.challenge-item {
    background-color: #0b4e8d;
    border-right: 5px solid var(--gold-accent);
    cursor: pointer;
    transition: background-color 0.3s;
}
.challenge-item:hover {
    background-color: #094073;
}

.icon-symbol {
    color: var(--sand-ochre);
}

.utility-button {
    background-color: #0b4e8d;
    color: var(--sand-ochre);
    border: 2px solid var(--sand-ochre);
    transition: background-color 0.3s, border-color 0.3s;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
.utility-button:hover {
    background-color: #083c6b;
    border-color: var(--gold-accent);
}

.leaderboard-card {
    background-color: #17365e;
    border: 2px solid var(--sand-ochre);
}
.user-alias {
    font-family: 'Cairo', sans-serif;
}

#alias-input {
    background-color: #0b4e8d;
    border: 1px solid var(--sand-ochre);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
}
#alias-input::placeholder {
    color: #d6b876aa;
}
#alias-input:disabled {
    background-color: #1c2c44;
    cursor: not-allowed;
}

.alias-management-card {
    background-color: #17365e;
    border: 1px solid var(--sand-ochre);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

/* 3D Museum Styles (Updated) */
.museum-body {
    margin: 0;
    overflow: hidden;
    font-family: 'El Messiri', sans-serif;
    background-color: #000000;
    cursor: default; 
}
.museum-body canvas { display: block; }

#info-panel {
    position: fixed; 
    z-index: 30;
    top: 50%;
    left: 50%;
    background: rgba(0, 0, 0, 0.95);
    color: #FFD700;
    border-radius: 12px; 
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
    padding: 16px;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    max-width: 350px;
    width: 90%; 
    text-align: right;
    border: 2px solid #D4AF37; 
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(0.8);
}
#info-panel.visible {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, -50%) scale(1);
}

#artifact-title {
    font-size: 1.25rem; 
    margin-bottom: 8px;
}
#artifact-description, #puzzle-text {
    font-size: 0.85rem;
    line-height: 1.5;
}

#blocker {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.98);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: opacity 0.5s ease-in-out;
    pointer-events: auto;
    z-index: 20; 
}
#blocker.hidden {
    opacity: 0;
    pointer-events: none;
}

#markers-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 8;
}

.artifact-marker {
    position: absolute;
    pointer-events: auto;
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    cursor: pointer;
    width: 35px;
    height: 35px;
    background-color: rgba(255, 215, 0, 0.9); 
    color: #000;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
    transform: translate(-50%, -50%) scale(1);
}
.artifact-marker:hover {
    background-color: #FFD700;
    box-shadow: 0 0 15px #FFD700;
    transform: translate(-50%, -50%) scale(1.15); 
}
.marker-title {
    position: absolute;
    top: 40px; 
    font-size: 0.75rem;
    color: #FFD700;
    text-shadow: 0 0 4px #000;
    white-space: nowrap;
}

#report-button {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10;
}

#academic-report-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.98);
    z-index: 25;
    display: none;
    overflow-y: auto;
    align-items: center;
    justify-content: center;
}

.report-card {
    background-color: #1a1a1a;
    border: 2px solid #D4AF37;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
    max-width: 900px;
    width: 90%;
    padding: 30px;
    margin: 20px auto;
    color: #fff;
    text-align: right;
    transform: scale(1);
}

.artifact-status-item {
    background-color: #2e2e2e;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.achieved-icon { color: #38a169; }
.pending-icon { color: #f6ad55; }

.info-button {
    padding: 8px 12px; 
    font-size: 0.9rem;
}

.alert-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    z-index: 100;
    font-family: 'El Messiri', sans-serif;
    opacity: 1;
    transition: opacity 0.3s ease-out;
}

.spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 4px solid #FFD700;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-right: 8px;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
''',
    "src/app/layout.tsx": '''
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  // Use a template to dynamically set the title for each page
  title: {
    template: '%s | Yalla Masry Academy',
    default: 'Yalla Masry Academy - The Royal Way for Women & Children to Learn Egyptian Arabic',
  },
  description: 'The premier online academy for women and children to master Egyptian Colloquial Arabic with expert female tutors, interactive challenges, and a vibrant, safe community.',
  keywords: ['Learn Egyptian Arabic for women', 'Egyptian Colloquial Arabic for children', 'ECA for women', 'Study Arabic online', 'Female Arabic tutors', 'Egyptian Dialect for kids', 'يلا مصري', 'تعلم العامية المصرية للنساء والأطفال'],
  
  // Open Graph metadata for social sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'Yalla Masry Academy: The Royal Way for Women & Children to Learn Egyptian Arabic',
    description: 'The fun, safe, and effective way for women and children to master the Egyptian dialect with expert female tutors.',
    type: 'website',
    url: 'https://www.yallamasry.com', // To be replaced with the actual domain
    images: [
      {
        url: '/og-image.png', // To be created. Recommended size: 1200x630
        width: 1200,
        height: 630,
        alt: 'Yalla Masry Academy Royal Banner for Women and Children',
      },
    ],
    siteName: 'Yalla Masry Academy',
  },

  // Twitter specific metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Yalla Masry Academy: Master the Egyptian Dialect for Women & Children',
    description: 'The fun, gamified platform for women and kids to master Egyptian Colloquial Arabic.',
    // creator: '@YourTwitterHandle', // To be added later
    images: ['/twitter-image.png'], // To be created. Recommended size: 1200x675
  },
  
  // Other important metadata
  metadataBase: new URL('https://www.yallamasry.com'), // Replace with actual domain
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // PWA manifest
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&family=El+Messiri:wght@400;700;900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0d284e" />
      </head>
      <body>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
''',
    "src/app/page.tsx": '''
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser, useAuth, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { updateProfileNonBlocking } from '@/firebase/non-blocking-login';
import {
  ArrowRight,
  BookOpen,
  Crown,
  Gem,
  LogIn,
  UserPlus,
  LogOut,
  GraduationCap,
  Mic,
  Smile,
  Palette,
  Shuffle,
  Map,
  Volume2,
  Users,
  CalendarCheck,
  Store,
  Landmark,
  BookMarked,
  Edit,
  Save,
  Loader2,
  Baby,
  BarChart3,
  Target,
  MessagesSquare,
  Globe,
  Medal,
} from 'lucide-react';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { Badge, getBadgeByName, type BadgeInfo } from '@/lib/badges';

interface Progress {
    id: string;
    courseId: string;
    completedLessons: string[];
}

const getRoyalTitle = (points: number): string => {
  if (points >= 1000) return "يد الفرعون";
  if (points >= 750) return "كاهنة المعبد";
  if (points >= 500) return "مهندسة ملكية";
  if (points >= 250) return "كاتبة البردي";
  if (points >= 100) return "تلميذة النيل";
  return "مستجدة في المملكة";
};


const StatCard = ({
  icon,
  value,
  label,
  isLoading,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  isLoading?: boolean;
}) => (
  <Card className="stat-card p-4">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-sand-ochre">
        {label}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
    </CardContent>
  </Card>
);

const ChallengeLink = ({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title:string;
  description: string;
  icon: React.ReactNode;
}) => (
  <Link
    href={href}
    className="challenge-item group block p-4 rounded-lg transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <div className="icon-symbol text-3xl text-gold-accent w-8 flex justify-center">{icon}</div>
      <div>
        <h3 className="font-bold text-white group-hover:text-gold-accent transition-colors">
          {title}
        </h3>
        <p className="text-sm text-sand-ochre">{description}</p>
      </div>
      <ArrowRight className="mr-auto h-5 w-5 text-sand-ochre group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

const AliasManagement = ({ user, toast }: { user: any, toast: any }) => {
    const [alias, setAlias] = useState(user.displayName || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSaveAlias = () => {
        if (!alias.trim()) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا يمكن ترك الاسم المستعار فارغاً.' });
            return;
        }
        setIsSubmitting(true);
        updateProfileNonBlocking(user, { displayName: alias }, (result) => {
            if (result.success) {
                toast({ title: 'تم التحديث بنجاح!', description: 'تم تغيير اسمك المستعار في جميع أنحاء المملكة.' });
                setIsEditing(false);
            } else {
                toast({ variant: 'destructive', title: 'فشل التحديث', description: result.error?.message || 'حدث خطأ غير متوقع.' });
            }
            setIsSubmitting(false);
        });
    };

    return (
        <Card className="alias-management-card p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-gold-accent"/>
                    {isEditing ? (
                        <Input
                            id="alias-input"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            className="bg-nile-dark border-sand-ochre text-white"
                            disabled={isSubmitting}
                        />
                    ) : (
                        <span className="text-lg font-bold text-white user-alias">{user.displayName || 'زائر ملكي'}</span>
                    )}
                </div>
                {isEditing ? (
                    <Button onClick={handleSaveAlias} size="sm" className="cta-button" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                        <span className="hidden sm:inline ml-2">حفظ</span>
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost" className="text-sand-ochre hover:text-gold-accent">
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">تغيير</span>
                    </Button>
                )}
            </div>
        </Card>
    );
}

const BadgeDisplay = ({ badgeInfo }: { badgeInfo: BadgeInfo }) => {
    const Icon = badgeInfo.icon;
    return (
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-nile-dark/50" title={badgeInfo.description}>
            <Icon className="w-8 h-8" style={{ color: badgeInfo.color }} />
            <span className="text-xs mt-1 text-center text-sand-ochre">{badgeInfo.name}</span>
        </div>
    );
};


export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const progressCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/progress`);
  }, [user, firestore]);
  
  const { data: progresses, isLoading: isProgressLoading } = useCollection<Progress>(progressCollectionRef);
  
  const nilePoints = user?.nilePoints ?? 0;
  const royalTitle = getRoyalTitle(nilePoints);
  
  useEffect(() => {
    const fetchCourseData = async () => {
        if (!firestore) return;
        setIsStatsLoading(true);

        try {
            let completedCount = 0;
            let totalCount = 0;

            const coursesQuery = query(collection(firestore, 'courses'));
            const coursesSnapshot = await getDocs(coursesQuery);
            
            const lessonCountPromises = coursesSnapshot.docs.map(async (courseDoc) => {
                const lessonsQuery = query(collection(firestore, `courses/${courseDoc.id}/lessons`));
                const lessonsSnapshot = await getDocs(lessonsQuery);
                return lessonsSnapshot.size;
            });
            
            const lessonCounts = await Promise.all(lessonCountPromises);
            totalCount = lessonCounts.reduce((sum, count) => sum + count, 0);

            if (progresses) {
                completedCount = progresses.reduce((sum, progress) => sum + progress.completedLessons.length, 0);
            }
            
            setLessonsCompleted(completedCount);
            setTotalLessons(totalCount);
        } catch (error) {
            console.error("Error fetching course stats:", error);
            toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل إحصائيات الدورات." });
        } finally {
            setIsStatsLoading(false);
        }
    };

    if (user && !isProgressLoading) {
        fetchCourseData();
    } else if (!user) {
        setIsStatsLoading(false);
        setLessonsCompleted(0);
        setTotalLessons(0);
    }
  }, [progresses, firestore, isProgressLoading, user, toast]);


  const progressPercentage = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0;
  const userBadges: BadgeInfo[] = user?.badges?.map((badgeName: string) => getBadgeByName(badgeName)).filter((b: BadgeInfo | null) => b !== null) as BadgeInfo[] || [];


  const handleSignOut = () => {
    if (auth) {
      initiateSignOut(auth, () => {
         toast({
            title: "تم تسجيل الخروج",
            description: "نأمل أن نراك قريباً في المملكة.",
        });
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-nile-dark text-white p-4 md:p-8"
      style={{ direction: 'rtl' }}
    >
      <div className="max-w-7xl mx-auto">
        {isUserLoading ? (
          <div className="text-center p-10 flex justify-center items-center h-[80vh]">
            <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
            <p className="text-xl text-sand-ochre mr-4">
              جاري استدعاء السجلات الملكية...
            </p>
          </div>
        ) : user ? (
          // Authenticated User Dashboard
          <>
            <header className="mb-10 flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-black royal-title mb-2">
                  ديوان الإنجازات الملكية
                </h1>
                <p className="text-xl text-sand-ochre">
                  مرحباً بعودتكِ يا <span className="font-bold text-white">{user.displayName || 'أيتها الملكة'}</span>!
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="utility-button"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </Button>
                <Link href="/admin" passHref>
                   <Button variant="outline" className="utility-button">
                      <Crown className="ml-2 h-4 w-4" />
                      الإدارة
                   </Button>
                </Link>
              </div>
            </header>

            <main>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="lg:col-span-2">
                     <AliasManagement user={user} toast={toast} />
                  </div>
                  <StatCard
                    icon={<Gem className="h-6 w-6 text-sand-ochre" />}
                    value={`${nilePoints}`}
                    label="نقاط النيل"
                    isLoading={isUserLoading}
                  />
                  <StatCard
                    icon={<BookOpen className="h-6 w-6 text-sand-ochre" />}
                    value={`${lessonsCompleted} من ${totalLessons}`}
                    label="الدروس المكتملة"
                    isLoading={isStatsLoading || isProgressLoading}
                  />
              </div>

               {/* Progress and Achievements Section */}
                <Card className="dashboard-card mb-8">
                    <CardHeader>
                        <CardTitle className="royal-title text-2xl">تقدمكِ وأوسمتكِ في المملكة</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="md:col-span-2">
                               {isStatsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-sand-ochre"/>
                               ) : (
                                <>
                                  <p className="text-sand-ochre mb-4">لقبك الملكي الحالي: <span className="font-bold text-white text-lg">{royalTitle}</span></p>
                                  <div className="progress-bar-royal mb-4">
                                    <div className="progress-fill-royal" style={{ width: `${progressPercentage}%` }}></div>
                                  </div>
                                  <div className="flex justify-between text-xs text-sand-ochre">
                                      <span>المستوى الحالي</span>
                                      <span>المستوى التالي: كاتب البردي</span>
                                  </div>
                                </>
                               )}
                           </div>
                           <div>
                                <h3 className="text-sand-ochre mb-4 font-bold">ديوان الشارات الملكية</h3>
                                {userBadges.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {userBadges.map(badge => <BadgeDisplay key={badge.name} badgeInfo={badge} />)}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">لم تحصلي على أي شارات بعد. أكملي التحديات لتبدأي!</p>
                                )}
                           </div>
                       </div>
                    </CardContent>
                </Card>


              {/* Main Content Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="royal-title text-2xl">
                      تحديات المملكة
                    </CardTitle>
                    <CardDescription className="text-sand-ochre">
                      صقلي مهاراتكِ واجمعي نقاط النيل.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ChallengeLink
                      href="/pronunciation-challenge"
                      title="قوة حتشبسوت"
                      description="تحدي النطق والتكرار."
                      icon={<Mic />}
                    />
                    <ChallengeLink
                      href="/dialogue-challenge"
                      title="حوارات السوق"
                      description="تحدي محاكاة المواقف اليومية."
                      icon={<Smile />}
                    />
                     <ChallengeLink
                      href="/comic-studio"
                      title="استوديو القصص المصورة"
                      description="اصنعي قصصاً بصوتكِ."
                      icon={<Palette />}
                    />
                    <ChallengeLink
                      href="/word-scramble"
                      title="ألغاز الكلمات"
                      description="أعيدي ترتيب الكلمات لتكوين جمل صحيحة."
                      icon={<Shuffle />}
                    />
                  </CardContent>
                </Card>

                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="royal-title text-2xl">
                      أدوات التعلم
                    </CardTitle>
                    <CardDescription className="text-sand-ochre">
                      استكشفي موارد الأكاديمية.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ChallengeLink
                      href="/learning-path"
                      title="مسار التعلم الملكي"
                      description="تابعي تقدمكِ في المنهج الدراسي."
                      icon={<Map />}
                    />
                    <ChallengeLink
                      href="/audio-library"
                      title="خزانة الأصوات"
                      description="استمعي للنطق الصحيح للعبارات."
                      icon={<Volume2 />}
                    />
                     <ChallengeLink
                      href="/tutor"
                      title="المعلم الخصوصي الذكي"
                      description="احصلي على إجابات فورية لأسئلتكِ."
                      icon={<GraduationCap />}
                    />
                     <ChallengeLink
                      href="/goals"
                      title="بوابة تحديد المصير"
                      description="حددي أهدافكِ التعليمية لتخصيص رحلتك."
                      icon={<Target />}
                    />
                    <ChallengeLink
                      href="/level-assessment"
                      title="اختبار تحديد المستوى"
                      description="اكتشفي مستواكِ الحالي وابدأي من حيث يجب."
                      icon={<BarChart3 />}
                    />
                  </CardContent>
                </Card>

                 <Card className="dashboard-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="royal-title text-2xl">
                      استكشاف المملكة
                    </CardTitle>
                    <CardDescription className="text-sand-ochre">
                      موارد إضافية لتجربة تعليمية فريدة.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <ChallengeLink
                      href="/instructors"
                      title="معلمات المملكة"
                      description="تصفحي ملفات المعلمات."
                      icon={<Users />}
                    />
                     <ChallengeLink
                      href="/booking"
                      title="حجز الدروس"
                      description="احجزي موعدكِ القادم."
                      icon={<CalendarCheck />}
                    />
                     <ChallengeLink
                      href="/store"
                      title="متجر الكنوز"
                      description="منتجات رقمية وهدايا."
                      icon={<Store />}
                    />
                     <ChallengeLink
                      href="/museum"
                      title="المتحف الافتراضي"
                      description="تجربة تفاعلية ثلاثية الأبعاد."
                      icon={<Landmark />}
                    />
                     <ChallengeLink
                      href="/quran"
                      title="واحة القرآن"
                      description="قسم خاص بالعلوم الشرعية."
                      icon={<BookMarked />}
                    />
                     <ChallengeLink
                      href="/kids"
                      title="ركن الأطفال"
                      description="تحديات ومواد تعليمية للصغار."
                      icon={<Baby />}
                    />
                  </CardContent>
                </Card>
                <Card className="dashboard-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="royal-title text-2xl">
                        التواصل والتوسع
                    </CardTitle>
                    <CardDescription className="text-sand-ochre">
                      تواصلي مع باقي أعضاء المملكة واستكشفي آفاقًا جديدة.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChallengeLink
                      href="/community-chat"
                      title="ساحة الحوار الكبرى"
                      description="دردشة عامة مع جميع طلاب المملكة."
                      icon={<MessagesSquare />}
                    />
                    <ChallengeLink
                      href="/gulf-gateway"
                      title="رحلة نوف في مصر"
                      description="مغامرة تفاعلية لفهم اللهجة المصرية."
                      icon={<Globe />}
                    />
                  </CardContent>
                </Card>
              </div>
            </main>
          </>
        ) : (
          // Unauthenticated User Landing
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <Crown className="w-24 h-24 text-gold-accent mb-4" />
            <h1 className="text-5xl md:text-6xl font-black royal-title mb-4">
              أهلاً بكِ في أكاديمية يلا مصري
            </h1>
            <p className="text-2xl text-sand-ochre mb-10 max-w-2xl">
              البوابة الملكية للنساء والأطفال لإتقان اللهجة المصرية في بيئة آمنة
              وممتعة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="cta-button text-lg px-8 py-6">
                <Link href="/login">
                  <LogIn className="ml-2" /> تسجيل الدخول
                </Link>
              </Button>
              <Button asChild variant="outline" className="utility-button text-lg px-8 py-6">
                <Link href="/signup">
                  <UserPlus className="ml-2" /> انضمي إلى المملكة
                </Link>
              </Button>
            </div>
            <div className="mt-8">
              <Link
                href="/landing"
                className="text-sand-ochre hover:text-gold-accent transition-colors underline"
              >
                أو تصفحي المزيد عنا
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
''',
    "src/components/layout/app-sidebar.tsx": '''
'use client';

import {
  BookOpenCheck,
  LayoutDashboard,
  BookCopy,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '#', label: 'All Courses', icon: BookCopy },
  { href: '#', label: 'Messages', icon: MessageSquare },
  { href: '#', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <BookOpenCheck className="size-6 text-sidebar-primary" />
          <span className="text-lg font-semibold font-headline">EdTech</span>
        </div>
      </SidebarHeader>

      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="p-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>

      <SidebarFooter>
        <Separator className="my-2" />
        <p className="text-xs text-sidebar-foreground/60 p-2 group-data-[collapsible=icon]:hidden">
          © 2024 EdTech Inc.
        </p>
      </SidebarFooter>
    </>
  );
}
''',
    "src/components/layout/header.tsx": '''
'use client';

import Link from 'next/link';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import Image from 'next/image';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { user } from '@/lib/data';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Image
              src={user.avatar.imageUrl}
              width={36}
              height={36}
              alt="User avatar"
              className="rounded-full"
              data-ai-hint={user.avatar.imageHint}
            />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/login">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
''',
    "src/components/layout/main-layout.tsx": '''
import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Header } from './header';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
''',
}


def main():
    """
    Main function to create the project structure and files.
    """
    print("Starting to build the Yalla Masry Academy kingdom...")
    
    # The project root will be created in the current working directory
    project_root = os.path.join(os.getcwd(), "yalla-masry-academy")
    
    if os.path.exists(project_root):
        print(f"Project directory '{project_root}' already exists.")
        # Do not automatically overwrite to be safe
    else:
        os.makedirs(project_root)
        print(f"Created project directory: '{project_root}'")

    for file_path, content in PROJECT_FILES.items():
        # Sanitize file path for the current OS
        sanitized_path = os.path.join(project_root, *file_path.split('/'))
        
        # Ensure the directory for the file exists
        dir_name = os.path.dirname(sanitized_path)
        if not os.path.exists(dir_name):
            os.makedirs(dir_name)
            print(f"  Created directory: '{dir_name}'")
            
        # Write the file content
        try:
            with open(sanitized_path, 'w', encoding='utf-8') as f:
                # textwrap.dedent removes leading whitespace from multiline strings
                f.write(textwrap.dedent(content).strip())
            print(f"    - Successfully created file: '{sanitized_path}'")
        except Exception as e:
            print(f"    - !!! ERROR creating file '{sanitized_path}': {e}")
            
    print("\\n'Yalla Masry Academy' has been successfully built!")
    print(f"All project files are now in the '{project_root}' folder.")
    print("You can now proceed with the next commands in your terminal.")

if __name__ == "__main__":
    main()

    