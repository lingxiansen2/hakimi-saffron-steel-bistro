[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/lingxiansen2/hakimi-saffron-steel-bistro/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/lingxiansen2/hakimi-saffron-steel-bistro/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Saffron & Steel: Bistro Rush

An original 2.5D French-Japanese fusion bistro cooking game built with zero external dependencies using pure static HTML5 Canvas, CSS, and modular ES modules.

## Gameplay & Features

- **5 Multi-Ingredient Fusion Dishes**:
  - **Classic Bistro Burger** (`Brioche Bun` + `Seared Wagyu` + `Chopped Greens`)
  - **Herb-Seared Wagyu** (`Seared Wagyu` + `Chopped Herb` + `Chopped Tomato`)
  - **Citrus Salmon Bowl** (`Seared Salmon` + `Chopped Greens` + `Chopped Tomato`)
  - **Tomato Basil Bruschetta** (`Brioche Bun` + `Chopped Tomato` + `Chopped Herb`)
  - **Surf & Turf Platter** (`Seared Wagyu` + `Seared Salmon` + `Chopped Herb`)
- **Tactical Parallel Cooking**: Juggle twin copper gas burners (pulling searing proteins off before they burn!) while chopping produce on dual butcher-block boards and batching plates on twin assembly counters.
- **Full Keyboard & Mouse Controls**:
  - **Keyboard**: `WASD` or Arrow keys to move, `Space` or `E` to pick up, chop, cook, assemble, or serve, `Q` or `Shift` for a quick chef dash, `M` to mute sound, `P` to pause.
  - **Mouse**: Click any station, counter, ingredient crate, or floor tile to auto-route via shortest path and interact seamlessly.
- **Combo & Rush System**: Serve matching orders consecutively within the combo window for escalating tip multipliers across 3 escalating bistro shifts (`Prep Service`, `Lunch Rush`, `Dinner Service`).
- **Procedural Web Audio SFX**: Crisp synthesized sizzles, knife chops, plating chimes, service bell dings, and combo flourishes with zero external audio files.

## Running Locally

```bash
node serve.ts --port 8080
```

Then open `http://localhost:8080/` in a desktop browser.

## Generating the Submission Output

```bash
MAKEFUN_OUTPUT_DIR=out node main.ts
```
