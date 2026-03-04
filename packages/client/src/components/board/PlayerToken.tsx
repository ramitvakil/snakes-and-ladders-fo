import { motion } from 'framer-motion';
import type { Player } from '@game/shared';

const COLORS = ['bg-cyan-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400'];

interface PlayerTokenProps {
  player: Player;
  offset: number; // index when multiple players on same tile
}

export default function PlayerToken({ player, offset }: PlayerTokenProps) {
  const color = COLORS[player.turnOrder % COLORS.length];

  return (
    <motion.div
      layout
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`player-token h-3 w-3 rounded-full ${color} border border-gray-900 shadow-md`}
      style={{ marginLeft: offset > 0 ? -4 : 0 }}
      title={`${player.displayName} — ₹${player.capital.toLocaleString('en-IN')}`}
    >
      {player.isBot && (
        <span className="absolute -top-1 -right-1 text-[6px]">🤖</span>
      )}
    </motion.div>
  );
}
