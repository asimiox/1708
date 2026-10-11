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
  generateDailyPuzzle,
  generateClassicPuzzle,
  generateFounderPuzzle,
  generatePracticePuzzle,
  getDailyNumber,
  GeneratedPuzzle,
} from './utils/generator';
import { loadGameStats, recordWin, GameStats } from './utils/storage';
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
import { ThreeD1708 } from './components/ThreeD1708';

type Mode = 'daily' | 'classic' | 'founder' | 'practice';

interface HistoryState {
  tiles: number[];
  tokens: Tokens;
  move: Move;
}

export default function App() {
  // Theme & Sound state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.enabled);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      sounds.enabled = next;
      return next;
    });
  }, []);

  // Active Mode (Menu order: 1. Daily, 2. Classic, 3. Founder, 4. Practice)
  const [mode, setMode] = useState<Mode>('daily');

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
  const [stats, setStats] = useState<GameStats>(loadGameStats());
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

  // Initialize a puzzle by mode
  const initPuzzle = useCallback(
    (m: Mode) => {
      let p: GeneratedPuzzle;
      if (m === 'daily') {
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
    },
    []
  );

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
    if (history.length > 0 && !isWon && !isLost) {
      setIsConfirmNewPuzzleOpen(true);
    } else {
      initPuzzle(mode);
    }
  }, [history.length, isWon, isLost, initPuzzle, mode]);

  const startNewPuzzle = useCallback(() => {
    setIsConfirmNewPuzzleOpen(false);
    initPuzzle(mode);
  }, [initPuzzle, mode]);

  // Execute a valid move
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
        const updated = recordWin(mode, history.length + 1, new Date().toISOString().split('T')[0]);
        setStats(updated);
      } else if (stateCheck.lost) {
        sounds.error();
        setIsLost(true);
        setIsWon(false);
        setIsResultDismissed(false);
        showToast(stateCheck.message || 'No legal moves left.');
      } else {
        sounds.combine();
        setIsWon(false);
        setIsLost(false);
      }
    },
    [mode, tiles, tokens, history.length, checkGameState, showToast]
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
    <div className="min-h-[100dvh] bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--ink)] selection:text-[var(--paper)] font-sans transition-colors duration-200">
      {/* 1. TOP HEADER NAVIGATION - EXACT REPRODUCTION OF REFERENCE IMAGE */}
      <header className="w-full border-b border-[var(--border)] shrink-0 py-3.5 px-4 sm:px-8 bg-[var(--paper)] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Left Brand Logo: 1708 serif */}
          <div className="font-serif text-[28px] font-bold tracking-tight text-[var(--ink)] select-none">
            1708
          </div>

          {/* Center Navigation Tabs: Play, How to Play, About */}
          <nav className="flex items-center gap-7 text-[14px]" aria-label="Main Navigation">
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-1.5 font-medium text-[var(--ink)] pb-1 border-b-2 border-[var(--ink)] cursor-pointer"
            >
              <Home className="w-4 h-4 stroke-[1.75]" />
              <span>Play</span>
            </button>

            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)] hover:text-[var(--ink)] transition pb-1 border-b-2 border-transparent cursor-pointer"
            >
              <BookOpen className="w-4 h-4 stroke-[1.75]" />
              <span>How to Play</span>
            </button>

            <button
              onClick={() => setIsAboutOpen(true)}
              className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)] hover:text-[var(--ink)] transition pb-1 border-b-2 border-transparent cursor-pointer"
            >
              <Info className="w-4 h-4 stroke-[1.75]" />
              <span>About</span>
            </button>
          </nav>

          {/* Right Controls: Dark Mode Toggle Pill & Menu/Sliders */}
          <div className="flex items-center gap-3">
            {/* Dark mode pill toggle with sun/moon */}
            <button
              onClick={toggleDarkMode}
              className="w-12 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] flex items-center p-0.5 transition cursor-pointer relative"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[var(--paper-2)] border border-[var(--border)] flex items-center justify-center text-[var(--ink)] shadow-xs transition-transform duration-200 ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {darkMode ? <Moon className="w-3 h-3 stroke-[2]" /> : <Sun className="w-3 h-3 stroke-[2] text-[#A06428]" />}
              </div>
            </button>

            {/* Sliders / Options drawer button */}
            <button
              onClick={() => setIsMenuDrawerOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] transition cursor-pointer"
              title="Game options and modes"
              aria-label="Game options and modes"
            >
              <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAMEPLAY CONTENT CONTAINER */}
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-8 py-5 flex-1 flex flex-col gap-6 text-left">
        {/* 2. HERO SECTION: 1708 NUMBER PUZZLE + FLOATING 3D PORCELAIN TILES & ORBITS */}
        <section className="w-full flex items-center justify-between gap-6 pt-2 pb-1">
          <div className="flex flex-col text-left max-w-[280px] sm:max-w-[320px]">
            <h1 className="font-serif text-[64px] sm:text-[76px] font-bold tracking-tight text-[var(--ink)] leading-none select-none">
              1708
            </h1>
            <p className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-[var(--ink-secondary)] mt-2.5">
              NUMBER PUZZLE
            </p>
            <div className="w-9 h-[1px] bg-[var(--border)] my-3" />
            <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">
              Reach the target number using the given tiles and operation tokens.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-end">
            <ThreeD1708 isWon={isWon} className="w-[190px] sm:w-[270px] h-[130px] sm:h-[160px]" />
          </div>
        </section>

        {/* 3. TARGET NUMBER CARD */}
        <div className="w-full rounded-[22px] bg-[var(--paper-2)] border border-[var(--border)] p-6 sm:p-7 shadow-[0_1px_4px_rgba(37,35,31,0.03)] flex flex-col gap-5 text-left">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] text-[var(--ink-secondary)] font-normal">
                Target number
              </span>
              <div className="font-serif text-[46px] sm:text-[52px] font-bold text-[var(--ink)] leading-tight tracking-tight my-0.5 tabular-nums select-none">
                1708
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--border)] text-[12px] text-[var(--ink-secondary)] w-fit mt-1">
                <span className="tabular-nums">{history.length} {history.length === 1 ? 'move' : 'moves'}</span>
                <span>·</span>
                <span className="tabular-nums">{totalTokensLeft} tokens left</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2.5">
              <button
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--surface-alt)] text-[13px] text-[var(--ink)] font-normal transition cursor-pointer"
                title="Optimal moves hint"
              >
                <Lightbulb className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{showHint && currentPuzzle ? `Best: ${currentPuzzle.solveResult.minMoves}` : 'Optimal'}</span>
              </button>
              <span className="text-[12px] text-[var(--ink-secondary)]">
                {tiles.length} tiles · {totalTokensLeft} tokens
              </span>
            </div>
          </div>

          {/* Target Card instruction & status area */}
          <div className="border-t border-[var(--border)]/70 pt-3.5 flex flex-col items-center justify-center text-center">
            <LayoutGrid className="w-5 h-5 text-[var(--ink-secondary)] opacity-60 mb-1 stroke-[1.5]" />
            <p className="text-[13px] text-[var(--ink-secondary)]">
              {hintText}
            </p>
          </div>
        </div>

        {/* 4. TILES: 5 tiles with large serif digits */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 text-[14px]">
            <span className="font-medium text-[var(--ink)]">
              Tiles <span className="text-[var(--ink-secondary)] font-normal">({tiles.length})</span>
            </span>
            <span className="text-[13px] text-[var(--ink-secondary)]">Reach 1708</span>
          </div>

          <div className="grid grid-cols-5 gap-3">
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
                  className={`relative min-h-[76px] sm:min-h-[88px] rounded-[18px] flex flex-col items-center justify-center transition-all duration-150 select-none cursor-pointer border shadow-[0_1px_2px_rgba(37,35,31,0.03)] ${
                    isTarget
                      ? 'bg-[var(--ink)] text-[var(--paper-2)] border-2 border-[var(--ink)] shadow-xs'
                      : isSelected
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--ink)] ring-2 ring-[var(--ink)] shadow-xs scale-[1.02]'
                      : isNew
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--ink)]/50'
                      : isAvailable
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] hover:border-[var(--ink)]/50 hover:bg-[var(--paper)] active:scale-[0.98]'
                      : 'opacity-30 bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] cursor-not-allowed'
                  }`}
                  aria-label={`Tile ${val}`}
                >
                  <span className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tabular-nums truncate px-1">
                    {val}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. TOKENS: 5 operation tokens */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 text-[14px]">
            <span className="font-medium text-[var(--ink)]">
              Tokens <span className="text-[var(--ink-secondary)] font-normal">({totalTokensLeft} left)</span>
            </span>
            <span className="text-[13px] text-[var(--ink-secondary)]">1 per move</span>
          </div>

          <div className="grid grid-cols-5 gap-3">
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
                  className={`min-h-[86px] sm:min-h-[98px] rounded-[18px] flex flex-col items-center justify-center transition-all duration-150 p-2 border cursor-pointer shadow-[0_1px_2px_rgba(37,35,31,0.03)] ${
                    isSelected
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--ink)] ring-2 ring-[var(--ink)] shadow-xs scale-[1.02]'
                      : isAvailable
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] hover:border-[var(--ink)]/50 hover:bg-[var(--paper)] active:scale-[0.98]'
                      : 'opacity-30 bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] cursor-not-allowed'
                  }`}
                  aria-label={`${op} token (${count} remaining)`}
                >
                  <div className="text-[11px] font-sans font-medium tracking-wider text-[var(--ink-secondary)] uppercase">
                    {op}
                  </div>
                  <div className="text-[17px] sm:text-[19px] font-medium leading-tight my-1 text-[var(--ink)]">
                    {op === 'ADD' ? '+' : op === 'SUB' ? '−' : op === 'MUL' ? '×' : op === 'SQ' ? 'x²' : 'xⁿ'}
                  </div>
                  <div className="text-[12px] tabular-nums text-[var(--ink-secondary)] font-medium">
                    ×{count}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. ACTION ROW: RESTART & SOLID BLACK NEW PUZZLE */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleRestart}
            className="h-12 border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] rounded-[16px] font-medium text-[15px] text-[var(--ink)] flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            aria-label="Restart puzzle"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.75]" />
            <span>Restart</span>
          </button>

          <button
            onClick={handleNewPuzzleRequest}
            className="h-12 bg-[#23211E] text-white hover:bg-[#151412] active:bg-black rounded-[16px] font-medium text-[15px] flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            aria-label="New puzzle"
          >
            <Play className="w-4 h-4 stroke-[1.75] fill-white text-white" />
            <span>New Puzzle</span>
          </button>
        </div>

        {/* 7. Collapsible Move History (when moves exist) */}
        {history.length > 0 && (
          <div className="bg-[var(--paper-2)] rounded-[16px] border border-[var(--border)] overflow-hidden shrink-0 mt-1">
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="w-full px-4 py-2.5 text-[13px] flex items-center justify-between text-[var(--ink)] hover:bg-[var(--paper)] transition cursor-pointer"
            >
              <span className="truncate">
                Step {history.length}: [{history[history.length - 1].move.op}]{' '}
                {history[history.length - 1].move.op === 'SQ'
                  ? `${history[history.length - 1].move.inputs[0]}² = ${history[history.length - 1].move.result}`
                  : history[history.length - 1].move.op === 'POW'
                  ? `${history[history.length - 1].move.inputs[0]}^${history[history.length - 1].move.inputs[0]} = ${history[history.length - 1].move.result}`
                  : `${history[history.length - 1].move.inputs[0]} & ${history[history.length - 1].move.inputs[1]} → ${history[history.length - 1].move.result}`}
              </span>
              <span className="flex items-center gap-1 text-[13px] text-[var(--ink-secondary)] shrink-0 ml-2">
                {history.length} {history.length === 1 ? 'move' : 'moves'}
                {historyExpanded ? <ChevronUp className="w-4 h-4 stroke-[1.5]" /> : <ChevronDown className="w-4 h-4 stroke-[1.5]" />}
              </span>
            </button>

            {historyExpanded && (
              <div className="px-4 pb-3 pt-1.5 border-t border-[var(--border)] max-h-28 overflow-y-auto space-y-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[var(--ink-secondary)] text-[13px] tabular-nums"
                  >
                    <span>
                      {i + 1}. [{h.move.op}]{' '}
                      {h.move.op === 'SQ'
                        ? `${h.move.inputs[0]}²`
                        : h.move.op === 'POW'
                        ? `${h.move.inputs[0]}^${h.move.inputs[0]}`
                        : `${h.move.inputs[0]} & ${h.move.inputs[1]}`}
                    </span>
                    <span className="font-medium text-[var(--ink)]">
                      = {h.move.result}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 8. FOOTER - MATCHING REFERENCE IMAGE */}
      <footer className="w-full border-t border-[var(--border)] py-4 px-4 sm:px-8 shrink-0 mt-6 bg-[var(--paper)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-[13px] text-[var(--ink-secondary)]">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-[var(--ink)] text-[16px]">1708</span>
            <span className="opacity-40">|</span>
            <span>Developed by Asim Nawaz</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="hover:text-[var(--ink)] transition cursor-pointer"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              <Moon className="w-4 h-4 stroke-[1.75]" />
            </button>
            <button
              onClick={() => setIsMenuDrawerOpen(true)}
              className="hover:text-[var(--ink)] transition cursor-pointer"
              title="Open options and game modes"
              aria-label="Open options and game modes"
            >
              <Menu className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </footer>

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

      {/* WinModal */}
      <WinModal
        isOpen={isWon && !isResultDismissed}
        onClose={() => setIsResultDismissed(true)}
        movesCount={history.length}
        bestPossible={currentPuzzle?.solveResult.minMoves ?? 0}
        isClassicFounderRoute={isClassicFounderRoute}
        history={history.map(h => h.move)}
        onPlayAgain={handleRestart}
        onNewPuzzle={startNewPuzzle}
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
