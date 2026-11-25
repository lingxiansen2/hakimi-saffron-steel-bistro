import {
  BAKE_BURN_DURATION,
  BAKE_DURATION,
  CHOP_DURATION,
  GRID_COLS,
  GRID_ORIGIN_X,
  GRID_ORIGIN_Y,
  GRID_ROWS,
  SEAR_BURN_DURATION,
  SEAR_DURATION,
  SIMMER_DURATION,
  TILE_H,
  TILE_W,
} from './config.js';
import {
  BAKE_RESULTS,
  CHOP_RESULTS,
  INGREDIENTS,
  RECIPE_BY_ID,
  SEAR_RESULTS,
  SIMMER_RESULTS,
  canAcceptIngredient,
  canBakeItem,
  canChopItem,
  canSearItem,
  canSimmerItem,
  isReadyIngredient,
  matchCompleteRecipe,
} from './recipes.js';

export function buildKitchenGrid() {
  const stations = new Map();
  const put = (col, row, station) => {
    stations.set(`${col},${row}`, {
      col,
      row,
      item: null,
      progress: 0,
      burned: false,
      assemblyItems: [],
      completedRecipeId: null,
      pulse: 0,
      ...station,
    });
  };

  /* Row 0: Proteins, Twin Copper Stoves, Stockpot, Butcher Boards & Produce */
  put(0, 0, { kind: 'counter', label: 'COPPER POTS', decor: 'copper_pots' });
  put(1, 0, { kind: 'crate', itemType: 'steak', label: 'WAGYU' });
  put(2, 0, { kind: 'crate', itemType: 'salmon', label: 'SALMON' });
  put(3, 0, { kind: 'stove', label: 'STOVE 1', burnerIndex: 1 });
  put(4, 0, { kind: 'stove', label: 'STOVE 2', burnerIndex: 2 });
  put(5, 0, { kind: 'stockpot', label: 'STOCKPOT' });
  put(6, 0, { kind: 'chop', label: 'BOARD 1' });
  put(7, 0, { kind: 'chop', label: 'BOARD 2' });
  put(8, 0, { kind: 'crate', itemType: 'tomato', label: 'TOMATO' });
  put(9, 0, { kind: 'crate', itemType: 'greens', label: 'GREENS' });
  put(10, 0, { kind: 'crate', itemType: 'herb', label: 'HERB' });

  /* Row 1: Bakery Dough & Stacked Porcelain Plates */
  put(0, 1, { kind: 'crate', itemType: 'dough', label: 'DOUGH' });
  put(10, 1, { kind: 'counter', label: 'PLATES', decor: 'plates' });

  /* Row 2: Dashi Crate, Central Marble Assembly Islands & Heated Serve Pass */
  put(0, 2, { kind: 'crate', itemType: 'dashi', label: 'DASHI' });
  put(3, 2, { kind: 'counter', label: 'HERB PREP', decor: 'spice' });
  put(4, 2, { kind: 'assembly', label: 'ASSEMBLE A' });
  put(5, 2, { kind: 'counter', label: 'OIL & SALT', decor: 'oil' });
  put(6, 2, { kind: 'assembly', label: 'ASSEMBLE B' });
  put(7, 2, { kind: 'counter', label: 'PREP PASS', decor: 'rosemary' });
  put(10, 2, { kind: 'pass', label: 'SERVE PASS' });

  /* Row 3: Berry Crate & Golden Service Bell */
  put(0, 3, { kind: 'crate', itemType: 'berry', label: 'BERRIES' });
  put(10, 3, { kind: 'serve', label: 'RING BELL', hasBell: true });

  /* Row 4: Compost & Potted Herbs */
  put(0, 4, { kind: 'trash', label: 'COMPOST' });
  put(10, 4, { kind: 'counter', label: 'GARNISH', decor: 'rosemary' });

  /* Row 5: Wood-Fired Hearth Oven, Stove 3, Board 3 & Lower Crates */
  put(0, 5, { kind: 'counter', label: 'CELLAR', decor: 'oil' });
  put(1, 5, { kind: 'crate', itemType: 'dough', label: 'DOUGH' });
  put(2, 5, { kind: 'oven', label: 'HEARTH OVEN' });
  put(3, 5, { kind: 'stove', label: 'STOVE 3', burnerIndex: 3 });
  put(4, 5, { kind: 'counter', label: 'PREP', decor: 'copper_pots' });
  put(5, 5, { kind: 'chop', label: 'BOARD 3' });
  put(6, 5, { kind: 'counter', label: 'PLATES', decor: 'plates' });
  put(7, 5, { kind: 'crate', itemType: 'tomato', label: 'TOMATO' });
  put(8, 5, { kind: 'crate', itemType: 'greens', label: 'GREENS' });
  put(9, 5, { kind: 'crate', itemType: 'herb', label: 'HERB' });
  put(10, 5, { kind: 'trash', label: 'COMPOST' });

  return { cols: GRID_COLS, rows: GRID_ROWS, stations };
}

export function stepKitchenStations(kitchen, chefsOrChef, dt, events, modifiers = {}) {
  const chefs = Array.isArray(chefsOrChef) ? chefsOrChef : [chefsOrChef];
  const chefTiles = chefs.map((c) => pxToTile(c.x, c.y));
  const chopMult = modifiers.chopSpeedMult || 1.0;
  const cookMult = modifiers.cookSpeedMult || 1.0;

  for (const st of kitchen.stations.values()) {
    if (st.pulse > 0) st.pulse = Math.max(0, st.pulse - dt * 2.5);

    if (st.kind === 'chop' && st.item && canChopItem(st.item)) {
      const hasAdjacentChef = chefTiles.some(
        (t) => Math.abs(t.col - st.col) + Math.abs(t.row - st.row) <= 1,
      );
      if (hasAdjacentChef) {
        const prev = st.progress;
        st.progress += (dt * chopMult) / CHOP_DURATION;
        if (Math.floor(prev * 4) < Math.floor(st.progress * 4)) {
          events.push({ type: 'chop_tick', col: st.col, row: st.row, item: st.item });
        }
        if (st.progress >= 1) {
          st.item = CHOP_RESULTS[st.item];
          st.progress = 0;
          st.pulse = 1;
          events.push({ type: 'chop_done', col: st.col, row: st.row, item: st.item });
        }
      }
    }

    if (st.kind === 'stove' && st.item) {
      if (canSearItem(st.item)) {
        st.progress += dt * cookMult;
        if (Math.random() < dt * 5.5) events.push({ type: 'sizzle', col: st.col, row: st.row, hot: false });
        if (st.progress >= SEAR_DURATION) {
          st.item = SEAR_RESULTS[st.item];
          st.progress = SEAR_DURATION;
          st.pulse = 1;
          events.push({ type: 'sear_ready', col: st.col, row: st.row, item: st.item });
        }
      } else if (st.item === 'seared_steak' || st.item === 'seared_salmon') {
        st.progress += dt;
        const warning = st.progress > SEAR_BURN_DURATION - 2.2;
        if (Math.random() < dt * (warning ? 9 : 4.5)) {
          events.push({ type: 'sizzle', col: st.col, row: st.row, hot: warning });
        }
        if (st.progress >= SEAR_BURN_DURATION) {
          st.item = 'burned';
          st.burned = true;
          st.progress = 0;
          st.pulse = 1;
          events.push({ type: 'burned', col: st.col, row: st.row });
        }
      }
    }

    if (st.kind === 'stockpot' && st.item) {
      if (canSimmerItem(st.item)) {
        st.progress += dt * cookMult;
        if (Math.random() < dt * 4.5) events.push({ type: 'sizzle', col: st.col, row: st.row, hot: false });
        if (st.progress >= SIMMER_DURATION) {
          st.item = SIMMER_RESULTS[st.item];
          st.pulse = 1;
          events.push({ type: 'simmer_ready', col: st.col, row: st.row, item: st.item });
        }
      } else if (st.item === 'saffron_broth' && Math.random() < dt * 3.2) {
        events.push({ type: 'sizzle', col: st.col, row: st.row, hot: false });
      }
    }

    if (st.kind === 'oven' && st.item) {
      if (canBakeItem(st.item)) {
        st.progress += dt * cookMult;
        if (Math.random() < dt * 3.5) events.push({ type: 'sizzle', col: st.col, row: st.row, hot: false });
        if (st.progress >= BAKE_DURATION) {
          st.item = BAKE_RESULTS[st.item];
          st.progress = BAKE_DURATION;
          st.pulse = 1;
          events.push({ type: 'bake_ready', col: st.col, row: st.row, item: st.item });
        }
      } else if (st.item === 'baked_bun') {
        st.progress += dt;
        if (st.progress >= BAKE_BURN_DURATION) {
          st.item = 'burned';
          st.burned = true;
          st.progress = 0;
          st.pulse = 1;
          events.push({ type: 'burned', col: st.col, row: st.row });
        }
      }
    }
  }
}

export function interactWithStation(kitchen, chef, station, orders, events) {
  if (!station) return false;
  const { col, row } = station;

  if (station.kind === 'crate') {
    if (!chef.holding) {
      chef.holding = { kind: 'ingredient', id: station.itemType };
      station.pulse = 1;
      events.push({ type: 'pickup', col, row, item: station.itemType });
      return true;
    }
    if (chef.holding.kind === 'ingredient' && chef.holding.id === station.itemType) {
      chef.holding = null;
      station.pulse = 0.6;
      events.push({ type: 'drop', col, row });
      return true;
    }
    return false;
  }

  if (station.kind === 'trash') {
    if (chef.holding) {
      chef.holding = null;
      station.pulse = 1;
      events.push({ type: 'trash', col, row });
      return true;
    }
    return false;
  }

  if (station.kind === 'chop') {
    if (!station.item && chef.holding && chef.holding.kind === 'ingredient' && canChopItem(chef.holding.id)) {
      station.item = chef.holding.id;
      station.progress = 0.14;
      chef.holding = null;
      station.pulse = 0.8;
      events.push({ type: 'chop_tick', col, row, item: station.item });
      return true;
    }
    if (station.item && canChopItem(station.item)) {
      station.progress += 0.36;
      events.push({ type: 'chop_tick', col, row, item: station.item });
      if (station.progress >= 1) {
        station.item = CHOP_RESULTS[station.item];
        station.progress = 0;
        station.pulse = 1;
        events.push({ type: 'chop_done', col, row, item: station.item });
      }
      return true;
    }
    if (station.item && !chef.holding) {
      chef.holding = { kind: 'ingredient', id: station.item };
      station.item = null;
      station.progress = 0;
      station.pulse = 0.8;
      events.push({ type: 'pickup', col, row, item: chef.holding.id });
      return true;
    }
    return false;
  }

  if (station.kind === 'stove') {
    if (!station.item && chef.holding && chef.holding.kind === 'ingredient' && canSearItem(chef.holding.id)) {
      station.item = chef.holding.id;
      station.progress = 0;
      station.burned = false;
      chef.holding = null;
      station.pulse = 0.8;
      events.push({ type: 'drop', col, row });
      return true;
    }
    if (station.item && !canSearItem(station.item) && !chef.holding) {
      const sweetSpot =
        (station.item === 'seared_steak' || station.item === 'seared_salmon') &&
        station.progress >= SEAR_DURATION &&
        station.progress <= SEAR_DURATION + 1.8;
      chef.holding = { kind: 'ingredient', id: station.item };
      station.item = null;
      station.progress = 0;
      station.burned = false;
      station.pulse = 0.9;
      if (sweetSpot && orders) {
        orders.score += 35;
        events.push({ type: 'perfect_sear', col, row, bonus: 35 });
      }
      events.push({ type: 'pickup', col, row, item: chef.holding.id });
      return true;
    }
    return false;
  }

  if (station.kind === 'stockpot') {
    if (!station.item && chef.holding && chef.holding.kind === 'ingredient' && canSimmerItem(chef.holding.id)) {
      station.item = chef.holding.id;
      station.progress = 0;
      chef.holding = null;
      station.pulse = 0.8;
      events.push({ type: 'drop', col, row });
      return true;
    }
    if (station.item && !canSimmerItem(station.item) && !chef.holding) {
      chef.holding = { kind: 'ingredient', id: station.item };
      station.item = null;
      station.progress = 0;
      station.pulse = 0.9;
      events.push({ type: 'pickup', col, row, item: chef.holding.id });
      return true;
    }
    return false;
  }

  if (station.kind === 'oven') {
    if (!station.item && chef.holding && chef.holding.kind === 'ingredient' && canBakeItem(chef.holding.id)) {
      station.item = chef.holding.id;
      station.progress = 0;
      station.burned = false;
      chef.holding = null;
      station.pulse = 0.8;
      events.push({ type: 'drop', col, row });
      return true;
    }
    if (station.item && !canBakeItem(station.item) && !chef.holding) {
      chef.holding = { kind: 'ingredient', id: station.item };
      station.item = null;
      station.progress = 0;
      station.burned = false;
      station.pulse = 0.9;
      events.push({ type: 'pickup', col, row, item: chef.holding.id });
      return true;
    }
    return false;
  }

  if (station.kind === 'assembly') {
    if (station.completedRecipeId) {
      if (!chef.holding) {
        chef.holding = { kind: 'plate', recipeId: station.completedRecipeId };
        station.completedRecipeId = null;
        station.assemblyItems = [];
        station.pulse = 1;
        events.push({ type: 'pickup_plate', col, row, recipeId: chef.holding.recipeId });
        return true;
      }
      return false;
    }
    if (chef.holding && chef.holding.kind === 'ingredient') {
      const id = chef.holding.id;
      if (isReadyIngredient(id) && canAcceptIngredient(station.assemblyItems, id)) {
        station.assemblyItems.push(id);
        chef.holding = null;
        station.pulse = 0.9;
        const complete = matchCompleteRecipe(station.assemblyItems);
        if (complete) {
          station.completedRecipeId = complete.id;
          events.push({ type: 'plate_ready', col, row, recipeId: complete.id });
        } else {
          events.push({ type: 'assemble', col, row, count: station.assemblyItems.length });
        }
        return true;
      }
      events.push({ type: 'warn', col, row, message: 'Prep or pair first!' });
      return false;
    }
    if (!chef.holding && station.assemblyItems.length > 0) {
      const popped = station.assemblyItems.pop();
      chef.holding = { kind: 'ingredient', id: popped };
      station.pulse = 0.6;
      events.push({ type: 'pickup', col, row, item: popped });
      return true;
    }
    return false;
  }

  if (station.kind === 'counter' || station.kind === 'pass') {
    if (!station.item && chef.holding) {
      station.item = chef.holding;
      chef.holding = null;
      station.pulse = 0.7;
      events.push({ type: 'drop', col, row });
      return true;
    }
    if (station.item && !chef.holding) {
      chef.holding = station.item;
      station.item = null;
      station.pulse = 0.7;
      events.push({ type: 'pickup', col, row, item: chef.holding.id || chef.holding.recipeId });
      return true;
    }
    if (station.item && chef.holding) {
      const swap = station.item;
      station.item = chef.holding;
      chef.holding = swap;
      station.pulse = 0.7;
      events.push({ type: 'drop', col, row });
      return true;
    }
    return false;
  }

  if (station.kind === 'serve') {
    let servedAny = false;
    if (chef.holding && chef.holding.kind === 'plate') {
      const served = orders.tryServe(chef.holding.recipeId);
      if (served) {
        chef.holding = null;
        station.pulse = 1;
        events.push({ type: 'serve_success', col, row, ...served });
        servedAny = true;
      } else {
        events.push({
          type: 'warn',
          col,
          row,
          message: `No ${RECIPE_BY_ID[chef.holding.recipeId]?.shortName || 'dish'} ticket!`,
        });
      }
    }
    const passSt = getStation(kitchen, 10, 2);
    if (passSt && passSt.item && passSt.item.kind === 'plate') {
      const served = orders.tryServe(passSt.item.recipeId);
      if (served) {
        passSt.item = null;
        passSt.pulse = 1;
        station.pulse = 1;
        events.push({ type: 'serve_success', col, row, ...served });
        servedAny = true;
      }
    }
    return servedAny;
  }

  return false;
}

export function findPath(kitchen, startCol, startRow, goalCol, goalRow) {
  if (!isWalkable(kitchen, goalCol, goalRow)) return null;
  if (startCol === goalCol && startRow === goalRow) return [];
  const queue = [{ col: startCol, row: startRow }];
  const cameFrom = new Map();
  const startKey = tileKey(startCol, startRow);
  cameFrom.set(startKey, null);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.col === goalCol && cur.row === goalRow) {
      const path = [];
      let trace = tileKey(goalCol, goalRow);
      while (trace && trace !== startKey) {
        const [c, r] = trace.split(',').map(Number);
        path.unshift({ col: c, row: r });
        trace = cameFrom.get(trace);
      }
      return path;
    }
    for (const [dc, dr] of dirs) {
      const nc = cur.col + dc;
      const nr = cur.row + dr;
      const nk = tileKey(nc, nr);
      if (!cameFrom.has(nk) && isWalkable(kitchen, nc, nr)) {
        cameFrom.set(nk, tileKey(cur.col, cur.row));
        queue.push({ col: nc, row: nr });
      }
    }
  }
  return null;
}

export function findBestAdjacentApproach(kitchen, fromCol, fromRow, targetCol, targetRow) {
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let best = null;
  for (const [dc, dr] of dirs) {
    const ac = targetCol + dc;
    const ar = targetRow + dr;
    if (!isWalkable(kitchen, ac, ar)) continue;
    const path = findPath(kitchen, fromCol, fromRow, ac, ar);
    if (path && (!best || path.length < best.path.length)) {
      best = { col: ac, row: ar, path };
    }
  }
  return best;
}

export function findTargetStationForChef(kitchen, chef) {
  const fx = chef.x + chef.facingX * 48;
  const fy = chef.y + chef.facingY * 42;
  const target = pxToTile(fx, fy);
  const direct = getStation(kitchen, target.col, target.row);
  if (direct) return direct;

  const cur = pxToTile(chef.x, chef.y);
  const offsets = [
    [Math.round(chef.facingX), Math.round(chef.facingY)],
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  for (const [dc, dr] of offsets) {
    const st = getStation(kitchen, cur.col + dc, cur.row + dr);
    if (st) return st;
  }
  return null;
}

export function tileKey(col, row) {
  return `${col},${row}`;
}

export function getStation(kitchen, col, row) {
  return kitchen.stations.get(tileKey(col, row)) || null;
}

export function isWalkable(kitchen, col, row) {
  if (col < 0 || row < 0 || col >= kitchen.cols || row >= kitchen.rows) return false;
  return !kitchen.stations.has(tileKey(col, row));
}

export function tileCenterPx(col, row) {
  return {
    x: GRID_ORIGIN_X + col * TILE_W + TILE_W * 0.5,
    y: GRID_ORIGIN_Y + row * TILE_H + TILE_H * 0.5,
  };
}

export function pxToTile(x, y) {
  return {
    col: Math.floor((x - GRID_ORIGIN_X) / TILE_W),
    row: Math.floor((y - GRID_ORIGIN_Y) / TILE_H),
  };
}

export function describeItemLabel(holding) {
  if (!holding) return '';
  if (holding.kind === 'plate') {
    return RECIPE_BY_ID[holding.recipeId]?.shortName || 'Plated Dish';
  }
  return INGREDIENTS[holding.id]?.short || holding.id;
}
