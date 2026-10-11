export interface LevelRecord {
  level: number;
  moves: number;
  solvedAt: string;
}

export interface GameStats {
  // Campaign Progression (Levels 1 to n)
  currentLevel: number;
  maxLevelCompleted: number;
  levelRecords: Record<number, LevelRecord>;

  // Real-time Games & Performance
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalMoves: number;

  // Real-time Streaks
  dailyStreak: number;
  maxStreak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  playedDates: string[];

  // Personal Bests (min moves by mode)
  bestMoves: Record<string, number>;
}

export const DEFAULT_STATS: GameStats = {
  currentLevel: 1,
  maxLevelCompleted: 0,
  levelRecords: {},
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalMoves: 0,
  dailyStreak: 0,
  maxStreak: 0,
  lastPlayedDate: '',
  playedDates: [],
  bestMoves: {},
};

const STORAGE_KEY = '1708_game_stats_v2';
const LEGACY_STORAGE_KEY = '1708_game_stats_v1';

export function getLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayDateStr(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return getLocalDateStr(d);
}

export function loadGameStats(): GameStats {
  if (typeof window === 'undefined') return { ...DEFAULT_STATS };

  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    
    // Attempt migration from v1 if v2 doesn't exist
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        const migrated: GameStats = {
          ...DEFAULT_STATS,
          currentLevel: 1,
          maxLevelCompleted: 0,
          totalGames: Number(legacy.totalGames) || 0,
          totalWins: Number(legacy.totalWins) || 0,
          dailyStreak: Number(legacy.dailyStreak) || 0,
          maxStreak: Number(legacy.maxStreak) || Number(legacy.dailyStreak) || 0,
          lastPlayedDate: legacy.lastDailyPlayedDate || '',
          playedDates: Array.isArray(legacy.dailySolvedDates) ? legacy.dailySolvedDates : [],
          bestMoves: legacy.bestMoves || {},
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return checkStreakExpiry(migrated);
      }
      return { ...DEFAULT_STATS };
    }

    const parsed = JSON.parse(raw);
    const stats: GameStats = {
      ...DEFAULT_STATS,
      ...parsed,
      currentLevel: Math.max(1, Number(parsed.currentLevel) || 1),
      maxLevelCompleted: Math.max(0, Number(parsed.maxLevelCompleted) || 0),
      levelRecords: parsed.levelRecords || {},
      totalGames: Math.max(0, Number(parsed.totalGames) || 0),
      totalWins: Math.max(0, Number(parsed.totalWins) || 0),
      totalLosses: Math.max(0, Number(parsed.totalLosses) || 0),
      totalMoves: Math.max(0, Number(parsed.totalMoves) || 0),
      dailyStreak: Math.max(0, Number(parsed.dailyStreak) || 0),
      maxStreak: Math.max(0, Number(parsed.maxStreak) || 0),
      playedDates: Array.isArray(parsed.playedDates) ? parsed.playedDates : [],
      bestMoves: parsed.bestMoves || {},
    };

    return checkStreakExpiry(stats);
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function checkStreakExpiry(stats: GameStats): GameStats {
  if (!stats.lastPlayedDate) return stats;

  const today = getLocalDateStr();
  const yesterday = getYesterdayDateStr();

  // If last played was before yesterday, the active streak has lapsed
  if (stats.lastPlayedDate !== today && stats.lastPlayedDate !== yesterday) {
    stats.dailyStreak = 0;
  }
  return stats;
}

export function saveGameStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Real-time event: Player starts/makes first move on a puzzle
 */
export function recordGameStart(): GameStats {
  const current = loadGameStats();
  const today = getLocalDateStr();

  const updated: GameStats = {
    ...current,
    totalGames: current.totalGames + 1,
    playedDates: current.playedDates.includes(today) ? current.playedDates : [...current.playedDates, today],
  };

  saveGameStats(updated);
  return updated;
}

/**
 * Real-time event: Player makes a move
 */
export function recordMoveMade(): GameStats {
  const current = loadGameStats();
  const updated: GameStats = {
    ...current,
    totalMoves: current.totalMoves + 1,
  };
  saveGameStats(updated);
  return updated;
}

/**
 * Real-time event: Player wins a puzzle
 */
export function recordWin(
  mode: string,
  level: number,
  movesCount: number
): { stats: GameStats; advancedLevel: boolean } {
  const current = loadGameStats();
  const today = getLocalDateStr();
  const yesterday = getYesterdayDateStr();

  let newDailyStreak = current.dailyStreak;
  if (current.lastPlayedDate === today) {
    // Already played today, preserve current streak
    newDailyStreak = Math.max(1, current.dailyStreak);
  } else if (current.lastPlayedDate === yesterday) {
    // Consecutive day!
    newDailyStreak = current.dailyStreak + 1;
  } else {
    // New streak
    newDailyStreak = 1;
  }

  const newMaxStreak = Math.max(current.maxStreak, newDailyStreak);

  // Check level advancement
  let newCurrentLevel = current.currentLevel;
  let newMaxLevelCompleted = current.maxLevelCompleted;
  let advancedLevel = false;

  const newLevelRecords = { ...current.levelRecords };

  if (mode === 'level') {
    newLevelRecords[level] = {
      level,
      moves: movesCount,
      solvedAt: new Date().toISOString(),
    };
    newMaxLevelCompleted = Math.max(current.maxLevelCompleted, level);
    // Always advance to next level!
    newCurrentLevel = level + 1;
    advancedLevel = true;
  }

  // Update best moves
  const modeKey = mode === 'level' ? `level_${level}` : mode;
  const currentBest = current.bestMoves[modeKey];
  const newBestMoves = {
    ...current.bestMoves,
    [modeKey]: currentBest ? Math.min(currentBest, movesCount) : movesCount,
  };

  const updated: GameStats = {
    ...current,
    currentLevel: newCurrentLevel,
    maxLevelCompleted: newMaxLevelCompleted,
    levelRecords: newLevelRecords,
    totalWins: current.totalWins + 1,
    dailyStreak: newDailyStreak,
    maxStreak: newMaxStreak,
    lastPlayedDate: today,
    playedDates: current.playedDates.includes(today) ? current.playedDates : [...current.playedDates, today],
    bestMoves: newBestMoves,
  };

  saveGameStats(updated);
  return { stats: updated, advancedLevel };
}

/**
 * Real-time event: Player loses a puzzle (no moves left)
 */
export function recordLoss(): GameStats {
  const current = loadGameStats();
  const updated: GameStats = {
    ...current,
    totalLosses: current.totalLosses + 1,
  };
  saveGameStats(updated);
  return updated;
}
