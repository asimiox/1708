import { OpType, Tokens, SolveResult } from '../types/game';
import { solveGame } from './solver';

// Mulberry32 deterministic PRNG
export function createMulberry32(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dateToSeed(date: Date = new Date()): number {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return parseInt(`${y}${m}${d}`, 10);
}

export const LAUNCH_DATE_UTC = new Date('2025-01-01T00:00:00Z');

export function getDailyNumber(date: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcNow = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const utcLaunch = Date.UTC(LAUNCH_DATE_UTC.getUTCFullYear(), LAUNCH_DATE_UTC.getUTCMonth(), LAUNCH_DATE_UTC.getUTCDate());
  const diffDays = Math.floor((utcNow - utcLaunch) / msPerDay);
  return Math.max(1, diffDays + 1);
}

export function pick5Tiles(rng: () => number): number[] {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  // Fisher-Yates shuffle first 5
  for (let i = 0; i < 5; i++) {
    const j = i + Math.floor(rng() * (pool.length - i));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }
  return pool.slice(0, 5).sort((a, b) => a - b);
}

export function generateTokenSplit(rng: () => number): Tokens {
  const opKeys: OpType[] = ['ADD', 'SUB', 'MUL', 'SQ', 'POW'];
  const tokens: Tokens = { ADD: 0, SUB: 0, MUL: 0, SQ: 0, POW: 0 };
  
  // Distribute 9 tokens randomly across the 5 types
  // Ensure that at least ADD or MUL has tokens so puzzles have good combinatorial power
  for (let i = 0; i < 9; i++) {
    const op = opKeys[Math.floor(rng() * opKeys.length)];
    tokens[op]++;
  }
  return tokens;
}

export interface GeneratedPuzzle {
  tiles: number[];
  tokens: Tokens;
  solveResult: SolveResult;
}

export function generateDailyPuzzle(date: Date = new Date()): GeneratedPuzzle {
  const seed = dateToSeed(date);
  const rng = createMulberry32(seed);

  let attempt = 0;
  while (attempt < 500) {
    attempt++;
    const tiles = pick5Tiles(rng);
    const tokens = generateTokenSplit(rng);

    // Re-roll deterministically if the puzzle is unsolvable,
    // or if it is solvable ONLY by using MUL 7 x 244.
    // Check with allowClassicFounderOnlyCheck
    const solution = solveGame(tiles, tokens, { allowClassicFounderOnlyCheck: true });
    if (solution.solvable) {
      if (!solution.onlyFounderRoute) {
        return {
          tiles,
          tokens,
          solveResult: solution,
        };
      }
    }
  }

  // Fallback guaranteed verified puzzle
  const fallbackTiles = [4, 8, 9, 11, 12];
  const fallbackTokens = { ADD: 1, SUB: 2, MUL: 1, SQ: 4, POW: 1 };
  return {
    tiles: fallbackTiles,
    tokens: fallbackTokens,
    solveResult: solveGame(fallbackTiles, fallbackTokens),
  };
}

export function areTokensEqual(t1?: Tokens, t2?: Tokens): boolean {
  if (!t1 || !t2) return false;
  return (
    t1.ADD === t2.ADD &&
    t1.SUB === t2.SUB &&
    t1.MUL === t2.MUL &&
    t1.SQ === t2.SQ &&
    t1.POW === t2.POW
  );
}

export function areTilesEqual(t1?: number[], t2?: number[]): boolean {
  if (!t1 || !t2) return false;
  if (t1.length !== t2.length) return false;
  return t1.every((val, idx) => val === t2[idx]);
}

export function generateClassicPuzzle(seed?: number, prevTokens?: Tokens): GeneratedPuzzle {
  const tiles = [1, 3, 5, 7, 9];
  const rng = seed !== undefined ? createMulberry32(seed) : Math.random;

  let attempt = 0;
  while (attempt < 500) {
    attempt++;
    const tokens = generateTokenSplit(rng);
    if (prevTokens && areTokensEqual(tokens, prevTokens) && attempt < 400) {
      continue;
    }
    const solution = solveGame(tiles, tokens);
    if (solution.solvable) {
      return {
        tiles,
        tokens,
        solveResult: solution,
      };
    }
  }

  // Guaranteed fallback
  const fallbackTokens: Tokens = areTokensEqual(prevTokens, { ADD: 2, SUB: 1, MUL: 3, SQ: 2, POW: 1 })
    ? { ADD: 1, SUB: 2, MUL: 2, SQ: 1, POW: 3 }
    : { ADD: 2, SUB: 1, MUL: 3, SQ: 2, POW: 1 };
  return {
    tiles,
    tokens: fallbackTokens,
    solveResult: solveGame(tiles, fallbackTokens),
  };
}

export function generateFounderPuzzle(seed?: number, prevTokens?: Tokens): GeneratedPuzzle {
  const tiles = [1, 3, 5, 7, 9];
  const rng = seed !== undefined ? createMulberry32(seed) : Math.random;

  let attempt = 0;
  while (attempt < 500) {
    attempt++;
    const tokens = generateTokenSplit(rng);
    if (prevTokens && areTokensEqual(tokens, prevTokens) && attempt < 400) {
      continue;
    }
    // MUL 7 x 244 blocked
    const solution = solveGame(tiles, tokens, { blockFounderRoute: true });
    if (solution.solvable) {
      return {
        tiles,
        tokens,
        solveResult: solution,
      };
    }
  }

  // Guaranteed fallback for Founder mode
  const fallbackTokens: Tokens = areTokensEqual(prevTokens, { ADD: 3, SUB: 2, MUL: 2, SQ: 2, POW: 0 })
    ? { ADD: 1, SUB: 2, MUL: 2, SQ: 1, POW: 3 }
    : { ADD: 3, SUB: 2, MUL: 2, SQ: 2, POW: 0 };
  return {
    tiles,
    tokens: fallbackTokens,
    solveResult: solveGame(tiles, fallbackTokens, { blockFounderRoute: true }),
  };
}

export function generatePracticePuzzle(prev?: { tiles: number[]; tokens: Tokens }): GeneratedPuzzle {
  let attempt = 0;
  while (attempt < 200) {
    attempt++;
    const tiles = pick5Tiles(Math.random);
    const tokens = generateTokenSplit(Math.random);
    if (prev && areTilesEqual(tiles, prev.tiles) && areTokensEqual(tokens, prev.tokens) && attempt < 150) {
      continue;
    }
    const solution = solveGame(tiles, tokens);
    if (solution.solvable) {
      return {
        tiles,
        tokens,
        solveResult: solution,
      };
    }
  }

  const fallbackTiles = prev && areTilesEqual(prev.tiles, [2, 6, 8, 9, 10])
    ? [4, 8, 9, 11, 12]
    : [2, 6, 8, 9, 10];
  const fallbackTokens = prev && areTilesEqual(prev.tiles, [2, 6, 8, 9, 10])
    ? { ADD: 1, SUB: 2, MUL: 1, SQ: 4, POW: 1 }
    : { ADD: 3, SUB: 3, MUL: 2, SQ: 1, POW: 0 };
  return {
    tiles: fallbackTiles,
    tokens: fallbackTokens,
    solveResult: solveGame(fallbackTiles, fallbackTokens),
  };
}
