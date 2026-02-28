import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import { redirect } from "next/navigation";
import ProfileHeader from "../../../components/profile/ProfileHeader.js";
import LearningStats from "../../../components/profile/LearningStats.js";
import SignOutButton from "../../../components/profile/SignOutButton.js";

export const metadata = {
  title: "Retain | Profile",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch basic user information and XP
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, xp: true },
  });

  // Efficiently fetch Spaced Repetition counts grouped by status
  const progressCounts = await prisma.userProgress.groupBy({
    by: ["status"],
    where: { userId: session.user.id },
    _count: { status: true },
  });

  // Map the grouped database counts to our variables
  let learningCount = 0;
  let reviewingCount = 0;
  let masteredCount = 0;

  progressCounts.forEach((group) => {
    if (group.status === "learning") learningCount = group._count.status;
    if (group.status === "reviewing") reviewingCount = group._count.status;
    if (group.status === "mastered") masteredCount = group._count.status;
  });

  // Gamification Math for current level
  const xp = user?.xp || 0;
  const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1;

  return (
    <div className="animate-fade-in pt-4 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Profile
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Manage your account and view your learning stats.
        </p>
      </header>

      <ProfileHeader
        name={user?.name}
        email={user?.email}
        level={currentLevel}
      />

      <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">
        Vocabulary Retention
      </h3>
      <LearningStats
        learning={learningCount}
        reviewing={reviewingCount}
        mastered={masteredCount}
      />

      <div className="mt-12">
        <SignOutButton />
      </div>
    </div>
  );
}
