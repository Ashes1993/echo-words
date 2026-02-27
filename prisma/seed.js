// prisma/seed.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import { prisma } from "../src/lib/prisma.js"; // Import the global Prisma client

// Recreate __dirname for ES module environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting MVP database seed...");

  // 1. Load the Dictionary
  const dictPath = path.join(__dirname, "data", "dictionary.json");
  const rawDict = fs.readFileSync(dictPath, "utf8");
  const dictionary = JSON.parse(rawDict);

  // 2. Parse the Frequency List
  const freqPath = path.join(__dirname, "data", "unigram_freq.csv");
  const frequencyData = [];

  console.log("Parsing word frequency data...");

  await new Promise((resolve, reject) => {
    fs.createReadStream(freqPath)
      .pipe(csv())
      .on("data", (row) => {
        // Only keep words that exist in our dictionary to ensure we have definitions
        const word = row.word?.toUpperCase();
        if (word && dictionary[word]) {
          frequencyData.push({
            word: word.toLowerCase(),
            count: parseInt(row.count, 10),
            definition: dictionary[word],
          });
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });

  // Sort by frequency (highest count first)
  frequencyData.sort((a, b) => b.count - a.count);

  // 3. Select 100 words for the MVP (Skipping the top 5,000 most common words)
  const mvpWords = frequencyData.slice(5000, 5100);

  // 4. Create Lessons and inject Words
  let wordCounter = 0;

  for (let i = 1; i <= 10; i++) {
    const lesson = await prisma.lesson.create({
      data: {
        lessonNumber: i,
        title: `Foundation Level ${i}`,
      },
    });

    console.log(`Created Lesson ${i}`);

    // Take 10 words for this lesson
    const lessonWords = mvpWords.slice(wordCounter, wordCounter + 10);

    for (const item of lessonWords) {
      // Create the Word
      const wordRecord = await prisma.word.create({
        data: {
          word: item.word,
          definition: item.definition,
          difficultyLevel: 2,
        },
      });

      // Link Word to Lesson
      await prisma.lessonWord.create({
        data: {
          lessonId: lesson.id,
          wordId: wordRecord.id,
        },
      });

      // Generate Placeholder Content
      await prisma.content.createMany({
        data: [
          {
            wordId: wordRecord.id,
            contentType: "example_formal",
            textBody: `The board of directors noted the ${item.word} nature of the report.`,
          },
          {
            wordId: wordRecord.id,
            contentType: "quiz_fill_blank",
            textBody: `Despite the challenges, her approach was incredibly _____.`,
            options: [item.word, "apple", "car", "blue"],
            correctAnswer: item.word,
          },
        ],
      });
    }
    wordCounter += 10;
  }

  console.log("MVP Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
