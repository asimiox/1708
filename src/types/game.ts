export type OpType = 'ADD' | 'SUB' | 'MUL' | 'SQ' | 'POW';

export interface Tokens {
  ADD: number;
  SUB: number;
  MUL: number;
  SQ: number;
  POW: number;
}

export interface Move {
  op: OpType;
  inputs: number[];
  result: number;
}

export interface SolveResult {
  solvable: boolean;
  minMoves: number;
  path: Move[];
  usesClassicFounderRoute: boolean; // whether winning move is MUL 7 x 244
  onlyFounderRoute?: boolean;
}
