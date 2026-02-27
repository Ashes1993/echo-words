// prisma/seed.js
import { prisma } from "../src/lib/prisma.js";
import { generateLessonData } from "../src/lib/gemini.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Resetting database for 1-Word-per-Lesson architecture...");

  await prisma.content.deleteMany();
  await prisma.lessonWord.deleteMany();
  await prisma.word.deleteMany();
  await prisma.lesson.deleteMany();

  const targetWords = [
    "macabre",
    "ominous",
    "sinister",
    "desolate",
    "malevolent",
  ];

  for (let i = 0; i < targetWords.length; i++) {
    const currentWord = targetWords[i];
    const lessonNumber = i + 1;
    console.log(
      `\n[Lesson ${lessonNumber}] Generating content for "${currentWord}"...`,
    );

    try {
      // 1. Fetch AI Data
      const aiData = await generateLessonData(currentWord);

      if (!aiData) {
        console.error(`Skipping "${currentWord}" due to API failure.`);
        continue;
      }

      // 2. Create the standalone Lesson
      const lesson = await prisma.lesson.create({
        data: {
          lessonNumber: lessonNumber,
          title: `Focus: ${currentWord.charAt(0).toUpperCase() + currentWord.slice(1)}`,
        },
      });

      // 3. Save the Word
      const wordRecord = await prisma.word.create({
        data: {
          word: aiData.word.toLowerCase(),
          definition: aiData.definition,
          partOfSpeech: aiData.part_of_speech,
          difficultyLevel: 3,
        },
      });

      // 4. Link Word to Lesson
      await prisma.lessonWord.create({
        data: { lessonId: lesson.id, wordId: wordRecord.id },
      });

      // 5. Save the 6-Step Content
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

      console.log(
        `Successfully created Lesson ${lessonNumber} for "${currentWord}".`,
      );

      // Rate Limit Buffer
      if (i < targetWords.length - 1) {
        await delay(3000);
      }
    } catch (error) {
      console.error(`Failed processing word "${currentWord}":`, error);
    }
  }

  console.log("\nAI Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Fatal error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
