import React, { useState } from 'react';
import { RotateCcw, X, ArrowRight, Share2, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { Move } from '../types/game';
import { shareVictory, createVictorySnapshot } from '../utils/snapshot';
import { CubeLogo1708 } from './CubeLogo1708';

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
  nextLevel?: number;
  isLevelMode?: boolean;
  onNextLevel?: () => void;
  mode?: string;
  darkMode?: boolean;
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
  nextLevel = currentLevel + 1,
  isLevelMode = true,
  onNextLevel,
  mode = 'level',
  darkMode,
}) => {
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const outcome = await shareVictory({
        level: currentLevel,
        mode,
        movesCount,
        bestPossible,
        history,
        isClassicFounderRoute,
      });

      if (outcome === 'shared') {
        setShareFeedback('Shared successfully!');
      } else {
        setShareFeedback('Snapshot saved & link copied!');
      }

      setTimeout(() => {
        setShareFeedback(null);
      }, 3500);
    } catch {
      setShareFeedback('Snapshot generated');
      setTimeout(() => setShareFeedback(null), 3000);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePreviewSnapshot = async () => {
    try {
      if (previewUrl) {
        setPreviewUrl(null);
        return;
      }
      const { dataUrl } = await createVictorySnapshot({
        level: currentLevel,
        mode,
        movesCount,
        bestPossible,
        history,
        isClassicFounderRoute,
      });
      setPreviewUrl(dataUrl);
    } catch {
      // ignore
    }
  };

  const isOptimal = movesCount <= bestPossible;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs transition-opacity animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-headline"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[420px] max-h-[92vh] overflow-y-auto bg-[var(--paper-2)] rounded-[24px] border border-[var(--border)] p-5 sm:p-6 text-[var(--ink)] flex flex-col gap-3.5 text-left shadow-2xl"
      >
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-[var(--ink)]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Bar: 3D Cubes Logo on left, Close [X] on right */}
        <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]/70">
          <CubeLogo1708 isWon size="sm" darkMode={darkMode} />
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Header Celebration */}
        <div className="flex flex-col gap-1 pr-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--ink)] text-[var(--paper)] shadow-2xs">
              <Sparkles className="w-3 h-3 fill-current" />
              {isLevelMode ? `Level ${currentLevel} Passed` : '1708 Solved'}
            </span>
            {isOptimal && (
              <span className="text-[11px] font-medium text-[var(--ink-secondary)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                ★ Optimal
              </span>
            )}
          </div>

          <h2
            id="win-headline"
            className="font-serif text-[30px] sm:text-[34px] font-bold tracking-tight text-[var(--ink)] leading-none mt-1"
          >
            {isLevelMode ? `Level ${currentLevel}` : '1708'}
          </h2>

          <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">
            Solved in <span className="text-[var(--ink)] font-semibold tabular-nums">{movesCount}</span> moves · Best possible is{' '}
            <span className="text-[var(--ink)] font-medium tabular-nums">{bestPossible}</span>
          </p>
        </div>

        {/* Founder route achievement */}
        {isClassicFounderRoute && (
          <div className="p-3 bg-[var(--paper)] border border-[var(--border)] rounded-[14px] text-left">
            <span className="text-[12px] text-[var(--ink)] font-semibold block">
              The Founder Route
            </span>
            <p className="text-[12px] text-[var(--ink-secondary)] mt-0.5 leading-relaxed">
              You discovered the founder's classic route. Respect from Asim Nawaz.
            </p>
          </div>
        )}

        {/* Math Steps Sequence */}
        {history.length > 0 && (
          <div className="bg-[var(--paper)] p-3 rounded-[14px] border border-[var(--border)] text-[12px]">
            <div className="flex items-center justify-between font-medium text-[var(--ink-secondary)] pb-1.5 border-b border-[var(--border)]">
              <span>Solution Sequence ({history.length} {history.length === 1 ? 'move' : 'moves'})</span>
              <span className="text-[11px] opacity-75">Target: 1708</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 pt-1.5 pr-0.5">
              {history.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between tabular-nums text-[var(--ink-secondary)] text-[12px]"
                >
                  <span>
                    <span className="opacity-60 mr-1.5">{idx + 1}.</span>
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
                  <span className="text-[var(--ink)] font-semibold">= {m.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share feedback toast */}
        {shareFeedback && (
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-[12px] font-medium text-[var(--ink)] animate-fadeIn">
            <Check className="w-3.5 h-3.5 stroke-[2]" />
            <span>{shareFeedback}</span>
          </div>
        )}

        {/* Image Snapshot Preview */}
        {previewUrl && (
          <div className="p-2.5 bg-[var(--paper)] border border-[var(--border)] rounded-[14px] flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px] text-[var(--ink-secondary)]">
              <span className="font-medium">1708 Victory Snapshot Card</span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="hover:text-[var(--ink)] cursor-pointer text-[11px] underline"
              >
                Hide
              </button>
            </div>
            <img
              src={previewUrl}
              alt="1708 Victory Snapshot"
              className="w-full rounded-lg border border-[var(--border)] shadow-sm max-h-48 object-contain bg-black"
            />
          </div>
        )}

        {/* User-requested Actions:
            1. "Level 'x'" (where x is next level)
            2. "Play Again"
            3. "Share" (with 1708 branding snapshot)
            4. "Close" option to close modal
        */}
        <div className="flex flex-col gap-2 pt-1">
          {/* 1. Next Level Primary Button */}
          {isLevelMode && onNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full h-11 sm:h-12 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 active:opacity-80 font-semibold rounded-[14px] flex items-center justify-center gap-2 transition text-[15px] cursor-pointer shadow-xs"
            >
              <span>Level {nextLevel}</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          ) : onNewPuzzle ? (
            <button
              onClick={onNewPuzzle}
              className="w-full h-11 sm:h-12 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 active:opacity-80 font-semibold rounded-[14px] flex items-center justify-center transition text-[15px] cursor-pointer shadow-xs"
            >
              New Puzzle
            </button>
          ) : null}

          {/* 2 & 3. "Play Again" and "Share" */}
          <div className="grid grid-cols-2 gap-2">
            {/* Play Again */}
            <button
              onClick={onPlayAgain}
              className="h-11 border border-[var(--border)] bg-[var(--paper)] hover:bg-[var(--surface-alt)] text-[var(--ink)] font-medium rounded-[14px] flex items-center justify-center gap-2 transition text-[14px] cursor-pointer"
              title="Play this level again"
            >
              <RotateCcw className="w-4 h-4 stroke-[1.75]" />
              <span>Play Again</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="h-11 border border-[var(--border)] bg-[var(--paper)] hover:bg-[var(--surface-alt)] text-[var(--ink)] font-medium rounded-[14px] flex items-center justify-center gap-2 transition text-[14px] cursor-pointer"
              title="Share victory snapshot with 1708 branding"
            >
              <Share2 className="w-4 h-4 stroke-[1.75]" />
              <span>{isSharing ? 'Sharing...' : 'Share'}</span>
            </button>
          </div>

          {/* Preview Snapshot & Close & View Board */}
          <div className="flex items-center justify-between pt-1 px-1 text-[12px]">
            <button
              onClick={handlePreviewSnapshot}
              className="inline-flex items-center gap-1 text-[var(--ink-secondary)] hover:text-[var(--ink)] transition cursor-pointer underline underline-offset-2"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{previewUrl ? 'Hide snapshot card' : 'Preview snapshot card'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-[var(--ink)] font-medium hover:underline cursor-pointer"
            >
              Close & View Board
            </button>
          </div>
        </div>

        {/* Minimal branding */}
        <div className="text-[11px] text-[var(--ink-secondary)] opacity-60 text-center select-none pt-0.5">
          1708 · By Asim Nawaz
        </div>
      </div>
    </div>
  );
};
