import { motion } from 'framer-motion';

interface DiceRollerProps {
  onRoll: () => void;
  isRolling: boolean;
  disabled?: boolean;
}

export default function DiceRoller({ onRoll, isRolling, disabled }: DiceRollerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={onRoll}
        disabled={disabled || isRolling}
        whileHover={{ scale: 1.08, boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)' }}
        whileTap={{ scale: 0.9 }}
        className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-2xl font-bold text-white shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-30 disabled:shadow-none"
        style={{ perspective: '200px' }}
      >
        {isRolling ? (
          <motion.span
            animate={{
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.2, 1, 1.2, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
            className="inline-block text-3xl"
          >
            🎲
          </motion.span>
        ) : (
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-3xl"
          >
            🎲
          </motion.span>
        )}

        {/* Glow ring when enabled */}
        {!disabled && !isRolling && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      <span className="text-[11px] font-medium text-gray-500">
        {disabled ? (
          <span className="text-gray-600">Select view first</span>
        ) : isRolling ? (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-emerald-400"
          >
            Rolling…
          </motion.span>
        ) : (
          <span className="text-gray-400">Tap to roll</span>
        )}
      </span>
    </div>
  );
}
