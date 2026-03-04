import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ── Theme Definitions ─────────────────────────────────── */

export type ThemeId = 'midnight' | 'bull' | 'bear' | 'euphoria' | 'panic' | 'auto';

export interface ThemeTokens {
  id: ThemeId | 'euphoria' | 'panic' | 'bull' | 'bear' | 'midnight';
  label: string;
  emoji: string;
  description: string;
  bodyBg: string;
  surfaceBg: string;
  surfaceRaised: string;
  surfaceOverlay: string;
  accent: string;
  accentGlow: string;
  accentHex: string;
  border: string;
  borderHover: string;
  textPrimary: string;
  textSecondary: string;
  boardGradient: string;
  glassFrom: string;
  glassTo: string;
  tileNeutral: string;
  navBg: string;
  cardShadow: string;
  tickerBg: string;
}

export const THEMES: Record<Exclude<ThemeId, 'auto'>, ThemeTokens> = {
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    emoji: '🌙',
    description: 'Classic dark trading floor',
    bodyBg: 'linear-gradient(180deg, #080d1a 0%, #0a1020 50%, #060b16 100%)',
    surfaceBg: '#0f1629',
    surfaceRaised: '#151d33',
    surfaceOverlay: '#1a2340',
    accent: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.15)',
    accentHex: '#10b981',
    border: 'rgba(148, 163, 184, 0.08)',
    borderHover: 'rgba(148, 163, 184, 0.16)',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    boardGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03), rgba(59, 130, 246, 0.03))',
    glassFrom: 'rgba(15, 22, 41, 0.9)',
    glassTo: 'rgba(21, 29, 51, 0.85)',
    tileNeutral: '#141b2e',
    navBg: 'rgba(15, 23, 42, 0.7)',
    cardShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)',
    tickerBg: 'rgba(15, 22, 41, 0.95)',
  },
  bull: {
    id: 'bull',
    label: 'Bull Run',
    emoji: '🐂',
    description: 'Optimistic green market vibes',
    bodyBg: 'linear-gradient(180deg, #052e16 0%, #064e3b 50%, #022c22 100%)',
    surfaceBg: '#0a2818',
    surfaceRaised: '#0f3a22',
    surfaceOverlay: '#14532d',
    accent: '#22c55e',
    accentGlow: 'rgba(34, 197, 94, 0.15)',
    accentHex: '#22c55e',
    border: 'rgba(34, 197, 94, 0.12)',
    borderHover: 'rgba(34, 197, 94, 0.24)',
    textPrimary: '#dcfce7',
    textSecondary: '#86efac',
    boardGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(16, 185, 129, 0.05))',
    glassFrom: 'rgba(10, 40, 24, 0.9)',
    glassTo: 'rgba(15, 58, 34, 0.85)',
    tileNeutral: '#0f2918',
    navBg: 'rgba(5, 46, 22, 0.7)',
    cardShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 12px rgba(34, 197, 94, 0.05)',
    tickerBg: 'rgba(10, 40, 24, 0.95)',
  },
  bear: {
    id: 'bear',
    label: 'Bear Market',
    emoji: '🐻',
    description: 'Cautious red & amber tones',
    bodyBg: 'linear-gradient(180deg, #1a0a0a 0%, #2d0f0f 50%, #1c0808 100%)',
    surfaceBg: '#1f0e0e',
    surfaceRaised: '#2a1515',
    surfaceOverlay: '#3b1c1c',
    accent: '#f87171',
    accentGlow: 'rgba(248, 113, 113, 0.15)',
    accentHex: '#f87171',
    border: 'rgba(248, 113, 113, 0.1)',
    borderHover: 'rgba(248, 113, 113, 0.2)',
    textPrimary: '#fecaca',
    textSecondary: '#fca5a5',
    boardGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.04), rgba(245, 158, 11, 0.04))',
    glassFrom: 'rgba(31, 14, 14, 0.9)',
    glassTo: 'rgba(42, 21, 21, 0.85)',
    tileNeutral: '#1f1212',
    navBg: 'rgba(26, 10, 10, 0.7)',
    cardShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 12px rgba(239, 68, 68, 0.05)',
    tickerBg: 'rgba(31, 14, 14, 0.95)',
  },
  euphoria: {
    id: 'euphoria',
    label: 'Euphoria',
    emoji: '🚀',
    description: 'Peak greed — vivid neon glow',
    bodyBg: 'linear-gradient(180deg, #0c0a20 0%, #130f2e 50%, #0a0818 100%)',
    surfaceBg: '#120e28',
    surfaceRaised: '#1a1538',
    surfaceOverlay: '#231d48',
    accent: '#a78bfa',
    accentGlow: 'rgba(167, 139, 250, 0.15)',
    accentHex: '#a78bfa',
    border: 'rgba(167, 139, 250, 0.1)',
    borderHover: 'rgba(167, 139, 250, 0.2)',
    textPrimary: '#ede9fe',
    textSecondary: '#c4b5fd',
    boardGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05), rgba(244, 114, 182, 0.05))',
    glassFrom: 'rgba(18, 14, 40, 0.9)',
    glassTo: 'rgba(26, 21, 56, 0.85)',
    tileNeutral: '#151030',
    navBg: 'rgba(12, 10, 32, 0.7)',
    cardShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 12px rgba(167, 139, 250, 0.08)',
    tickerBg: 'rgba(18, 14, 40, 0.95)',
  },
  panic: {
    id: 'panic',
    label: 'Panic',
    emoji: '🔥',
    description: 'High volatility — dark & urgent',
    bodyBg: 'linear-gradient(180deg, #18120a 0%, #261a0a 50%, #140e06 100%)',
    surfaceBg: '#1c1408',
    surfaceRaised: '#28200e',
    surfaceOverlay: '#382a12',
    accent: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.15)',
    accentHex: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.1)',
    borderHover: 'rgba(245, 158, 11, 0.2)',
    textPrimary: '#fef3c7',
    textSecondary: '#fcd34d',
    boardGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(239, 68, 68, 0.04))',
    glassFrom: 'rgba(28, 20, 8, 0.9)',
    glassTo: 'rgba(40, 32, 14, 0.85)',
    tileNeutral: '#1a1408',
    navBg: 'rgba(24, 18, 10, 0.7)',
    cardShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 12px rgba(245, 158, 11, 0.08)',
    tickerBg: 'rgba(28, 20, 8, 0.95)',
  },
};

/* ── Auto-mood calculation ─────────────────────────────── */

export function resolveAutoTheme(
  vixValue: number | null,
  sentimentScore: number, // -1 (extreme bearish) to +1 (extreme bullish)
): Exclude<ThemeId, 'auto'> {
  const vix = vixValue ?? 15;

  // Extreme volatility → panic
  if (vix >= 35) return 'panic';

  // High VIX + bearish → bear
  if (vix >= 25 && sentimentScore < 0) return 'bear';

  // Low VIX + very bullish → euphoria
  if (vix < 15 && sentimentScore > 0.4) return 'euphoria';

  // Mild bullish → bull
  if (sentimentScore > 0.15) return 'bull';

  // Mild bearish → bear
  if (sentimentScore < -0.15) return 'bear';

  // Default
  return 'midnight';
}

/* ── Store ─────────────────────────────────────────────── */

interface ThemeState {
  selectedTheme: ThemeId;
  resolvedThemeId: Exclude<ThemeId, 'auto'>;
  setTheme: (id: ThemeId) => void;
  updateAutoMood: (vixValue: number | null, sentimentScore: number) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      selectedTheme: 'auto',
      resolvedThemeId: 'midnight',

      setTheme: (id) => {
        if (id === 'auto') {
          set({ selectedTheme: 'auto' });
        } else {
          set({ selectedTheme: id, resolvedThemeId: id });
        }
      },

      updateAutoMood: (vixValue, sentimentScore) => {
        if (get().selectedTheme !== 'auto') return;
        const resolved = resolveAutoTheme(vixValue, sentimentScore);
        if (resolved !== get().resolvedThemeId) {
          set({ resolvedThemeId: resolved });
        }
      },
    }),
    {
      name: 'snl-theme',
      partialize: (s) => ({ selectedTheme: s.selectedTheme }),
    },
  ),
);

/** Returns the concrete tokens for the currently active theme */
export function useActiveTheme(): ThemeTokens {
  const resolvedId = useThemeStore((s) => s.resolvedThemeId);
  return THEMES[resolvedId];
}
