"use server";

import { prisma } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";
import { auth } from "../lib/auth.js";

export async function completeLessonAction(lessonId, wordIds) {
  try {
    // 1. Securely identify the logged-in user
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized: No active session found.");
    }

    const userId = session.user.id;

    // 2. Grant Gamification Rewards (XP and Coins) to the real user
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: 50 },
        coins: { increment: 10 },
        lastLogin: new Date(),
      },
    });

    // 3. Process Spaced Repetition (SRS)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const progressPromises = wordIds.map((wordId) => {
      return prisma.userProgress.upsert({
        where: {
          userId_wordId: { userId: userId, wordId: wordId },
        },
        update: {
          status: "reviewing",
          interval: 1,
          nextReviewDate: tomorrow,
        },
        create: {
          userId: userId,
          wordId: wordId,
          status: "learning",
          easeFactor: 2.5,
          interval: 1,
          nextReviewDate: tomorrow,
        },
      });
    });

    // Run all database operations concurrently
    await Promise.all(progressPromises);

    // Clear the cache so the dashboard updates instantly
    revalidatePath("/overview");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Failed to save lesson progress:", error);
    return { success: false, error: "Failed to save progress." };
  }
}
