// prisma/seed.js
import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("Resetting database for single-word MVP...");

  // Clean up existing data for a fresh test
  await prisma.content.deleteMany();
  await prisma.lessonWord.deleteMany();
  await prisma.word.deleteMany();
  await prisma.lesson.deleteMany();

  console.log("Seeding Lesson 1: Macabre...");

  // 1. Create the Lesson
  const lesson = await prisma.lesson.create({
    data: {
      lessonNumber: 1,
      title: "The Atmospheric Edge",
    },
  });

  // 2. Create the Word
  const wordRecord = await prisma.word.create({
    data: {
      word: "macabre",
      definition:
        "Disturbing and horrifying because of involvement with or depiction of death and injury.",
      partOfSpeech: "Adjective",
      difficultyLevel: 3,
    },
  });

  // Link Word to Lesson
  await prisma.lessonWord.create({
    data: { lessonId: lesson.id, wordId: wordRecord.id },
  });

  // 3. Inject the 6-Step Content
  await prisma.content.createMany({
    data: [
      {
        wordId: wordRecord.id,
        contentType: "story_context",
        textBody:
          "The detective slowly pushed open the basement door, his flashlight cutting through the thick dust. What he found inside was a macabre display of antique dolls, each carefully positioned to mimic a famous historical execution.",
      },
      {
        wordId: wordRecord.id,
        contentType: "quiz_formal",
        textBody:
          "The director's latest film was heavily censored due to its _____ special effects, which the studio deemed too graphic for mainstream audiences.",
        options: ["macabre", "uplifting", "mundane", "ephemeral"],
        correctAnswer: "macabre",
      },
      {
        wordId: wordRecord.id,
        contentType: "quiz_casual",
        textBody:
          "I don't know why he's so obsessed with those midnight cemetery tours; the whole vibe is just too _____ for me.",
        options: ["hilarious", "macabre", "soothing", "predictable"],
        correctAnswer: "macabre",
      },
      {
        wordId: wordRecord.id,
        contentType: "quiz_synonym",
        textBody: "Which of the following is closest in meaning to Macabre?",
        options: ["Gruesome", "Cheerful", "Tedious", "Complicated"],
        correctAnswer: "Gruesome",
      },
      {
        wordId: wordRecord.id,
        contentType: "quiz_true_false",
        textBody:
          "A brightly lit, bustling comedy club on a Saturday night is the perfect setting for a macabre scene.",
        options: ["True", "False"],
        correctAnswer: "False",
      },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
