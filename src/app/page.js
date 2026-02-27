// src/app/page.js
import { prisma } from "../lib/prisma.js";

export default async function Home() {
  // Fetch lessons directly from the database, ordered by their number
  // We also include a count of the words attached to each lesson
  const lessons = await prisma.lesson.findMany({
    orderBy: {
      lessonNumber: "asc",
    },
    include: {
      _count: {
        select: { words: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Complete your daily vocabulary foundations.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                    Level {lesson.lessonNumber}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    {lesson._count.words} words
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  {lesson.title}
                </h2>
              </div>

              <a
                href={`/lesson/${lesson.id}`}
                className="block w-full text-center bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
              >
                Start Lesson
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
