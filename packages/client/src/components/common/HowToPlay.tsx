import { useUIStore } from '../../stores/uiStore';

const sections = [
  {
    icon: '🎯',
    title: 'Objective',
    body: 'Race across a 100-tile board and be the first player to accumulate ₹2,00,000 (₹2 Lakh) in capital. Each tile represents a market event — navigate bull runs, survive crashes, and build your portfolio wisely.',
  },
  {
    icon: '🎲',
    title: 'How a Turn Works',
    body: '1. **Choose your Market View** — Bullish, Bearish, or Sideways.\n2. **Set your Conviction** — Low, Medium, or High. Higher conviction = bigger rewards (and bigger risks).\n3. **Roll the Dice** — your piece moves forward and lands on a tile.\n4. The tile effect (snake, ladder, or event) is applied to your capital.',
  },
  {
    icon: '📈',
    title: 'Snakes & Ladders',
    body: '**Ladders** 🪜 boost you forward (profit rally!). **Snakes** 🐍 pull you back (market crash!). Some tiles trigger special F&O events like margin calls, circuit breakers, or bonus dividends.',
  },
  {
    icon: '⚡',
    title: 'VIX & Volatility',
    body: 'The **VIX meter** simulates real market volatility. When VIX is high, tile effects are amplified — both gains and losses. Keep an eye on the VIX gauge in the sidebar during a game.',
  },
  {
    icon: '🏛️',
    title: 'Greek Modifiers',
    body: '**Theta** decays your capital each turn (time value). **Gamma** amplifies dice moves. **Vega** scales tile effects with volatility. These modifiers add strategic depth beyond simple dice rolls.',
  },
  {
    icon: '🏆',
    title: 'Tiers & Quests',
    body: 'Complete daily quests to earn XP and unlock higher subscription tiers: **Apprentice → MarketWarrior → BillionaireGuild**. Higher tiers unlock benefits like reduced theta decay and quest bonuses.',
  },
  {
    icon: '🤖',
    title: 'Single-Player Mode',
    body: 'Click **Quick Single-Player** in the Lobby to start a game with an AI bot. The bot uses an adaptive strategy that adjusts conviction based on its board position.',
  },
  {
    icon: '👥',
    title: 'Multiplayer Mode',
    body: 'Create a room in the Lobby, share the room with friends, and start the game once at least 2 players have joined. You can also add bots to fill empty slots.',
  },
];

function renderMarkdown(text: string) {
  // Very simple bold rendering
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-emerald-400">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function HowToPlay() {
  const show = useUIStore((s) => s.showHowToPlay);
  const toggle = useUIStore((s) => s.toggleHowToPlay);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggle}>
      <div
        className="relative mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white">How to Play</h2>
          <button onClick={toggle} className="text-gray-500 hover:text-white text-xl" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {sections.map((s) => (
            <div key={s.title} className="rounded-xl bg-gray-800/60 p-4">
              <h3 className="mb-1 text-base font-bold text-white">
                <span className="mr-2">{s.icon}</span>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">{renderMarkdown(s.body)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={toggle}
            className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-500"
          >
            Got it — Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
}
