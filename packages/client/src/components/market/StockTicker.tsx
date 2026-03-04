import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { VIXLevel } from '@game/shared';

interface StockTickerProps {
  vixLevel: VIXLevel | null;
}

interface TickerStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
}

/**
 * Indian stock market indices + key stocks ticker.
 * Prices are simulated and influenced by VIX level to feel
 * consistent with the game's market regime.
 */

const BASE_STOCKS: Omit<TickerStock, 'change' | 'changePct'>[] = [
  { symbol: 'NIFTY', name: 'Nifty 50', price: 23850 },
  { symbol: 'SENSEX', name: 'BSE Sensex', price: 78400 },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 51200 },
  { symbol: 'RELIANCE', name: 'Reliance', price: 2890 },
  { symbol: 'TCS', name: 'TCS', price: 3940 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1680 },
  { symbol: 'INFY', name: 'Infosys', price: 1550 },
  { symbol: 'ITC', name: 'ITC Ltd', price: 440 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 980 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1640 },
  { symbol: 'ADANIENT', name: 'Adani Ent', price: 2460 },
  { symbol: 'WIPRO', name: 'Wipro', price: 480 },
  { symbol: 'SBIN', name: 'SBI', price: 810 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1240 },
  { symbol: 'LT', name: 'L&T', price: 3520 },
  { symbol: 'HINDUNILVR', name: 'HUL', price: 2420 },
];

function generateStockData(vixLevel: VIXLevel | null): TickerStock[] {
  const regime = vixLevel?.regime ?? 'normal';

  // Bias based on regime: calm/normal = slight bullish, elevated/high/extreme = bearish
  const biasMap: Record<string, number> = {
    calm: 0.6,
    normal: 0.2,
    elevated: -0.3,
    high: -0.8,
    extreme: -1.5,
  };
  const bias = biasMap[regime] ?? 0;

  // Volatility scale based on VIX
  const volScale = (vixLevel?.value ?? 15) / 15;

  return BASE_STOCKS.map((stock) => {
    const volatility = stock.price * 0.015 * volScale;
    const rawChange = (Math.random() - 0.5 + bias * 0.3) * volatility;
    const change = Math.round(rawChange * 100) / 100;
    const changePct = (change / stock.price) * 100;
    return {
      ...stock,
      price: Math.round((stock.price + change) * 100) / 100,
      change,
      changePct: Math.round(changePct * 100) / 100,
    };
  });
}

export default function StockTicker({ vixLevel }: StockTickerProps) {
  const [stocks, setStocks] = useState<TickerStock[]>(() => generateStockData(vixLevel));
  const containerRef = useRef<HTMLDivElement>(null);

  // Update stock prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(generateStockData(vixLevel));
    }, 5000);
    return () => clearInterval(interval);
  }, [vixLevel]);

  // Double the items for seamless infinite scroll
  const doubled = [...stocks, ...stocks];

  return (
    <div className="relative overflow-hidden bg-gray-900/80 border-y border-gray-800/50">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />

      <div
        ref={containerRef}
        className="ticker-tape flex items-center whitespace-nowrap py-1.5"
      >
        {doubled.map((stock, i) => (
          <TickerItem key={`${stock.symbol}-${i}`} stock={stock} />
        ))}
      </div>
    </div>
  );
}

function TickerItem({ stock }: { stock: TickerStock }) {
  const isPositive = stock.change >= 0;

  return (
    <motion.div
      className="inline-flex items-center gap-1.5 px-3 py-0.5 mx-1"
      initial={false}
    >
      <span className="text-[11px] font-bold text-gray-300">{stock.symbol}</span>
      <span className="text-[11px] font-mono text-gray-400">
        {stock.price.toLocaleString('en-IN', { maximumFractionDigits: stock.price > 1000 ? 0 : 2 })}
      </span>
      <span
        className={clsx(
          'text-[11px] font-mono font-semibold',
          isPositive ? 'text-emerald-400' : 'text-red-400',
        )}
      >
        {isPositive ? '▲' : '▼'}{' '}
        {Math.abs(stock.changePct).toFixed(2)}%
      </span>
      <span className="text-gray-700 mx-1">│</span>
    </motion.div>
  );
}
