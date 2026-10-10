import test from 'node:test';
import assert from 'node:assert/strict';

import { validateMove, hasLegalMove, solveGame, TARGET } from '../src/utils/solver';
import {
  createMulberry32,
  dateToSeed,
  generateTokenSplit,
  generateDailyPuzzle,
  generateClassicPuzzle,
  generateFounderPuzzle,
  generatePracticePuzzle,
} from '../src/utils/generator';
import type { Tokens } from '../src/types/game';

const emptyTokens = (): Tokens => ({ ADD: 0, SUB: 0, MUL: 0, SQ: 0, POW: 0 });

test('target remains 1708', () => {
  assert.equal(TARGET, 1708);
});

test('addition accepts two non-zero tiles and returns their sum', () => {
  assert.deepEqual(validateMove('ADD', [2, 3]), { valid: true, result: 5 });
  assert.equal(validateMove('ADD', [0, 3]).valid, false);
  assert.equal(validateMove('ADD', [2]).valid, false);
});

test('subtraction returns the absolute difference and rejects equal tiles', () => {
  assert.deepEqual(validateMove('SUB', [9, 4]), { valid: true, result: 5 });
  assert.equal(validateMove('SUB', [4, 4]).valid, false);
});

test('multiplication rejects zero and one, and Founder blocks 7 × 244', () => {
  assert.deepEqual(validateMove('MUL', [7, 244]), { valid: true, result: TARGET });
  assert.equal(validateMove('MUL', [1, 8]).valid, false);
  assert.equal(validateMove('MUL', [0, 8]).valid, false);
  assert.equal(validateMove('MUL', [7, 244], true).valid, false);
  assert.deepEqual(validateMove('MUL', [244, 7], true).valid, false);
});

test('squaring rejects zero and one', () => {
  assert.deepEqual(validateMove('SQ', [4]), { valid: true, result: 16 });
  assert.equal(validateMove('SQ', [0]).valid, false);
  assert.equal(validateMove('SQ', [1]).valid, false);
  assert.equal(validateMove('SQ', [4, 5]).valid, false);
});

test('self-power only accepts bases from 2 through 5', () => {
  assert.deepEqual(validateMove('POW', [3]), { valid: true, result: 27 });
  assert.deepEqual(validateMove('POW', [5]), { valid: true, result: 3125 });
  for (const value of [0, 1, 6, 7]) {
    assert.equal(validateMove('POW', [value]).valid, false);
  }
});

test('winning move is found and Founder restriction is respected by the solver', () => {
  const tokens = { ...emptyTokens(), MUL: 1 };
  const normal = solveGame([7, 244], tokens);
  assert.equal(normal.solvable, true);
  assert.equal(normal.path.at(-1)?.result, TARGET);

  const founder = solveGame([7, 244], tokens, { blockFounderRoute: true });
  assert.equal(founder.solvable, false);
});

test('legal-move detection respects available tokens', () => {
  assert.equal(hasLegalMove([2, 3], emptyTokens()), false);
  assert.equal(hasLegalMove([2, 3], { ...emptyTokens(), ADD: 1 }), true);
  assert.equal(hasLegalMove([1], { ...emptyTokens(), SQ: 1 }), false);
});

test('daily date seed is based on UTC calendar date', () => {
  assert.equal(dateToSeed(new Date('2026-10-09T00:30:00Z')), 20261009);
  assert.equal(dateToSeed(new Date('2026-10-09T23:59:59Z')), 20261009);
});

test('Mulberry32 and token splitting are deterministic for a fixed seed', () => {
  const a = createMulberry32(1708);
  const b = createMulberry32(1708);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);

  const splitA = generateTokenSplit(createMulberry32(1708));
  const splitB = generateTokenSplit(createMulberry32(1708));
  assert.deepEqual(splitA, splitB);
  assert.equal(Object.values(splitA).reduce((sum, count) => sum + count, 0), 9);
});

test('all puzzle generators return five tiles, nine tokens, and a solver-confirmed solution', () => {
  const puzzles = [
    generateDailyPuzzle(new Date('2026-10-09T12:00:00Z')),
    generateClassicPuzzle(1708),
    generateFounderPuzzle(1708),
    generatePracticePuzzle(),
  ];

  for (const puzzle of puzzles) {
    assert.equal(puzzle.tiles.length, 5);
    assert.equal(new Set(puzzle.tiles).size, 5);
    assert.equal(puzzle.tokens.ADD + puzzle.tokens.SUB + puzzle.tokens.MUL + puzzle.tokens.SQ + puzzle.tokens.POW, 9);
    assert.equal(puzzle.solveResult.solvable, true);
    assert.ok(puzzle.solveResult.path.length <= 9);
  }

  assert.deepEqual(puzzles[1].tiles, [1, 3, 5, 7, 9]);
  assert.deepEqual(puzzles[2].tiles, [1, 3, 5, 7, 9]);
  assert.ok(puzzles[2].solveResult.path.every(move =>
    !(move.op === 'MUL' &&
      ((move.inputs[0] === 7 && move.inputs[1] === 244) ||
       (move.inputs[0] === 244 && move.inputs[1] === 7)))
  ));
});
