import type { PlayerBuff } from '@game/shared';

interface BuffListProps {
  buffs: PlayerBuff[];
}

export default function BuffList({ buffs }: BuffListProps) {
  if (buffs.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {buffs.map((b, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-violet-900/30 px-2 py-0.5 text-[10px] text-violet-300"
        >
          <span className="font-bold">{b.type}</span>
          <span>×{b.multiplier}</span>
          <span className="text-gray-500">({b.turnsRemaining}t)</span>
        </span>
      ))}
    </div>
  );
}
