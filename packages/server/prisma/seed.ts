import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/users.js';
import { seedGames } from './seeds/games.js';
import { seedLeaderboard } from './seeds/leaderboard.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data in order (respect FK constraints)
  await prisma.turnLog.deleteMany();
  await prisma.gamePlayer.deleteMany();
  await prisma.game.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.user.deleteMany();

  // Seed in dependency order
  const users = await seedUsers(prisma);
  console.log(`✅ Seeded ${users.length} users`);

  const games = await seedGames(prisma, users);
  console.log(`✅ Seeded ${games.length} games with players and turn logs`);

  const leaderboards = await seedLeaderboard(prisma, users);
  console.log(`✅ Seeded ${leaderboards.length} leaderboard entries`);

  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
