# Game Design Document (GDD)

## 1. Overview

**Title:** Snakes & Ladders — F&O Market Edition  
**Genre:** Roguelite Board Game / Financial Strategy  
**Platform:** Web (Desktop & Mobile browsers)  
**Players:** 1-4 (Single-player vs AI bot, Multiplayer)

## 2. Core Concept

A digital board game that maps classic Snakes & Ladders to the Indian Futures & Options market. Players navigate a 100-tile board where movement is dice-based, but capital gains/losses are driven by market view accuracy, conviction level, and Greek modifiers. The VIX (volatility index) fluctuates in real-time, affecting gameplay dynamically.

## 3. Win Condition

Reach tile 100 with maximum capital. If capital reaches ₹0, the player is margin-called (eliminated). If all remaining players are margin-called, the last player standing wins.

## 4. Player State

| Attribute | Type | Default | Description |
|---|---|---|---|
| Position | 1-100 | 1 | Current tile |
| Capital | Number | ₹1,00,000 | Currency balance |
| Market View | Bullish/Bearish/Neutral | — | Prediction for the turn |
| Conviction | 1-5 | 1 | Confidence level (risk multiplier) |
| Buffs | Array | [] | Active multipliers with durations |
| Stun Turns | Number | 0 | Turns to skip |
| PnL History | Array | [] | Capital at end of each turn |

## 5. Turn Pipeline

Each turn processes through 7 sequential stages:

### 5.1 ROLL Stage
- Player rolls a 6-sided die
- If stunned (stunTurns > 0), turn is skipped, stun decremented

### 5.2 MOVE Stage
- New position = current + dice roll
- If exceeds 100, bounce back: 100 - (roll - (100 - position))
- If exactly 100, player wins

### 5.3 TILE_EFFECT Stage
- **Ladders**: Warp to higher tile (e.g., Short Squeeze Ramp: 23→33)
- **Snakes**: Warp to lower tile + capital penalty (e.g., Fat Finger: 62, -5% capital)
- **Events**: Apply special effects (buffs, stuns, view resets, teleports)

### 5.4 MODIFIER Stage (Greeks)
- **Theta (Θ)**: 0.5% capital decay per turn — time value erosion
- **Gamma (Γ)**: 1.5× capital gain multiplier if view was correct; 2× if consecutive correct views
- **Vega (ν)**: When VIX > 25, additional 2% penalty per VIX point above threshold

### 5.5 CONVICTION Stage
- Market generates random outcome: Bullish/Bearish/Neutral
- If player's view matches: +₹5,000 × conviction scalar
- If wrong: -₹3,000 × conviction scalar
- Conviction scalar increases non-linearly with level (1→5 maps to 0.5→3.0)

### 5.6 CAPITAL Stage
- Aggregate all deltas from previous stages
- Apply active buff multipliers
- Decrement buff durations (remove expired)
- Clamp capital ≥ 0

### 5.7 HEALTH_CHECK Stage
- If capital = 0: **Margin Call** — player eliminated
- If single-turn capital drop ≥ 20%: **Stun** for 2 turns

## 6. Board Design

100-tile boustrophedon (snake) layout:
- Row 1 (bottom): tiles 1→10 left-to-right
- Row 2: tiles 11→20 right-to-left
- Row 10 (top): tiles 91→100 left-to-right

### 6.1 Ladders (7 total)
| From | To | Name |
|---|---|---|
| 4 | 14 | Bull Run Rally |
| 23 | 33 | Short Squeeze Ramp |
| 28 | 56 | FII Inflow |
| 42 | 58 | RBI Rate Cut Surge |
| 55 | 72 | Institutional Accumulation |
| 71 | 89 | Breakout Momentum |
| 80 | 97 | Gamma Squeeze |

### 6.2 Snakes (9 total)
| Position | Drop | Name | Capital Effect |
|---|---|---|---|
| 16 | →6 | Margin Shortfall | -3% |
| 34 | →12 | Circuit Breaker | flat |
| 47 | →26 | Liquidity Trap | -2% |
| 56 | →33 | Operator Trap | flat |
| 62 | →19 | Fat Finger | -5% |
| 74 | →50 | SEBI Crackdown | -4% |
| 87 | →36 | Global Meltdown | -8% |
| 93 | →68 | Flash Crash | -10% |
| 99 | →77 | Black Swan | -15% |

### 6.3 Event Tiles (6 total)
| Position | Name | Effect |
|---|---|---|
| 10 | Dividend Day | +₹5,000 |
| 25 | FII/DII Battle | 2× buff for 2 turns |
| 38 | Budget Volatility | Stun 1 turn |
| 51 | Earnings Surprise | 2× buff for 3 turns |
| 65 | Expiry Volatility | View reset |
| 85 | RBI Policy | +₹10,000 |

## 7. VIX System

### 7.1 Simulation
- Ornstein-Uhlenbeck mean-reverting stochastic process
- Configurable: mean (20), volatility (0.5), tick interval (15s)
- 2% chance of regime shift per tick
- Box-Muller transform for Gaussian noise

### 7.2 Regimes
| Regime | VIX Range | Gameplay Effect |
|---|---|---|
| Calm | <15 | Minimal vega impact, stable gains |
| Normal | 15-25 | Standard play |
| Elevated | 25-40 | Vega penalty kicks in |
| High | 40-55 | Significant vega drag |
| Extreme | ≥55 | Maximum volatility, high risk/reward |

## 8. Quest System

- Quests rotate every 30 minutes
- Generated based on current VIX regime
- Types: consecutive_correct, survive_turns, reach_capital, land_on_tile, avoid_snake, correct_at_vix
- Completion awards capital bonus
- Higher tiers get more concurrent quests

## 9. Bot AI

Three strategies based on difficulty:

| Difficulty | Strategy | Behavior |
|---|---|---|
| Easy | Conservative | Neutral-biased, low conviction |
| Medium | Aggressive | Momentum/contrarian, moderate conviction |
| Hard | Adaptive | Risk-aware (capital, position, VIX), variable conviction |

10% personality deviation for unpredictability. Thinking delay simulated (500ms-3s).

## 10. Subscription Tiers

| Feature | Apprentice | MarketWarrior | BillionaireGuild |
|---|---|---|---|
| Price | Free | ₹299/mo | ₹999/mo |
| Daily Games | 5 | Unlimited | Unlimited |
| Board Type | Basic | Custom | Custom + Exclusive |
| Quests | 1 active | 3 active | 5 active |
| Detailed PnL | ✗ | ✓ | ✓ |
| Tournaments | ✗ | ✗ | ✓ |
| Priority Match | ✗ | ✗ | ✓ |
| Custom Avatars | ✗ | ✗ | ✓ |
