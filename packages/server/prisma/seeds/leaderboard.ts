import type { PrismaClient, User } from '@prisma/client';

export async function seedLeaderboard(prisma: PrismaClient, users: User[]) {
  const leaderboardData = [
    {
      userId: users[0]!.id,
      gamesPlayed: 42,
      gamesWon: 18,
      highestCapital: 320,
      longestStreak: 5,
      totalCapitalEarned: 4200,
    },
    {
      userId: users[1]!.id,
      gamesPlayed: 35,
      gamesWon: 12,
      highestCapital: 250,
      longestStreak: 4,
      totalCapitalEarned: 3100,
    },
    {
      userId: users[2]!.id,
      gamesPlayed: 28,
      gamesWon: 9,
      highestCapital: 180,
      longestStreak: 3,
      totalCapitalEarned: 2400,
    },
    {
      userId: users[3]!.id,
      gamesPlayed: 20,
      gamesWon: 6,
      highestCapital: 155,
      longestStreak: 2,
      totalCapitalEarned: 1800,
    },
    {
      userId: users[4]!.id,
      gamesPlayed: 15,
      gamesWon: 7,
      highestCapital: 210,
      longestStreak: 3,
      totalCapitalEarned: 1950,
    },
    {
      userId: users[5]!.id,
      gamesPlayed: 50,
      gamesWon: 22,
      highestCapital: 400,
      longestStreak: 7,
      totalCapitalEarned: 5800,
    },
    {
      userId: users[6]!.id,
      gamesPlayed: 10,
      gamesWon: 2,
      highestCapital: 130,
      longestStreak: 1,
      totalCapitalEarned: 900,
    },
    {
      userId: users[7]!.id,
      gamesPlayed: 8,
      gamesWon: 1,
      highestCapital: 115,
      longestStreak: 1,
      totalCapitalEarned: 650,
    },
  ];

  for (const entry of leaderboardData) {
    await prisma.leaderboard.upsert({
      where: { userId: entry.userId },
      update: entry,
      create: entry,
    });
  }

  return leaderboardData;
}
