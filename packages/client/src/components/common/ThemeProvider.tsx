import { useEffect } from 'react';
import { useActiveTheme, useThemeStore } from '../../stores/themeStore';
import { useMarketStore } from '../../stores/marketStore';
import type { NewsSentiment } from '@game/shared';

/**
 * ThemeProvider — renders nothing visible.
 * It syncs the active theme tokens into CSS custom properties on <html>
 * and drives auto-mood updates from market data.
 */
export default function ThemeProvider() {
  const theme = useActiveTheme();
  const selectedTheme = useThemeStore((s: { selectedTheme: string }) => s.selectedTheme);
  const updateAutoMood = useThemeStore((s: { updateAutoMood: (v: number | null, s: number) => void }) => s.updateAutoMood);
  const vixLevel = useMarketStore((s: { vixLevel: { value: number } | null }) => s.vixLevel);
  const newsItems = useMarketStore((s: { newsItems: { sentiment: NewsSentiment }[] }) => s.newsItems);

  /* ── Inject CSS variables whenever theme changes ── */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-board-bg', theme.surfaceBg);
    root.style.setProperty('--color-surface', theme.surfaceBg);
    root.style.setProperty('--color-surface-raised', theme.surfaceRaised);
    root.style.setProperty('--color-surface-overlay', theme.surfaceOverlay);
    root.style.setProperty('--color-tile-neutral', theme.tileNeutral);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-glow', theme.accentGlow);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-border-hover', theme.borderHover);
    root.style.setProperty('--shadow-card', theme.cardShadow);

    // Body background
    document.body.style.background = theme.bodyBg;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.color = theme.textPrimary;

    // Glass card overrides
    root.style.setProperty('--glass-from', theme.glassFrom);
    root.style.setProperty('--glass-to', theme.glassTo);
    root.style.setProperty('--nav-bg', theme.navBg);
    root.style.setProperty('--ticker-bg', theme.tickerBg);

    // Expose theme id as data attribute for conditional Tailwind classes
    root.dataset.theme = theme.id;
  }, [theme]);

  /* ── Auto-mood: recalculate from market data ── */
  useEffect(() => {
    if (selectedTheme !== 'auto') return;

    const recent = newsItems.slice(0, 12);
    if (recent.length === 0) {
      updateAutoMood(vixLevel?.value ?? null, 0);
      return;
    }

    const sentimentWeights: Record<NewsSentiment, number> = {
      bullish: 1,
      neutral: 0,
      bearish: -1,
    };

    const score =
      recent.reduce((sum: number, n: { sentiment: NewsSentiment }) => sum + sentimentWeights[n.sentiment], 0) / recent.length;

    updateAutoMood(vixLevel?.value ?? null, score);
  }, [selectedTheme, vixLevel, newsItems, updateAutoMood]);

  return null; // Provider renders nothing
}
