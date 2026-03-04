import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useThemeStore, THEMES, useActiveTheme } from '../../stores/themeStore';
import type { ThemeId } from '../../stores/themeStore';

const ALL_OPTIONS: { id: ThemeId; label: string; emoji: string; desc: string }[] = [
  { id: 'auto', label: 'Auto (Market Mood)', emoji: '🤖', desc: 'Theme follows live VIX + news sentiment' },
  ...Object.values(THEMES).map((t) => ({
    id: t.id as ThemeId,
    label: t.label,
    emoji: t.emoji,
    desc: t.description,
  })),
];

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const selectedTheme = useThemeStore((s) => s.selectedTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const active = useActiveTheme();

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition hover:bg-white/5"
        title="Change theme"
      >
        <span className="text-sm">{selectedTheme === 'auto' ? '🤖' : active.emoji}</span>
        <span className="hidden sm:inline text-gray-400">Theme</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-700/40 bg-gray-900/95 backdrop-blur-xl p-2 shadow-2xl"
            >
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Trader Mood Themes
              </p>

              <div className="mt-1 space-y-0.5">
                {ALL_OPTIONS.map((opt) => {
                  const isActive = selectedTheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setOpen(false);
                      }}
                      className={clsx(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition',
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
                      )}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold flex items-center gap-1.5">
                          {opt.label}
                          {isActive && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-px text-[9px] font-bold text-emerald-400">
                              ACTIVE
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-500 leading-tight truncate">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Current mood indicator */}
              {selectedTheme === 'auto' && (
                <div className="mt-2 rounded-lg bg-gray-800/60 px-2.5 py-1.5 border border-gray-700/30">
                  <p className="text-[10px] text-gray-500">
                    Current mood: <span className="font-bold text-gray-300">{active.emoji} {active.label}</span>
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
