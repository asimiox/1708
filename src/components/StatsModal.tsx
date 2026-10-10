import React from 'react';
import { X } from 'lucide-react';
import { GameStats } from '../utils/storage';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/35 transition-opacity">
      <div 
        className="relative w-full max-w-[380px] bg-[var(--paper-2)] rounded-[20px] border border-[var(--border)] p-6 text-[var(--ink)] flex flex-col gap-4 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-[12px] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 hover:bg-[var(--paper)] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="pr-8">
          <h2 id="stats-title" className="font-serif text-[24px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight">
            Statistics
          </h2>
        </div>

        {/* 3 Quiet Stats */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
            <div className="font-serif text-[24px] text-[var(--ink)] tabular-nums font-semibold">
              {stats.dailyStreak}
            </div>
            <div className="text-[13px] text-[var(--ink)] opacity-65 mt-0.5">
              Streak
            </div>
          </div>

          <div className="p-3 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
            <div className="font-serif text-[24px] text-[var(--ink)] tabular-nums font-semibold">
              {stats.maxStreak}
            </div>
            <div className="text-[13px] text-[var(--ink)] opacity-65 mt-0.5">
              Max streak
            </div>
          </div>

          <div className="p-3 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
            <div className="font-serif text-[24px] text-[var(--ink)] tabular-nums font-semibold">
              {stats.daysPlayed}
            </div>
            <div className="text-[13px] text-[var(--ink)] opacity-65 mt-0.5">
              Days
            </div>
          </div>
        </div>

        {/* Personal Best Moves */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[13px] text-[var(--ink)] opacity-65 font-medium">
            Best moves
          </p>
          <div className="space-y-1 text-[13px]">
            <div className="flex justify-between items-center py-2 px-3 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
              <span className="text-[var(--ink)] opacity-65">Daily</span>
              <span className="font-medium tabular-nums text-[var(--ink)]">
                {stats.bestMoves['daily'] ? `${stats.bestMoves['daily']} moves` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
              <span className="text-[var(--ink)] opacity-65">Classic</span>
              <span className="font-medium tabular-nums text-[var(--ink)]">
                {stats.bestMoves['classic'] ? `${stats.bestMoves['classic']} moves` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
              <span className="text-[var(--ink)] opacity-65">Founder</span>
              <span className="font-medium tabular-nums text-[var(--ink)]">
                {stats.bestMoves['founder'] ? `${stats.bestMoves['founder']} moves` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
              <span className="text-[var(--ink)] opacity-65">Practice</span>
              <span className="font-medium tabular-nums text-[var(--ink)]">
                {stats.bestMoves['practice'] ? `${stats.bestMoves['practice']} moves` : '—'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] text-[var(--ink)] font-medium rounded-[12px] transition text-[15px] mt-1 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
