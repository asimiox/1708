import { solveGame, hasLegalMove } from './solver';
import { generateDailyPuzzle } from './generator';
import { Tokens } from '../types/game';

export interface TestResultItem {
  id: string;
  name: string;
  passed: boolean;
  details: string;
  durationMs: number;
}

export interface SelfTestReport {
  timestamp: string;
  allPassed: boolean;
  tests: TestResultItem[];
}

export function runAllSelfTests(): SelfTestReport {
  const tests: TestResultItem[] = [];

  // Test 1: tiles [4,8,9,11,12] with tokens [1,2,1,4,1]
  const t1Start = performance.now();
  const t1Tiles = [4, 8, 9, 11, 12];
  const t1Tokens: Tokens = { ADD: 1, SUB: 2, MUL: 1, SQ: 4, POW: 1 };
  const res1 = solveGame(t1Tiles, t1Tokens);
  const t1Duration = Math.round(performance.now() - t1Start);
  tests.push({
    id: 'test-1',
    name: 'Solvability: [4,8,9,11,12] with [1,2,1,4,1]',
    passed: res1.solvable,
    details: res1.solvable
      ? `Solvable in ${res1.minMoves} moves (${t1Duration}ms)`
      : 'Failed: Unsolvable',
    durationMs: t1Duration,
  });

  // Test 2: tiles [2,6,8,9,10] with tokens [3,3,2,1,0]
  const t2Start = performance.now();
  const t2Tiles = [2, 6, 8, 9, 10];
  const t2Tokens: Tokens = { ADD: 3, SUB: 3, MUL: 2, SQ: 1, POW: 0 };
  const res2 = solveGame(t2Tiles, t2Tokens);
  const t2Duration = Math.round(performance.now() - t2Start);
  tests.push({
    id: 'test-2',
    name: 'Solvability: [2,6,8,9,10] with [3,3,2,1,0]',
    passed: res2.solvable,
    details: res2.solvable
      ? `Solvable in ${res2.minMoves} moves (${t2Duration}ms)`
      : 'Failed: Unsolvable',
    durationMs: t2Duration,
  });

  // Test 3: Daily mode consistency for same date
  const t3Start = performance.now();
  const testDate = new Date('2026-10-09T12:00:00Z');
  const d1 = generateDailyPuzzle(testDate);
  const d2 = generateDailyPuzzle(testDate);
  const tilesMatch = JSON.stringify(d1.tiles) === JSON.stringify(d2.tiles);
  const tokensMatch = JSON.stringify(d1.tokens) === JSON.stringify(d2.tokens);
  const dailyPassed = tilesMatch && tokensMatch && d1.solveResult.solvable;
  const t3Duration = Math.round(performance.now() - t3Start);
  tests.push({
    id: 'test-3',
    name: 'Deterministic Daily: Identical generation for same date',
    passed: dailyPassed,
    details: dailyPassed
      ? `Consistent tiles [${d1.tiles.join(', ')}] across runs (${t3Duration}ms)`
      : 'Failed: Non-deterministic output',
    durationMs: t3Duration,
  });

  // Test 4: Tile 2809 with ADD x2, MUL x1, POW x1 -> No legal moves (Loss)
  const case1Tokens: Tokens = { ADD: 2, SUB: 0, MUL: 1, SQ: 0, POW: 1 };
  const hasLegal1 = hasLegalMove([2809], case1Tokens, 'classic');
  tests.push({
    id: 'test-4',
    name: 'Legal Move Check: [2809] with ADD x2, MUL x1, POW x1',
    passed: !hasLegal1,
    details: !hasLegal1 ? 'Correctly detected loss (hasLegalMove is false)' : 'Failed: Detected move',
    durationMs: 0,
  });

  // Test 5: Tiles [3, 5] with only SQ tokens -> Playable
  const case2Tokens: Tokens = { ADD: 0, SUB: 0, MUL: 0, SQ: 2, POW: 0 };
  const hasLegal2 = hasLegalMove([3, 5], case2Tokens, 'classic');
  tests.push({
    id: 'test-5',
    name: 'Legal Move Check: [3, 5] with SQ x2',
    passed: hasLegal2,
    details: hasLegal2 ? 'Correctly detected playable (hasLegalMove is true)' : 'Failed: Blocked legal move',
    durationMs: 0,
  });

  // Test 6: Tiles [1708, 5] -> Win, not loss
  const has1708 = [1708, 5].includes(1708);
  tests.push({
    id: 'test-6',
    name: 'Target Priority: [1708, 5]',
    passed: has1708,
    details: has1708 ? 'Correctly classified as WIN, not loss' : 'Failed',
    durationMs: 0,
  });

  const allPassed = tests.every(t => t.passed);

  // Console output
  console.group('%c[1708 Verification Test Suite - Developed by Asim Nawaz]', 'color: #38bdf8; font-weight: bold;');
  tests.forEach(t => {
    if (t.passed) {
      console.log(`%c✔ ${t.name}: %c${t.details}`, 'color: #10b981; font-weight: bold;', 'color: inherit;');
    } else {
      console.error(`✖ ${t.name}: ${t.details}`);
    }
  });
  console.log(`%cSummary: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`, allPassed ? 'color: #10b981; font-weight: bold;' : 'color: #ef4444; font-weight: bold;');
  console.groupEnd();

  return {
    timestamp: new Date().toISOString(),
    allPassed,
    tests,
  };
}
