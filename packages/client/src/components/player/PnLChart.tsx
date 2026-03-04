interface PnLChartProps {
  history: number[];
}

/**
 * Simple inline SVG sparkline of the player's PnL history.
 */
export default function PnLChart({ history }: PnLChartProps) {
  if (history.length < 2) return null;

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const w = 200;
  const h = 40;

  const points = history
    .map((v, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  const lastVal = history[history.length - 1]!;
  const firstVal = history[0]!;
  const color = lastVal >= firstVal ? '#34d399' : '#f87171';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}
