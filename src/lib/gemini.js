// src/lib/gemini.js
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fetch from "node-fetch";
import { SocksProxyAgent } from "socks-proxy-agent";

// 1. Initialize the SOCKS5 Agent pointing to v2rayN's default port
const proxyAgent = new SocksProxyAgent("socks5://127.0.0.1:10808");

// 2. Create a custom fetch wrapper
// We use node-fetch here because standard Node 18+ fetch doesn't cleanly accept custom agents
const proxiedFetch = (url, options) => {
  return fetch(url, { ...options, agent: proxyAgent });
};

// 3. Initialize the Gemini Client, injecting the proxy
// The SDK safely accepts a custom fetch implementation in its options object
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  fetch: proxiedFetch,
});

// We define a strict schema to guarantee Gemini always returns the exact format our database expects.
const lessonSchema = {
  type: SchemaType.OBJECT,
  properties: {
    word: { type: SchemaType.STRING },
    part_of_speech: { type: SchemaType.STRING },
    definition: { type: SchemaType.STRING },
    story_context: { type: SchemaType.STRING },
    quiz_usage: {
      type: SchemaType.OBJECT,
      properties: {
        question: { type: SchemaType.STRING },
        options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        answer: { type: SchemaType.STRING },
      },
      required: ["question", "options", "answer"],
    },
    quiz_implication: {
      type: SchemaType.OBJECT,
      properties: {
        question: { type: SchemaType.STRING },
        options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        answer: { type: SchemaType.STRING },
      },
      required: ["question", "options", "answer"],
    },
    quiz_synonym: {
      type: SchemaType.OBJECT,
      properties: {
        question: { type: SchemaType.STRING },
        options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        answer: { type: SchemaType.STRING },
      },
      required: ["question", "options", "answer"],
    },
    quiz_true_false: {
      type: SchemaType.OBJECT,
      properties: {
        question: { type: SchemaType.STRING },
        options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        answer: { type: SchemaType.STRING },
      },
      required: ["question", "options", "answer"],
    },
  },
  required: [
    "word",
    "part_of_speech",
    "definition",
    "story_context",
    "quiz_usage",
    "quiz_implication",
    "quiz_synonym",
    "quiz_true_false",
  ],
};

export async function generateLessonData(targetWord) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: lessonSchema,
        temperature: 0.7,
      },
    });

    const prompt = `
      You are an expert English linguist and game designer.
      Generate a highly engaging, 6-step vocabulary lesson for the word: "${targetWord}".
      
      Requirements:
      1. Provide the definition and part of speech.
      2. Write a gripping, atmospheric 2-sentence story using the word naturally.
      3. For 'quiz_usage', write 4 distinct sentences. Only ONE should use the word correctly. The question must be "Which sentence uses the word '${targetWord}' correctly?".
      4. For 'quiz_implication', write a sentence containing the word, and ask what it implies about the subject. Provide 4 options, only 1 correct.
      5. For 'quiz_synonym', ask for the closest meaning. Provide 4 options, 1 correct.
      6. For 'quiz_true_false', write a real-world scenario testing the word's vibe. Options must be ["True", "False"].
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return JSON.parse(responseText);
  } catch (error) {
    console.error(`Failed to generate lesson for ${targetWord}:`, error);
    return null;
  }
}
