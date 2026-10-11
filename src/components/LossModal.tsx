import React from 'react';
import { RotateCcw, X } from 'lucide-react';

interface LossModalProps {
  isOpen: boolean;
  onClose: () => void;
  movesCount: number;
  bestPossible: number;
  onRestart: () => void;
  onNewPuzzle?: () => void;
}

export const LossModal: React.FC<LossModalProps> = ({
  isOpen,
  onClose,
  movesCount,
  bestPossible,
  onRestart,
  onNewPuzzle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/35 transition-opacity">
      <div
        className="relative w-full max-w-[380px] bg-[var(--paper-2)] rounded-[20px] border border-[var(--border)] p-6 text-[var(--ink)] flex flex-col gap-4 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loss-headline"
      >
        {/* Close [x] button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-[12px] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 hover:bg-[var(--paper)] transition cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="pr-8">
          <h2
            id="loss-headline"
            className="font-serif text-[24px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight"
          >
            No legal moves left.
          </h2>
          <p className="mt-1 text-[15px] text-[var(--ink)] opacity-65">
            Moves taken: <span className="tabular-nums font-medium text-[var(--ink)]">{movesCount}</span>.{' '}
            <span>Best possible: <span className="tabular-nums">{bestPossible}</span>.</span>
          </p>
        </div>

        {/* Action Buttons: Only "New Puzzle", "Replay" */}
        <div className="space-y-2 pt-1">
          {onNewPuzzle && (
            <button
              onClick={onNewPuzzle}
              className="w-full h-11 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink)]/90 active:bg-[var(--ink)]/80 font-medium rounded-[12px] flex items-center justify-center transition text-[15px] cursor-pointer shadow-xs"
            >
              New Puzzle
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full h-11 border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] text-[var(--ink)] font-medium rounded-[12px] flex items-center justify-center gap-1.5 transition text-[15px] cursor-pointer shadow-[0_1px_2px_rgba(30,24,19,0.05)]"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.5]" />
            Replay
          </button>
        </div>

        <div className="text-[13px] text-[var(--ink)] opacity-65 pt-1">
          Developed by Asim Nawaz
        </div>
      </div>
    </div>
  );
};
