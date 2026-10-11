import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import { Move } from '../types/game';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  movesCount: number;
  bestPossible: number;
  isClassicFounderRoute: boolean;
  history: Move[];
  onPlayAgain: () => void;
  onNewPuzzle?: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  onClose,
  movesCount,
  bestPossible,
  isClassicFounderRoute,
  history,
  onPlayAgain,
  onNewPuzzle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/35 transition-opacity">
      <div
        className="relative w-full max-w-[380px] bg-[var(--paper-2)] rounded-[20px] border border-[var(--border)] p-6 text-[var(--ink)] flex flex-col gap-4 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="win-headline"
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
            id="win-headline"
            className="font-serif text-[24px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight"
          >
            Solved.
          </h2>
          <p className="mt-1 text-[15px] text-[var(--ink)] opacity-65">
            Solved in <span className="text-[var(--ink)] font-semibold tabular-nums">{movesCount}</span>{' '}
            {movesCount === 1 ? 'move' : 'moves'}.{' '}
            <span>Best possible: <span className="tabular-nums">{bestPossible}</span>.</span>
          </p>
        </div>

        {/* Founder route note */}
        {isClassicFounderRoute && (
          <div className="p-3 bg-[var(--paper)] border border-[var(--border)] rounded-[12px] text-left">
            <span className="text-[13px] text-[var(--accent)] font-medium block">
              The founder route
            </span>
            <p className="text-[13px] text-[var(--ink)] opacity-65 mt-0.5 leading-relaxed">
              You found the founder's route. Respect from Asim Nawaz.
            </p>
          </div>
        )}

        {/* Moves sequence */}
        {history.length > 0 && (
          <div className="text-left bg-[var(--paper)] p-3 rounded-[12px] border border-[var(--border)] max-h-32 overflow-y-auto space-y-1 text-[13px]">
            <div className="text-[13px] font-medium text-[var(--ink)] opacity-65 pb-1 border-b border-[var(--border)]">
              Sequence ({history.length} {history.length === 1 ? 'step' : 'steps'})
            </div>
            {history.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between tabular-nums text-[var(--ink)] opacity-65"
              >
                <span>
                  {idx + 1}.{' '}
                  {m.op === 'SQ'
                    ? `${m.inputs[0]}²`
                    : m.op === 'POW'
                    ? `${m.inputs[0]}^${m.inputs[0]}`
                    : m.op === 'ADD'
                    ? `${m.inputs[0]} + ${m.inputs[1]}`
                    : m.op === 'SUB'
                    ? `|${m.inputs[0]} - ${m.inputs[1]}|`
                    : `${m.inputs[0]} × ${m.inputs[1]}`}
                </span>
                <span className="text-[var(--ink)] font-medium">= {m.result}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons: Only "New Puzzle", "Replay" */}
        <div className="space-y-2 pt-1">
          {onNewPuzzle && (
            <button
              onClick={onNewPuzzle}
              className="w-full h-11 bg-[var(--accent)] text-[var(--paper-2)] hover:opacity-95 font-medium rounded-[12px] flex items-center justify-center transition text-[15px] cursor-pointer shadow-[0_2px_4px_rgba(184,86,43,0.22)]"
            >
              New Puzzle
            </button>
          )}

          <button
            onClick={onPlayAgain}
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
