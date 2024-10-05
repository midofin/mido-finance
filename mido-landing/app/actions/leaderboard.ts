// app/actions/leaderboard.ts
"use server";

import client from "@/db";

/**
 * Fetches the top users ordered by their points in descending order.
 * @param page - Current page number for pagination. Defaults to 1.
 * @param pageSize - Number of users per page. Defaults to 100.
 * @returns An array of user objects containing id, walletAddress, and points.
 */
export async function getLeaderboard(page: number = 1, pageSize: number = 100) {
  try {
    const topUsers = await client.user.findMany({
      orderBy: {
        points: 'desc',
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true,
        walletAddress: true,
        points: true,
      },
    });

    return topUsers;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw new Error("Failed to fetch leaderboard.");
  }
}
