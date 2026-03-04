import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import type { NewsItem, NewsSentiment } from '@game/shared';

interface NewsTickerProps {
  items: NewsItem[];
}

/* ── sentiment styling ─────────────────────────────────────── */

const sentimentBadge: Record<NewsSentiment, { bg: string; text: string; label: string; icon: string }> = {
  bullish: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Bullish', icon: '▲' },
  bearish: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Bearish', icon: '▼' },
  neutral: { bg: 'bg-gray-500/15', text: 'text-gray-400', label: 'Neutral', icon: '—' },
};

const categoryConfig: Record<string, { color: string; icon: string }> = {
  equity: { color: 'text-blue-400', icon: '📊' },
  derivative: { color: 'text-purple-400', icon: '📈' },
  macro: { color: 'text-amber-400', icon: '🏦' },
  geopolitical: { color: 'text-rose-400', icon: '🌍' },
  rbi: { color: 'text-cyan-400', icon: '🇮🇳' },
  global: { color: 'text-teal-400', icon: '🌐' },
  sector: { color: 'text-indigo-400', icon: '🏭' },
};

/* ── helper ─────────────────────────────────────────────────── */

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/* ── component ──────────────────────────────────────────────── */

export default function NewsTicker({ items }: NewsTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to top when a new item arrives */
  useEffect(() => {
    if (scrollRef.current && items.length > 0) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [items.length]);

  // Headline counts by sentiment
  const counts = items.reduce(
    (acc, n) => { acc[n.sentiment]++; return acc; },
    { bullish: 0, bearish: 0, neutral: 0 } as Record<NewsSentiment, number>,
  );

  return (
    <div className="flex max-h-[380px] flex-col rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/30">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-700/30 px-3 py-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Live Feed</p>
        <div className="ml-auto flex items-center gap-1.5 text-[10px]">
          <span className="text-emerald-400 tabular-nums">{counts.bullish}▲</span>
          <span className="text-gray-500 tabular-nums">{counts.neutral}—</span>
          <span className="text-red-400 tabular-nums">{counts.bearish}▼</span>
        </div>
      </div>

      {/* Scrollable feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain px-1.5 py-1"
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-4 w-24 rounded shimmer" />
            <p className="mt-2 text-[11px] text-gray-600">Awaiting market news…</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item, idx) => (
              <NewsCard key={item.id} item={item} isLatest={idx === 0} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* ── individual card ────────────────────────────────────────── */

function NewsCard({ item, isLatest }: { item: NewsItem; isLatest: boolean }) {
  const badge = sentimentBadge[item.sentiment];
  const cat = categoryConfig[item.category] ?? { color: 'text-gray-400', icon: '📰' };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx(
        'mb-1 rounded-lg px-2.5 py-2 transition-colors border border-transparent',
        isLatest
          ? 'bg-gray-800/80 border-gray-600/30'
          : 'bg-gray-800/40 hover:bg-gray-800/60',
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className={clsx('text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1', cat.color)}>
          <span className="text-[9px]">{cat.icon}</span>
          {item.category}
        </span>
        <span className="text-[10px] text-gray-600 tabular-nums">{timeAgo(item.timestamp)}</span>
      </div>

      {/* Headline */}
      <p className={clsx(
        'mt-0.5 text-[11px] font-semibold leading-snug',
        isLatest ? 'text-gray-100' : 'text-gray-300',
      )}>
        {item.headline}
      </p>

      {/* Detail */}
      {item.detail && (
        <p className="mt-0.5 text-[10px] leading-tight text-gray-500">{item.detail}</p>
      )}

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[9px] text-gray-600">{item.source}</span>
        <span
          className={clsx(
            'rounded-md px-1.5 py-px text-[9px] font-bold',
            badge.bg,
            badge.text,
          )}
        >
          {badge.icon} {badge.label}
        </span>
      </div>
    </motion.div>
  );
}
