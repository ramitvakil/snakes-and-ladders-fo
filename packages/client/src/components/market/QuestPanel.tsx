import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { DailyQuest } from '@game/shared';

interface QuestPanelProps {
  quests: DailyQuest[];
}

export default function QuestPanel({ quests }: QuestPanelProps) {
  if (quests.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-3">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quests</p>
        <p className="mt-2 text-[11px] text-gray-600 text-center">No active quests</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 p-3">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Quests</p>
      <div className="space-y-1.5">
        {quests.map((q) => (
          <QuestCard key={q.id} quest={q} />
        ))}
      </div>
    </div>
  );
}

function QuestCard({ quest }: { quest: DailyQuest }) {
  const pct = quest.targetValue > 0 ? Math.min(100, (quest.currentProgress / quest.targetValue) * 100) : 0;
  const isComplete = pct >= 100;

  return (
    <div className={clsx(
      'rounded-lg px-2.5 py-2 border transition-colors',
      isComplete
        ? 'bg-emerald-950/20 border-emerald-800/20'
        : 'bg-gray-800/50 border-transparent',
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className={clsx(
          'text-[11px] font-semibold leading-snug',
          isComplete ? 'text-emerald-300' : 'text-gray-300',
        )}>
          {isComplete && '✓ '}{quest.description}
        </p>
        <span className="whitespace-nowrap text-[10px] font-bold text-yellow-400/80">
          +₹{quest.reward.capitalBonus}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-1.5 h-1 rounded-full bg-gray-700/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={clsx(
            'h-full rounded-full',
            isComplete ? 'bg-emerald-500' : 'bg-violet-500',
          )}
        />
      </div>
      <p className="mt-0.5 text-[9px] text-gray-600 tabular-nums">
        {quest.currentProgress}/{quest.targetValue}
      </p>
    </div>
  );
}
