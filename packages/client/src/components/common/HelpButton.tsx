import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const startTour = useUIStore((s) => s.startTour);
  const toggleHowToPlay = useUIStore((s) => s.toggleHowToPlay);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-600 text-sm text-gray-400 transition hover:border-emerald-500 hover:text-emerald-400"
        aria-label="Help menu"
        data-testid="help-button"
      >
        ?
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-xl z-50">
          <button
            onClick={() => {
              toggleHowToPlay();
              setOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            📖 How to Play
          </button>
          <button
            onClick={() => {
              startTour('home');
              setOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            🗺️ Guided Tour
          </button>
        </div>
      )}
    </div>
  );
}
