import { getFloorTileSprite } from './assets.js';
import {
  BAKE_BURN_DURATION,
  BAKE_DURATION,
  BISTRO_PALETTE,
  BOTTOM_BAR_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COUNTER_BEVEL,
  DINING_REGULARS,
  DINING_STRIP_X,
  GRID_COLS,
  GRID_ORIGIN_X,
  GRID_ORIGIN_Y,
  GRID_ROWS,
  PLAYFIELD_TOP,
  SEAR_BURN_DURATION,
  SEAR_DURATION,
  SIMMER_DURATION,
  TILE_H,
  TILE_W,
} from './config.js';
import {
  drawMarbleVeins,
  drawPillBadge,
  drawWoodgrainPlanks,
  traceRoundedRect,
} from './drawPrimitives.js';
import { renderIngredientArt, renderMidAssemblyPlate, renderPlatedDish } from './foodArt.js';
import { findTargetStationForChef, getStation, isWalkable, pxToTile } from './kitchen.js';
import { RECIPE_BY_ID } from './recipes.js';

export function renderBistroKitchen(ctx, world) {
  const isLantern = world.orders.shift.lighting === 'lantern';
  drawBistroBackdrop(ctx, isLantern);
  drawBistroFloor(ctx, world.kitchen, isLantern);
  drawBackWallBacksplash(ctx);

  const chefs = world.chefs || [world.chef];
  const activeChef = chefs[world.activeChefIdx || 0] || world.chef;
  const targeted = findTargetStationForChef(world.kitchen, activeChef);
  const hover = world.hoverTile;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const station = world.kitchen.stations.get(`${col},${row}`);
      if (!station) continue;
      const isHighlighted =
        (targeted && targeted.col === col && targeted.row === row) ||
        (hover && hover.col === col && hover.row === row);
      drawKitchenStation(ctx, world.kitchen, station, world.elapsed, isHighlighted);
    }
    const rowChefs = chefs
      .map((chef, idx) => ({ chef, idx }))
      .filter(({ chef }) => Math.max(0, Math.min(GRID_ROWS - 1, pxToTile(chef.x, chef.y).row)) === row)
      .sort((a, b) => a.chef.y - b.chef.y);
    for (const { chef, idx } of rowChefs) {
      drawBrigadeChef(ctx, chef, world.kitchen, world.elapsed, idx === (world.activeChefIdx || 0));
    }
  }

  drawPassWindowHoods(ctx);
  drawHeatLampGlow(ctx);
  drawDiningRoomStrip(ctx, world, isLantern);
  world.particles.render(ctx);

  if (isLantern) {
    drawDinnerLanternAtmosphere(ctx, world.elapsed);
  }
}

function drawBistroBackdrop(ctx, isLantern) {
  const grad = ctx.createLinearGradient(0, PLAYFIELD_TOP, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, isLantern ? '#1b1b26' : '#2a201b');
  grad.addColorStop(1, isLantern ? '#10121b' : '#17110e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, PLAYFIELD_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAYFIELD_TOP);
}

function drawBistroFloor(ctx, kitchen, isLantern) {
  const floorX = GRID_ORIGIN_X - 6;
  const floorY = GRID_ORIGIN_Y - 12;
  const floorW = GRID_COLS * TILE_W + 12;
  const floorH = GRID_ROWS * TILE_H + COUNTER_BEVEL + 16;

  traceRoundedRect(ctx, floorX, floorY, floorW, floorH, 10);
  ctx.fillStyle = isLantern ? '#232330' : '#33251d';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = isLantern ? '#4e5874' : '#6c4d36';
  ctx.stroke();

  const tileImg = getFloorTileSprite();
  const innerW = GRID_COLS * TILE_W;
  const innerH = GRID_ROWS * TILE_H;
  if (tileImg) {
    ctx.save();
    ctx.translate(GRID_ORIGIN_X, GRID_ORIGIN_Y);
    const pat = ctx.createPattern(tileImg, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, innerW, innerH);
    }
    ctx.restore();
  }

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tx = GRID_ORIGIN_X + c * TILE_W;
      const ty = GRID_ORIGIN_Y + r * TILE_H;
      if (!tileImg) {
        const even = (r + c) % 2 === 0;
        ctx.fillStyle = even ? BISTRO_PALETTE.floorLight : BISTRO_PALETTE.floorDark;
        ctx.fillRect(tx + 1, ty + 1, TILE_W - 2, TILE_H - 2);
      }
      ctx.strokeStyle = 'rgba(85, 58, 36, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx + 0.5, ty + 0.5, TILE_W - 1, TILE_H - 1);

      if (isLantern) {
        ctx.fillStyle = 'rgba(18, 28, 56, 0.34)';
        ctx.fillRect(tx, ty, TILE_W, TILE_H);
      }
      if (isWalkable(kitchen, c, r) && r === 1) {
        ctx.fillStyle = 'rgba(34, 21, 14, 0.16)';
        ctx.fillRect(tx, ty, TILE_W, 8);
      }
    }
  }

  drawFloorMat(ctx, GRID_ORIGIN_X + 3 * TILE_W + 8, GRID_ORIGIN_Y + 1 * TILE_H + 14, TILE_W * 3 - 16, TILE_H - 26);
  drawFloorMat(ctx, GRID_ORIGIN_X + 6 * TILE_W + 8, GRID_ORIGIN_Y + 1 * TILE_H + 14, TILE_W * 2 - 16, TILE_H - 26);
  drawFloorMat(ctx, GRID_ORIGIN_X + 9 * TILE_W + 12, GRID_ORIGIN_Y + 2 * TILE_H + 10, TILE_W - 24, TILE_H * 2 - 20);
}

function drawBackWallBacksplash(ctx) {
  const bx = GRID_ORIGIN_X;
  const by = GRID_ORIGIN_Y - 10;
  const bw = GRID_COLS * TILE_W;
  ctx.fillStyle = '#e8d7bc';
  ctx.fillRect(bx, by, bw, 12);

  ctx.strokeStyle = 'rgba(130, 86, 52, 0.35)';
  ctx.lineWidth = 1;
  for (let tx = bx; tx < bx + bw; tx += 34) {
    ctx.beginPath();
    ctx.moveTo(tx, by);
    ctx.lineTo(tx, by + 12);
    ctx.stroke();
  }
  ctx.fillStyle = '#d49a3a';
  ctx.fillRect(bx + 6, by + 4, bw - 12, 2.5);
}

function drawPassWindowHoods(ctx) {
  const rx = GRID_ORIGIN_X + GRID_COLS * TILE_W + 1;
  const py = GRID_ORIGIN_Y + 2 * TILE_H + 12;
  const ph = TILE_H * 2 - 24;
  ctx.save();
  traceRoundedRect(ctx, rx - 3, py, 9, ph, 4);
  ctx.fillStyle = '#d89238';
  ctx.fill();
  ctx.strokeStyle = '#532f19';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  for (const ly of [GRID_ORIGIN_Y + 2 * TILE_H + 24, GRID_ORIGIN_Y + 3 * TILE_H + 24]) {
    ctx.fillStyle = '#f4b942';
    ctx.beginPath();
    ctx.arc(rx + 2, ly, 7, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloorMat(ctx, x, y, w, h) {
  ctx.save();
  traceRoundedRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = 'rgba(42, 39, 43, 0.84)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(216, 122, 50, 0.48)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let px = x + 12; px < x + w - 10; px += 12) {
    ctx.beginPath();
    ctx.moveTo(px, y + 6);
    ctx.lineTo(px, y + h - 6);
    ctx.stroke();
  }
  ctx.restore();
}

function stationStyleOf(st) {
  if (!st) return null;
  if (st.kind === 'assembly') return 'marble';
  if (st.kind === 'stove' || st.kind === 'stockpot' || st.kind === 'trash') return 'steel';
  if (st.kind === 'oven') return 'stone';
  if (st.kind === 'pass' || st.kind === 'serve') return 'pass';
  return 'walnut';
}

function drawCounterCabinet(ctx, kitchen, station, x, y, topColor, frontColor, highlight, style = 'walnut') {
  const leftSt = getStation(kitchen, station.col - 1, station.row);
  const rightSt = getStation(kitchen, station.col + 1, station.row);
  const upSt = getStation(kitchen, station.col, station.row - 1);
  const downSt = getStation(kitchen, station.col, station.row + 1);

  const hasLeft = Boolean(leftSt);
  const hasRight = Boolean(rightSt);
  const hasUp = Boolean(upSt);
  const hasDown = Boolean(downSt);

  const rx = hasLeft ? x : x + 2;
  const rw = (hasRight ? x + TILE_W : x + TILE_W - 2) - rx;
  const ry = hasUp ? y : y + 2;
  const rh = (hasDown ? y + TILE_H : y + TILE_H - 4) - ry;

  if (!hasDown) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
    ctx.fillRect(rx + (hasLeft ? 0 : 2), y + TILE_H - 4, rw - (hasLeft || hasRight ? 0 : 2), COUNTER_BEVEL + 6);

    ctx.fillStyle = frontColor;
    ctx.fillRect(rx, y + TILE_H - 6, rw, COUNTER_BEVEL + 2);

    ctx.fillStyle = 'rgba(255, 224, 175, 0.14)';
    ctx.fillRect(rx, y + TILE_H + 1, rw, 3);

    ctx.strokeStyle = '#22150e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(rx, y + TILE_H + COUNTER_BEVEL - 4);
    ctx.lineTo(rx + rw, y + TILE_H + COUNTER_BEVEL - 4);
    ctx.stroke();
  }

  ctx.fillStyle = topColor;
  ctx.fillRect(rx, ry, rw, rh);

  if (style === 'walnut') {
    drawWoodgrainPlanks(ctx, rx + 2, ry + 2, rw - 4, rh - 6, BISTRO_PALETTE.walnutPlank);
  } else if (style === 'marble') {
    drawMarbleVeins(ctx, rx + 2, ry + 2, rw - 4, rh - 6, BISTRO_PALETTE.marbleVein);
  }

  if (!hasUp) {
    ctx.fillStyle = 'rgba(255, 248, 232, 0.18)';
    ctx.fillRect(rx, ry, rw, 4);
  }

  ctx.strokeStyle = '#3b2416';
  ctx.lineWidth = 1.5;
  if (!hasUp) {
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.stroke();
  }
  if (!hasLeft) {
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx, ry + rh + (hasDown ? 0 : COUNTER_BEVEL));
    ctx.stroke();
  }
  if (!hasRight) {
    ctx.beginPath();
    ctx.moveTo(rx + rw, ry);
    ctx.lineTo(rx + rw, ry + rh + (hasDown ? 0 : COUNTER_BEVEL));
    ctx.stroke();
  }

  if (hasLeft) {
    ctx.strokeStyle = stationStyleOf(leftSt) !== style ? 'rgba(28, 17, 11, 0.72)' : 'rgba(28, 17, 11, 0.22)';
    ctx.lineWidth = stationStyleOf(leftSt) !== style ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, ry + 2);
    ctx.lineTo(x, ry + rh - 2);
    ctx.stroke();
  }
  if (hasUp) {
    ctx.strokeStyle = 'rgba(28, 17, 11, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx + 3, y);
    ctx.lineTo(rx + rw - 3, y);
    ctx.stroke();
  }

  if (highlight) {
    traceRoundedRect(ctx, x + 2, y + 2, TILE_W - 4, TILE_H - 6, 6);
    ctx.strokeStyle = '#f4b942';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawStationLabel(ctx, cx, yTileTop, label, accent = '#f5e8d0') {
  ctx.save();
  ctx.font = '900 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(20, 14, 11, 0.9)';
  const w = ctx.measureText(label).width + 10;
  const labelY = yTileTop + TILE_H - 12;
  traceRoundedRect(ctx, cx - w / 2, labelY - 7, w, 14, 4);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.fillText(label, cx, labelY);
  ctx.restore();
}

function drawKitchenStation(ctx, kitchen, station, time, highlighted) {
  const x = GRID_ORIGIN_X + station.col * TILE_W;
  const y = GRID_ORIGIN_Y + station.row * TILE_H;
  const cx = x + TILE_W * 0.5;
  const cy = y + TILE_H * 0.42;

  if (station.kind === 'crate') {
    drawCounterCabinet(ctx, kitchen, station, x, y, BISTRO_PALETTE.walnutTop, BISTRO_PALETTE.walnutFront, highlighted, 'walnut');
    traceRoundedRect(ctx, x + 11, y + 6, TILE_W - 22, TILE_H - 25, 6);
    ctx.fillStyle = '#583219';
    ctx.fill();
    ctx.strokeStyle = '#c8925c';
    ctx.lineWidth = 2;
    ctx.stroke();

    renderIngredientArt(ctx, station.itemType, cx - 12, cy - 1, 0.8);
    renderIngredientArt(ctx, station.itemType, cx + 12, cy + 2, 0.8);
    drawStationLabel(ctx, cx, y, station.label, '#ffe7ad');
    return;
  }

  if (station.kind === 'stove') {
    drawCounterCabinet(ctx, kitchen, station, x, y, BISTRO_PALETTE.steelTop, BISTRO_PALETTE.steelFront, highlighted, 'steel');
    const active = Boolean(station.item);
    const hot = station.item === 'seared_steak' || station.item === 'seared_salmon';
    const warning = hot && station.progress > SEAR_BURN_DURATION - 2.2;

    ctx.fillStyle = '#24282e';
    ctx.beginPath();
    ctx.arc(cx, cy, 23, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = active ? (warning ? '#ff5938' : '#f49c36') : '#b56327';
    ctx.lineWidth = active ? 3.5 : 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.stroke();

    if (active) {
      const pulseR = 21 + Math.sin(time * 14) * 1.5;
      ctx.strokeStyle = warning ? 'rgba(255, 80, 48, 0.9)' : 'rgba(92, 208, 255, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#2a2e34';
    ctx.strokeStyle = '#545c68';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#d87a32';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy + 5);
    ctx.lineTo(cx + 28, cy + 12);
    ctx.stroke();
    ctx.lineCap = 'butt';

    if (station.item) {
      renderIngredientArt(ctx, station.item, cx, cy, 0.86);
      drawApplianceGauge(ctx, cx, y + 6, station.progress, SEAR_DURATION, SEAR_BURN_DURATION, station.item === 'steak' || station.item === 'salmon', station.burned, time, 'SEARED!', 'PULL NOW!');
      if (!station.burned) {
        drawStoveTempPill(ctx, x + TILE_W - 21, y + 25, station.progress, hot, warning);
      }
    }
    drawStationLabel(ctx, cx, y, station.label, '#f7c488');
    return;
  }

  if (station.kind === 'stockpot') {
    drawCounterCabinet(ctx, kitchen, station, x, y, BISTRO_PALETTE.steelTop, BISTRO_PALETTE.steelFront, highlighted, 'steel');
    ctx.fillStyle = '#262326';
    ctx.strokeStyle = '#d87a32';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f4b942';
    traceRoundedRect(ctx, cx - 28, cy - 4, 6, 8, 2);
    ctx.fill();
    traceRoundedRect(ctx, cx + 22, cy - 4, 6, 8, 2);
    ctx.fill();

    const simmerReady = station.item === 'saffron_broth';
    const simmering = station.item === 'dashi';
    const brothGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 18);
    if (simmerReady || simmering) {
      brothGrad.addColorStop(0, '#ffe37e');
      brothGrad.addColorStop(1, '#d97f21');
    } else {
      brothGrad.addColorStop(0, '#5d4a3c');
      brothGrad.addColorStop(1, '#332820');
    }
    ctx.fillStyle = brothGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();

    if (simmering || simmerReady) {
      for (let b = 0; b < 3; b++) {
        const bx = cx + Math.sin(time * 5 + b * 2.1) * 8;
        const by = cy + Math.cos(time * 4 + b * 1.7) * 6;
        ctx.fillStyle = 'rgba(255, 250, 220, 0.76)';
        ctx.beginPath();
        ctx.arc(bx, by, 2.2 + Math.sin(time * 8 + b) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      if (simmering) {
        drawProgressBar(ctx, cx, y + 6, Math.min(1, station.progress / SIMMER_DURATION), '#f4b942');
      } else {
        drawPillBadge(ctx, cx, y + 8, 'BROTH READY!', '#2ea66f', '#fff');
      }
    }
    drawStationLabel(ctx, cx, y, 'POT', '#ffe399');
    return;
  }

  if (station.kind === 'oven') {
    drawCounterCabinet(ctx, kitchen, station, x, y, BISTRO_PALETTE.hearthStone, BISTRO_PALETTE.hearthFront, highlighted, 'stone');
    traceRoundedRect(ctx, x + 13, y + 5, TILE_W - 26, TILE_H - 23, 14);
    ctx.fillStyle = '#472a20';
    ctx.fill();
    ctx.strokeStyle = '#c47b47';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    const ember = ctx.createRadialGradient(cx, cy + 4, 2, cx, cy + 4, 24);
    ember.addColorStop(0, '#ffe88e');
    ember.addColorStop(0.55, '#eb6822');
    ember.addColorStop(1, '#3b1b12');
    ctx.fillStyle = ember;
    ctx.beginPath();
    ctx.arc(cx, cy + 7, 18, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    if (station.item) {
      renderIngredientArt(ctx, station.item, cx, cy + 2, 0.82);
      drawApplianceGauge(ctx, cx, y + 6, station.progress, BAKE_DURATION, BAKE_BURN_DURATION, station.item === 'dough', station.burned, time, 'BAKED!', 'PULL!');
    }
    drawStationLabel(ctx, cx, y, 'OVEN', '#ffd7a1');
    return;
  }

  if (station.kind === 'chop') {
    drawCounterCabinet(ctx, kitchen, station, x, y, BISTRO_PALETTE.walnutTop, BISTRO_PALETTE.walnutFront, highlighted, 'walnut');
    traceRoundedRect(ctx, x + 15, y + 7, TILE_W - 30, TILE_H - 25, 6);
    ctx.fillStyle = BISTRO_PALETTE.butcherTop;
    ctx.fill();
    ctx.strokeStyle = BISTRO_PALETTE.butcherSide;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (station.item) {
      renderIngredientArt(ctx, station.item, cx - 3, cy, 0.9);
      if (station.progress > 0 && station.progress < 1) {
        const slash = Math.sin(time * 24) * 5;
        ctx.save();
        ctx.translate(cx + 12, cy - 6 + slash);
        ctx.rotate(-0.45);
        ctx.fillStyle = '#edf3f8';
        ctx.fillRect(-13, -3, 21, 6);
        ctx.fillStyle = '#3b2416';
        ctx.fillRect(8, -2, 9, 4);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + 22, y + 18, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18, 13, 11, 0.92)';
        ctx.fill();
        ctx.strokeStyle = '#2ea66f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(x + 22, y + 18, 8.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * station.progress);
        ctx.stroke();
        ctx.restore();
      } else {
        drawPillBadge(ctx, cx, y + 8, 'READY!', '#2ea66f', '#fff');
      }
    } else {
      ctx.save();
      ctx.translate(cx + 12, cy - 2);
      ctx.rotate(-0.55);
      ctx.fillStyle = '#d3dce6';
      ctx.fillRect(-13, -3, 20, 6);
      ctx.fillStyle = '#4a2c18';
      ctx.fillRect(7, -2.5, 10, 5);
      ctx.restore();
    }
    drawStationLabel(ctx, cx, y, 'BOARD', '#f7e5c6');
    return;
  }

  if (station.kind === 'assembly') {
    drawCounterCabinet(ctx, kitchen, station, x, y, BISTRO_PALETTE.marbleTop, BISTRO_PALETTE.marbleFront, highlighted, 'marble');
    traceRoundedRect(ctx, x + 10, y + 6, TILE_W - 20, TILE_H - 23, 8);
    ctx.fillStyle = 'rgba(216, 122, 50, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#c9a673';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    if (station.completedRecipeId) {
      renderPlatedDish(ctx, station.completedRecipeId, cx, cy, 0.92, true);
      const recipe = RECIPE_BY_ID[station.completedRecipeId];
      drawPillBadge(ctx, cx, y - 9, `READY: ${recipe.shortName.toUpperCase()}`, '#f4b942', '#1e140d');
    } else if (station.assemblyItems.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#e89b28';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, 31 + Math.sin(time * 5) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      renderMidAssemblyPlate(ctx, station.assemblyItems, cx, cy, 0.94);
      drawPillBadge(ctx, cx, y - 9, `BUILD ${station.assemblyItems.length}/3`, '#2b2019', '#ffdf78', '#f4b942');
    } else {
      ctx.strokeStyle = 'rgba(139, 93, 51, 0.42)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 19, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    drawStationLabel(ctx, cx, y, station.label, '#fff1cf');
    return;
  }

  if (station.kind === 'pass') {
    drawCounterCabinet(ctx, kitchen, station, x, y, '#cf9342', '#794e1c', highlighted, 'pass');
    traceRoundedRect(ctx, x + 12, y + 6, TILE_W - 24, TILE_H - 25, 6);
    ctx.fillStyle = '#3a291b';
    ctx.fill();
    ctx.strokeStyle = '#f4b942';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (station.item && station.item.kind === 'plate') {
      renderPlatedDish(ctx, station.item.recipeId, cx, cy - 1, 0.88, true);
      drawSparkleMotes(ctx, cx, cy - 2, time);
      drawPillBadge(ctx, cx - 10, y - 9, 'READY!', '#f4b942', '#1d140d', '#fff8e2');
    } else {
      ctx.fillStyle = 'rgba(244, 185, 66, 0.48)';
      ctx.font = '800 10px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HOT PASS', cx, cy);
    }
    drawStationLabel(ctx, cx, y, 'SERVE', '#ffe79c');
    return;
  }

  if (station.kind === 'serve') {
    drawCounterCabinet(ctx, kitchen, station, x, y, '#cf9444', '#794e1c', highlighted, 'pass');
    traceRoundedRect(ctx, x + 14, y + 7, TILE_W - 28, TILE_H - 25, 6);
    ctx.fillStyle = '#3a291b';
    ctx.fill();
    ctx.strokeStyle = '#f4b942';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.fillStyle = '#d1982b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 17, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8d05a';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 14, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff5c8';
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 3.8, 0, Math.PI * 2);
    ctx.fill();
    drawStationLabel(ctx, cx, y, 'BELL', '#ffe79c');
    return;
  }

  if (station.kind === 'trash') {
    drawCounterCabinet(ctx, kitchen, station, x, y, '#4a4e54', '#2b2e33', highlighted, 'steel');
    traceRoundedRect(ctx, x + 22, y + 8, TILE_W - 44, TILE_H - 27, 8);
    ctx.fillStyle = '#1b1e21';
    ctx.fill();
    ctx.strokeStyle = '#6db36b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#6db36b';
    ctx.beginPath();
    ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
    ctx.fill();
    drawStationLabel(ctx, cx, y, 'COMPOST', '#a8e6a3');
    return;
  }

  drawCounterCabinet(ctx, kitchen, station, x, y, BISTRO_PALETTE.walnutTop, BISTRO_PALETTE.walnutFront, highlighted, 'walnut');
  if (station.item) {
    if (station.item.kind === 'plate') {
      renderPlatedDish(ctx, station.item.recipeId, cx, cy + 4, 0.88, true);
      drawPillBadge(ctx, cx, y - 7, 'READY!', '#f4b942', '#1d140d');
    } else {
      renderIngredientArt(ctx, station.item.id, cx, cy + 4, 0.92);
    }
  } else if (station.decor) {
    drawCounterProps(ctx, cx, cy + 4, station.decor);
  }
}

function drawStoveTempPill(ctx, cx, cy, progress, isHot, isWarning) {
  const temp = isHot
    ? Math.round(230 + ((progress - SEAR_DURATION) / (SEAR_BURN_DURATION - SEAR_DURATION)) * 42)
    : Math.round(195 + (progress / SEAR_DURATION) * 35);
  const label = `${temp}°C`;
  ctx.save();
  ctx.font = '900 9px "Consolas", monospace';
  const w = 34;
  traceRoundedRect(ctx, cx - w / 2, cy - 6.5, w, 13, 6);
  ctx.fillStyle = isWarning ? '#a8231a' : isHot ? '#1d6944' : 'rgba(20, 15, 12, 0.88)';
  ctx.fill();
  ctx.strokeStyle = isWarning ? '#ff7c6e' : isHot ? '#74e8ad' : '#f4b942';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.fillStyle = '#fff8e2';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 0.5);
  ctx.restore();
}

function drawSparkleMotes(ctx, cx, cy, time) {
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const ang = time * 2.1 + (i * Math.PI) / 2;
    const sx = cx + Math.cos(ang) * 28;
    const sy = cy + Math.sin(ang) * 20;
    const r = 2.6 + Math.sin(time * 7 + i) * 0.9;
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.moveTo(sx, sy - r * 1.8);
    ctx.lineTo(sx + r * 0.6, sy - r * 0.6);
    ctx.lineTo(sx + r * 1.8, sy);
    ctx.lineTo(sx + r * 0.6, sy + r * 0.6);
    ctx.lineTo(sx, sy + r * 1.8);
    ctx.lineTo(sx - r * 0.6, sy + r * 0.6);
    ctx.lineTo(sx - r * 1.8, sy);
    ctx.lineTo(sx - r * 0.6, sy - r * 0.6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCounterProps(ctx, cx, cy, decor) {
  if (decor === 'copper_pots') {
    ctx.fillStyle = '#d87a32';
    ctx.strokeStyle = '#5a290b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#9aa6b5';
    ctx.beginPath();
    ctx.arc(cx + 12, cy + 3, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#d87a32';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + 5);
    ctx.lineTo(cx + 3, cy + 13);
    ctx.stroke();
  } else if (decor === 'oil') {
    ctx.fillStyle = '#c89b32';
    ctx.strokeStyle = '#4f3512';
    ctx.lineWidth = 1.4;
    traceRoundedRect(ctx, cx - 15, cy - 12, 11, 20, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fcf4e3';
    traceRoundedRect(ctx, cx + 4, cy - 10, 10, 18, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3b2416';
    ctx.fillRect(cx - 12, cy - 15, 5, 3);
    ctx.fillRect(cx + 6, cy - 13, 6, 3);
  } else if (decor === 'plates') {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#fcf6ea';
      ctx.strokeStyle = '#bfa984';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6 - i * 5, 20, 12.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (decor === 'spice') {
    for (const [ox, col] of [[-13, '#e24b3a'], [0, '#f4b942'], [13, '#4ba85c']]) {
      ctx.fillStyle = col;
      ctx.strokeStyle = '#291c14';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(cx + ox, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (decor === 'rosemary') {
    ctx.fillStyle = '#b45c34';
    ctx.strokeStyle = '#4f2412';
    ctx.lineWidth = 1.4;
    traceRoundedRect(ctx, cx - 11, cy, 22, 13, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3ca65f';
    for (const [lx, ly] of [[-6, -6], [0, -11], [6, -6], [-3, -2], [4, -2]]) {
      ctx.beginPath();
      ctx.arc(cx + lx, cy + ly, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawProgressBar(ctx, cx, yTop, pct, fillColor) {
  const barW = 70;
  const barX = cx - barW / 2;
  traceRoundedRect(ctx, barX - 2, yTop - 2, barW + 4, 10, 5);
  ctx.fillStyle = 'rgba(18, 13, 11, 0.92)';
  ctx.fill();
  traceRoundedRect(ctx, barX, yTop, Math.max(4, barW * pct), 6, 3);
  ctx.fillStyle = fillColor;
  ctx.fill();
}

function drawApplianceGauge(ctx, cx, yTop, progress, readyDur, burnDur, isCooking, burned, time, readyLabel, warnLabel) {
  if (burned) {
    drawPillBadge(ctx, cx, yTop + 2, 'BURNED!', '#d9453a', '#fff');
    return;
  }
  if (isCooking) {
    drawProgressBar(ctx, cx, yTop, Math.min(1, progress / readyDur), '#f4b942');
    return;
  }
  const burnPct = Math.min(1, (progress - readyDur) / (burnDur - readyDur));
  const warning = progress > burnDur - 2.2;
  const flash = warning && Math.sin(time * 18) > 0;
  drawProgressBar(ctx, cx, yTop, 1 - burnPct, warning ? (flash ? '#ff4f3d' : '#ff9838') : '#38c77b');
  drawPillBadge(ctx, cx, yTop + 2, warning ? warnLabel : readyLabel, warning ? '#e64937' : '#2ea66f', '#fff');
}

function drawBrigadeChef(ctx, chef, kitchen, time, isActive) {
  const isHana = chef.id === 'hana';
  const apronColor = isHana ? '#2c6f7e' : '#d97a32';
  const scarfColor = isHana ? '#f4b942' : '#e04838';

  for (const trail of chef.dashTrail) {
    ctx.save();
    ctx.globalAlpha = trail.life * 1.4;
    ctx.fillStyle = isHana ? '#79d8eb' : '#f4b942';
    ctx.beginPath();
    ctx.arc(trail.x, trail.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const bob = Math.abs(Math.sin(chef.walkPhase)) * 3.8;
  const x = chef.x;
  const y = chef.y - bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.18, 1.18);

  if (isActive) {
    ctx.strokeStyle = 'rgba(244, 185, 66, 0.92)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 18, 22 + Math.sin(time * 6) * 1.2, 10.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 17, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  traceRoundedRect(ctx, -15, -6, 30, 23, 9);
  ctx.fillStyle = '#fcf8f0';
  ctx.fill();
  ctx.strokeStyle = '#3d2a20';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  traceRoundedRect(ctx, -10.5, 1, 21, 16, 4.5);
  ctx.fillStyle = apronColor;
  ctx.fill();
  ctx.fillStyle = '#f4b942';
  ctx.fillRect(-10.5, 1, 21, 3.5);

  ctx.fillStyle = scarfColor;
  traceRoundedRect(ctx, -8, -6, 16, 5, 2.5);
  ctx.fill();

  const targetSt = findTargetStationForChef(kitchen, chef);
  if (!chef.holding && targetSt && targetSt.kind === 'chop' && targetSt.item && targetSt.progress > 0) {
    ctx.save();
    ctx.translate(15, -2 + Math.sin(time * 22) * 3);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#edf3f8';
    ctx.fillRect(0, -2.5, 14, 5);
    ctx.fillStyle = '#3b2416';
    ctx.fillRect(-5, -2, 6, 4);
    ctx.restore();
  } else if (!chef.holding && targetSt && targetSt.kind === 'stove' && targetSt.item) {
    ctx.save();
    ctx.translate(15, 0);
    ctx.rotate(-0.4);
    ctx.fillStyle = '#f4b942';
    ctx.fillRect(0, -1.5, 13, 3);
    ctx.restore();
  }

  ctx.fillStyle = '#f5cfa8';
  ctx.strokeStyle = '#3d2a20';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -14, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const ex = chef.facingX * 2.8;
  const ey = chef.facingY * 1.6;
  ctx.fillStyle = '#241812';
  ctx.beginPath();
  ctx.arc(-4 + ex, -14.5 + ey, 2, 0, Math.PI * 2);
  ctx.arc(4 + ex, -14.5 + ey, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#7d4430';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(ex, -11.5 + ey, 3.6, 0.15, Math.PI - 0.15);
  ctx.stroke();

  /* Chef Toque or Sous-Chef Bandana Toque */
  ctx.fillStyle = isHana ? '#2c6f7e' : '#ffffff';
  ctx.strokeStyle = isHana ? '#163b45' : '#b9a892';
  ctx.lineWidth = 1.5;
  traceRoundedRect(ctx, -11, -26, 22, 7.5, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#b9a892';
  ctx.beginPath();
  ctx.arc(-5.5, -29, 6.5, 0, Math.PI * 2);
  ctx.arc(5.5, -29, 6.5, 0, Math.PI * 2);
  ctx.arc(0, -31.8, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  /* Nameplate Pip */
  ctx.font = '900 8px "Trebuchet MS", sans-serif';
  traceRoundedRect(ctx, -16, 16, 32, 10, 5);
  ctx.fillStyle = isActive ? '#f4b942' : 'rgba(22, 16, 13, 0.86)';
  ctx.fill();
  ctx.fillStyle = isActive ? '#1c120b' : '#e6d8c3';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(chef.name || 'REN', 0, 21.5);

  if (chef.holding) {
    const hx = chef.facingX * 11;
    const hy = -42 + chef.facingY * 3;
    if (chef.holding.kind === 'plate') {
      renderPlatedDish(ctx, chef.holding.recipeId, hx, hy, 0.84, true);
      ctx.restore();
      drawPillBadge(ctx, x + hx * 1.15, y - 80, 'SERVE ->', '#f4b942', '#1d140d');
      return;
    }
    renderIngredientArt(ctx, chef.holding.id, hx, hy, 0.84);
  }

  ctx.restore();
}

function drawDiningRoomStrip(ctx, world, isLantern) {
  const x = DINING_STRIP_X;
  const y = GRID_ORIGIN_Y - 10;
  const w = CANVAS_WIDTH - x - 8;
  const h = GRID_ROWS * TILE_H + COUNTER_BEVEL + 14;

  ctx.save();
  const bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, isLantern ? '#1f2030' : '#3a291f');
  bg.addColorStop(1, isLantern ? '#141522' : '#261a14');
  traceRoundedRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = isLantern ? '#4e5874' : '#785235';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* Wainscoting horizontal trim */
  ctx.fillStyle = 'rgba(244, 185, 66, 0.14)';
  ctx.fillRect(x + 4, y + 6, w - 8, 16);
  ctx.fillStyle = '#f4b942';
  ctx.font = '900 10px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DINING', x + w / 2, y + 14);

  /* Assign active orders to 3 tables, ensuring any VIP ticket seats Critic Auguste */
  const orders = world.orders.orders;
  const vipOrder = orders.find((o) => o.isVip);
  const regularOrders = orders.filter((o) => !o.isVip);
  const tableOrders = [
    regularOrders[0] || null,
    vipOrder || regularOrders[1] || null,
    vipOrder ? (regularOrders[1] || null) : (regularOrders[2] || null),
  ];
  const tableYs = [262, 410, 558];
  const cx = x + w / 2;

  tableYs.forEach((ty, idx) => {
    const order = tableOrders[idx];
    const guest = order?.isVip ? DINING_REGULARS[3] : DINING_REGULARS[idx % 3];

    /* Candlelit Round Bistro Table */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
    ctx.beginPath();
    ctx.ellipse(cx, ty + 20, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    /* Seated Diner */
    ctx.fillStyle = guest.coat;
    traceRoundedRect(ctx, cx - 14, ty - 14, 28, 22, 8);
    ctx.fill();
    ctx.fillStyle = guest.skin;
    ctx.strokeStyle = '#362319';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, ty - 22, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = guest.hair;
    ctx.beginPath();
    ctx.arc(cx, ty - 26, 10.5, Math.PI, 0);
    ctx.fill();

    if (guest.isVip) {
      /* Critic Beret + Monocle */
      ctx.fillStyle = '#291c24';
      ctx.beginPath();
      ctx.ellipse(cx - 2, ty - 33, 12, 5, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f4b942';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx + 4, ty - 22, 3.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* Wooden Table Top */
    ctx.fillStyle = '#734424';
    ctx.strokeStyle = '#c4894d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, ty + 14, 29, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* Flickering Table Candle */
    const candleGlow = ctx.createRadialGradient(cx + 12, ty + 10, 1, cx + 12, ty + 10, 18);
    candleGlow.addColorStop(0, 'rgba(255, 226, 120, 0.8)');
    candleGlow.addColorStop(1, 'rgba(255, 180, 60, 0)');
    ctx.fillStyle = candleGlow;
    ctx.beginPath();
    ctx.arc(cx + 12, ty + 10, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff5d4';
    ctx.fillRect(cx + 10, ty + 10, 4, 5);
    ctx.fillStyle = '#ffaa2b';
    ctx.beginPath();
    ctx.arc(cx + 12, ty + 9, 2.2, 0, Math.PI * 2);
    ctx.fill();

    /* Dish Craving Bubble */
    if (order) {
      traceRoundedRect(ctx, cx - 25, ty - 68, 50, 32, 10);
      ctx.fillStyle = order.isVip ? '#fff6d6' : '#fcf4e3';
      ctx.fill();
      ctx.strokeStyle = order.isVip ? '#f4b942' : '#96744c';
      ctx.lineWidth = order.isVip ? 2.2 : 1.5;
      ctx.stroke();
      renderPlatedDish(ctx, order.recipeId, cx, ty - 52, 0.44, false);
    }
  });
  ctx.restore();
}

function drawHeatLampGlow(ctx) {
  const passX = GRID_ORIGIN_X + 10.5 * TILE_W;
  const passY = GRID_ORIGIN_Y + 2.5 * TILE_H;
  const glow = ctx.createRadialGradient(passX, passY, 16, passX, passY, 138);
  glow.addColorStop(0, 'rgba(255, 220, 125, 0.42)');
  glow.addColorStop(0.55, 'rgba(255, 190, 88, 0.16)');
  glow.addColorStop(1, 'rgba(255, 190, 88, 0)');
  ctx.save();
  ctx.fillStyle = glow;
  ctx.fillRect(passX - 140, passY - 130, 280, 260);
  ctx.restore();
}

function drawDinnerLanternAtmosphere(ctx, time) {
  ctx.save();
  const vig = ctx.createRadialGradient(CANVAS_WIDTH / 2, 420, 230, CANVAS_WIDTH / 2, 420, 700);
  vig.addColorStop(0, 'rgba(255, 185, 90, 0.02)');
  vig.addColorStop(1, 'rgba(10, 14, 30, 0.44)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, PLAYFIELD_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAYFIELD_TOP);

  const pools = [
    [GRID_ORIGIN_X + 3.5 * TILE_W, GRID_ORIGIN_Y + 0.5 * TILE_H, 135],
    [GRID_ORIGIN_X + 2.5 * TILE_W, GRID_ORIGIN_Y + 5.2 * TILE_H, 130],
    [GRID_ORIGIN_X + 5.5 * TILE_W, GRID_ORIGIN_Y + 2.5 * TILE_H, 145],
    [GRID_ORIGIN_X + 10.2 * TILE_W, GRID_ORIGIN_Y + 2.5 * TILE_H, 145],
  ];
  for (const [lx, ly, rad] of pools) {
    const g = ctx.createRadialGradient(lx, ly, 10, lx, ly, rad);
    g.addColorStop(0, 'rgba(255, 188, 72, 0.24)');
    g.addColorStop(1, 'rgba(255, 188, 72, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(lx, ly, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const colPos of [2.5, 5.5, 8.5]) {
    const lx = GRID_ORIGIN_X + colPos * TILE_W;
    const ly = PLAYFIELD_TOP + 5 + Math.sin(time * 2 + colPos) * 0.8;
    const halo = ctx.createRadialGradient(lx, ly, 4, lx, ly, 38);
    halo.addColorStop(0, 'rgba(255, 224, 130, 0.72)');
    halo.addColorStop(1, 'rgba(255, 165, 50, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(lx, ly, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff9c3b';
    ctx.strokeStyle = '#63280a';
    ctx.lineWidth = 1.4;
    traceRoundedRect(ctx, lx - 9, ly - 6, 18, 12, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2d1a10';
    ctx.fillRect(lx - 5, ly - 8, 10, 2.5);
    ctx.fillRect(lx - 5, ly + 5.5, 10, 2.5);
  }
  ctx.restore();
}
