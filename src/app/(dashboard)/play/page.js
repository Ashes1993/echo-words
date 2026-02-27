import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "../../../lib/prisma.js";

export default async function PlayPage() {
  // Fetch all lessons from the database
  const lessons = await prisma.lesson.findMany({
    orderBy: {
      lessonNumber: "asc",
    },
  });

  return (
    <div className="animate-fade-in flex flex-col items-center pb-24 pt-8">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Path
        </h1>
        <p className="text-slate-500 mt-1">Continue your vocabulary journey.</p>
      </header>

      {/* The Map Container */}
      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* The connecting background line */}
        <div className="absolute top-0 bottom-0 w-2 bg-slate-200 rounded-full left-1/2 -translate-x-1/2 z-0"></div>

        {lessons.map((lesson, index) => {
          // Alternate positioning: left, center, right, center...
          // This creates the winding path effect using modulo math.
          const positionMod = index % 4;
          let translateClass = "";

          if (positionMod === 0) translateClass = "translate-x-0"; // Center
          if (positionMod === 1)
            translateClass = "-translate-x-16 md:-translate-x-24"; // Left
          if (positionMod === 2) translateClass = "translate-x-0"; // Center
          if (positionMod === 3)
            translateClass = "translate-x-16 md:translate-x-24"; // Right

          // For the MVP, we treat the first lesson as "active" and the rest as "locked"
          // just to show the UI difference. Later, this will be dynamic based on UserProgress.
          const isActive = index === 0;
          const isLocked = index > 0;

          return (
            <div
              key={lesson.id}
              className={`relative z-10 flex flex-col items-center mb-12 transition-transform duration-300 ${translateClass}`}
            >
              {/* Level Number floating above the node */}
              <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-500 shadow-sm mb-2 border border-slate-100">
                Level {lesson.lessonNumber}
              </div>

              {/* The Node Button */}
              <Link
                href={`/play/${lesson.id}`}
                className={`group relative flex items-center justify-center w-20 h-20 rounded-full border-b-8 active:border-b-0 active:translate-y-2 transition-all ${
                  isActive
                    ? "bg-brand-500 border-brand-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-bounce-subtle"
                    : isLocked
                      ? "bg-slate-300 border-slate-400 pointer-events-none"
                      : "bg-brand-500 border-brand-600 shadow-md"
                }`}
              >
                {/* Inner ring for a premium 3D button feel */}
                <div className="absolute inset-2 border-2 border-white/20 rounded-full pointer-events-none"></div>

                <Star
                  size={32}
                  className={
                    isActive || !isLocked
                      ? "text-white fill-white"
                      : "text-slate-400 fill-slate-400"
                  }
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
