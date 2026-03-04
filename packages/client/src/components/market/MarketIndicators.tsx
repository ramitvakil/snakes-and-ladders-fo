import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { VIXLevel, NewsItem } from '@game/shared';

interface MarketIndicatorsProps {
  vixLevel: VIXLevel | null;
  vixHistory: VIXLevel[];
  newsItems: NewsItem[];
  currentTurn: number;
}

/**
 * Compact market indicators strip showing:
 * - Nifty trend (derived from news)
 * - VIX mini value
 * - Put/Call ratio (simulated from sentiment)
 * - FII flow (simulated)
 * - Market breadth
 */
export default function MarketIndicators({
  vixLevel,
  vixHistory,
  newsItems,
  currentTurn,
}: MarketIndicatorsProps) {
  // Derive indicators from news sentiment + VIX
  const recentNews = newsItems.slice(0, 6);
  const sentimentScore = recentNews.length > 0
    ? recentNews.reduce((acc, n) => {
        if (n.sentiment === 'bullish') return acc + 1;
        if (n.sentiment === 'bearish') return acc - 1;
        return acc;
      }, 0) / recentNews.length
    : 0;

  const vix = vixLevel?.value ?? 15;

  // Put-Call Ratio: influenced by sentiment + VIX
  const pcr = Math.max(0.4, Math.min(1.8, 1.0 - sentimentScore * 0.4 + (vix - 20) * 0.01));

  // FII flow: bullish news = net buy, bearish = net sell
  const fiiFlow = Math.round(sentimentScore * 3500 + (Math.random() - 0.5) * 1000);

  // Market breadth: advances vs declines
  const advanceRatio = 0.5 + sentimentScore * 0.25 + (Math.random() - 0.5) * 0.1;
  const advances = Math.round(advanceRatio * 2500);
  const declines = 2500 - advances;

  // VIX trend from history
  const vixTrend = vixHistory.length >= 2
    ? (vixHistory[vixHistory.length - 1]!.value - vixHistory[Math.max(0, vixHistory.length - 5)]!.value)
    : 0;

  const indicators = [
    {
      label: 'PCR',
      value: pcr.toFixed(2),
      color: pcr > 1.2 ? 'text-emerald-400' : pcr < 0.8 ? 'text-red-400' : 'text-gray-300',
      tooltip: pcr > 1.2 ? 'Bullish' : pcr < 0.8 ? 'Bearish' : 'Neutral',
    },
    {
      label: 'FII',
      value: `${fiiFlow >= 0 ? '+' : ''}${(fiiFlow / 1000).toFixed(1)}K Cr`,
      color: fiiFlow >= 0 ? 'text-emerald-400' : 'text-red-400',
      tooltip: fiiFlow >= 0 ? 'Net buyer' : 'Net seller',
    },
    {
      label: 'A/D',
      value: `${advances}/${declines}`,
      color: advances > declines ? 'text-emerald-400' : 'text-red-400',
      tooltip: advances > declines ? 'Positive breadth' : 'Negative breadth',
    },
    {
      label: 'VIX Δ',
      value: `${vixTrend >= 0 ? '+' : ''}${vixTrend.toFixed(1)}`,
      color: vixTrend > 1 ? 'text-red-400' : vixTrend < -1 ? 'text-emerald-400' : 'text-gray-400',
      tooltip: vixTrend > 0 ? 'Fear rising' : 'Fear falling',
    },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
      {indicators.map((ind, i) => (
        <motion.div
          key={ind.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-1.5 rounded-lg bg-gray-800/40 border border-gray-700/30 px-2.5 py-1.5 flex-shrink-0"
          title={ind.tooltip}
        >
          <span className="text-[10px] text-gray-500 font-medium uppercase">{ind.label}</span>
          <span className={clsx('text-[11px] font-mono font-bold', ind.color)}>{ind.value}</span>
        </motion.div>
      ))}
    </div>
  );
}
