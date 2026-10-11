import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Trophy,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
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
import { StatsModal } from './components/StatsModal';
import { WinModal } from './components/WinModal';
import { LossModal } from './components/LossModal';
import { SelfTestModal } from './components/SelfTestModal';
import { ConfirmNewPuzzleModal } from './components/ConfirmNewPuzzleModal';
import { ThreeD1708 } from './components/ThreeD1708';

type Mode = 'daily' | 'classic' | 'founder' | 'practice';

interface HistoryState {
  tiles: number[];
  tokens: Tokens;
  move: Move;
}

export default function App() {
  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.enabled);

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
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSelfTestOpen, setIsSelfTestOpen] = useState<boolean>(false);
  const [isConfirmNewPuzzleOpen, setIsConfirmNewPuzzleOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<GameStats>(loadGameStats());
  const [testReport, setTestReport] = useState<SelfTestReport>(() => runAllSelfTests());

  const dailyNumber = useMemo(() => getDailyNumber(new Date()), []);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger feedback toast with vibration
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
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

  // Keyboard navigation: Escape clears selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  // Load a puzzle for the selected mode
  const loadModePuzzle = useCallback(
    (newMode: Mode) => {
      setSelectedOp(null);
      setSelectedTileIndices([]);
      setToastMessage(null);
      setNewTileIndex(null);
      setIsWon(false);
      setIsLost(false);
      setIsResultDismissed(false);
      setWinningMove(null);
      setShowHint(false);
      setHistory([]);
      setHistoryExpanded(false);

      let puzzle: GeneratedPuzzle;
      if (newMode === 'daily') {
        puzzle = generateDailyPuzzle(new Date());
      } else if (newMode === 'classic') {
        puzzle = generateClassicPuzzle();
      } else if (newMode === 'founder') {
        puzzle = generateFounderPuzzle();
      } else {
        puzzle = generatePracticePuzzle();
      }

      setCurrentPuzzle(puzzle);
      setTiles([...puzzle.tiles]);
      setTokens({ ...puzzle.tokens });

      const state = checkGameState(puzzle.tiles, puzzle.tokens, newMode);
      if (state.won) {
        setIsWon(true);
      } else if (state.lost) {
        setIsLost(true);
      }
    },
    [checkGameState]
  );

  // Initialize on mount or mode change
  useEffect(() => {
    loadModePuzzle(mode);
  }, [mode, loadModePuzzle]);

  const toggleSound = () => {
    const val = sounds.toggle();
    setSoundEnabled(val);
  };

  // Generate a new verified puzzle
  const startNewPuzzle = useCallback(() => {
    setIsConfirmNewPuzzleOpen(false);

    let newPuzzle: GeneratedPuzzle;
    if (mode === 'daily') {
      // In daily mode, start a new practice puzzle so player can continue playing
      newPuzzle = generatePracticePuzzle();
    } else if (mode === 'classic') {
      newPuzzle = generateClassicPuzzle(undefined, currentPuzzle?.tokens);
    } else if (mode === 'founder') {
      newPuzzle = generateFounderPuzzle(undefined, currentPuzzle?.tokens);
    } else {
      newPuzzle = generatePracticePuzzle(
        currentPuzzle ? { tiles: currentPuzzle.tiles, tokens: currentPuzzle.tokens } : undefined
      );
    }

    setCurrentPuzzle(newPuzzle);
    setTiles([...newPuzzle.tiles]);
    setTokens({ ...newPuzzle.tokens });
    setHistory([]);
    setHistoryExpanded(false);
    setSelectedOp(null);
    setSelectedTileIndices([]);
    setToastMessage(null);
    setNewTileIndex(null);
    setIsWon(false);
    setIsLost(false);
    setIsResultDismissed(false);
    setWinningMove(null);
    setShowHint(false);
  }, [mode, currentPuzzle]);

  // Request new puzzle with mid-game progress confirmation guard
  const handleNewPuzzleRequest = useCallback(() => {
    if (mode === 'daily') {
      setMode('practice');
      return;
    }

    if (history.length > 0 && !isWon && !isLost) {
      setIsConfirmNewPuzzleOpen(true);
      return;
    }

    startNewPuzzle();
  }, [mode, history.length, isWon, isLost, startNewPuzzle]);

  // Execute Move
  const executeMove = useCallback(
    (op: OpType, inputVals: number[], indicesToRemove: number[]) => {
      const blockFounder = mode === 'founder';
      const validation = validateMove(op, inputVals, blockFounder);

      if (!validation.valid || validation.result === undefined) {
        showToast(validation.reason || 'Invalid move');
        sounds.error();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch {
            // ignore
          }
        }
        setSelectedTileIndices([]);
        setSelectedOp(null);
        return;
      }

      const result = validation.result;
      const move: Move = { op, inputs: inputVals, result };

      setHistory(prev => [
        ...prev,
        {
          tiles: [...tiles],
          tokens: { ...tokens },
          move,
        },
      ]);

      const nextTokens: Tokens = {
        ...tokens,
        [op]: tokens[op] - 1,
      };
      setTokens(nextTokens);

      const nextTiles = tiles.filter((_, idx) => !indicesToRemove.includes(idx));
      nextTiles.push(result);
      setTiles(nextTiles);

      const newIdx = nextTiles.length - 1;
      setNewTileIndex(newIdx);
      setTimeout(() => setNewTileIndex(null), 900);

      setSelectedOp(null);
      setSelectedTileIndices([]);
      setToastMessage(null);

      const state = checkGameState(nextTiles, nextTokens, mode);
      if (state.won) {
        sounds.win();
        setIsWon(true);
        setIsResultDismissed(false);
        setWinningMove(move);
        setIsLost(false);

        const todayUtc = new Date().toISOString().slice(0, 10);
        const updated = recordWin(mode, history.length + 1, todayUtc);
        setStats(updated);
      } else if (state.lost) {
        sounds.error();
        setIsWon(false);
        setIsLost(true);
        setIsResultDismissed(false);
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
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch {
          // ignore
        }
      }
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
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch {
          // ignore
        }
      }
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

  // Replay / Restart current puzzle
  const handleRestart = () => {
    if (!currentPuzzle) return;
    sounds.tap();
    setTiles([...currentPuzzle.tiles]);
    setTokens({ ...currentPuzzle.tokens });
    setHistory([]);
    setHistoryExpanded(false);
    setSelectedOp(null);
    setSelectedTileIndices([]);
    setToastMessage(null);
    setNewTileIndex(null);
    setIsResultDismissed(false);

    const state = checkGameState(currentPuzzle.tiles, currentPuzzle.tokens, mode);
    if (state.won) {
      setIsWon(true);
      setIsLost(false);
    } else if (state.lost) {
      setIsWon(false);
      setIsLost(true);
    } else {
      setIsWon(false);
      setIsLost(false);
      setWinningMove(null);
    }
  };

  const totalTokensLeft = (Object.values(tokens) as number[]).reduce((sum, n) => sum + n, 0);

  const isClassicFounderRoute = useMemo(() => {
    if (!winningMove) return false;
    return isFounderMove(winningMove);
  }, [winningMove]);

  // Live preview equation
  const previewInfo = useMemo(() => {
    if ((selectedOp === 'SQ' || selectedOp === 'POW') && selectedTileIndices.length === 1) {
      const val = tiles[selectedTileIndices[0]];
      const v = validateMove(selectedOp, [val], mode === 'founder');
      if (v.valid && v.result !== undefined) {
        const expr = selectedOp === 'SQ' ? `${val}²` : `${val}^${val}`;
        return `${expr} = ${v.result}`;
      }
    }
    if (selectedOp && selectedTileIndices.length === 2) {
      const valA = tiles[selectedTileIndices[0]];
      const valB = tiles[selectedTileIndices[1]];
      const v = validateMove(selectedOp, [valA, valB], mode === 'founder');
      if (v.valid && v.result !== undefined) {
        const sym = selectedOp === 'ADD' ? '+' : selectedOp === 'SUB' ? '−' : '×';
        return `${valA} ${sym} ${valB} = ${v.result}`;
      }
    }
    return null;
  }, [selectedOp, selectedTileIndices, tiles, mode]);

  // Live hint bar text
  const hintText = useMemo(() => {
    if (toastMessage) {
      return toastMessage;
    }
    if (previewInfo) {
      return previewInfo;
    }
    if (isWon && isResultDismissed) {
      return `Solved in ${history.length} moves. Tap to view summary.`;
    }
    if (isLost && isResultDismissed) {
      return 'No legal moves left. Tap to view summary.';
    }
    if (!selectedOp) {
      if (selectedTileIndices.length === 0) {
        return 'Choose a tile or a token.';
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
    return 'Choose a tile or a token.';
  }, [toastMessage, previewInfo, isWon, isLost, isResultDismissed, history.length, selectedOp, selectedTileIndices]);

  return (
    <div className="min-h-[100dvh] max-w-[420px] mx-auto bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-between p-4 selection:bg-[var(--accent)] selection:text-[var(--paper-2)]">
      {/* 1. Header: Bodoni Moda 1708 wordmark, 44px, tight letter spacing */}
      <header className="w-full flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <h1 className="text-[44px] font-serif font-semibold tracking-[-0.02em] text-[var(--ink)] leading-none select-none">
              1708<span className="sr-only"> Game</span>
            </h1>
            <p className="text-[13px] text-[var(--ink)] opacity-65 mt-1">
              Developed by Asim Nawaz
            </p>
          </div>

          {/* Header Actions: 1.5px stroke, 20px icons, no emoji, real button elements */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSelfTestOpen(true)}
              className="w-9 h-9 rounded-[12px] border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 transition cursor-pointer"
              title="Verification tests"
              aria-label="Verification tests"
            >
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setIsStatsOpen(true)}
              className="w-9 h-9 rounded-[12px] border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 transition cursor-pointer"
              title="Statistics"
              aria-label="Statistics"
            >
              <Trophy className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button
              onClick={toggleSound}
              className="w-9 h-9 rounded-[12px] border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 transition cursor-pointer"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 stroke-[1.5]" /> : <VolumeX className="w-5 h-5 stroke-[1.5]" />}
            </button>
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="w-9 h-9 rounded-[12px] border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 transition cursor-pointer"
              title="How to play"
              aria-label="How to play"
            >
              <HelpCircle className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Mode switch: plain text tabs with a 2px ink underline on the active one */}
        <nav className="flex items-center justify-between border-b border-[var(--border)] text-[15px]" aria-label="Game modes">
          {(['daily', 'classic', 'founder', 'practice'] as Mode[]).map((m) => {
            const isCurrent = mode === m;
            const label =
              m === 'daily'
                ? `Daily #${dailyNumber}`
                : m === 'classic'
                ? 'Classic'
                : m === 'founder'
                ? 'Founder'
                : 'Practice';
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`pb-2 transition cursor-pointer text-center flex-1 ${
                  isCurrent
                    ? 'border-b-2 border-[var(--ink)] font-semibold text-[var(--ink)]'
                    : 'text-[var(--ink)] opacity-65 hover:opacity-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Gameplay */}
      <main className="w-full flex-1 flex flex-col justify-between py-3 gap-3 min-h-0 text-left">
        {/* 2. Target Card with 3D 1708 element on the right */}
        <div className="rounded-[14px] bg-[var(--paper-2)] text-[var(--ink)] p-4 border border-[var(--border)] shadow-[0_1px_3px_rgba(37,35,31,0.04)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col justify-between min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--ink-secondary)]">
                Target number
              </span>
              {mode === 'founder' && (
                <span className="text-[11px] font-medium text-[var(--accent)] bg-[var(--accent-light)] px-1.5 py-0.5 rounded-[6px]">
                  7 × 244 blocked
                </span>
              )}
            </div>

            <div className="text-[38px] font-serif font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight py-0.5 tabular-nums select-none">
              1708
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[var(--ink-secondary)] flex-wrap">
              <span className="tabular-nums font-medium">{history.length} {history.length === 1 ? 'move' : 'moves'}</span>
              <span>·</span>
              <span className="tabular-nums font-medium">{totalTokensLeft} left</span>
              {currentPuzzle && !isLost && !isWon && (
                <>
                  <span>·</span>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] border border-[var(--border)] bg-[var(--paper)] hover:bg-[var(--surface-alt)] text-[var(--ink)] opacity-85 hover:opacity-100 transition cursor-pointer"
                    title="Optimal moves hint"
                  >
                    <Lightbulb className="w-3 h-3 stroke-[1.5]" />
                    <span>{showHint ? `Best: ${currentPuzzle.solveResult.minMoves}` : 'Optimal'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right side: 3D "1708" interactive isometric blocks */}
          <div className="shrink-0 flex items-center justify-center pl-2">
            <ThreeD1708 isWon={isWon} className="w-[144px] h-[82px]" />
          </div>
        </div>

        {/* 3. Live Hint Bar and Preview */}
        <div
          role="status"
          aria-live="polite"
          onClick={() => {
            if ((isWon || isLost) && isResultDismissed) {
              setIsResultDismissed(false);
            }
          }}
          className={`w-full py-2 px-3.5 rounded-[12px] text-[13px] font-medium flex items-center justify-between transition-colors min-h-[40px] shrink-0 border ${
            toastMessage
              ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] animate-shake'
              : (isWon || isLost) && isResultDismissed
              ? 'bg-[var(--paper-2)] text-[var(--accent)] border-[var(--border)] cursor-pointer'
              : 'bg-[var(--paper-2)] text-[var(--ink)] opacity-85 border-[var(--border)]'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {toastMessage && <AlertCircle className="w-4 h-4 shrink-0 text-[var(--paper)] stroke-[1.5]" />}
            <span className="truncate">{hintText}</span>
          </div>

          {(selectedOp !== null || selectedTileIndices.length > 0) && !toastMessage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="text-[13px] font-medium text-[var(--accent)] hover:opacity-80 px-2.5 py-0.5 rounded-[12px] border border-[var(--border)] hover:bg-[var(--paper)] transition shrink-0 ml-2 cursor-pointer"
              title="Clear selection"
            >
              Clear
            </button>
          )}
        </div>

        {/* 4. TILES: 5 tiles, rounded 12px, tabular-nums */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between px-1 text-[13px] text-[var(--ink-secondary)]">
            <span>Tiles ({tiles.length})</span>
            <span className="text-[13px]">Reach 1708</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
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
                  className={`relative min-h-[56px] h-14 rounded-[12px] font-semibold text-[18px] flex flex-col items-center justify-center transition-all duration-150 select-none cursor-pointer border shadow-[0_1px_2px_rgba(37,35,31,0.03)] ${
                    isTarget
                      ? 'bg-[var(--accent)] text-[var(--paper-2)] border-2 border-[var(--accent)] shadow-[0_2px_8px_rgba(184,86,43,0.25)]'
                      : isSelected
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--accent)] ring-1 ring-[var(--accent)] shadow-xs scale-[1.02]'
                      : isNew
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--accent)]'
                      : isAvailable
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] hover:border-[var(--ink)]/50 active:scale-[0.98]'
                      : 'opacity-30 bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] cursor-not-allowed'
                  }`}
                  aria-label={`Tile ${val}`}
                >
                  <span className="truncate px-0.5 max-w-full leading-tight tabular-nums">{val}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. TOKENS: 9 operation tokens */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between px-1 text-[13px] text-[var(--ink-secondary)]">
            <span>Tokens ({totalTokensLeft} left)</span>
            <span className="text-[13px]">1 per move</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
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
                  className={`min-h-[52px] h-[54px] rounded-[12px] flex flex-col items-center justify-center transition-all duration-150 p-1 border cursor-pointer shadow-[0_1px_2px_rgba(37,35,31,0.03)] ${
                    isSelected
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border-2 border-[var(--accent)] ring-1 ring-[var(--accent)] shadow-xs scale-[1.02]'
                      : isAvailable
                      ? 'bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] hover:border-[var(--ink)]/50 hover:bg-[var(--surface-alt)]/30 active:scale-[0.98]'
                      : 'opacity-30 bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--border)] cursor-not-allowed'
                  }`}
                  aria-label={`${op} token (${count} remaining)`}
                >
                  <div className="text-[14px] font-semibold leading-none tabular-nums">
                    {op === 'ADD' ? '+' : op === 'SUB' ? '−' : op === 'MUL' ? '×' : op === 'SQ' ? 'x²' : 'xˣ'}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--ink-secondary)] leading-tight mt-0.5 font-medium">
                    {op}
                  </div>
                  <div className="mt-0.5 text-[11px] tabular-nums text-[var(--ink-secondary)] font-medium">
                    ×{count}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Action Row: NO UNDO BUTTON IN ANY TYPE. Only Restart and New Puzzle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRestart}
            className="flex-1 min-h-[44px] h-11 border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] rounded-[12px] font-medium text-[15px] text-[var(--ink)] flex items-center justify-center gap-1.5 transition cursor-pointer"
            aria-label="Restart puzzle"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.5]" />
            Restart
          </button>

          <button
            onClick={handleNewPuzzleRequest}
            className="flex-1 min-h-[44px] h-11 bg-[var(--accent)] text-[var(--paper-2)] hover:opacity-95 rounded-[12px] font-medium text-[15px] flex items-center justify-center gap-1.5 transition cursor-pointer"
            aria-label="New puzzle"
          >
            New Puzzle
          </button>
        </div>

        {/* 7. Collapsible Move History */}
        {history.length > 0 && (
          <div className="bg-[var(--paper-2)] rounded-[12px] border border-[var(--border)] overflow-hidden shrink-0">
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="w-full px-3.5 py-2.5 text-[13px] flex items-center justify-between text-[var(--ink)] hover:bg-[var(--paper)] transition cursor-pointer"
            >
              <span className="truncate">
                Step {history.length}: [{history[history.length - 1].move.op}]{' '}
                {history[history.length - 1].move.op === 'SQ'
                  ? `${history[history.length - 1].move.inputs[0]}² = ${history[history.length - 1].move.result}`
                  : history[history.length - 1].move.op === 'POW'
                  ? `${history[history.length - 1].move.inputs[0]}^${history[history.length - 1].move.inputs[0]} = ${history[history.length - 1].move.result}`
                  : `${history[history.length - 1].move.inputs[0]} & ${history[history.length - 1].move.inputs[1]} → ${history[history.length - 1].move.result}`}
              </span>
              <span className="flex items-center gap-1 text-[13px] text-[var(--ink)] opacity-65 shrink-0 ml-2">
                {history.length} {history.length === 1 ? 'move' : 'moves'}
                {historyExpanded ? <ChevronUp className="w-4 h-4 stroke-[1.5]" /> : <ChevronDown className="w-4 h-4 stroke-[1.5]" />}
              </span>
            </button>

            {historyExpanded && (
              <div className="px-3.5 pb-2.5 pt-1.5 border-t border-[var(--border)] max-h-24 overflow-y-auto space-y-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[var(--ink)] opacity-65 text-[13px] tabular-nums"
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

      {/* Footer Credit on every main screen */}
      <footer className="w-full text-center text-[13px] text-[var(--ink)] opacity-65 py-2 shrink-0">
        Developed by Asim Nawaz
      </footer>

      {/* Modals */}
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

      {/* Solved Screen: WinModal with [x] close, only New Puzzle & Replay */}
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

      {/* Failed Screen: LossModal with [x] close, only New Puzzle & Replay */}
      <LossModal
        isOpen={isLost && !isResultDismissed}
        onClose={() => setIsResultDismissed(true)}
        movesCount={history.length}
        bestPossible={currentPuzzle?.solveResult.minMoves ?? 0}
        onRestart={handleRestart}
        onNewPuzzle={startNewPuzzle}
      />

      <ConfirmNewPuzzleModal
        isOpen={isConfirmNewPuzzleOpen}
        onConfirm={startNewPuzzle}
        onCancel={() => setIsConfirmNewPuzzleOpen(false)}
      />
    </div>
  );
}
