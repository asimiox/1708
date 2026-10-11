import React from 'react';
import {
  X,
  HelpCircle,
  Trophy,
  Volume2,
  VolumeX,
  ShieldCheck,
  Moon,
  Sun,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { GameStats } from '../utils/storage';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onOpenSelfTest: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentMode: string;
  onSelectMode: (mode: 'level' | 'daily' | 'classic' | 'founder' | 'practice') => void;
  dailyNumber: number;
  stats: GameStats;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenHowToPlay,
  onOpenStats,
  onOpenSelfTest,
  soundEnabled,
  onToggleSound,
  darkMode,
  onToggleDarkMode,
  currentMode,
  onSelectMode,
  dailyNumber,
  stats,
}) => {
  if (!isOpen) return null;

  const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Card */}
      <div className="relative w-full max-w-[340px] h-full bg-[var(--paper-2)] text-[var(--ink)] shadow-2xl flex flex-col justify-between p-6 z-10 border-l border-[var(--border)] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-serif font-bold text-sm">
                17
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl leading-none text-[var(--ink)]">1708</h2>
                <p className="text-xs text-[var(--ink-secondary)] mt-0.5">By Asim Nawaz</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink)] opacity-60 hover:opacity-100 hover:bg-[var(--border-subtle)] transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Real-time Detailed Stats Banner */}
          <div className="bg-[var(--paper)] p-3 rounded-xl border border-[var(--border)] grid grid-cols-4 gap-1 text-center select-none shadow-2xs">
            <div className="px-0.5">
              <div className="text-base sm:text-lg font-serif font-bold text-[var(--ink)] tabular-nums">
                L{stats.currentLevel}
              </div>
              <div className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-wider">Level</div>
            </div>
            <div className="border-l border-[var(--border)] px-0.5">
              <div className="text-base sm:text-lg font-serif font-semibold text-[var(--ink)] tabular-nums">{stats.totalGames}</div>
              <div className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-wider">Played</div>
            </div>
            <div className="border-l border-[var(--border)] px-0.5">
              <div className="text-base sm:text-lg font-serif font-semibold text-[var(--ink)] tabular-nums">{stats.dailyStreak}</div>
              <div className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-wider">Streak</div>
            </div>
            <div className="border-l border-[var(--border)] px-0.5">
              <div className="text-base sm:text-lg font-serif font-semibold text-[var(--ink)] tabular-nums">
                {winRate}%
              </div>
              <div className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-wider">Win Rate</div>
            </div>
          </div>

          {/* Game Modes */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)] px-1">
              Game Modes
            </div>
            <div className="space-y-1">
              {/* Level Progression Mode (Primary) */}
              <button
                onClick={() => {
                  onSelectMode('level');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                  currentMode === 'level'
                    ? 'bg-[var(--ink)] text-[var(--paper)] font-medium shadow-2xs'
                    : 'hover:bg-[var(--surface-alt)] text-[var(--ink)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 stroke-[1.75]" />
                  <span>Level {stats.currentLevel}</span>
                </div>
                <span className="text-xs opacity-75 tabular-nums">
                  {stats.maxLevelCompleted} solved
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectMode('daily');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                  currentMode === 'daily'
                    ? 'bg-[var(--ink)] text-[var(--paper)] font-medium shadow-sm'
                    : 'hover:bg-[var(--surface-alt)] text-[var(--ink)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 stroke-[1.5]" />
                  <span>Daily #{dailyNumber}</span>
                </div>
                <span className="text-xs opacity-75">Daily challenge</span>
              </button>

              <button
                onClick={() => {
                  onSelectMode('classic');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                  currentMode === 'classic'
                    ? 'bg-[var(--ink)] text-[var(--paper)] font-medium shadow-sm'
                    : 'hover:bg-[var(--surface-alt)] text-[var(--ink)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 stroke-[1.5]" />
                  <span>Classic</span>
                </div>
                <span className="text-xs opacity-75">Unlimited</span>
              </button>

              <button
                onClick={() => {
                  onSelectMode('founder');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                  currentMode === 'founder'
                    ? 'bg-[var(--ink)] text-[var(--paper)] font-medium shadow-sm'
                    : 'hover:bg-[var(--surface-alt)] text-[var(--ink)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 stroke-[1.5]" />
                  <span>Founder</span>
                </div>
                <span className="text-xs opacity-75">7×244 blocked</span>
              </button>

              <button
                onClick={() => {
                  onSelectMode('practice');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                  currentMode === 'practice'
                    ? 'bg-[var(--ink)] text-[var(--paper)] font-medium shadow-sm'
                    : 'hover:bg-[var(--surface-alt)] text-[var(--ink)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 stroke-[1.5]" />
                  <span>Practice</span>
                </div>
                <span className="text-xs opacity-75">Warm up</span>
              </button>
            </div>
          </div>

          {/* Actions & Settings */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)] px-1">
              Menu & Tools
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenHowToPlay();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--paper)] text-[var(--ink)] transition text-left cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 stroke-[1.5] text-[var(--ink-secondary)]" />
                <span>How to Play</span>
              </button>

              <button
                onClick={() => {
                  onOpenStats();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--paper)] text-[var(--ink)] transition text-left cursor-pointer"
              >
                <Trophy className="w-4 h-4 stroke-[1.5] text-[var(--ink-secondary)]" />
                <span>Game Statistics</span>
              </button>

              <button
                onClick={onToggleSound}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--paper)] text-[var(--ink)] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 stroke-[1.5] text-[var(--ink-secondary)]" />
                  ) : (
                    <VolumeX className="w-4 h-4 stroke-[1.5] text-[var(--ink-secondary)]" />
                  )}
                  <span>Sound Effects</span>
                </div>
                <span className="text-xs text-[var(--ink-secondary)]">{soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={onToggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--paper)] text-[var(--ink)] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Sun className="w-4 h-4 stroke-[1.5] text-[var(--ink-secondary)]" />
                  ) : (
                    <Moon className="w-4 h-4 stroke-[1.5] text-[var(--ink-secondary)]" />
                  )}
                  <span>Appearance</span>
                </div>
                <span className="text-xs text-[var(--ink-secondary)]">{darkMode ? 'Dark' : 'Light'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenSelfTest();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--paper)] text-[var(--ink)] transition text-left cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 stroke-[1.5] text-[var(--ink-secondary)]" />
                <span>Self-Test Verification</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--ink-secondary)] space-y-1">
          <p className="font-serif font-medium text-sm text-[var(--ink)]">1708 Daily Number Puzzle</p>
          <p>Created & Developed by Asim Nawaz</p>
        </div>
      </div>
    </div>
  );
};
