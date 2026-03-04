-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'Apprentice',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "board_config" TEXT NOT NULL DEFAULT '{}',
    "vix_level" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "current_turn" INTEGER NOT NULL DEFAULT 0,
    "winner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_players" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT,
    "display_name" TEXT NOT NULL,
    "capital" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "position" INTEGER NOT NULL DEFAULT 1,
    "active_buffs" TEXT NOT NULL DEFAULT '[]',
    "current_view" TEXT,
    "conviction" INTEGER NOT NULL DEFAULT 1,
    "stun_turns" INTEGER NOT NULL DEFAULT 0,
    "is_margin_called" BOOLEAN NOT NULL DEFAULT false,
    "has_won" BOOLEAN NOT NULL DEFAULT false,
    "is_bot" BOOLEAN NOT NULL DEFAULT false,
    "bot_difficulty" TEXT,
    "turn_order" INTEGER NOT NULL DEFAULT 0,
    "pnl_history" TEXT NOT NULL DEFAULT '[100]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turn_logs" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "turn_number" INTEGER NOT NULL,
    "command" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turn_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "games_played" INTEGER NOT NULL DEFAULT 0,
    "games_won" INTEGER NOT NULL DEFAULT 0,
    "highest_capital" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "total_capital_earned" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "game_players_game_id_user_id_key" ON "game_players"("game_id", "user_id");

-- CreateIndex
CREATE INDEX "turn_logs_game_id_turn_number_idx" ON "turn_logs"("game_id", "turn_number");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_user_id_key" ON "leaderboard"("user_id");

-- AddForeignKey
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turn_logs" ADD CONSTRAINT "turn_logs_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turn_logs" ADD CONSTRAINT "turn_logs_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "game_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
