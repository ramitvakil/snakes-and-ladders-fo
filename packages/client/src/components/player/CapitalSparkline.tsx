import clsx from 'clsx';

interface CapitalSparklineProps {
  /** Array of capital values over turns */
  data: number[];
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
  className?: string;
}

export default function CapitalSparkline({
  data,
  width = 120,
  height = 28,
  className,
}: CapitalSparklineProps) {
  if (data.length < 2) return null;

  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid division by zero

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * w;
      const y = padding + h - ((val - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Color: green if trending up, red if trending down
  const lastVal = data[data.length - 1] ?? 0;
  const firstVal = data[0] ?? 0;
  const trend = lastVal - firstVal;
  const strokeColor = trend >= 0 ? '#34d399' : '#f87171';
  const fillColor = trend >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)';

  // Build area fill path
  const firstX = (padding).toFixed(1);
  const lastX = (padding + w).toFixed(1);
  const bottomY = (padding + h).toFixed(1);
  const areaPath = `M ${firstX},${bottomY} L ${points.split(' ').map((p) => p).join(' L ')} L ${lastX},${bottomY} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={clsx('flex-shrink-0', className)}
    >
      {/* Fill area under line */}
      <path d={areaPath} fill={fillColor} />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current value dot */}
      {data.length > 0 && (
        <circle
          cx={padding + w}
          cy={padding + h - ((lastVal - min) / range) * h}
          r="2"
          fill={strokeColor}
        />
      )}
    </svg>
  );
}
