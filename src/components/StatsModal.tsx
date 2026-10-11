import React from 'react';
import { X, Trophy, Flame, Target, Play } from 'lucide-react';
import { GameStats } from '../utils/storage';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity backdrop-blur-xs">
      <div 
        className="relative w-full max-w-[400px] bg-[var(--paper-2)] rounded-[22px] border border-[var(--border)] p-5 sm:p-6 text-[var(--ink)] flex flex-col gap-4 text-left shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-[12px] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 hover:bg-[var(--paper)] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="pr-8">
          <h2 id="stats-title" className="font-serif text-[22px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight">
            Detailed Statistics
          </h2>
          <p className="text-[12px] text-[var(--ink-secondary)] mt-0.5">
            Real-time gameplay records & level progression
          </p>
        </div>

        {/* Level Progression Card */}
        <div className="p-3.5 bg-[var(--paper)] rounded-[14px] border border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center">
              <Trophy className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-[var(--ink)] leading-tight">
                Level {stats.currentLevel}
              </div>
              <div className="text-[11px] text-[var(--ink-secondary)]">
                {stats.maxLevelCompleted} levels completed
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--ink-secondary)] font-medium">
              Permanent
            </span>
          </div>
        </div>

        {/* 4 Core Real-Time Metrics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
            <div className="font-serif text-lg text-[var(--ink)] tabular-nums font-bold">
              {stats.totalGames}
            </div>
            <div className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-wider mt-0.5">
              Played
            </div>
          </div>

          <div className="p-2.5 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
            <div className="font-serif text-lg text-[var(--ink)] tabular-nums font-bold">
              {stats.totalWins}
            </div>
            <div className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-wider mt-0.5">
              Won
            </div>
          </div>

          <div className="p-2.5 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
            <div className="font-serif text-lg text-[var(--ink)] tabular-nums font-bold">
              {winRate}%
            </div>
            <div className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-wider mt-0.5">
              Win Rate
            </div>
          </div>

          <div className="p-2.5 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
            <div className="font-serif text-lg text-[var(--ink)] tabular-nums font-bold">
              {stats.dailyStreak}
            </div>
            <div className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-wider mt-0.5">
              Streak
            </div>
          </div>
        </div>

        {/* Secondary Details: Streaks & Moves */}
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="p-2.5 bg-[var(--paper)] rounded-[12px] border border-[var(--border)] flex items-center justify-between">
            <span className="text-[var(--ink-secondary)]">Max Streak</span>
            <span className="font-semibold text-[var(--ink)] tabular-nums">{stats.maxStreak} days</span>
          </div>
          <div className="p-2.5 bg-[var(--paper)] rounded-[12px] border border-[var(--border)] flex items-center justify-between">
            <span className="text-[var(--ink-secondary)]">Total Moves</span>
            <span className="font-semibold text-[var(--ink)] tabular-nums">{stats.totalMoves}</span>
          </div>
        </div>

        {/* Personal Best Moves by Mode */}
        <div className="space-y-1.5 pt-0.5">
          <p className="text-[12px] text-[var(--ink-secondary)] font-medium">
            Best moves per mode
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[12px]">
            <div className="flex justify-between items-center py-1.5 px-2.5 bg-[var(--paper)] rounded-[10px] border border-[var(--border)]">
              <span className="text-[var(--ink-secondary)]">Daily</span>
              <span className="font-semibold tabular-nums text-[var(--ink)]">
                {stats.bestMoves['daily'] ? `${stats.bestMoves['daily']} moves` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2.5 bg-[var(--paper)] rounded-[10px] border border-[var(--border)]">
              <span className="text-[var(--ink-secondary)]">Classic</span>
              <span className="font-semibold tabular-nums text-[var(--ink)]">
                {stats.bestMoves['classic'] ? `${stats.bestMoves['classic']} moves` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2.5 bg-[var(--paper)] rounded-[10px] border border-[var(--border)]">
              <span className="text-[var(--ink-secondary)]">Founder</span>
              <span className="font-semibold tabular-nums text-[var(--ink)]">
                {stats.bestMoves['founder'] ? `${stats.bestMoves['founder']} moves` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2.5 bg-[var(--paper)] rounded-[10px] border border-[var(--border)]">
              <span className="text-[var(--ink-secondary)]">Practice</span>
              <span className="font-semibold tabular-nums text-[var(--ink)]">
                {stats.bestMoves['practice'] ? `${stats.bestMoves['practice']} moves` : '—'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 bg-[var(--ink)] text-[var(--paper)] font-medium rounded-[12px] transition text-[14px] mt-1 cursor-pointer hover:opacity-90 active:opacity-80"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
};
