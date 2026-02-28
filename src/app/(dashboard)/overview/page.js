import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import { redirect } from "next/navigation";
import StatCard from "../../../components/overview/StatCard.js";
import DailyReviewBanner from "../../../components/overview/DailyReviewBanner.js";
import { Flame, Coins, Sparkles, Target } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Retain | Overview",
};

export default async function OverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch true gamification stats from Postgres
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, coins: true, streak: true },
  });

  // Calculate pending SRS reviews exactly when nextReviewDate is today or past
  const pendingReviewsCount = await prisma.userProgress.count({
    where: {
      userId: session.user.id,
      nextReviewDate: {
        lte: new Date(),
      },
    },
  });

  // Gamification Math for current level
  const xp = user?.xp || 0;
  const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1;

  return (
    <div className="animate-fade-in pt-4">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Overview
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Track your progress and build your vocabulary habit.
        </p>
      </header>

      {/* SRS Action Banner */}
      <DailyReviewBanner pendingReviewsCount={pendingReviewsCount} />

      {/* Real Data Gamification Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Current Streak"
          value={`${user?.streak || 0} Days`}
          icon={Flame}
          bgClass="bg-flame-100"
          colorClass="text-flame-500"
        />
        <StatCard
          title="Total XP"
          value={user?.xp || 0}
          icon={Sparkles}
          bgClass="bg-brand-100"
          colorClass="text-brand-500"
        />
        <StatCard
          title="Current Level"
          value={`Lvl ${currentLevel}`}
          icon={Target}
          bgClass="bg-emerald-100"
          colorClass="text-emerald-500"
        />
        <StatCard
          title="Gold Coins"
          value={user?.coins || 0}
          icon={Coins}
          bgClass="bg-amber-100"
          colorClass="text-amber-500"
        />
      </div>

      {/* Main Path Call to Action */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
          Continue Your Journey
        </h3>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Unlock new words and tackle your next milestone on the main path.
        </p>
        <Link
          href="/play"
          className="inline-flex items-center justify-center px-10 py-4 bg-brand-600 text-white font-extrabold rounded-2xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 active:scale-95"
        >
          Go to Path
        </Link>
      </div>
    </div>
  );
}
