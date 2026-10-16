# [Play 1708 Game — Official Website](https://1708game.vercel.app/)

**1708** is a free mathematical number puzzle created by **Asim Nawaz**. Combine number tiles using a limited set of operations and reach exactly **1708** before you run out of legal moves or operation tokens.

**Play in your browser:** https://1708game.vercel.app/  
**How to play:** https://1708game.vercel.app/how-to-play-1708.html  
**About the creator and game:** https://1708game.vercel.app/about.html  
**Latest Windows release:** https://github.com/asimiox/1708/releases/latest

## Run 1708 on Windows with one command

You do not need to install a compiler or manually download/extract a ZIP. Open **PowerShell** on Windows with an internet connection, paste this command, and press Enter:

```powershell
curl.exe -fLsS https://github.com/asimiox/1708/releases/latest/download/1708.exe -o "$env:TEMP\1708.exe"; if ($LASTEXITCODE -eq 0) { & "$env:TEMP\1708.exe" }
```

This downloads the Windows executable from the latest GitHub release to your temporary folder and starts it. The first run requires an internet connection. Only run executables from a release you trust.

### Command Prompt (CMD)

On Windows versions that include `curl.exe`, open CMD and run:

```cmd
curl.exe -fLsS https://github.com/asimiox/1708/releases/latest/download/1708.exe -o "%TEMP%\1708.exe" && "%TEMP%\1708.exe"
```

### Download manually instead

If you prefer not to use a terminal command, open the [latest release](https://github.com/asimiox/1708/releases/latest), download `1708.exe`, and run it.

## Game modes

- **Daily** — a deterministic daily puzzle based on the UTC date.
- **Classic** — the fixed starting set with a generated operation-token budget.
- **Founder** — the Classic-style challenge with the Founder restriction.
- **Practice** — generated tiles and token budgets for replayable practice.

## Operations and core rules

The game uses addition, subtraction, multiplication, squaring, and self-power. Binary operations consume two selected tiles; unary operations consume one. A successful operation spends one token of that operation and creates a result tile. Reach a tile equal to 1708 to win.

The in-game rules and source implementation are authoritative; this README is a quick overview, not a replacement for the rules shown in the game.

## Development

This repository contains the web implementation built with React, TypeScript, and Vite.

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

### Build locally on Termux

Install Clang and compile:

```sh
pkg install clang
clang termux/1708.c -O2 -Wall -Wextra -o 1708
./1708
```

### Windows build from source

A GitHub Actions workflow builds the Windows executable. See the [Windows build workflow](https://github.com/asimiox/1708/actions/workflows/windows-build.yml). For local builds, install GCC (for example through MSYS2) and run:

```powershell
gcc termux/1708.c -std=c11 -O2 -Wall -Wextra -o 1708.exe
.\1708.exe
```

Before requesting official Termux packaging, compile and test the program on-device, then add packaging metadata and verify the native rules against the web implementation.

## Attribution

Created by **Asim Nawaz**. Product name: **1708**.
