// src/app/(dashboard)/play/[id]/page.js
import { prisma } from "../../../../lib/prisma.js";
import GameEngine from "./GameEngine.js";
import { redirect } from "next/navigation";

export default async function LessonPage({ params }) {
  // Await params for Next.js 15+ compatibility
  const { id } = await params;

  // Fetch the lesson, its associated words, and the AI-generated content (sentences/quizzes)
  const lesson = await prisma.lesson.findUnique({
    where: { id: id },
    include: {
      words: {
        include: {
          word: {
            include: {
              content: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    redirect("/play");
  }

  // Flatten the nested database structure into a clean array for the game engine
  const gamePayload = lesson.words.map((lw) => ({
    id: lw.word.id,
    text: lw.word.word,
    definition: lw.word.definition,
    partOfSpeech: lw.word.partOfSpeech,
    examples: lw.word.content.filter((c) =>
      c.contentType.startsWith("example"),
    ),
    quizzes: lw.word.content.filter((c) => c.contentType === "quiz_fill_blank"),
  }));

  return (
    <div className="max-w-xl mx-auto w-full pt-4">
      <GameEngine
        lessonTitle={lesson.title}
        payload={gamePayload}
        lessonId={id}
      />
    </div>
  );
}
