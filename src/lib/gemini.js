// src/lib/gemini.js
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { SocksProxyAgent } from "socks-proxy-agent";
import nodeFetch from "node-fetch";

// 1. SETUP PROXY CONNECTION
const proxyUrl = "socks5://127.0.0.1:10808";
const agent = new SocksProxyAgent(proxyUrl);

// 2. CREATE CUSTOM GOOGLE PROVIDER
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY, // Ensure this matches your .env variable name
  fetch: async (url, options) => {
    console.log(`🔌 Proxying request to: ${url}`);
    try {
      return await nodeFetch(url, { ...options, agent });
    } catch (error) {
      console.error("❌ Proxy Error:", error.message);
      throw error;
    }
  },
});

// 3. DEFINE ZOD SCHEMA
const lessonSchema = z.object({
  word: z.string(),
  part_of_speech: z.string(),
  definition: z.string(),
  story_context: z.string(),
  quiz_usage: z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
  }),
  quiz_implication: z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
  }),
  quiz_synonym: z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
  }),
  quiz_true_false: z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
  }),
});

export async function generateLessonData(targetWord) {
  try {
    // 4. ASK GEMINI (Through Proxy, forcing JSON structure)
    const { object: aiParams } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: lessonSchema,
      prompt: `
        You are an expert English linguist and game designer.
        Generate a highly engaging, 6-step vocabulary lesson for the word: "${targetWord}".
        
        Requirements:
        1. Provide the definition and part of speech.
        2. Write a gripping, atmospheric 2-sentence story using the word naturally.
        3. For 'quiz_usage', write 4 distinct sentences. Only ONE should use the word correctly. The question must be "Which sentence uses the word '${targetWord}' correctly?".
        4. For 'quiz_implication', write a sentence containing the word, and ask what it implies about the subject. Provide 4 options, only 1 correct.
        5. For 'quiz_synonym', ask for the closest meaning. Provide 4 options, 1 correct.
        6. For 'quiz_true_false', write a real-world scenario testing the word's vibe. Options must be ["True", "False"].
      `,
    });

    return aiParams;
  } catch (error) {
    console.error(
      `🚨 Failed to generate lesson for ${targetWord}:`,
      error.message,
    );
    return null;
  }
}
