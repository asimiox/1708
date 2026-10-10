export interface GameStats {
  dailyStreak: number;
  maxStreak: number;
  daysPlayed: number;
  lastDailyPlayedDate: string; // YYYY-MM-DD
  dailySolvedDates: string[];
  totalWins: number;
  totalGames: number;
  bestMoves: Record<string, number>; // mode -> min moves
}

const DEFAULT_STATS: GameStats = {
  dailyStreak: 0,
  maxStreak: 0,
  daysPlayed: 0,
  lastDailyPlayedDate: '',
  dailySolvedDates: [],
  totalWins: 0,
  totalGames: 0,
  bestMoves: {},
};

const STORAGE_KEY = '1708_game_stats_v1';

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveGameStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage might be unavailable or disabled
  }
}

export function recordWin(mode: string, movesCount: number, utcDateStr: string): GameStats {
  const current = loadGameStats();
  const updated: GameStats = {
    ...current,
    totalWins: current.totalWins + 1,
    totalGames: current.totalGames + 1,
    bestMoves: {
      ...current.bestMoves,
      [mode]: current.bestMoves[mode] ? Math.min(current.bestMoves[mode], movesCount) : movesCount,
    },
  };

  if (mode === 'daily') {
    if (!updated.dailySolvedDates.includes(utcDateStr)) {
      updated.dailySolvedDates.push(utcDateStr);
      updated.daysPlayed += 1;

      // Calculate streak
      const prevDate = new Date();
      prevDate.setUTCDate(prevDate.getUTCDate() - 1);
      const yesterdayStr = prevDate.toISOString().slice(0, 10);

      if (current.lastDailyPlayedDate === yesterdayStr) {
        updated.dailyStreak = current.dailyStreak + 1;
      } else if (current.lastDailyPlayedDate === utcDateStr) {
        // Same day, streak already counted
        updated.dailyStreak = current.dailyStreak;
      } else {
        // Missed a day or first game
        updated.dailyStreak = 1;
      }

      updated.maxStreak = Math.max(updated.maxStreak, updated.dailyStreak);
      updated.lastDailyPlayedDate = utcDateStr;
    }
  }

  saveGameStats(updated);
  return updated;
}
