// src/app/(dashboard)/play/[id]/page.js
import { prisma } from "../../../../lib/prisma.js";
import GameEngine from "../../../../components/play/GameEngine.js";
import { redirect } from "next/navigation";

export default async function LessonPage({ params }) {
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: id },
    include: {
      words: {
        include: {
          word: { include: { content: true } },
        },
      },
    },
  });

  if (!lesson || lesson.words.length === 0) {
    redirect("/play");
  }

  // For this architecture, a lesson is focused on a single word.
  const targetWord = lesson.words[0].word;
  const content = targetWord.content;

  // Helper to find specific content types safely
  const getBy = (type) => content.find((c) => c.contentType === type);

  // Build the strict 6-step sequential array
  const steps = [
    {
      type: "reveal",
      title: "New Word",
      word: targetWord.word,
      definition: targetWord.definition,
      partOfSpeech: targetWord.partOfSpeech,
    },
    {
      type: "story",
      title: "In Context",
      text: getBy("story_context")?.textBody,
    },
    {
      type: "quiz",
      title: "Usage Recognition",
      question: getBy("quiz_usage")?.textBody,
      options: getBy("quiz_usage")?.options,
      answer: getBy("quiz_usage")?.correctAnswer,
    },
    {
      type: "quiz",
      title: "Contextual Implication",
      question: getBy("quiz_implication")?.textBody,
      options: getBy("quiz_implication")?.options,
      answer: getBy("quiz_implication")?.correctAnswer,
    },
    {
      type: "quiz",
      title: "Synonym Match",
      question: getBy("quiz_synonym")?.textBody,
      options: getBy("quiz_synonym")?.options,
      answer: getBy("quiz_synonym")?.correctAnswer,
    },
    {
      type: "quiz",
      title: "Comprehension",
      question: getBy("quiz_true_false")?.textBody,
      options: getBy("quiz_true_false")?.options,
      answer: getBy("quiz_true_false")?.correctAnswer,
    },
  ];

  return (
    <div className="max-w-xl mx-auto w-full pt-4">
      <GameEngine
        lessonTitle={lesson.title}
        steps={steps}
        lessonId={id}
        wordId={targetWord.id}
      />
    </div>
  );
}
