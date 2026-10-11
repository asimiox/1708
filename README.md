# [Play 1708 Game — Official Website](https://1708game.vercel.app/)

**1708 Game** is a free mathematical number puzzle created by **Asim Nawaz**. Combine number tiles using a limited set of operations and reach exactly **1708** before you run out of legal moves or operation tokens.

**Play the game:** https://1708game.vercel.app/  
**How to play:** https://1708game.vercel.app/how-to-play-1708.html  
**About the creator and game:** https://1708game.vercel.app/about.html

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

An initial terminal-native C port is available at [`termux/1708.c`](termux/1708.c). It supports Classic, Founder, and Practice starting boards, the five operations, token spending, and win/loss checks. It is **not yet feature-parity verified**: Daily mode, solvability-aware puzzle generation, and a native regression test suite are not implemented. Treat it as an initial port, not a verified replacement for the web game.

Build on Termux with Clang:

```sh
pkg install clang
gcc --version # optional compiler check; Termux normally provides clang
clang termux/1708.c -O2 -Wall -Wextra -o 1708
./1708
```

Before requesting official Termux packaging, compile and test the program on-device, then add packaging metadata and verify the native rules against the web implementation.

## Attribution

Created by **Asim Nawaz**. Product name: **1708**.
