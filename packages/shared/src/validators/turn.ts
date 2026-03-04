import { z } from 'zod';

// ─── Turn Input Validation ─────────────────────────────────

export const MarketViewSchema = z.enum(['Bullish', 'Bearish', 'Sideways']);

export const ConvictionSchema = z.number().int().min(1).max(5);

export const DiceRollSchema = z.number().int().min(1).max(6);

export const SetViewInputSchema = z.object({
  gameId: z.string().uuid(),
  view: MarketViewSchema,
});

export const SetConvictionInputSchema = z.object({
  gameId: z.string().uuid(),
  conviction: ConvictionSchema,
});

export const RollDiceInputSchema = z.object({
  gameId: z.string().uuid(),
});

export const EndTurnInputSchema = z.object({
  gameId: z.string().uuid(),
});

export const JoinGameInputSchema = z.object({
  gameId: z.string().uuid(),
});

// ─── Auth Validation ───────────────────────────────────────

export const RegisterInputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(50),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Game Creation Validation ──────────────────────────────

export const CreateGameInputSchema = z.object({
  mode: z.enum(['SinglePlayer', 'Multiplayer']),
  boardPreset: z.string().optional().default('default'),
});

// ─── Lobby Validation ──────────────────────────────────────

export const CreateRoomInputSchema = z.object({
  name: z.string().min(1).max(50),
  maxPlayers: z.number().int().min(2).max(4),
  gameMode: z.enum(['SinglePlayer', 'Multiplayer']),
});

export const AddBotInputSchema = z.object({
  roomId: z.string().min(1),
  difficulty: z.enum(['conservative', 'aggressive', 'adaptive']),
});

// ─── Subscription Validation ───────────────────────────────

export const UpgradeTierInputSchema = z.object({
  tier: z.enum(['Apprentice', 'MarketWarrior', 'BillionaireGuild']),
});
