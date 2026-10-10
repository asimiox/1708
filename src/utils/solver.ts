import { OpType, Tokens, Move, SolveResult } from '../types/game';

export const TARGET = 1708;

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  result?: number;
}

export function validateMove(
  op: OpType,
  inputs: number[],
  blockFounderRoute: boolean = false
): ValidationResult {
  if (op === 'ADD') {
    if (inputs.length !== 2) return { valid: false, reason: 'ADD requires 2 tiles' };
    const [a, b] = inputs;
    if (a === 0 || b === 0) return { valid: false, reason: 'Addition with 0 is not allowed' };
    const res = a + b;
    if (res === a || res === b) return { valid: false, reason: 'Result cannot equal an input tile' };
    return { valid: true, result: res };
  }

  if (op === 'SUB') {
    if (inputs.length !== 2) return { valid: false, reason: 'SUB requires 2 tiles' };
    const [a, b] = inputs;
    if (a === b) return { valid: false, reason: 'Subtracting equal numbers gives 0 and is not allowed' };
    const res = Math.abs(a - b);
    if (res === a || res === b) return { valid: false, reason: 'Result cannot equal an input tile' };
    return { valid: true, result: res };
  }

  if (op === 'MUL') {
    if (inputs.length !== 2) return { valid: false, reason: 'MUL requires 2 tiles' };
    const [a, b] = inputs;
    if (a === 1 || b === 1) return { valid: false, reason: 'Multiplication by 1 is not allowed' };
    if (a === 0 || b === 0) return { valid: false, reason: 'Multiplication by 0 is not allowed' };
    if (blockFounderRoute && ((a === 7 && b === 244) || (a === 244 && b === 7))) {
      return { valid: false, reason: '7 × 244 is blocked in Founder Mode' };
    }
    const res = a * b;
    if (res === a || res === b) return { valid: false, reason: 'Result cannot equal an input tile' };
    return { valid: true, result: res };
  }

  if (op === 'SQ') {
    if (inputs.length !== 1) return { valid: false, reason: 'SQ requires 1 tile' };
    const a = inputs[0];
    if (a === 0 || a === 1) return { valid: false, reason: 'Square of 0 or 1 is not allowed' };
    const res = a * a;
    if (res === a) return { valid: false, reason: 'Result cannot equal an input tile' };
    return { valid: true, result: res };
  }

  if (op === 'POW') {
    if (inputs.length !== 1) return { valid: false, reason: 'POW requires 1 tile' };
    const a = inputs[0];
    if (a === 0 || a === 1) return { valid: false, reason: 'Power on 0 or 1 is not allowed' };
    if (a < 2 || a > 5) {
      return { valid: false, reason: 'Power (aᵃ) is only allowed for numbers 2 to 5' };
    }
    let res = 1;
    for (let i = 0; i < a; i++) res *= a;
    if (res === a) return { valid: false, reason: 'Result cannot equal an input tile' };
    return { valid: true, result: res };
  }

  return { valid: false, reason: 'Unknown operation' };
}

export function hasLegalMove(
  tiles: number[],
  tokens: Tokens,
  mode: string = 'classic'
): boolean {
  const blockFounderRoute = mode === 'founder';

  // SQ: 1 tile needed, count > 0
  if (tokens.SQ > 0 && tiles.length >= 1) {
    for (let i = 0; i < tiles.length; i++) {
      if (validateMove('SQ', [tiles[i]], blockFounderRoute).valid) {
        return true;
      }
    }
  }

  // POW: 1 tile needed, count > 0
  if (tokens.POW > 0 && tiles.length >= 1) {
    for (let i = 0; i < tiles.length; i++) {
      if (validateMove('POW', [tiles[i]], blockFounderRoute).valid) {
        return true;
      }
    }
  }

  // ADD: 2 tiles needed, count > 0
  if (tokens.ADD > 0 && tiles.length >= 2) {
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (validateMove('ADD', [tiles[i], tiles[j]], blockFounderRoute).valid) {
          return true;
        }
      }
    }
  }

  // SUB: 2 tiles needed, count > 0
  if (tokens.SUB > 0 && tiles.length >= 2) {
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (validateMove('SUB', [tiles[i], tiles[j]], blockFounderRoute).valid) {
          return true;
        }
      }
    }
  }

  // MUL: 2 tiles needed, count > 0
  if (tokens.MUL > 0 && tiles.length >= 2) {
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (validateMove('MUL', [tiles[i], tiles[j]], blockFounderRoute).valid) {
          return true;
        }
      }
    }
  }

  return false;
}

interface State {
  tiles: number[];
  tokens: Tokens;
  path: Move[];
}

function canonicalKey(tiles: number[], tokens: Tokens): string {
  // Sort tiles to canonical form
  const sortedTiles = [...tiles].sort((a, b) => a - b).join(',');
  return `${sortedTiles}|${tokens.ADD},${tokens.SUB},${tokens.MUL},${tokens.SQ},${tokens.POW}`;
}

export function solveGame(
  initialTiles: number[],
  initialTokens: Tokens,
  options: {
    blockFounderRoute?: boolean;
    maxNodes?: number;
    allowClassicFounderOnlyCheck?: boolean;
  } = {}
): SolveResult {
  const blockFounderRoute = options.blockFounderRoute ?? false;
  const maxNodes = options.maxNodes ?? 250000;

  if (initialTiles.includes(TARGET)) {
    return {
      solvable: true,
      minMoves: 0,
      path: [],
      usesClassicFounderRoute: false,
      onlyFounderRoute: false,
    };
  }

  // BFS / Iterative deepening to find minimum moves
  // Since max moves is at most sum of tokens (9), BFS level-by-level guarantees minimum moves!
  let queue: State[] = [
    {
      tiles: [...initialTiles],
      tokens: { ...initialTokens },
      path: [],
    },
  ];

  const visited = new Set<string>();
  visited.add(canonicalKey(initialTiles, initialTokens));

  let nodesVisited = 0;
  let winningPaths: Move[][] = [];
  let foundMinMoves = -1;

  while (queue.length > 0 && nodesVisited < maxNodes) {
    const nextQueue: State[] = [];

    for (const current of queue) {
      nodesVisited++;

      // If we already found solutions at a lower depth, we stop expanding
      if (foundMinMoves !== -1 && current.path.length >= foundMinMoves) {
        continue;
      }

      // Generate all possible valid next moves
      const { tiles, tokens, path } = current;

      // 1. Unary operations: SQ, POW
      const unaryOps: ('SQ' | 'POW')[] = [];
      if (tokens.SQ > 0) unaryOps.push('SQ');
      if (tokens.POW > 0) unaryOps.push('POW');

      for (const op of unaryOps) {
        // De-duplicate same tile values
        const seenVals = new Set<number>();
        for (let i = 0; i < tiles.length; i++) {
          const val = tiles[i];
          if (seenVals.has(val)) continue;
          seenVals.add(val);

          const validation = validateMove(op, [val], blockFounderRoute);
          if (!validation.valid || validation.result === undefined) continue;

          const res = validation.result;
          // Prune ridiculous numbers that cannot lead to 1708
          if (res > 35000 && res !== TARGET) continue;

          const newTiles = tiles.filter((_, idx) => idx !== i);
          newTiles.push(res);

          const newTokens: Tokens = {
            ...tokens,
            [op]: tokens[op] - 1,
          };

          const move: Move = { op, inputs: [val], result: res };
          const newPath = [...path, move];

          if (res === TARGET) {
            winningPaths.push(newPath);
            if (foundMinMoves === -1) {
              foundMinMoves = newPath.length;
            }
            if (!options.allowClassicFounderOnlyCheck) {
              // We just need the first shortest solution
              const isFounder = isFounderMove(move);
              return {
                solvable: true,
                minMoves: newPath.length,
                path: newPath,
                usesClassicFounderRoute: isFounder,
                onlyFounderRoute: false,
              };
            }
            continue;
          }

          const key = canonicalKey(newTiles, newTokens);
          if (!visited.has(key)) {
            visited.add(key);
            nextQueue.push({ tiles: newTiles, tokens: newTokens, path: newPath });
          }
        }
      }

      // 2. Binary operations: ADD, SUB, MUL
      const binaryOps: ('ADD' | 'SUB' | 'MUL')[] = [];
      if (tokens.ADD > 0) binaryOps.push('ADD');
      if (tokens.SUB > 0) binaryOps.push('SUB');
      if (tokens.MUL > 0) binaryOps.push('MUL');

      for (const op of binaryOps) {
        for (let i = 0; i < tiles.length; i++) {
          for (let j = i + 1; j < tiles.length; j++) {
            const a = tiles[i];
            const b = tiles[j];

            const validation = validateMove(op, [a, b], blockFounderRoute);
            if (!validation.valid || validation.result === undefined) continue;

            const res = validation.result;
            if (res > 35000 && res !== TARGET) continue;

            const newTiles = tiles.filter((_, idx) => idx !== i && idx !== j);
            newTiles.push(res);

            const newTokens: Tokens = {
              ...tokens,
              [op]: tokens[op] - 1,
            };

            const move: Move = { op, inputs: [a, b], result: res };
            const newPath = [...path, move];

            if (res === TARGET) {
              winningPaths.push(newPath);
              if (foundMinMoves === -1) {
                foundMinMoves = newPath.length;
              }
              if (!options.allowClassicFounderOnlyCheck) {
                const isFounder = isFounderMove(move);
                return {
                  solvable: true,
                  minMoves: newPath.length,
                  path: newPath,
                  usesClassicFounderRoute: isFounder,
                  onlyFounderRoute: false,
                };
              }
              continue;
            }

            const key = canonicalKey(newTiles, newTokens);
            if (!visited.has(key)) {
              visited.add(key);
              nextQueue.push({ tiles: newTiles, tokens: newTokens, path: newPath });
            }
          }
        }
      }
    }

    if (winningPaths.length > 0 && !options.allowClassicFounderOnlyCheck) {
      break;
    }

    queue = nextQueue;
  }

  if (winningPaths.length === 0) {
    return {
      solvable: false,
      minMoves: 0,
      path: [],
      usesClassicFounderRoute: false,
      onlyFounderRoute: false,
    };
  }

  // If we checked for whether it is solvable ONLY by using MUL 7 x 244
  const shortest = winningPaths[0];
  const allUseFounder = winningPaths.every(p => {
    const lastMove = p[p.length - 1];
    return isFounderMove(lastMove);
  });

  return {
    solvable: true,
    minMoves: shortest.length,
    path: shortest,
    usesClassicFounderRoute: isFounderMove(shortest[shortest.length - 1]),
    onlyFounderRoute: allUseFounder,
  };
}

export function isFounderMove(move: Move): boolean {
  if (move.op !== 'MUL') return false;
  const [a, b] = move.inputs;
  return (a === 7 && b === 244) || (a === 244 && b === 7);
}
