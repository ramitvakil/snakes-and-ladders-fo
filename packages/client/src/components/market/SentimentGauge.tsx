import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { NewsItem } from '@game/shared';

interface SentimentGaugeProps {
  newsItems: NewsItem[];
}

/**
 * SentimentGauge — Aggregates recent news sentiment into a visual indicator
 * that hints at likely market outcome. Uses the last N news items to compute
 * a sentiment score: bullish = +1, neutral = 0, bearish = -1.
 *
 * The gauge needle position maps to market bias.
 */
export default function SentimentGauge({ newsItems }: SentimentGaugeProps) {
  // Use last 8 news items for sentiment calculation
  const recentNews = newsItems.slice(0, 8);

  if (recentNews.length === 0) return null;

  // Compute sentiment score: range [-1, +1]
  const sentimentScore = recentNews.reduce((acc, item) => {
    if (item.sentiment === 'bullish') return acc + 1;
    if (item.sentiment === 'bearish') return acc - 1;
    return acc;
  }, 0) / recentNews.length;

  const bullishCount = recentNews.filter((n) => n.sentiment === 'bullish').length;
  const bearishCount = recentNews.filter((n) => n.sentiment === 'bearish').length;
  const neutralCount = recentNews.filter((n) => n.sentiment === 'neutral').length;

  // Determine market bias label
  let biasLabel: string;
  let biasColor: string;
  let biasEmoji: string;
  if (sentimentScore > 0.4) {
    biasLabel = 'Strong Bullish';
    biasColor = 'text-emerald-400';
    biasEmoji = '🐂';
  } else if (sentimentScore > 0.15) {
    biasLabel = 'Lean Bullish';
    biasColor = 'text-emerald-300';
    biasEmoji = '↗';
  } else if (sentimentScore < -0.4) {
    biasLabel = 'Strong Bearish';
    biasColor = 'text-red-400';
    biasEmoji = '🐻';
  } else if (sentimentScore < -0.15) {
    biasLabel = 'Lean Bearish';
    biasColor = 'text-red-300';
    biasEmoji = '↘';
  } else {
    biasLabel = 'Mixed / Neutral';
    biasColor = 'text-gray-400';
    biasEmoji = '⚖️';
  }

  // Needle rotation: -90deg (full bear) to +90deg (full bull)
  const needleAngle = sentimentScore * 90;

  return (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          News Sentiment
        </p>
        <span className="text-[10px] text-gray-600">{recentNews.length} stories</span>
      </div>

      {/* Gauge visual */}
      <div className="flex items-center justify-center mb-2">
        <div className="relative w-28 h-14 overflow-hidden">
          {/* Arc background */}
          <svg viewBox="0 0 100 50" className="w-full h-full">
            {/* Background arc segments */}
            <path d="M 5 50 A 45 45 0 0 1 25 10" fill="none" stroke="#991b1b" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
            <path d="M 25 10 A 45 45 0 0 1 50 5" fill="none" stroke="#92400e" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
            <path d="M 50 5 A 45 45 0 0 1 75 10" fill="none" stroke="#365314" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
            <path d="M 75 10 A 45 45 0 0 1 95 50" fill="none" stroke="#065f46" strokeWidth="6" strokeLinecap="round" opacity="0.4" />

            {/* Tick marks */}
            <line x1="5" y1="50" x2="8" y2="47" stroke="#475569" strokeWidth="0.8" />
            <line x1="50" y1="5" x2="50" y2="9" stroke="#475569" strokeWidth="0.8" />
            <line x1="95" y1="50" x2="92" y2="47" stroke="#475569" strokeWidth="0.8" />
          </svg>

          {/* Needle */}
          <motion.div
            className="absolute bottom-0 left-1/2"
            initial={{ rotate: 0 }}
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{ transformOrigin: 'bottom center', marginLeft: '-1px' }}
          >
            <div className="w-0.5 h-12 bg-gradient-to-t from-white to-transparent rounded-full" />
          </motion.div>

          {/* Center dot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md" />
        </div>
      </div>

      {/* Bias label */}
      <div className="text-center mb-2">
        <span className={clsx('text-sm font-bold', biasColor)}>
          {biasEmoji} {biasLabel}
        </span>
      </div>

      {/* Sentiment breakdown bar */}
      <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-gray-800/50">
        {bullishCount > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(bullishCount / recentNews.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-emerald-500 rounded-l-full"
          />
        )}
        {neutralCount > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(neutralCount / recentNews.length) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full bg-gray-500"
          />
        )}
        {bearishCount > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(bearishCount / recentNews.length) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full bg-red-500 rounded-r-full"
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-1.5 text-[10px]">
        <span className="text-emerald-400">▲ {bullishCount}</span>
        <span className="text-gray-500">— {neutralCount}</span>
        <span className="text-red-400">▼ {bearishCount}</span>
      </div>

      {/* Hint for player */}
      <p className="mt-2 text-[10px] text-gray-500 leading-snug text-center">
        {sentimentScore > 0.3
          ? '💡 News skews bullish — consider a Bullish view'
          : sentimentScore < -0.3
            ? '💡 News skews bearish — consider a Bearish view'
            : '💡 Mixed signals — any view could win'}
      </p>
    </div>
  );
}
