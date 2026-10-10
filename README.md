# 1708

**1708** is a number puzzle game by Asim Nawaz. Combine number tiles using a limited set of operations and reach exactly **1708** before you run out of legal moves or operation tokens.

Play online: https://1708game.vercel.app/

## Game modes

- **Daily** — a deterministic daily puzzle based on the UTC date.
- **Classic** — the fixed starting set with a generated operation-token budget.
- **Founder** — the Classic-style challenge with the Founder restriction.
- **Practice** — generated tiles and token budgets for replayable practice.

## Operations and core rules

The game uses addition, subtraction, multiplication, squaring, and self-power. Binary operations consume two selected tiles; unary operations consume one. A successful operation spends one token of that operation and creates a result tile. Reach a tile equal to 1708 to win.

The in-game rules and source implementation are authoritative; this README is a quick overview, not a replacement for the rules shown in the game.

## Development

This repository currently contains the web implementation built with React, TypeScript, and Vite.

Install dependencies and run locally:

```bash
npm install
npm run dev
```

Build the production site:

```bash
npm run build
```

Type-check:

```bash
npm run lint
```

## Native port status

A native C/Termux port is a separate workstream. Do not assume that the native port is implemented or feature-parity verified based only on this web repository. Before replacing an existing native build, compare every mode, token rule, legality check, puzzle generator, and win/loss condition against the web source and run a parity test suite.

## Attribution

Created by **Asim Nawaz**. Product name: **1708**.
