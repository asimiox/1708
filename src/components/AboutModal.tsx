import React from 'react';
import { X, Sparkles, User, HelpCircle } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHowToPlay: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenHowToPlay }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity">
      <div
        className="relative w-full max-w-md bg-[var(--paper-2)] rounded-[20px] border border-[var(--border)] p-6 text-[var(--ink)] flex flex-col gap-4 text-left shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-[12px] flex items-center justify-center text-[var(--ink)] opacity-60 hover:opacity-100 hover:bg-[var(--surface-alt)] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="pr-8">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[28px] font-bold text-[var(--ink)]">1708</span>
            <span className="text-[11px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--ink-secondary)]">
              Number Puzzle
            </span>
          </div>
          <p className="text-[13px] text-[var(--ink-secondary)] mt-1">
            An elegant, distraction-free mathematical reasoning game.
          </p>
        </div>

        <div className="space-y-3 text-[13px] text-[var(--ink)] leading-relaxed">
          <div className="p-3.5 bg-[var(--paper)] rounded-[14px] border border-[var(--border)]">
            <div className="flex items-center gap-2 font-medium text-[14px] text-[var(--ink)]">
              <Sparkles className="w-4 h-4 text-[var(--ink)]" />
              <span>The Target 1708</span>
            </div>
            <p className="mt-1.5 text-[13px] text-[var(--ink-secondary)]">
              Transform your starting tiles into the target number 1708 using basic operations and power rules before your tokens run out. Every daily puzzle is guaranteed mathematically solvable.
            </p>
          </div>

          <div className="p-3.5 bg-[var(--paper)] rounded-[14px] border border-[var(--border)]">
            <div className="flex items-center gap-2 font-medium text-[14px] text-[var(--ink)]">
              <User className="w-4 h-4 text-[var(--ink)]" />
              <span>Credits & Design</span>
            </div>
            <p className="mt-1.5 text-[13px] text-[var(--ink-secondary)]">
              Crafted and developed by <span className="font-semibold text-[var(--ink)]">Asim Nawaz</span>. Designed with a warm editorial aesthetic inspired by fine typography and tangible tactile ceramics.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenHowToPlay();
            }}
            className="flex-1 h-11 border border-[var(--border)] bg-[var(--paper)] hover:bg-[var(--surface-alt)] text-[var(--ink)] text-[14px] font-medium rounded-[12px] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 stroke-[1.5]" />
            How to Play
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink)]/90 text-[14px] font-medium rounded-[12px] transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
