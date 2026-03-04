import type { PrismaClient, User, Game } from '@prisma/client';

export async function seedGames(prisma: PrismaClient, users: User[]): Promise<Game[]> {
  const games: Game[] = [];

  // ── Game 1: Fresh / waiting ──
  const game1 = await prisma.game.create({
    data: {
      mode: 'Multiplayer',
      status: 'waiting',
      vixLevel: 18,
      currentTurn: 0,
      players: {
        create: [
          {
            userId: users[0]!.id,
            displayName: users[0]!.displayName,
            capital: 100,
            position: 1,
            turnOrder: 0,
          },
          {
            userId: users[1]!.id,
            displayName: users[1]!.displayName,
            capital: 100,
            position: 1,
            turnOrder: 1,
          },
        ],
      },
    },
  });
  games.push(game1);

  // ── Game 2: Mid-game / in_progress ──
  const game2 = await prisma.game.create({
    data: {
      mode: 'Multiplayer',
      status: 'in_progress',
      vixLevel: 22,
      currentTurn: 8,
      players: {
        create: [
          {
            userId: users[2]!.id,
            displayName: users[2]!.displayName,
            capital: 72.5,
            position: 34,
            turnOrder: 0,
            currentView: 'Bullish',
            conviction: 3,
            pnlHistory: JSON.stringify([100, 95, 88, 92, 85, 78, 75, 72.5]),
          },
          {
            userId: users[3]!.id,
            displayName: users[3]!.displayName,
            capital: 85,
            position: 28,
            turnOrder: 1,
            currentView: 'Bearish',
            conviction: 2,
            pnlHistory: JSON.stringify([100, 98, 96, 90, 92, 88, 85, 85]),
          },
          {
            displayName: 'Bot_Adaptive',
            capital: 65,
            position: 42,
            turnOrder: 2,
            isBot: true,
            botDifficulty: 'adaptive',
            pnlHistory: JSON.stringify([100, 90, 82, 78, 72, 68, 65, 65]),
          },
        ],
      },
    },
  });
  games.push(game2);

  // Add some turn logs for game 2
  const game2Players = await prisma.gamePlayer.findMany({
    where: { gameId: game2.id },
    orderBy: { turnOrder: 'asc' },
  });

  for (let turn = 1; turn <= 8; turn++) {
    const player = game2Players[turn % game2Players.length]!;
    await prisma.turnLog.create({
      data: {
        gameId: game2.id,
        playerId: player.id,
        turnNumber: turn,
        command: JSON.stringify({
          playerId: player.id,
          gameId: game2.id,
          turnNumber: turn,
          declaredView: turn % 2 === 0 ? 'Bullish' : 'Bearish',
          convictionMultiplier: Math.min(5, Math.max(1, (turn % 3) + 1)),
          diceRoll: (turn % 6) + 1,
          marketOutcome: turn % 3 === 0 ? 'Bullish' : turn % 3 === 1 ? 'Bearish' : 'Sideways',
          vixLevel: 18 + turn * 0.5,
        }),
        result: JSON.stringify({
          playerId: player.id,
          gameId: game2.id,
          turnNumber: turn,
          previousPosition: Math.max(1, player.position - (turn % 6) - 1),
          newPosition: player.position,
          spacesMovedRaw: (turn % 6) + 1,
          previousCapital: player.capital + (turn % 5),
          capitalDelta: -(turn % 5),
          finalCapital: player.capital,
          tileEffect: null,
          tileName: null,
          appliedModifiers: [],
          isStunned: false,
          isMarginCall: false,
          isGameWon: false,
          diceRoll: (turn % 6) + 1,
          declaredView: turn % 2 === 0 ? 'Bullish' : 'Bearish',
          marketOutcome: turn % 3 === 0 ? 'Bullish' : 'Bearish',
          viewMatched: turn % 6 === 0,
          convictionMultiplier: 1,
          gammaMultiplier: 1,
          thetaApplied: false,
          vixLevel: 18 + turn * 0.5,
          vixPenaltyApplied: false,
        }),
      },
    });
  }

  // ── Game 3: Completed ──
  const game3 = await prisma.game.create({
    data: {
      mode: 'SinglePlayer',
      status: 'completed',
      vixLevel: 30,
      currentTurn: 25,
      winnerId: users[4]!.id,
      players: {
        create: [
          {
            userId: users[4]!.id,
            displayName: users[4]!.displayName,
            capital: 45,
            position: 100,
            turnOrder: 0,
            hasWon: true,
            pnlHistory: JSON.stringify([100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 48, 45]),
          },
          {
            displayName: 'Bot_Aggressive',
            capital: 0,
            position: 67,
            turnOrder: 1,
            isBot: true,
            botDifficulty: 'aggressive',
            isMarginCalled: true,
            pnlHistory: JSON.stringify([100, 85, 70, 55, 40, 25, 10, 0]),
          },
        ],
      },
    },
  });
  games.push(game3);

  return games;
}
