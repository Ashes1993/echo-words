"use server";

import { prisma } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

export async function completeLessonAction(lessonId, wordIds) {
  try {
    // TEMPORARY: For testing Phase 2 without Auth, we grab the first user or create a dummy one.
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: "Test User", email: "test@retain.app" },
      });
    }

    // 1. Grant Gamification Rewards (XP and Coins)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: 50 },
        coins: { increment: 10 },
        lastLogin: new Date(), // We will use this later for the Streak calculation
      },
    });

    // 2. Process Spaced Repetition (SRS)
    // We loop through the completed words and either create a new tracking record
    // or update their existing review date to tomorrow.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const progressPromises = wordIds.map((wordId) => {
      return prisma.userProgress.upsert({
        where: {
          userId_wordId: { userId: user.id, wordId: wordId },
        },
        update: {
          status: "reviewing",
          interval: 1,
          nextReviewDate: tomorrow,
        },
        create: {
          userId: user.id,
          wordId: wordId,
          status: "learning",
          easeFactor: 2.5,
          interval: 1,
          nextReviewDate: tomorrow,
        },
      });
    });

    // Run all database operations concurrently for maximum speed
    await Promise.all(progressPromises);

    // Tell Next.js to clear the cache for the dashboard so the new XP shows up instantly
    revalidatePath("/overview");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Failed to save lesson progress:", error);
    return { success: false, error: "Failed to save progress." };
  }
}
