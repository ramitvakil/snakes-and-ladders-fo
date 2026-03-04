import { motion } from 'framer-motion';

interface CapitalDisplayProps {
  capital: number;
  delta?: number;
}

export default function CapitalDisplay({ capital, delta }: CapitalDisplayProps) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-bold text-white">₹{capital.toLocaleString('en-IN')}</span>
      {delta !== undefined && delta !== 0 && (
        <motion.span
          key={delta}
          initial={{ opacity: 0, y: delta > 0 ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={delta > 0 ? 'text-sm font-semibold text-emerald-400' : 'text-sm font-semibold text-red-400'}
        >
          {delta > 0 ? '+' : ''}₹{delta.toLocaleString('en-IN')}
        </motion.span>
      )}
    </div>
  );
}
