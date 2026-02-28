import { auth } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";
import { Coins, User, Sparkles } from "lucide-react";

export default async function Header() {
  const session = await auth();

  // Fetch the fresh user data directly from the database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, coins: true, name: true },
  });

  // Gamification Math
  const xp = user?.xp || 0;
  const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1;

  // Calculate exact boundaries for the current level to size the progress bar
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100;

  const xpIntoCurrentLevel = xp - xpForCurrentLevel;
  const xpRequiredForNext = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min(
    100,
    Math.max(0, (xpIntoCurrentLevel / xpRequiredForNext) * 100),
  );

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left: User Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold border border-brand-200">
          {user?.name?.charAt(0).toUpperCase() || <User size={20} />}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-slate-900 leading-tight">
            {user?.name}
          </p>
          <p className="text-xs font-medium text-slate-500">Learner</p>
        </div>
      </div>

      {/* Middle: Level & Progress Bar */}
      <div className="flex-1 max-w-md mx-4 md:mx-8">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} className="text-brand-500" />
            Level {currentLevel}
          </span>
          <span className="text-xs font-bold text-slate-400">
            Level {currentLevel + 1}
          </span>
        </div>
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="absolute top-0 left-0 h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-center mt-1">
          <span className="text-[10px] font-semibold text-slate-400">
            {xpIntoCurrentLevel} / {xpRequiredForNext} XP
          </span>
        </div>
      </div>

      {/* Right: Economy (Coins) */}
      <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
        <Coins size={18} className="text-amber-500 fill-amber-500" />
        <span className="font-extrabold text-amber-900">
          {user?.coins || 0}
        </span>
      </div>
    </header>
  );
}
