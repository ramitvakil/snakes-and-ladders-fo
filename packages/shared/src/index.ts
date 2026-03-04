// ─── Types ─────────────────────────────────────────────────
export type { Player, PlayerBuff, MarketView, BotDifficulty, BotDecision } from './types/player';
export { ConvictionLevel, DEFAULT_PLAYER_CAPITAL, DEFAULT_PLAYER_POSITION, STUN_THRESHOLD, STUN_DURATION, MARGIN_CALL_THRESHOLD } from './types/player';

export type { TileDefinition, TileEffect, TileEffectType, WarpEdge, BoardMap } from './types/board';
export { TileType } from './types/board';

export type { TurnCommand, TurnResult, TurnLogEntry, AppliedModifier } from './types/turn';
export { TurnPhase, VALID_PHASE_TRANSITIONS } from './types/turn';

export type { GreekModifier, GreekConfig, ModifierStackState } from './types/modifiers';
export { GreekType } from './types/modifiers';

export type { VIXLevel, VIXRegime, MarketTrend, MarketSimulationConfig, DailyQuest, QuestReward, QuestLogEntry, QuestType, NewsItem, NewsCategory } from './types/market';
export type { NewsSentiment } from './types/market';

export type { TierFeatures, TierChannel, BotDifficultyAccess } from './types/subscription';
export { SubscriptionTier } from './types/subscription';

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  GameMode,
  GameStanding,
  GameStateSnapshot,
  LobbyRoomInfo,
} from './types/events';

export type { LobbyPlayer, GameRoom, CreateRoomRequest, JoinRoomRequest } from './types/lobby';

export type { ServerConfig, ClientConfig } from './types/config';
export { ServerConfigSchema, ClientConfigSchema } from './types/config';

// ─── Constants ─────────────────────────────────────────────
export { DEFAULT_BOARD_MAP, WARP_EDGES, WARP_LOOKUP, TILE_LOOKUP } from './constants/board-map';
export { DEFAULT_GREEK_CONFIG, getConvictionScalar, DICE_MIN, DICE_MAX, rollDice, generateMarketOutcome } from './constants/greeks';
export { TIER_DEFINITIONS, getTierFeatures, canAccessFeature, tierMeetsMinimum } from './constants/tiers';
export { QUEST_TEMPLATES, MARKET_PRESETS } from './constants/quests';
export type { QuestTemplate } from './constants/quests';

// ─── Config ────────────────────────────────────────────────
export { hasFeatureAccess, getEffectiveTier, FEATURE_TIER_REQUIREMENTS } from './config/feature-flags';

// ─── Validators ────────────────────────────────────────────
export {
  MarketViewSchema,
  ConvictionSchema,
  DiceRollSchema,
  SetViewInputSchema,
  SetConvictionInputSchema,
  RollDiceInputSchema,
  EndTurnInputSchema,
  JoinGameInputSchema,
  RegisterInputSchema,
  LoginInputSchema,
  CreateGameInputSchema,
  CreateRoomInputSchema,
  AddBotInputSchema,
  UpgradeTierInputSchema,
} from './validators/turn';

// ─── Test Utilities ────────────────────────────────────────
export {
  createMockPlayer,
  createMockBotPlayer,
  createMockTurnCommand,
  createMockTurnResult,
  createMockVIXLevel,
  createMockQuest,
  createMockGameState,
  createMockRoom,
  resetMockIds,
} from './test-utils/factories';
