import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ConvictionLevel } from '@game/shared';

interface ConvictionSliderProps {
  value: ConvictionLevel;
  onChange: (level: ConvictionLevel) => void;
}

const levels: {
  level: ConvictionLevel;
  label: string;
  color: string;
  barColor: string;
  multiplier: string;
}[] = [
  { level: 1, label: 'Low', color: 'text-gray-400', barColor: 'bg-gray-400', multiplier: '1.0×' },
  { level: 2, label: 'Med', color: 'text-cyan-400', barColor: 'bg-cyan-400', multiplier: '1.25×' },
  { level: 3, label: 'High', color: 'text-emerald-400', barColor: 'bg-emerald-400', multiplier: '1.5×' },
  { level: 4, label: 'V.High', color: 'text-yellow-400', barColor: 'bg-yellow-400', multiplier: '1.75×' },
  { level: 5, label: 'Max', color: 'text-red-400', barColor: 'bg-red-400', multiplier: '2.0×' },
];

export default function ConvictionSlider({ value, onChange }: ConvictionSliderProps) {
  const current = levels[value - 1]!;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Conviction</p>
        <motion.span
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={clsx('text-xs font-bold', current.color)}
        >
          {current.label} {current.multiplier}
        </motion.span>
      </div>

      {/* Segmented bar buttons */}
      <div className="flex gap-1">
        {levels.map((l) => {
          const isActive = value >= l.level;
          const isExact = value === l.level;
          return (
            <motion.button
              key={l.level}
              onClick={() => onChange(l.level)}
              whileHover={{ scaleY: 1.3 }}
              whileTap={{ scaleY: 0.8 }}
              className={clsx(
                'flex-1 h-3 rounded-full transition-colors duration-200',
                isActive ? l.barColor : 'bg-gray-700/60',
                isExact && 'ring-1 ring-white/20',
              )}
            />
          );
        })}
      </div>

      {/* Dot labels */}
      <div className="flex justify-between px-0.5">
        {levels.map((l) => (
          <button
            key={l.level}
            onClick={() => onChange(l.level)}
            className={clsx(
              'text-[10px] font-medium transition-colors',
              value === l.level ? l.color : 'text-gray-600 hover:text-gray-400',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
