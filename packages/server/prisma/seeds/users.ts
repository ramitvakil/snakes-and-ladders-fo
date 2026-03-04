import type { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient): Promise<User[]> {
  const password = await bcrypt.hash('password123', 10);

  const usersData = [
    { email: 'alice@example.com', displayName: 'Alice Trader', tier: 'BillionaireGuild' },
    { email: 'bob@example.com', displayName: 'Bob Bull', tier: 'MarketWarrior' },
    { email: 'charlie@example.com', displayName: 'Charlie Charts', tier: 'MarketWarrior' },
    { email: 'diana@example.com', displayName: 'Diana Delta', tier: 'Apprentice' },
    { email: 'eve@example.com', displayName: 'Eve Expiry', tier: 'Apprentice' },
    { email: 'frank@example.com', displayName: 'Frank Futures', tier: 'BillionaireGuild' },
    { email: 'grace@example.com', displayName: 'Grace Gamma', tier: 'MarketWarrior' },
    { email: 'hank@example.com', displayName: 'Hank Hedge', tier: 'Apprentice' },
    { email: 'iris@example.com', displayName: 'Iris IV', tier: 'MarketWarrior' },
    { email: 'jack@example.com', displayName: 'Jack Jackpot', tier: 'BillionaireGuild' },
  ];

  const users: User[] = [];

  for (const data of usersData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        displayName: data.displayName,
        tier: data.tier,
      },
    });
    users.push(user);
  }

  return users;
}
