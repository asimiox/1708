import React from 'react';
import { RotateCcw, X, ArrowRight, Trophy } from 'lucide-react';
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
  currentLevel?: number;
  isLevelMode?: boolean;
  onNextLevel?: () => void;
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
  currentLevel = 1,
  isLevelMode = false,
  onNextLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity backdrop-blur-xs">
      <div
        className="relative w-full max-w-[380px] bg-[var(--paper-2)] rounded-[20px] border border-[var(--border)] p-6 text-[var(--ink)] flex flex-col gap-4 text-left shadow-2xl"
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
          <div className="flex items-center gap-2 mb-1">
            {isLevelMode && (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--ink)] text-[var(--paper)]">
                <Trophy className="w-3 h-3" /> Level {currentLevel} Complete
              </span>
            )}
          </div>
          <h2
            id="win-headline"
            className="font-serif text-[26px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight"
          >
            {isLevelMode ? `Level ${currentLevel} Solved!` : 'Target 1708 Reached.'}
          </h2>
          <p className="mt-1 text-[14px] text-[var(--ink-secondary)]">
            Completed in <span className="text-[var(--ink)] font-semibold tabular-nums">{movesCount}</span>{' '}
            {movesCount === 1 ? 'move' : 'moves'}.{' '}
            <span>Optimal: <span className="tabular-nums font-medium text-[var(--ink)]">{bestPossible}</span>.</span>
          </p>
        </div>

        {/* Founder route note */}
        {isClassicFounderRoute && (
          <div className="p-3 bg-[var(--paper)] border border-[var(--border)] rounded-[12px] text-left">
            <span className="text-[13px] text-[var(--ink)] font-semibold block">
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
            <div className="text-[12px] font-medium text-[var(--ink-secondary)] pb-1 border-b border-[var(--border)]">
              Sequence ({history.length} {history.length === 1 ? 'step' : 'steps'})
            </div>
            {history.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between tabular-nums text-[var(--ink-secondary)]"
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

        {/* Action Buttons: Next Level, Replay */}
        <div className="space-y-2 pt-1">
          {isLevelMode && onNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full h-11 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 active:opacity-80 font-medium rounded-[12px] flex items-center justify-center gap-2 transition text-[15px] cursor-pointer shadow-xs"
            >
              <span>Next Level (Level {currentLevel + 1})</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          ) : onNewPuzzle ? (
            <button
              onClick={onNewPuzzle}
              className="w-full h-11 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 active:opacity-80 font-medium rounded-[12px] flex items-center justify-center transition text-[15px] cursor-pointer shadow-xs"
            >
              New Puzzle
            </button>
          ) : null}

          <button
            onClick={onPlayAgain}
            className="w-full h-11 border border-[var(--border)] bg-[var(--paper)] hover:bg-[var(--surface-alt)] text-[var(--ink)] font-medium rounded-[12px] flex items-center justify-center gap-1.5 transition text-[14px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.5]" />
            {isLevelMode ? `Replay Level ${currentLevel}` : 'Replay'}
          </button>
        </div>

        <div className="text-[12px] text-[var(--ink-secondary)] opacity-60 text-center pt-0.5 select-none">
          1708 · By Asim Nawaz
        </div>
      </div>
    </div>
  );
};
