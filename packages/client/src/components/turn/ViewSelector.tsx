import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { MarketView } from '@game/shared';

interface ViewSelectorProps {
  selected: MarketView | null;
  onChange: (view: MarketView) => void;
}

const views: {
  value: MarketView;
  label: string;
  emoji: string;
  activeClasses: string;
  activeBg: string;
}[] = [
  {
    value: 'Bullish',
    label: 'Bull',
    emoji: '🐂',
    activeClasses: 'border-emerald-500 text-emerald-300 shadow-emerald-500/10',
    activeBg: 'bg-emerald-950/40',
  },
  {
    value: 'Bearish',
    label: 'Bear',
    emoji: '🐻',
    activeClasses: 'border-red-500 text-red-300 shadow-red-500/10',
    activeBg: 'bg-red-950/40',
  },
  {
    value: 'Neutral',
    label: 'Flat',
    emoji: '⚖️',
    activeClasses: 'border-gray-500 text-gray-300 shadow-gray-500/10',
    activeBg: 'bg-gray-800/60',
  },
];

export default function ViewSelector({ selected, onChange }: ViewSelectorProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Market View</p>
      <div className="flex gap-2">
        {views.map((v) => {
          const isActive = selected === v.value;
          return (
            <motion.button
              key={v.value}
              onClick={() => onChange(v.value)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={clsx(
                'flex flex-1 flex-col items-center rounded-xl border px-2 py-2 text-xs transition-all duration-200',
                isActive
                  ? `${v.activeBg} ${v.activeClasses} shadow-md`
                  : 'border-gray-700/50 bg-gray-800/30 text-gray-500 hover:border-gray-600 hover:bg-gray-800/50',
              )}
            >
              <motion.span
                className="text-xl"
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={isActive ? { duration: 0.3 } : {}}
              >
                {v.emoji}
              </motion.span>
              <span className="mt-0.5 font-semibold">{v.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
