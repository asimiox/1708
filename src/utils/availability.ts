import { OpType, Tokens } from '../types/game';
import { validateMove } from './solver';

export interface ItemAvailability {
  available: boolean;
  reason?: string;
}

/**
 * Calculates whether a token is available based on remaining count,
 * current board tiles, selected tiles, and mode rules.
 */
export function getTokenAvailability(
  op: OpType,
  tiles: number[],
  tokens: Tokens,
  selectedTileIndices: number[],
  mode: string
): ItemAvailability {
  const blockFounder = mode === 'founder';

  // 1. Check remaining token count
  if (tokens[op] <= 0) {
    return { available: false, reason: `No [${op}] tokens remaining` };
  }

  const isUnary = op === 'SQ' || op === 'POW';
  const selCount = selectedTileIndices.length;

  // Nothing selected yet: token is available if there exists at least one legal move with the tiles on the board
  if (selCount === 0) {
    if (isUnary) {
      if (tiles.length === 0) {
        return { available: false, reason: `[${op}] requires at least 1 tile` };
      }
      for (let i = 0; i < tiles.length; i++) {
        if (validateMove(op, [tiles[i]], blockFounder).valid) {
          return { available: true };
        }
      }
      return {
        available: false,
        reason: op === 'POW' ? 'POW works only on tiles 2 to 5' : 'SQ not allowed on 0 or 1',
      };
    } else {
      // Binary op: ADD, SUB, MUL
      if (tiles.length < 2) {
        return { available: false, reason: `[${op}] requires at least 2 tiles` };
      }
      for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
          if (validateMove(op, [tiles[i], tiles[j]], blockFounder).valid) {
            return { available: true };
          }
        }
      }
      return { available: false, reason: `No legal [${op}] move possible with current tiles` };
    }
  }

  // 1 tile selected first
  if (selCount === 1) {
    const tileVal = tiles[selectedTileIndices[0]];
    if (isUnary) {
      const v = validateMove(op, [tileVal], blockFounder);
      return { available: v.valid, reason: v.reason };
    } else {
      // Binary op: available only if at least one legal partner tile exists
      if (tiles.length < 2) {
        return { available: false, reason: `[${op}] requires a second tile` };
      }
      const selIdx = selectedTileIndices[0];
      let lastReason = '';
      for (let j = 0; j < tiles.length; j++) {
        if (j === selIdx) continue;
        const v = validateMove(op, [tileVal, tiles[j]], blockFounder);
        if (v.valid) {
          return { available: true };
        }
        lastReason = v.reason || '';
      }
      return {
        available: false,
        reason: lastReason || `No partner tile allows a legal [${op}] with ${tileVal}`,
      };
    }
  }

  // 2 tiles selected first
  if (selCount === 2) {
    if (isUnary) {
      return { available: false, reason: `[${op}] takes only 1 tile, but 2 are selected` };
    }
    const valA = tiles[selectedTileIndices[0]];
    const valB = tiles[selectedTileIndices[1]];
    const v = validateMove(op, [valA, valB], blockFounder);
    return { available: v.valid, reason: v.reason };
  }

  return { available: false, reason: 'Invalid selection' };
}

/**
 * Calculates whether a tile is available based on currently selected token,
 * currently selected tiles, and mode rules.
 */
export function getTileAvailability(
  tileIndex: number,
  tiles: number[],
  tokens: Tokens,
  selectedOp: OpType | null,
  selectedTileIndices: number[],
  mode: string
): ItemAvailability {
  const blockFounder = mode === 'founder';
  const tileVal = tiles[tileIndex];
  const isSelected = selectedTileIndices.includes(tileIndex);

  // If tile is already selected, it is always clickable to deselect
  if (isSelected) {
    return { available: true };
  }

  // Case A: No operation selected yet
  if (!selectedOp) {
    // 0 tiles selected: all tiles are normal/available
    if (selectedTileIndices.length === 0) {
      return { available: true };
    }

    // 1 tile already selected: can this tile pair with it?
    if (selectedTileIndices.length === 1) {
      const firstVal = tiles[selectedTileIndices[0]];
      const binaryOps: OpType[] = ['ADD', 'SUB', 'MUL'];
      let anyPossible = false;
      let reason = '';

      for (const op of binaryOps) {
        if (tokens[op] > 0) {
          const v = validateMove(op, [firstVal, tileVal], blockFounder);
          if (v.valid) {
            anyPossible = true;
            break;
          }
          reason = v.reason || reason;
        }
      }

      if (anyPossible) {
        return { available: true };
      }
      return {
        available: false,
        reason: reason || `Cannot combine ${firstVal} and ${tileVal} with any available token`,
      };
    }

    // 2 tiles already selected: cannot pick a 3rd tile
    return { available: false, reason: '2 tiles already selected. Pick an operation or tap Clear' };
  }

  // Case B: An operation IS selected
  const isUnary = selectedOp === 'SQ' || selectedOp === 'POW';

  if (isUnary) {
    if (selectedTileIndices.length >= 1) {
      return { available: false, reason: `[${selectedOp}] takes only 1 tile` };
    }
    const v = validateMove(selectedOp, [tileVal], blockFounder);
    return { available: v.valid, reason: v.reason };
  } else {
    // Binary op: ADD, SUB, MUL
    if (selectedTileIndices.length === 0) {
      // Must have at least one legal partner tile among the other tiles
      let anyPartner = false;
      let lastReason = '';
      for (let j = 0; j < tiles.length; j++) {
        if (j === tileIndex) continue;
        const v = validateMove(selectedOp, [tileVal, tiles[j]], blockFounder);
        if (v.valid) {
          anyPartner = true;
          break;
        }
        lastReason = v.reason || '';
      }
      return {
        available: anyPartner,
        reason: anyPartner ? undefined : lastReason || `Cannot use tile ${tileVal} with [${selectedOp}]`,
      };
    }

    if (selectedTileIndices.length === 1) {
      const firstVal = tiles[selectedTileIndices[0]];
      const v = validateMove(selectedOp, [firstVal, tileVal], blockFounder);
      return { available: v.valid, reason: v.reason };
    }

    return { available: false, reason: `[${selectedOp}] takes only 2 tiles` };
  }
}
