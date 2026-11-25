[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/lingxiansen2/hakimi-saffron-steel-bistro/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/lingxiansen2/hakimi-saffron-steel-bistro/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Saffron & Steel: Bistro Rush

An original 2.5D French-Japanese fusion bistro cooking game built with zero external dependencies using pure static HTML5 Canvas, CSS, and modular ES modules.

## Gameplay & Features

- **4 Specialized Kitchen Appliances**:
  - **Twin Copper Gas Stoves**: Sear Wagyu beef & salmon fillets with sweet-spot gauges and burn alerts.
  - **Simmering Cast-Iron Stockpot**: Simmer Dashi base into golden Saffron Broth.
  - **Wood-Fired Hearth Oven**: Bake Brioche Dough into golden crusty brioche.
  - **Twin Butcher Boards**: Chop tomatoes, greens, saffron herbs, and berries with instant slice feedback.
- **6 Signature Bistro Dishes + VIP Golden Critic Orders**:
  - **Classic Bistro Burger** (`Baked Brioche` + `Seared Wagyu` + `Crisp Greens`)
  - **Herb-Seared Wagyu** (`Seared Wagyu` + `Minced Herb` + `Sliced Tomato`)
  - **Citrus Salmon Bowl** (`Seared Salmon` + `Crisp Greens` + `Sliced Tomato`)
  - **Tomato Basil Bruschetta** (`Baked Brioche` + `Sliced Tomato` + `Minced Herb`)
  - **Saffron Salmon Ramen** (`Saffron Broth` + `Seared Salmon` + `Crisp Greens`)
  - **Warm Berry Tart** (`Baked Brioche` + `Glazed Berries` + `Minced Herb`)
  - **VIP Surf & Turf** (`Seared Wagyu` + `Seared Salmon` + `Saffron Broth`, golden critic ticket `+$320`)
- **Full Keyboard & Mouse Controls**:
  - **Keyboard**: `WASD` or Arrow keys to move, `Space` or `E` to pick up, chop, cook, assemble, stage, or serve, `Q` or `Shift` for a quick chef dash, `M` to mute sound, `P` to pause.
  - **Mouse**: Click any station, counter, crate, or floor tile to auto-route via shortest BFS path and interact automatically.
- **Combo Batching & Heated Serve Pass**: Stage finished plates under the glowing Serve Pass heat lamps or deliver directly to the Golden Bell to chain rapid combo multipliers across 3 escalating bistro shifts (`Prep Service`, `Lunch Rush`, `Dinner Service`).

## Running Locally

```bash
node serve.ts --port 8080
```

Then open `http://localhost:8080/` in a desktop browser.

## Generating the Submission Output

```bash
MAKEFUN_OUTPUT_DIR=out node main.ts
```
