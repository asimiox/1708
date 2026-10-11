import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Home,
  BookOpen,
  Info,
  Sun,
  Moon,
  SlidersHorizontal,
  Lightbulb,
  LayoutGrid,
  RotateCcw,
  Play,
  Menu,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { OpType, Tokens, Move } from './types/game';
import { validateMove, TARGET, isFounderMove, hasLegalMove } from './utils/solver';
import { getTokenAvailability, getTileAvailability } from './utils/availability';
import {
  generateLevelPuzzle,
  generateDailyPuzzle,
  generateClassicPuzzle,
  generateFounderPuzzle,
  generatePracticePuzzle,
  getDailyNumber,
  GeneratedPuzzle,
} from './utils/generator';
import {
  loadGameStats,
  recordGameStart,
  recordMoveMade,
  recordWin,
  recordLoss,
  GameStats,
} from './utils/storage';
import { runAllSelfTests, SelfTestReport } from './utils/tests';
import { sounds } from './utils/audio';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AboutModal } from './components/AboutModal';
import { StatsModal } from './components/StatsModal';
import { WinModal } from './components/WinModal';
import { LossModal } from './components/LossModal';
import { SelfTestModal } from './components/SelfTestModal';
import { ConfirmNewPuzzleModal } from './components/ConfirmNewPuzzleModal';
import { MenuDrawer } from './components/MenuDrawer';
import { CubeLogo1708 } from './components/CubeLogo1708';

type Mode = 'level' | 'daily' | 'classic' | 'founder' | 'practice';

interface HistoryState {
  tiles: number[];
  tokens: Tokens;
  move: Move;
}

export default function App() {
  // Theme & Sound state (Default: DARK THEME)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved !== null) {
        return saved === 'dark';
      }
      return true; // Dark mode default as requested
    }
    return true;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.enabled);

  // Sync dark class to html document and storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      sounds.enabled = next;
      return next;
    });
  }, []);

  // Active Mode (Default: Level progression mode, never resets)
  const [mode, setMode] = useState<Mode>('level');
  const [stats, setStats] = useState<GameStats>(() => loadGameStats());
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  // Puzzles state
  const [currentPuzzle, setCurrentPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [tiles, setTiles] = useState<number[]>([]);
  const [tokens, setTokens] = useState<Tokens>({ ADD: 0, SUB: 0, MUL: 0, SQ: 0, POW: 0 });

  // Selection state
  const [selectedOp, setSelectedOp] = useState<OpType | null>(null);
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newTileIndex, setNewTileIndex] = useState<number | null>(null);

  // Game lifecycle
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLost, setIsLost] = useState<boolean>(false);
  const [isResultDismissed, setIsResultDismissed] = useState<boolean>(false);
  const [winningMove, setWinningMove] = useState<Move | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Modals state
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSelfTestOpen, setIsSelfTestOpen] = useState<boolean>(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  const [isConfirmNewPuzzleOpen, setIsConfirmNewPuzzleOpen] = useState<boolean>(false);
  const [testReport, setTestReport] = useState<SelfTestReport>(() => runAllSelfTests());

  const dailyNumber = useMemo(() => getDailyNumber(new Date()), []);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger feedback toast
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Check win or loss conditions
  const checkGameState = useCallback(
    (
      currentTiles: number[],
      currentTokens: Tokens,
      currentMode: string
    ): { won: boolean; lost: boolean; message: string | null } => {
      if (currentTiles.includes(TARGET)) {
        return { won: true, lost: false, message: null };
      }
      const totalTokens = (Object.values(currentTokens) as number[]).reduce((sum, n) => sum + n, 0);
      if (totalTokens === 0) {
        return { won: false, lost: true, message: 'All tokens used' };
      }
      if (!hasLegalMove(currentTiles, currentTokens, currentMode)) {
        return { won: false, lost: true, message: 'No legal moves left.' };
      }
      return { won: false, lost: false, message: null };
    },
    []
  );

  // Clear entire selection
  const clearSelection = useCallback(() => {
    sounds.tap();
    setSelectedOp(null);
    setSelectedTileIndices([]);
    setToastMessage(null);
  }, []);

  // Initialize a puzzle by mode (level, daily, classic, founder, practice)
  const initPuzzle = useCallback(
    (m: Mode, targetLevel?: number) => {
      let p: GeneratedPuzzle;
      if (m === 'level') {
        const lvl = targetLevel ?? stats.currentLevel;
        p = generateLevelPuzzle(lvl);
      } else if (m === 'daily') {
        p = generateDailyPuzzle(new Date());
      } else if (m === 'founder') {
        p = generateFounderPuzzle();
      } else if (m === 'classic') {
        p = generateClassicPuzzle();
      } else {
        p = generatePracticePuzzle();
      }

      setCurrentPuzzle(p);
      setTiles(p.tiles);
      setTokens(p.tokens);
      setSelectedOp(null);
      setSelectedTileIndices([]);
      setHistory([]);
      setIsWon(false);
      setIsLost(false);
      setIsResultDismissed(false);
      setWinningMove(null);
      setNewTileIndex(null);
      setToastMessage(null);
      setShowHint(false);
      setIsGameStarted(false);
    },
    [stats.currentLevel]
  );

  // Advance to next level after victory
  const handleNextLevel = useCallback(() => {
    setIsResultDismissed(true);
    initPuzzle('level', stats.currentLevel);
  }, [initPuzzle, stats.currentLevel]);

  // Re-generate or initialize on mode change
  useEffect(() => {
    initPuzzle(mode);
  }, [mode, initPuzzle]);

  // Restart puzzle
  const handleRestart = useCallback(() => {
    if (!currentPuzzle) return;
    sounds.tap();
    setTiles(currentPuzzle.tiles);
    setTokens(currentPuzzle.tokens);
    setSelectedOp(null);
    setSelectedTileIndices([]);
    setHistory([]);
    setIsWon(false);
    setIsLost(false);
    setIsResultDismissed(false);
    setWinningMove(null);
    setNewTileIndex(null);
    setToastMessage(null);
  }, [currentPuzzle]);

  const handleNewPuzzleRequest = useCallback(() => {
    if (mode === 'level' && isWon) {
      handleNextLevel();
      return;
    }
    if (history.length > 0 && !isWon && !isLost) {
      setIsConfirmNewPuzzleOpen(true);
    } else {
      initPuzzle(mode);
    }
  }, [mode, isWon, isLost, history.length, handleNextLevel, initPuzzle]);

  const startNewPuzzle = useCallback(() => {
    setIsConfirmNewPuzzleOpen(false);
    initPuzzle(mode);
  }, [initPuzzle, mode]);

  // Execute a valid move with real-time stats tracking
  const executeMove = useCallback(
    (op: OpType, inputs: number[], inputIndices: number[]) => {
      const validation = validateMove(op, inputs, mode === 'founder');
      if (!validation.valid) {
        showToast(validation.reason || 'Invalid move');
        sounds.error();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(50);
          } catch {
            // ignore
          }
        }
        return;
      }

      const res = validation.result!;
      const move: Move = { op, inputs, result: res };

      // Real-time stats: Track game initiation on first move
      if (!isGameStarted) {
        setIsGameStarted(true);
        const startedStats = recordGameStart();
        setStats(startedStats);
      }
      // Real-time stats: Increment moves
      const movedStats = recordMoveMade();
      setStats(movedStats);

      // Save state before move
      setHistory(prev => [...prev, { tiles: [...tiles], tokens: { ...tokens }, move }]);

      // Calculate next tokens
      const nextTokens = { ...tokens, [op]: tokens[op] - 1 };

      // Calculate next tiles
      const remainingTiles = tiles.filter((_, idx) => !inputIndices.includes(idx));
      const nextTiles = [...remainingTiles, res];
      const insertedIndex = nextTiles.length - 1;

      setTokens(nextTokens);
      setTiles(nextTiles);
      setSelectedOp(null);
      setSelectedTileIndices([]);
      setNewTileIndex(insertedIndex);
      setTimeout(() => setNewTileIndex(null), 800);

      const stateCheck = checkGameState(nextTiles, nextTokens, mode);
      if (stateCheck.won) {
        sounds.win();
        setIsWon(true);
        setIsLost(false);
        setIsResultDismissed(false);
        setWinningMove(move);
        // Real-time stats: Record win and advance Level
        const { stats: updated } = recordWin(mode, stats.currentLevel, history.length + 1);
        setStats(updated);
      } else if (stateCheck.lost) {
        sounds.error();
        setIsLost(true);
        setIsWon(false);
        setIsResultDismissed(false);
        // Real-time stats: Record loss
        const updated = recordLoss();
        setStats(updated);
        showToast(stateCheck.message || 'No legal moves left.');
      } else {
        sounds.combine();
        setIsWon(false);
        setIsLost(false);
      }
    },
    [mode, tiles, tokens, history.length, checkGameState, showToast, isGameStarted, stats.currentLevel]
  );

  // Tile click handler
  const handleTileClick = (index: number) => {
    if (isLost || isWon) return;

    if (selectedTileIndices.includes(index)) {
      sounds.tap();
      setSelectedTileIndices(prev => prev.filter(i => i !== index));
      setToastMessage(null);
      return;
    }

    const availability = getTileAvailability(index, tiles, tokens, selectedOp, selectedTileIndices, mode);
    if (!availability.available) {
      showToast(availability.reason || 'Tile cannot be used right now');
      sounds.error();
      return;
    }

    sounds.tap();
    setToastMessage(null);
    const nextSelection = [...selectedTileIndices, index];

    if (selectedOp === 'SQ' || selectedOp === 'POW') {
      executeMove(selectedOp, [tiles[index]], [index]);
      return;
    }

    if (selectedOp) {
      if (nextSelection.length === 2) {
        const [idx1, idx2] = nextSelection;
        executeMove(selectedOp, [tiles[idx1], tiles[idx2]], [idx1, idx2]);
        return;
      }
      setSelectedTileIndices(nextSelection);
      return;
    }

    if (nextSelection.length <= 2) {
      setSelectedTileIndices(nextSelection);
    }
  };

  // Token click handler
  const handleOpClick = (op: OpType) => {
    if (isLost || isWon) return;

    if (selectedOp === op) {
      sounds.tap();
      setSelectedOp(null);
      setToastMessage(null);
      return;
    }

    const availability = getTokenAvailability(op, tiles, tokens, selectedTileIndices, mode);
    if (!availability.available) {
      showToast(availability.reason || 'Token cannot be used right now');
      sounds.error();
      return;
    }

    sounds.tap();
    setToastMessage(null);

    if (op === 'SQ' || op === 'POW') {
      if (selectedTileIndices.length === 1) {
        const idx = selectedTileIndices[0];
        executeMove(op, [tiles[idx]], [idx]);
        return;
      }
      setSelectedOp(op);
      return;
    }

    if (selectedTileIndices.length === 2) {
      const [idx1, idx2] = selectedTileIndices;
      executeMove(op, [tiles[idx1], tiles[idx2]], [idx1, idx2]);
      return;
    }

    setSelectedOp(op);
  };

  const totalTokensLeft = useMemo(() => {
    return (Object.values(tokens) as number[]).reduce((sum, n) => sum + n, 0);
  }, [tokens]);

  const isClassicFounderRoute = useMemo(() => {
    if (!isWon || mode !== 'classic') return false;
    return history.some(h => isFounderMove(h.move));
  }, [isWon, mode, history]);

  // Preview next action
  const previewInfo = useMemo(() => {
    if (!selectedOp && selectedTileIndices.length === 0) return null;

    if (selectedOp === 'SQ' && selectedTileIndices.length === 1) {
      const val = tiles[selectedTileIndices[0]];
      return `${val}² = ${val * val}`;
    }
    if (selectedOp === 'POW' && selectedTileIndices.length === 1) {
      const val = tiles[selectedTileIndices[0]];
      return `${val}^${val} = ${Math.pow(val, val)}`;
    }
    if (selectedOp && selectedTileIndices.length === 2) {
      const a = tiles[selectedTileIndices[0]];
      const b = tiles[selectedTileIndices[1]];
      if (selectedOp === 'ADD') return `${a} + ${b} = ${a + b}`;
      if (selectedOp === 'SUB') return `|${a} - ${b}| = ${Math.abs(a - b)}`;
      if (selectedOp === 'MUL') return `${a} × ${b} = ${a * b}`;
    }
    return null;
  }, [selectedOp, selectedTileIndices, tiles]);

  // Live status or instruction string
  const hintText = useMemo(() => {
    if (toastMessage) return toastMessage;
    if (isWon) return 'Puzzle solved! 1708 reached.';
    if (isLost) return 'No legal moves left. Restart to try again.';
    if (previewInfo) return previewInfo;

    if (!selectedOp) {
      if (selectedTileIndices.length === 0) {
        return 'Choose a tile or a token to start';
      }
      if (selectedTileIndices.length === 1) {
        return 'Pick a token or 1 more tile.';
      }
      if (selectedTileIndices.length === 2) {
        return 'Pick an operation token (+, −, ×).';
      }
    } else {
      if (selectedOp === 'SQ' || selectedOp === 'POW') {
        if (selectedTileIndices.length === 0) {
          return selectedOp === 'SQ' ? 'Pick 1 tile to square.' : 'Pick 1 tile (2 to 5) for power.';
        }
      } else {
        if (selectedTileIndices.length === 0) {
          return `Pick 2 tiles to ${selectedOp.toLowerCase()}.`;
        }
        if (selectedTileIndices.length === 1) {
          return 'Pick 1 more tile.';
        }
      }
    }
    return 'Choose a tile or a token to start';
  }, [toastMessage, previewInfo, isWon, isLost, selectedOp, selectedTileIndices]);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--ink)] selection:text-[var(--paper)] font-sans overflow-hidden select-none transition-colors duration-200">
      {/* 1. TOP HEADER: SINGLE 3D CUBES LOGO, THEME TOGGLE & SETTINGS */}
      <header className="w-full border-b border-[var(--border)] shrink-0 h-12 sm:h-13 px-3 sm:px-6 bg-[var(--paper)] flex items-center">
        <div className="max-w-xl mx-auto w-full flex items-center justify-between gap-3">
          {/* Brand Logo: ONLY ONE 3D Cubes Logo at the top */}
          <div className="shrink-0 flex items-center">
            <button
              onClick={() => {}}
              className="flex items-center group transition hover:opacity-90 focus:outline-none cursor-pointer"
              title="1708 - Number Puzzle"
              aria-label="1708 3D Cubes Logo"
            >
              <CubeLogo1708 isWon={isWon} size="sm" darkMode={darkMode} />
            </button>
          </div>

          {/* Right Controls: How to Play, Theme Toggle, Options Drawer */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="p-1.5 rounded-lg text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] transition cursor-pointer"
              title="How to Play"
              aria-label="How to Play"
            >
              <BookOpen className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Dark/Light mode toggle switch */}
            <button
              onClick={toggleDarkMode}
              className="w-11 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] flex items-center p-0.5 transition cursor-pointer relative"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[var(--paper-2)] border border-[var(--border)] flex items-center justify-center text-[var(--ink)] shadow-2xs transition-transform duration-200 ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {darkMode ? <Moon className="w-3 h-3 stroke-[2]" /> : <Sun className="w-3 h-3 stroke-[2]" />}
              </div>
            </button>

            {/* Sliders / Options drawer button */}
            <button
              onClick={() => setIsMenuDrawerOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] transition cursor-pointer"
              title="Options & Modes"
              aria-label="Options & Modes"
            >
              <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MODE SELECTOR SUB-BAR (LEVEL PROGRESSION DEFAULT, DAILY, CLASSIC, PRACTICE) */}
      <div className="w-full max-w-xl mx-auto px-3 sm:px-6 pt-2 shrink-0">
        <div className="flex items-center justify-between bg-[var(--paper-2)] border border-[var(--border)] p-1 rounded-xl">
          {(['level', 'daily', 'classic', 'practice'] as Mode[]).map(m => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[12px] font-medium transition cursor-pointer capitalize text-center ${
                  isActive
                    ? 'bg-[var(--ink)] text-[var(--paper)] shadow-2xs font-semibold'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                }`}
              >
                {m === 'level' ? `Level ${stats.currentLevel}` : m === 'daily' ? `Daily #${dailyNumber}` : m}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. STATIC APP PLAYFIELD: FITS TO VIEWPORT WITHOUT SCROLLING */}
      <main className="w-full max-w-xl mx-auto px-3 sm:px-6 py-2 flex-1 flex flex-col justify-between min-h-0 text-left">
        {/* Target Card */}
        <div className="w-full rounded-[18px] bg-[var(--paper-2)] border border-[var(--border)] p-3 sm:p-4 shrink-0 flex flex-col gap-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[var(--ink-secondary)] select-none">
                {mode === 'level' ? `Level ${stats.currentLevel}` : 'Target'}
              </span>
              <span className="font-serif text-[32px] sm:text-[40px] font-bold text-[var(--ink)] leading-none tabular-nums select-none">
                1708
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border)] hover:bg-[var(--surface-alt)] text-[12px] text-[var(--ink)] font-normal transition cursor-pointer"
                title="Optimal moves hint"
              >
                <Lightbulb className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{showHint && currentPuzzle ? `Best: ${currentPuzzle.solveResult.minMoves}` : 'Optimal'}</span>
              </button>

              <span className="text-[12px] text-[var(--ink-secondary)] tabular-nums border border-[var(--border)] px-2.5 py-1 rounded-full">
                {history.length} {history.length === 1 ? 'move' : 'moves'}
              </span>
            </div>
          </div>

          <div className="border-t border-[var(--border)]/70 pt-1.5 flex items-center justify-between text-[12px]">
            <span className="truncate pr-2 font-medium text-[var(--ink)]">
              {hintText}
            </span>
            <span className="shrink-0 text-[11px] text-[var(--ink-secondary)] tabular-nums">
              {totalTokensLeft} tokens left
            </span>
          </div>
        </div>

        {/* Tiles: 5 tiles */}
        <div className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center justify-between px-0.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">
              Tiles <span className="text-[var(--ink-secondary)] font-normal">({tiles.length})</span>
            </span>
            <span className="text-[11px] text-[var(--ink-secondary)]">Reach 1708</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {tiles.map((val, idx) => {
              const isSelected = selectedTileIndices.includes(idx);
              const isNew = newTileIndex === idx;
              const isTarget = val === TARGET;
              const availability = getTileAvailability(
                idx,
                tiles,
                tokens,
                selectedOp,
                selectedTileIndices,
                mode
              );
              const isAvailable = availability.available;

              return (
                <button
                  key={`${idx}-${val}`}
                  onClick={() => handleTileClick(idx)}
                  className={`relative h-14 sm:h-17 md:h-19 rounded-[14px] sm:rounded-[16px] flex flex-col items-center justify-center transition-all duration-150 select-none cursor-pointer border shadow-2xs ${
                    isTarget
                      ? 'bg-[var(--ink)] text-[var(--paper)] border-2 border-[var(--ink)] shadow-xs'
                      : isSelected
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--ink)] ring-2 ring-[var(--ink)] scale-[1.03]'
                      : isNew
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--ink)]/50'
                      : isAvailable
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] hover:border-[var(--ink)] active:scale-[0.98]'
                      : 'opacity-25 bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] cursor-not-allowed'
                  }`}
                  aria-label={`Tile ${val}`}
                >
                  <span className="font-serif text-[22px] sm:text-[28px] md:text-[32px] font-semibold leading-none tabular-nums truncate px-1">
                    {val}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tokens: 5 operations */}
        <div className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center justify-between px-0.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">
              Tokens <span className="text-[var(--ink-secondary)] font-normal">({totalTokensLeft} left)</span>
            </span>
            <span className="text-[11px] text-[var(--ink-secondary)]">1 per move</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {(['ADD', 'SUB', 'MUL', 'SQ', 'POW'] as OpType[]).map(op => {
              const count = tokens[op];
              const isSelected = selectedOp === op;
              const availability = getTokenAvailability(
                op,
                tiles,
                tokens,
                selectedTileIndices,
                mode
              );
              const isAvailable = availability.available;

              return (
                <button
                  key={op}
                  onClick={() => handleOpClick(op)}
                  className={`h-15 sm:h-18 md:h-20 rounded-[14px] sm:rounded-[16px] flex flex-col items-center justify-between transition-all duration-150 p-1.5 sm:p-2 border cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--ink)] ring-2 ring-[var(--ink)] scale-[1.03]'
                      : isAvailable
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] hover:border-[var(--ink)] active:scale-[0.98]'
                      : 'opacity-25 bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] cursor-not-allowed'
                  }`}
                  aria-label={`${op} token (${count} remaining)`}
                >
                  <div className="text-[9px] sm:text-[10px] font-sans font-medium tracking-wider text-[var(--ink-secondary)] uppercase">
                    {op}
                  </div>
                  <div className="text-[16px] sm:text-[19px] font-bold leading-none text-[var(--ink)]">
                    {op === 'ADD' ? '+' : op === 'SUB' ? '−' : op === 'MUL' ? '×' : op === 'SQ' ? 'x²' : 'xⁿ'}
                  </div>
                  <div className="text-[11px] tabular-nums text-[var(--ink-secondary)] font-medium">
                    ×{count}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Row: Restart & New Puzzle (No Undo action in any mode) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 shrink-0 pt-0.5">
          <button
            onClick={handleRestart}
            className="h-11 sm:h-12 border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--surface-alt)] rounded-[14px] sm:rounded-[16px] font-medium text-[14px] text-[var(--ink)] flex items-center justify-center gap-1.5 transition cursor-pointer"
            aria-label="Restart puzzle"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.75]" />
            <span>Restart</span>
          </button>

          <button
            onClick={handleNewPuzzleRequest}
            className="h-11 sm:h-12 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 active:opacity-80 rounded-[14px] sm:rounded-[16px] font-medium text-[14px] flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            aria-label="New puzzle or next level"
          >
            <Play className="w-4 h-4 stroke-[1.75] fill-current" />
            <span>
              {mode === 'level' && isWon
                ? `Next Level (${stats.currentLevel})`
                : mode === 'level'
                ? `Level ${stats.currentLevel}`
                : 'New Puzzle'}
            </span>
          </button>
        </div>

        {/* Clean Static Attribution (Zero-scroll, No bottom navigation bar) */}
        <div className="text-[11px] text-[var(--ink-secondary)] opacity-60 text-center py-0.5 shrink-0 select-none">
          1708 · Developed by Asim Nawaz
        </div>
      </main>

      {/* MODALS & DRAWERS */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <SelfTestModal
        isOpen={isSelfTestOpen}
        onClose={() => setIsSelfTestOpen(false)}
        report={testReport}
        onRerun={() => setTestReport(runAllSelfTests())}
      />

      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        onOpenHowToPlay={() => {
          setIsMenuDrawerOpen(false);
          setIsHowToPlayOpen(true);
        }}
        onOpenStats={() => {
          setIsMenuDrawerOpen(false);
          setIsStatsOpen(true);
        }}
        onOpenSelfTest={() => {
          setIsMenuDrawerOpen(false);
          setIsSelfTestOpen(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        currentMode={mode}
        onSelectMode={(m) => {
          setMode(m);
          setIsMenuDrawerOpen(false);
        }}
        dailyNumber={dailyNumber}
        stats={stats}
      />

      {/* WinModal with real Level progression */}
      <WinModal
        isOpen={isWon && !isResultDismissed}
        onClose={() => setIsResultDismissed(true)}
        movesCount={history.length}
        bestPossible={currentPuzzle?.solveResult.minMoves ?? 0}
        isClassicFounderRoute={isClassicFounderRoute}
        history={history.map(h => h.move)}
        onPlayAgain={handleRestart}
        onNewPuzzle={startNewPuzzle}
        currentLevel={mode === 'level' ? Math.max(1, stats.currentLevel - 1) : stats.currentLevel}
        isLevelMode={mode === 'level'}
        onNextLevel={handleNextLevel}
      />

      {/* LossModal */}
      <LossModal
        isOpen={isLost && !isResultDismissed}
        onClose={() => setIsResultDismissed(true)}
        movesCount={history.length}
        bestPossible={currentPuzzle?.solveResult.minMoves ?? 0}
        onRestart={handleRestart}
        onNewPuzzle={startNewPuzzle}
      />

      {/* ConfirmNewPuzzleModal */}
      <ConfirmNewPuzzleModal
        isOpen={isConfirmNewPuzzleOpen}
        onConfirm={startNewPuzzle}
        onCancel={() => setIsConfirmNewPuzzleOpen(false)}
      />
    </div>
  );
}
