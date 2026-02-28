import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import { prisma } from "../src/lib/prisma.js";
import { generateLessonData } from "../src/lib/gemini.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Starting Production Resumable Seeder...");

  // 1. Load the Dictionary
  const dictPath = path.join(__dirname, "data", "dictionary.json");
  const rawDict = fs.readFileSync(dictPath, "utf8");
  const dictionary = JSON.parse(rawDict);

  // 2. Parse the CSV Frequency Data
  const freqPath = path.join(__dirname, "data", "unigram_freq.csv");
  const frequencyData = [];

  console.log("Parsing word frequency data...");
  await new Promise((resolve, reject) => {
    fs.createReadStream(freqPath)
      .pipe(csv())
      .on("data", (row) => {
        const word = row.word?.toLowerCase();
        // Ensure the word exists in our dictionary so Gemini has a baseline
        if (word && dictionary[word.toUpperCase()]) {
          frequencyData.push({ word, count: parseInt(row.count, 10) });
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });

  // Sort by frequency (highest count first)
  frequencyData.sort((a, b) => b.count - a.count);

  // Skip the top 2,000 words to hit "medium" difficulty, then grab the next chunk
  const targetWords = frequencyData.slice(2000, 10000).map((item) => item.word);

  // 3. Database State Verification (Resumability)
  const existingWordsRaw = await prisma.word.findMany({
    select: { word: true },
  });
  const existingWords = new Set(existingWordsRaw.map((w) => w.word));

  const maxLesson = await prisma.lesson.findFirst({
    orderBy: { lessonNumber: "desc" },
  });
  let nextLessonNumber = maxLesson ? maxLesson.lessonNumber + 1 : 1;

  console.log(`Found ${existingWords.size} words already seeded.`);
  console.log(`Resuming generation from Lesson ${nextLessonNumber}...\n`);

  // 4. The Smart Loop
  for (const currentWord of targetWords) {
    // Instantly skip if the word is already in the database
    if (existingWords.has(currentWord)) {
      continue;
    }

    // --- BOSS LEVEL INJECTOR ---
    // If we hit a multiple of 10, create a Boss Level without hitting the AI API
    if (nextLessonNumber % 10 === 0) {
      console.log(
        `[Lesson ${nextLessonNumber}] Creating Boss Level (Milestone Review)...`,
      );

      const bossLesson = await prisma.lesson.create({
        data: {
          lessonNumber: nextLessonNumber,
          title: `Milestone Review ${nextLessonNumber / 10}`,
        },
      });

      // Fetch the last 9 lessons and link their words to this boss level
      const lastNineLessons = await prisma.lesson.findMany({
        where: {
          lessonNumber: {
            gte: nextLessonNumber - 9,
            lt: nextLessonNumber,
          },
        },
        include: { words: true },
      });

      const bossLinks = [];
      for (const l of lastNineLessons) {
        for (const w of l.words) {
          bossLinks.push({ lessonId: bossLesson.id, wordId: w.wordId });
        }
      }

      if (bossLinks.length > 0) {
        await prisma.lessonWord.createMany({ data: bossLinks });
      }

      nextLessonNumber++;
    }
    // --- END BOSS LEVEL INJECTOR ---

    // Process the normal word lesson
    console.log(
      `[Lesson ${nextLessonNumber}] Generating content for "${currentWord}"...`,
    );

    try {
      const aiData = await generateLessonData(currentWord);

      if (!aiData) {
        console.error(`Skipping "${currentWord}" due to AI API failure.`);
        continue; // Move to the next word, do not increment lesson number
      }

      // 1. Create Lesson
      const lesson = await prisma.lesson.create({
        data: {
          lessonNumber: nextLessonNumber,
          title: `Focus: ${currentWord.charAt(0).toUpperCase() + currentWord.slice(1)}`,
        },
      });

      // 2. Create Word
      const wordRecord = await prisma.word.create({
        data: {
          word: aiData.word.toLowerCase(),
          definition: aiData.definition,
          partOfSpeech: aiData.part_of_speech,
          difficultyLevel: 2, // Tagged as Medium
        },
      });

      // 3. Link Word to Lesson
      await prisma.lessonWord.create({
        data: { lessonId: lesson.id, wordId: wordRecord.id },
      });

      // 4. Create Content
      await prisma.content.createMany({
        data: [
          {
            wordId: wordRecord.id,
            contentType: "story_context",
            textBody: aiData.story_context,
          },
          {
            wordId: wordRecord.id,
            contentType: "quiz_usage",
            textBody: aiData.quiz_usage.question,
            options: aiData.quiz_usage.options,
            correctAnswer: aiData.quiz_usage.answer,
          },
          {
            wordId: wordRecord.id,
            contentType: "quiz_implication",
            textBody: aiData.quiz_implication.question,
            options: aiData.quiz_implication.options,
            correctAnswer: aiData.quiz_implication.answer,
          },
          {
            wordId: wordRecord.id,
            contentType: "quiz_synonym",
            textBody: aiData.quiz_synonym.question,
            options: aiData.quiz_synonym.options,
            correctAnswer: aiData.quiz_synonym.answer,
          },
          {
            wordId: wordRecord.id,
            contentType: "quiz_true_false",
            textBody: aiData.quiz_true_false.question,
            options: aiData.quiz_true_false.options,
            correctAnswer: aiData.quiz_true_false.answer,
          },
        ],
      });

      // Add to our local cache so we don't process it again if the CSV has duplicates
      existingWords.add(currentWord);
      console.log(
        `Successfully saved Lesson ${nextLessonNumber} for "${currentWord}".`,
      );

      nextLessonNumber++;

      // Delay to respect Gemini API rate limits
      await delay(3000);
    } catch (error) {
      console.error(
        `🚨 Failed processing word "${currentWord}":`,
        error.message,
      );
    }
  }

  console.log("\nProduction Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Fatal error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
