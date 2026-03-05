import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════════
   LearnPage — Trading Education Hub
   Tabs: Greeks | Strategies | Glossary | Tips | Patterns
   ═══════════════════════════════════════════════════════════ */

type TabId = 'guidebook' | 'greeks' | 'strategies' | 'glossary' | 'tips' | 'patterns';

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'guidebook', label: 'Guidebook', emoji: '📘' },
  { id: 'greeks', label: 'Option Greeks', emoji: '🏛️' },
  { id: 'strategies', label: 'Strategies', emoji: '♟️' },
  { id: 'glossary', label: 'Glossary', emoji: '📖' },
  { id: 'tips', label: 'Daily Tips', emoji: '💡' },
  { id: 'patterns', label: 'Chart Patterns', emoji: '📊' },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<TabId>('guidebook');

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 bg-clip-text text-transparent">
            Trading Academy
          </span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Master F&amp;O concepts while you play — every game mechanic teaches a real market principle
        </p>
        <p className="mt-1 text-xs text-emerald-400/80">Includes Trader’s Guidebook for mobile-first gameplay decisions</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap flex-1 justify-center',
              activeTab === tab.id
                ? 'bg-gray-700/60 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/40',
            )}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'guidebook' && <GuidebookTab />}
          {activeTab === 'greeks' && <GreeksTab />}
          {activeTab === 'strategies' && <StrategiesTab />}
          {activeTab === 'glossary' && <GlossaryTab />}
          {activeTab === 'tips' && <TipsTab />}
          {activeTab === 'patterns' && <PatternsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function GuidebookTab() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4">
        <h2 className="text-sm font-bold text-white mb-1.5">Ⅰ. Objective</h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          Reach Tile 100 (Financial Freedom) with capital intact, or hit the ₹2,00,000 milestone first.
        </p>
      </section>

      <section className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4 space-y-3">
        <h2 className="text-sm font-bold text-white">Ⅱ. The Game Interface</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard
            icon="🌐"
            title="Global Header"
            text="Track NIFTY/SENSEX/BANKNIFTY, FII/DII flows, and A/D ratio to read market mood and breadth before every roll."
          />
          <InfoCard
            icon="🌪️"
            title="VIX Engine"
            text="VIX 0–15 = calm, 15–25 = standard, 25+ = VIX storm (bigger reward and bigger risk)."
          />
        </div>
      </section>

      <section className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4 space-y-3">
        <h2 className="text-sm font-bold text-white">Ⅲ. Gameplay Mechanics</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <MiniStat label="Step 1" value="Pick View: Bull / Bear / Flat" />
          <MiniStat label="Step 2" value="Set Conviction: 1.0× to 5.0×" />
          <MiniStat label="Step 3" value="Roll and Resolve P&L" />
        </div>
        <div className="rounded-lg bg-gray-900/60 p-3 border border-gray-700/20">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">P&L Formula</p>
          <p className="text-xs text-emerald-300 font-mono">P&amp;L = (Base Reward/Penalty × Conviction) − Theta Decay</p>
        </div>
      </section>

      <section className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4 space-y-3">
        <h2 className="text-sm font-bold text-white">Ⅳ. Special Tiles</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <MiniStat label="Ladder: Policy Pivot" value="Strong upward jump; boosts Bull views" />
          <MiniStat label="Ladder: Short Covering" value="Fast move forward as bears exit" />
          <MiniStat label="Snake: Fat Finger" value="Accidental sell-off; move backward" />
          <MiniStat label="Snake: Circuit Breaker" value="High-conviction penalty during halt" />
          <MiniStat label="Event: RBI Decision" value="Immediate VIX spike and volatility" />
        </div>
      </section>

      <section className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4 space-y-3">
        <h2 className="text-sm font-bold text-white">Ⅴ. Greeks (Hidden Stats)</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <MiniStat label="Theta" value="Small capital decay every turn" />
          <MiniStat label="Vega" value="High VIX widens P&L swings" />
          <MiniStat label="Delta" value="Capital sensitivity to direction" />
        </div>
      </section>

      <section className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4">
        <h2 className="text-sm font-bold text-white mb-2">Ⅵ. Pro Tips</h2>
        <ul className="space-y-1.5 text-xs text-gray-300 list-disc pl-4">
          <li>Read the live feed before declaring your view.</li>
          <li>During VIX storms, reduce conviction until conditions stabilize.</li>
          <li>Tier progression unlocks deeper Greek modifiers — adapt your risk.</li>
        </ul>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GREEKS TAB
   ═══════════════════════════════════════════════════════════ */

const GREEKS = [
  {
    symbol: 'Δ',
    name: 'Delta',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    realWorld: 'Measures how much an option\'s price changes when the underlying stock moves ₹1. Delta of 0.5 means the option moves ₹0.50 for every ₹1 stock move.',
    inGame: 'Your dice roll direction! When you pick Bullish/Bearish, you\'re essentially choosing a delta direction. Correct view = positive delta payoff.',
    formula: 'Δ = ∂V / ∂S',
    proTip: 'Professional traders "delta hedge" to stay neutral. In our game, Neutral view is your hedge!',
    range: '-1.0 to +1.0',
    example: 'NIFTY 24000CE with delta 0.6 — if NIFTY rises 100pts, the option gains ~₹60',
  },
  {
    symbol: 'Θ',
    name: 'Theta',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    realWorld: 'Time decay — options lose value every day just from the passage of time. It\'s the "rent" option buyers pay. Theta accelerates near expiry.',
    inGame: 'Every turn costs you 0.5% of capital — this IS theta. The longer the game goes, the more you bleed. Speed matters!',
    formula: 'Θ = ∂V / ∂t',
    proTip: 'Option sellers LOVE theta — they earn money just by waiting. That\'s why professional desks are mostly "short gamma, long theta."',
    range: 'Always negative for buyers',
    example: 'A ₹200 premium option losing ₹15/day in theta near weekly expiry',
  },
  {
    symbol: 'Γ',
    name: 'Gamma',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    realWorld: 'Rate of change of delta — how quickly your exposure accelerates. High gamma = small moves create big P&L swings. Highest at-the-money near expiry.',
    inGame: 'Your streak multiplier! 2+ correct views in a row = 1.5-2× bonus. That\'s gamma acceleration — momentum compounds.',
    formula: 'Γ = ∂²V / ∂S²',
    proTip: 'Gamma explosions happen on expiry day. NIFTY can move 200+ points in the last hour — that\'s pure gamma at work.',
    range: 'Always positive for long options',
    example: 'ATM BANKNIFTY 50000CE on expiry day — delta swings from 0.5 to 0.9 in minutes',
  },
  {
    symbol: 'ν',
    name: 'Vega',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    realWorld: 'Sensitivity to implied volatility (IV). When India VIX spikes (fear), all option premiums inflate. When VIX drops, premiums crush.',
    inGame: 'When VIX ≥ 25, wrong views hurt extra (vega penalty). High volatility amplifies losses — just like real IV crush after events.',
    formula: 'ν = ∂V / ∂σ',
    proTip: 'Before budget/RBI events, buy straddles to profit from vega expansion. After the event, IV drops → vega sellers win.',
    range: 'Always positive for long options',
    example: 'Pre-budget: NIFTY CE premium ₹300. Post-budget: IV drops 5%, premium falls to ₹200 even if NIFTY doesn\'t move',
  },
  {
    symbol: 'ρ',
    name: 'Rho',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    realWorld: 'Sensitivity to interest rates. Less impactful for short-dated F&O but matters for LEAPS and longer-term positions. RBI rate decisions affect rho.',
    inGame: 'Not directly in game yet, but RBI-category news items hint at rate changes that shift market regime.',
    formula: 'ρ = ∂V / ∂r',
    proTip: 'In India, rho matters more for 3-6 month positions. For weekly BANKNIFTY, theta and gamma dominate.',
    range: 'Positive for calls, negative for puts',
    example: 'RBI cuts repo rate by 25bps → long-dated NIFTY calls gain ~₹2-5 from rho alone',
  },
];

function GreeksTab() {
  const [expanded, setExpanded] = useState<string | null>('Delta');

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4 mb-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="font-bold text-white">Option Greeks</span> measure the sensitivity of an option's
          price to various factors. Every game mechanic in S&L F&O maps to a real Greek — understanding them
          here helps you trade smarter both in-game and in real markets.
        </p>
      </div>

      {GREEKS.map((g) => {
        const isOpen = expanded === g.name;
        return (
          <motion.div
            key={g.name}
            layout
            className={clsx(
              'rounded-xl border transition-all overflow-hidden',
              isOpen ? `${g.bgColor} ${g.borderColor}` : 'bg-gray-800/40 border-gray-700/30',
            )}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : g.name)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span className={clsx('text-2xl font-black font-mono', g.color)}>{g.symbol}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{g.name}</p>
                <p className="text-[11px] text-gray-400 line-clamp-1">{g.realWorld.split('.')[0]}</p>
              </div>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-gray-500">▾</motion.span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <InfoCard icon="📈" title="In Real Markets" text={g.realWorld} />
                      <InfoCard icon="🎮" title="In This Game" text={g.inGame} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <MiniStat label="Formula" value={g.formula} />
                      <MiniStat label="Range" value={g.range} />
                      <MiniStat label="Example" value={g.example} />
                    </div>
                    <div className="rounded-lg bg-gray-900/60 px-3 py-2 border border-gray-700/20">
                      <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider mb-0.5">Pro Tip</p>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{g.proTip}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STRATEGIES TAB
   ═══════════════════════════════════════════════════════════ */

const STRATEGIES = [
  {
    name: 'Bull Call Spread',
    difficulty: 'Beginner',
    diffColor: 'text-emerald-400',
    outlook: 'Moderately Bullish',
    description: 'Buy a lower-strike call, sell a higher-strike call. Limits both profit and loss.',
    maxProfit: 'Difference in strikes - net premium paid',
    maxLoss: 'Net premium paid',
    inGame: 'Similar to picking Bullish view with low conviction — capped upside but limited downside.',
    whenToUse: 'When you expect a modest rally. Works best in low-to-medium VIX.',
    legs: ['Buy 24000 CE @ ₹200', 'Sell 24200 CE @ ₹120'],
    netCost: '₹80 debit',
  },
  {
    name: 'Iron Condor',
    difficulty: 'Intermediate',
    diffColor: 'text-yellow-400',
    outlook: 'Range-bound / Low volatility',
    description: 'Sell OTM call spread + sell OTM put spread. Profit from time decay in a range.',
    maxProfit: 'Net premium received',
    maxLoss: 'Width of spread - net premium',
    inGame: 'Like picking Neutral view with high conviction — you bet the market stays calm.',
    whenToUse: 'When VIX is elevated and you expect it to drop. Best before expiry when theta is high.',
    legs: ['Buy 23800 PE @ ₹60', 'Sell 23900 PE @ ₹100', 'Sell 24100 CE @ ₹110', 'Buy 24200 CE @ ₹65'],
    netCost: '₹85 credit',
  },
  {
    name: 'Long Straddle',
    difficulty: 'Intermediate',
    diffColor: 'text-yellow-400',
    outlook: 'Big move expected, direction unknown',
    description: 'Buy ATM call + ATM put at same strike. Profit from large moves in either direction.',
    maxProfit: 'Unlimited',
    maxLoss: 'Total premium paid',
    inGame: 'High conviction on any view when VIX is low (expecting a regime change).',
    whenToUse: 'Before budget, RBI policy, or elections. When VIX is unusually low.',
    legs: ['Buy 24000 CE @ ₹250', 'Buy 24000 PE @ ₹230'],
    netCost: '₹480 debit',
  },
  {
    name: 'Covered Call',
    difficulty: 'Beginner',
    diffColor: 'text-emerald-400',
    outlook: 'Neutral to Slightly Bullish',
    description: 'Hold stock/futures, sell OTM call against it. Generate income from premiums.',
    maxProfit: 'Premium + (strike - entry)',
    maxLoss: 'Entry price - premium (stock can fall)',
    inGame: 'Conservative play — like low conviction neutral, earning theta steadily.',
    whenToUse: 'When you own stocks and expect sideways action. Great in high VIX for fat premiums.',
    legs: ['Long NIFTY Futures @ 24000', 'Sell 24200 CE @ ₹130'],
    netCost: '₹130 credit',
  },
  {
    name: 'Protective Put',
    difficulty: 'Beginner',
    diffColor: 'text-emerald-400',
    outlook: 'Bullish but worried about crash',
    description: 'Hold stock, buy OTM put as insurance. The put gains if the market crashes.',
    maxProfit: 'Unlimited upside minus premium',
    maxLoss: 'Entry - strike + premium',
    inGame: 'Like having a safety net against margin calls — your insurance against black swan events.',
    whenToUse: 'Before events with unknown outcomes. When VIX is low (cheaper to buy puts).',
    legs: ['Long NIFTY @ 24000', 'Buy 23700 PE @ ₹75'],
    netCost: '₹75 debit',
  },
  {
    name: 'Calendar Spread',
    difficulty: 'Advanced',
    diffColor: 'text-red-400',
    outlook: 'Neutral short-term, directional longer-term',
    description: 'Sell near-term option, buy same strike longer-term. Profit from differential theta decay.',
    maxProfit: 'Difference in premium decay',
    maxLoss: 'Net debit paid',
    inGame: 'Managing theta across turns — sometimes waiting is the strategy.',
    whenToUse: 'When near-term VIX is elevated but you expect calm ahead. Exploits term structure.',
    legs: ['Sell Weekly 24000 CE @ ₹120', 'Buy Monthly 24000 CE @ ₹220'],
    netCost: '₹100 debit',
  },
];

function StrategiesTab() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4 mb-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="font-bold text-white">F&O Strategies</span> combine multiple option legs to
          create specific risk/reward profiles. Each strategy maps to a game scenario — learn when to use them
          and translate that intuition to real markets.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {STRATEGIES.map((s) => {
          const isOpen = selected === s.name;
          return (
            <motion.div
              key={s.name}
              layout
              className={clsx(
                'rounded-xl border transition-all cursor-pointer',
                isOpen ? 'bg-gray-800/60 border-gray-600/40 sm:col-span-2' : 'bg-gray-800/40 border-gray-700/30 hover:border-gray-600/40',
              )}
              onClick={() => setSelected(isOpen ? null : s.name)}
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">{s.name}</p>
                  <span className={clsx('text-[10px] font-bold', s.diffColor)}>{s.difficulty}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.outlook}</p>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 space-y-2"
                  >
                    <p className="text-[11px] text-gray-300 leading-relaxed">{s.description}</p>

                    {/* Legs */}
                    <div className="rounded-lg bg-gray-900/60 p-2.5 border border-gray-700/20">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Trade Legs</p>
                      {s.legs.map((leg, i) => (
                        <p key={i} className="text-[11px] text-gray-300 font-mono">{leg}</p>
                      ))}
                      <p className="text-[11px] font-bold text-amber-400 mt-1">Net: {s.netCost}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <MiniStat label="Max Profit" value={s.maxProfit} color="text-emerald-400" />
                      <MiniStat label="Max Loss" value={s.maxLoss} color="text-red-400" />
                    </div>

                    <div className="rounded-lg bg-gray-900/60 px-3 py-2 border border-gray-700/20">
                      <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider mb-0.5">In Game</p>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{s.inGame}</p>
                    </div>

                    <div className="rounded-lg bg-gray-900/60 px-3 py-2 border border-gray-700/20">
                      <p className="text-[10px] font-bold text-violet-400/80 uppercase tracking-wider mb-0.5">When to Use</p>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{s.whenToUse}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLOSSARY TAB
   ═══════════════════════════════════════════════════════════ */

const GLOSSARY: { term: string; definition: string; category: string }[] = [
  { term: 'ATM (At The Money)', definition: 'Option with strike price equal to current stock price. Highest gamma and fastest theta decay.', category: 'Options' },
  { term: 'ITM (In The Money)', definition: 'Call with strike below spot, or put with strike above spot. Has intrinsic value.', category: 'Options' },
  { term: 'OTM (Out of The Money)', definition: 'Call with strike above spot, or put with strike below spot. Only has time value.', category: 'Options' },
  { term: 'NIFTY', definition: 'NSE benchmark index of 50 large-cap stocks. Most traded F&O contract in India.', category: 'Index' },
  { term: 'BANKNIFTY', definition: 'Bank sector index. Known for wild intraday swings and high premiums.', category: 'Index' },
  { term: 'India VIX', definition: 'Volatility index derived from NIFTY option prices. VIX > 20 = fear, VIX < 13 = complacency.', category: 'Volatility' },
  { term: 'IV (Implied Volatility)', definition: 'Market\'s expectation of future price movement, priced into option premiums.', category: 'Volatility' },
  { term: 'IV Crush', definition: 'Sharp drop in IV after an event (budget, results). Option premiums collapse even if price moves.', category: 'Volatility' },
  { term: 'PCR (Put-Call Ratio)', definition: 'Ratio of put to call open interest. PCR > 1.2 = bullish (support), PCR < 0.7 = bearish.', category: 'Sentiment' },
  { term: 'FII/DII', definition: 'Foreign Institutional Investors / Domestic Institutional Investors. Their net buying/selling drives markets.', category: 'Sentiment' },
  { term: 'Max Pain', definition: 'Strike price where maximum number of options expire worthless. Market tends to gravitate here on expiry.', category: 'Strategy' },
  { term: 'Margin Call', definition: 'Broker demands extra capital when positions lose too much. Forced liquidation if not met.', category: 'Risk' },
  { term: 'Circuit Breaker', definition: 'Exchange halts trading when index moves ±5/10/15% in a day. Prevents panic selling.', category: 'Risk' },
  { term: 'Open Interest (OI)', definition: 'Total outstanding option contracts. Rising OI + rising price = strong trend.', category: 'Data' },
  { term: 'Premium', definition: 'Price paid to buy an option. Comprised of intrinsic value + time value.', category: 'Options' },
  { term: 'Expiry', definition: 'Date when option contract becomes void. Weekly (Thursday) and monthly (last Thursday).', category: 'Options' },
  { term: 'Lot Size', definition: 'Minimum quantity for F&O trading. NIFTY = 25 units, BANKNIFTY = 15 units.', category: 'Trading' },
  { term: 'Straddle', definition: 'Buy CE + PE at same strike. Profits from big move in either direction.', category: 'Strategy' },
  { term: 'Strangle', definition: 'Buy OTM CE + OTM PE. Cheaper than straddle but needs bigger move to profit.', category: 'Strategy' },
  { term: 'Hedging', definition: 'Taking an offsetting position to reduce risk. Like buying insurance on your portfolio.', category: 'Risk' },
  { term: 'Rollover', definition: 'Closing current month position and opening next month. Done near expiry to avoid delivery.', category: 'Trading' },
  { term: 'Gap Up / Gap Down', definition: 'Market opens significantly above/below previous close. Overnight news causes gaps.', category: 'Price Action' },
  { term: 'Support / Resistance', definition: 'Price levels where buying/selling pressure historically concentrates.', category: 'Price Action' },
  { term: 'Stop Loss', definition: 'Pre-set exit point to limit losses. Essential rule: always use stops in F&O.', category: 'Risk' },
];

function GlossaryTab() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const categories = [...new Set(GLOSSARY.map((g) => g.category))];

  const filtered = GLOSSARY.filter((g) => {
    const matchesSearch = search === '' || 
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === null || g.category === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-3">
      {/* Search + filter */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg bg-gray-800/60 border border-gray-700/30 px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-gray-600"
        />
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setFilterCat(null)}
            className={clsx(
              'rounded-lg px-2.5 py-1.5 text-[10px] font-semibold whitespace-nowrap transition',
              filterCat === null ? 'bg-gray-700/60 text-white' : 'text-gray-500 hover:text-gray-300',
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={clsx(
                'rounded-lg px-2.5 py-1.5 text-[10px] font-semibold whitespace-nowrap transition',
                filterCat === cat ? 'bg-gray-700/60 text-white' : 'text-gray-500 hover:text-gray-300',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="space-y-1">
        {filtered.map((g) => (
          <div key={g.term} className="rounded-lg bg-gray-800/40 border border-gray-700/20 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-white">{g.term}</p>
              <span className="rounded-md bg-gray-700/50 px-1.5 py-px text-[9px] font-medium text-gray-400">
                {g.category}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-gray-400 leading-relaxed">{g.definition}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-gray-600 py-8">No matching terms found</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TIPS TAB
   ═══════════════════════════════════════════════════════════ */

const TIPS: { category: string; icon: string; title: string; body: string; level: string }[] = [
  {
    category: 'Risk Management',
    icon: '🛡️',
    title: 'The 2% Rule',
    body: 'Never risk more than 2% of your total capital on a single trade. If you have ₹5L, max loss per trade = ₹10,000. This one rule saves 90% of traders from blowing up.',
    level: 'Essential',
  },
  {
    category: 'Risk Management',
    icon: '⏰',
    title: 'Theta Awareness',
    body: 'Every option bleeds value daily. If you\'re buying options, you\'re paying rent. Use time in your favor — sell options on Friday, buy on Monday morning.',
    level: 'Intermediate',
  },
  {
    category: 'Psychology',
    icon: '🧠',
    title: 'FOMO is Your Enemy',
    body: 'Missing a trade is NOT a loss. Chasing momentum late is. The market opens 252 days a year — there\'s always another opportunity. Sit on your hands when unsure.',
    level: 'Essential',
  },
  {
    category: 'Psychology',
    icon: '📏',
    title: 'Position Sizing > Entry',
    body: 'A mediocre entry with correct position sizing beats a perfect entry with too much leverage. Size your positions BEFORE entering the trade.',
    level: 'Essential',
  },
  {
    category: 'Volatility',
    icon: '📊',
    title: 'VIX is Your Weather Report',
    body: 'Check India VIX before every trade. VIX < 13 = buy options are cheap (buy straddles). VIX > 20 = premiums are inflated (sell strategies). VIX > 25 = stay small or hedge.',
    level: 'Intermediate',
  },
  {
    category: 'Volatility',
    icon: '🎢',
    title: 'IV Percentile > Absolute IV',
    body: 'IV of 25 might be low for BANKNIFTY but high for NIFTY. Use IV Percentile (0-100) to compare. Above 70th percentile = sell premium. Below 30th = buy premium.',
    level: 'Advanced',
  },
  {
    category: 'Execution',
    icon: '🎯',
    title: 'Trade the First 15 Minutes Carefully',
    body: 'The 9:15-9:30 window has the widest bid-ask spreads and most chaotic price action. Let the market settle. The real move often starts after 9:45.',
    level: 'Beginner',
  },
  {
    category: 'Execution',
    icon: '📋',
    title: 'Always Have an Exit Plan',
    body: 'Before entering any trade, define: 1) Profit target 2) Stop loss 3) Time-based exit. "I\'ll decide later" is how accounts get destroyed.',
    level: 'Essential',
  },
  {
    category: 'Strategy',
    icon: '♟️',
    title: 'Expiry Day is Different',
    body: 'Gamma explodes near expiry. Small moves create huge P&L. Reduce position size to 50% on expiry day. One 500-point BANKNIFTY move can wipe out a month of profits.',
    level: 'Intermediate',
  },
  {
    category: 'Strategy',
    icon: '🔄',
    title: 'Hedge, Don\'t Hope',
    body: 'Losing trade? Don\'t average down. Add a hedge instead. If long calls are losing, buy a put to create a synthetic position. Adjust, don\'t pray.',
    level: 'Advanced',
  },
  {
    category: 'Data',
    icon: '📈',
    title: 'Watch Open Interest Changes',
    body: 'OI build-up at strikes = strong support/resistance. Sudden OI increase + price drop = bears adding shorts. OI decrease + price rise = short covering rally.',
    level: 'Intermediate',
  },
  {
    category: 'Data',
    icon: '🌊',
    title: 'FII Data is Lagging but Useful',
    body: 'FII index futures data (published 6PM daily) shows institutional positioning. 3+ days of net selling = bearish bias. But remember: it\'s yesterday\'s data.',
    level: 'Advanced',
  },
];

function TipsTab() {
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const levels = ['Essential', 'Beginner', 'Intermediate', 'Advanced'];
  const levelColors: Record<string, string> = {
    Essential: 'text-red-400 bg-red-500/10',
    Beginner: 'text-emerald-400 bg-emerald-500/10',
    Intermediate: 'text-yellow-400 bg-yellow-500/10',
    Advanced: 'text-violet-400 bg-violet-500/10',
  };

  const filtered = filterLevel ? TIPS.filter((t) => t.level === filterLevel) : TIPS;

  return (
    <div className="space-y-3">
      {/* Level filter */}
      <div className="flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => setFilterLevel(null)}
          className={clsx(
            'rounded-lg px-3 py-1.5 text-[11px] font-semibold transition',
            filterLevel === null ? 'bg-gray-700/60 text-white' : 'text-gray-500 hover:text-gray-300',
          )}
        >
          All Tips
        </button>
        {levels.map((l) => (
          <button
            key={l}
            onClick={() => setFilterLevel(l)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-[11px] font-semibold transition',
              filterLevel === l ? 'bg-gray-700/60 text-white' : 'text-gray-500 hover:text-gray-300',
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl bg-gray-800/40 border border-gray-700/30 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{tip.icon}</span>
                <span className="text-[10px] font-medium text-gray-500">{tip.category}</span>
              </div>
              <span className={clsx('rounded-md px-1.5 py-px text-[9px] font-bold', levelColors[tip.level] ?? 'text-gray-400')}>
                {tip.level}
              </span>
            </div>
            <p className="text-xs font-bold text-white mb-1">{tip.title}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">{tip.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PATTERNS TAB
   ═══════════════════════════════════════════════════════════ */

const PATTERNS: {
  name: string;
  type: 'Bullish' | 'Bearish' | 'Neutral';
  ascii: string;
  description: string;
  action: string;
  reliability: string;
}[] = [
  {
    name: 'Double Bottom',
    type: 'Bullish',
    ascii: '╲    ╱╲    ╱\n  ╲╱    ╲╱  ',
    description: 'Price tests support twice and bounces. \'W\' shape. Strong reversal signal when neckline breaks.',
    action: 'Buy when price breaks above the neckline (the high between two bottoms). Stop below the second bottom.',
    reliability: 'High — especially with volume confirmation',
  },
  {
    name: 'Head & Shoulders',
    type: 'Bearish',
    ascii: '     ╱╲\n  ╱╲╱  ╲╱╲\n╱          ╲',
    description: 'Three peaks — middle one highest. Classic trend reversal pattern. The "neckline" connecting lows is key.',
    action: 'Short when price breaks below the neckline. Target = distance from head to neckline, projected downward.',
    reliability: 'Very high — one of the most reliable patterns',
  },
  {
    name: 'Ascending Triangle',
    type: 'Bullish',
    ascii: '          ────\n       ╱\n    ╱\n ╱',
    description: 'Flat resistance with rising support. Buyers are getting more aggressive. Usually breaks upward.',
    action: 'Buy on breakout above resistance. Volume should expand. Stop below the last higher low.',
    reliability: 'Medium-high — breakout direction matters more than pattern',
  },
  {
    name: 'Bearish Engulfing',
    type: 'Bearish',
    ascii: ' ┃\n▐█▌\n┃ ┃\n▐▓▌',
    description: 'Large red candle completely engulfs previous green candle. Shows sellers overwhelming buyers.',
    action: 'Short below the engulfing candle\'s low. More effective at resistance levels or after an uptrend.',
    reliability: 'Medium — needs context (works better at key levels)',
  },
  {
    name: 'Morning Star',
    type: 'Bullish',
    ascii: '▐▓▌\n┃ ┃  ╱\n▐▓▌╱\n    ▐█▌',
    description: 'Three-candle reversal: big red → small body (indecision) → big green. Found at bottoms.',
    action: 'Buy above the third candle\'s high. Stop below the second candle (the star).',
    reliability: 'High — classic reversal with strong psychology behind it',
  },
  {
    name: 'Cup & Handle',
    type: 'Bullish',
    ascii: '╲        ╱╲╱\n  ╲    ╱\n    ╲╱',
    description: 'Rounded bottom (cup) followed by small consolidation (handle). Measured move target = cup depth.',
    action: 'Buy on handle breakout. Target = cup depth added to breakout point. Can take weeks to form.',
    reliability: 'High — one of the best continuation patterns',
  },
];

function PatternsTab() {
  const [filterType, setFilterType] = useState<string | null>(null);
  const typeColors = { Bullish: 'text-emerald-400', Bearish: 'text-red-400', Neutral: 'text-gray-400' };

  const filtered = filterType ? PATTERNS.filter((p) => p.type === filterType) : PATTERNS;

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-4 mb-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="font-bold text-white">Chart Patterns</span> are visual formations in price
          action that signal potential moves. While the game doesn't directly plot charts, understanding
          these patterns helps you interpret the news feed and VIX signals.
        </p>
      </div>

      <div className="flex gap-1.5">
        {['Bullish', 'Bearish', 'Neutral'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(filterType === t ? null : t)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-[11px] font-semibold transition',
              filterType === t ? 'bg-gray-700/60 text-white' : 'text-gray-500 hover:text-gray-300',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <div key={p.name} className="rounded-xl bg-gray-800/40 border border-gray-700/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white">{p.name}</p>
              <span className={clsx('text-[10px] font-bold', typeColors[p.type])}>{p.type}</span>
            </div>

            {/* ASCII chart */}
            <pre className="rounded-lg bg-gray-900/60 p-2.5 text-[10px] font-mono text-gray-400 leading-tight mb-2 overflow-x-auto">
              {p.ascii}
            </pre>

            <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{p.description}</p>

            <div className="space-y-1.5">
              <div className="rounded-lg bg-gray-900/60 px-2.5 py-1.5 border border-gray-700/20">
                <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider">Action</p>
                <p className="text-[10px] text-gray-300">{p.action}</p>
              </div>
              <p className="text-[10px] text-gray-500">
                <span className="font-semibold">Reliability:</span> {p.reliability}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function InfoCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-lg bg-gray-900/60 p-3 border border-gray-700/20">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
        {icon} {title}
      </p>
      <p className="text-[11px] text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-gray-900/60 px-2 py-1.5 border border-gray-700/20">
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={clsx('text-[10px] font-semibold leading-tight mt-0.5', color ?? 'text-gray-300')}>{value}</p>
    </div>
  );
}
