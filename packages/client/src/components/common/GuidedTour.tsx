import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface TourStep {
  /** CSS selector to highlight */
  target?: string;
  /** Title of the step */
  title: string;
  /** Description text */
  content: string;
  /** Position of tooltip relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  /** localStorage key to track if tour was seen */
  tourKey?: string;
}

export default function GuidedTour({ steps, isOpen, onClose, tourKey }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const positionTooltip = useCallback(() => {
    if (!step) return;

    if (!step.target) {
      // Center on screen for intro steps
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002,
      });
      setHighlightStyle({ display: 'none' });
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) {
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10002,
      });
      setHighlightStyle({ display: 'none' });
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;

    setHighlightStyle({
      position: 'fixed',
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      borderRadius: '8px',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
      zIndex: 10001,
      pointerEvents: 'none',
    });

    const pos = step.position ?? 'bottom';
    const tooltipWidth = 320; // matches w-80
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10002,
      maxWidth: tooltipWidth,
    };

    switch (pos) {
      case 'bottom':
        style.top = Math.min(rect.bottom + 16, window.innerHeight - 260);
        style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
        break;
      case 'top':
        style.top = Math.max(16, rect.top - 260);
        style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
        break;
      case 'left':
        style.top = Math.max(16, Math.min(rect.top + rect.height / 2 - 100, window.innerHeight - 260));
        style.right = Math.max(16, window.innerWidth - rect.left + 16);
        break;
      case 'right':
        style.top = Math.max(16, Math.min(rect.top + rect.height / 2 - 100, window.innerHeight - 260));
        style.left = Math.min(rect.right + 16, window.innerWidth - tooltipWidth - 16);
        break;
    }

    setTooltipStyle(style);
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      positionTooltip();
      window.addEventListener('resize', positionTooltip);
      window.addEventListener('scroll', positionTooltip);
      return () => {
        window.removeEventListener('resize', positionTooltip);
        window.removeEventListener('scroll', positionTooltip);
      };
    }
  }, [isOpen, currentStep, positionTooltip]);

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const handleFinish = () => {
    if (tourKey) {
      localStorage.setItem(tourKey, 'true');
    }
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen || !step) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[10000] bg-black/50"
        onClick={handleFinish}
      />

      {/* Highlight box */}
      <div style={highlightStyle} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="w-80 rounded-xl border border-gray-700 bg-gray-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step indicator */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleFinish}
            className="text-gray-500 hover:text-white"
            aria-label="Close tour"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-3 h-1 w-full rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <h3 className="mb-1 text-base font-bold text-white">{step.title}</h3>
        <p className="mb-4 text-sm text-gray-400 leading-relaxed">{step.content}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition hover:text-white disabled:invisible"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            {isLast ? 'Got it!' : 'Next →'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
