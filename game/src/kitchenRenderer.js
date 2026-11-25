import {
  BAKE_BURN_DURATION,
  BAKE_DURATION,
  BISTRO_PALETTE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COUNTER_BEVEL,
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
import { INGREDIENTS, RECIPE_BY_ID, findMatchingRecipes } from './recipes.js';

export function renderBistroKitchen(ctx, world) {
  drawBistroFloor(ctx, world.kitchen);

  const targeted = findTargetStationForChef(world.kitchen, world.chef);
  const hover = world.hoverTile;
  const chefRow = Math.max(0, Math.min(GRID_ROWS - 1, pxToTile(world.chef.x, world.chef.y).row));

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const station = world.kitchen.stations.get(`${col},${row}`);
      if (!station) continue;
      const isHighlighted =
        (targeted && targeted.col === col && targeted.row === row) ||
        (hover && hover.col === col && hover.row === row);
      drawKitchenStation(ctx, station, world.elapsed, isHighlighted);
    }
    if (row === chefRow) {
      drawExpressiveChef(ctx, world.chef, world.kitchen, world.elapsed);
    }
  }

  drawHeatLampGlow(ctx);
  world.particles.render(ctx);

  if (world.orders.shift.lighting === 'lantern') {
    drawDinnerLanternVignette(ctx);
  }
}

function drawBistroFloor(ctx, kitchen) {
  const grad = ctx.createLinearGradient(0, PLAYFIELD_TOP, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#2a201b');
  grad.addColorStop(1, '#17110e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, PLAYFIELD_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAYFIELD_TOP);

  const floorX = GRID_ORIGIN_X - 8;
  const floorY = GRID_ORIGIN_Y - 8;
  const floorW = GRID_COLS * TILE_W + 16;
  const floorH = GRID_ROWS * TILE_H + COUNTER_BEVEL + 14;

  traceRoundedRect(ctx, floorX, floorY, floorW, floorH, 12);
  ctx.fillStyle = '#33251d';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#6c4d36';
  ctx.stroke();

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tx = GRID_ORIGIN_X + c * TILE_W;
      const ty = GRID_ORIGIN_Y + r * TILE_H;
      const even = (r + c) % 2 === 0;
      ctx.fillStyle = even ? BISTRO_PALETTE.floorLight : BISTRO_PALETTE.floorDark;
      ctx.fillRect(tx + 1, ty + 1, TILE_W - 2, TILE_H - 2);

      /* Herringbone diagonal tile bevel lines */
      ctx.strokeStyle = 'rgba(255, 245, 226, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx + 3, ty + TILE_H * 0.5);
      ctx.lineTo(tx + TILE_W * 0.5, ty + 3);
      ctx.moveTo(tx + TILE_W * 0.5, ty + TILE_H - 3);
      ctx.lineTo(tx + TILE_W - 3, ty + TILE_H * 0.5);
      ctx.stroke();

      ctx.strokeStyle = BISTRO_PALETTE.floorGrout;
      ctx.strokeRect(tx + 0.5, ty + 0.5, TILE_W - 1, TILE_H - 1);

      if (isWalkable(kitchen, c, r) && r === 1) {
        ctx.fillStyle = 'rgba(34, 21, 14, 0.16)';
        ctx.fillRect(tx, ty, TILE_W, 9);
      }
    }
  }

  /* Woven anti-fatigue kitchen mats in front of hot line & prep */
  drawFloorMat(ctx, GRID_ORIGIN_X + 3 * TILE_W + 8, GRID_ORIGIN_Y + 1 * TILE_H + 14, TILE_W * 3 - 16, TILE_H - 26);
  drawFloorMat(ctx, GRID_ORIGIN_X + 6 * TILE_W + 8, GRID_ORIGIN_Y + 1 * TILE_H + 14, TILE_W * 2 - 16, TILE_H - 26);
  drawFloorMat(ctx, GRID_ORIGIN_X + 9 * TILE_W + 12, GRID_ORIGIN_Y + 2 * TILE_H + 10, TILE_W - 24, TILE_H * 2 - 20);
}

function drawFloorMat(ctx, x, y, w, h) {
  ctx.save();
  traceRoundedRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = 'rgba(42, 39, 43, 0.85)';
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

function drawCounterCabinet(ctx, x, y, topColor, frontColor, highlight, style = 'walnut') {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  traceRoundedRect(ctx, x + 3, y + 6, TILE_W - 4, TILE_H + COUNTER_BEVEL - 4, 8);
  ctx.fill();

  /* 2.5D Front Bevel */
  traceRoundedRect(ctx, x + 2, y + TILE_H - 8, TILE_W - 4, COUNTER_BEVEL + 6, 6);
  ctx.fillStyle = frontColor;
  ctx.fill();
  ctx.strokeStyle = '#22150e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* Subtle cabinet trim groove */
  ctx.fillStyle = 'rgba(255, 224, 175, 0.1)';
  ctx.fillRect(x + 10, y + TILE_H + 2, TILE_W - 20, 3);

  /* Counter Top Surface */
  traceRoundedRect(ctx, x + 2, y + 2, TILE_W - 4, TILE_H - 6, 8);
  ctx.fillStyle = topColor;
  ctx.fill();
  if (style === 'walnut') {
    drawWoodgrainPlanks(ctx, x + 4, y + 4, TILE_W - 8, TILE_H - 12, BISTRO_PALETTE.walnutPlank);
  } else if (style === 'marble') {
    drawMarbleVeins(ctx, x + 4, y + 4, TILE_W - 8, TILE_H - 12, BISTRO_PALETTE.marbleVein);
  }
  ctx.strokeStyle = highlight ? '#f4b942' : '#40291b';
  ctx.lineWidth = highlight ? 3 : 1.6;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 248, 232, 0.18)';
  ctx.fillRect(x + 6, y + 4, TILE_W - 12, 4);
}

function drawStationLabel(ctx, cx, yTileTop, label, accent = '#f5e8d0') {
  ctx.save();
  ctx.font = '800 10px "Trebuchet MS", "Segoe UI", sans-serif';
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

function drawKitchenStation(ctx, station, time, highlighted) {
  const x = GRID_ORIGIN_X + station.col * TILE_W;
  const y = GRID_ORIGIN_Y + station.row * TILE_H;
  const cx = x + TILE_W * 0.5;
  const cy = y + TILE_H * 0.42;

  if (station.kind === 'crate') {
    drawCounterCabinet(ctx, x, y, BISTRO_PALETTE.walnutTop, BISTRO_PALETTE.walnutFront, highlighted, 'walnut');
    traceRoundedRect(ctx, x + 12, y + 7, TILE_W - 24, TILE_H - 25, 6);
    ctx.fillStyle = '#5a351d';
    ctx.fill();
    ctx.strokeStyle = '#c48d58';
    ctx.lineWidth = 2;
    ctx.stroke();

    renderIngredientArt(ctx, station.itemType, cx - 11, cy - 1, 0.78);
    renderIngredientArt(ctx, station.itemType, cx + 11, cy + 2, 0.78);
    drawStationLabel(ctx, cx, y, station.label, '#ffe7ad');
    return;
  }

  if (station.kind === 'stove') {
    drawCounterCabinet(ctx, x, y, BISTRO_PALETTE.steelTop, BISTRO_PALETTE.steelFront, highlighted, 'steel');
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
      ctx.strokeStyle = warning ? 'rgba(255, 80, 48, 0.9)' : 'rgba(92, 208, 255, 0.8)';
      ctx.lineWidth = 2;
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
      renderIngredientArt(ctx, station.item, cx, cy, 0.88);
      drawApplianceGauge(ctx, cx, y + 6, station.progress, SEAR_DURATION, SEAR_BURN_DURATION, station.item === 'steak' || station.item === 'salmon', station.burned, time, 'SEARED!', 'PULL NOW!');
    }
    drawStationLabel(ctx, cx, y, station.label, '#f7c488');
    return;
  }

  if (station.kind === 'stockpot') {
    drawCounterCabinet(ctx, x, y, BISTRO_PALETTE.steelTop, BISTRO_PALETTE.steelFront, highlighted, 'steel');
    ctx.fillStyle = '#262326';
    ctx.strokeStyle = '#d87a32';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* Brass side handles */
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
        ctx.fillStyle = 'rgba(255, 250, 220, 0.72)';
        ctx.beginPath();
        ctx.arc(bx, by, 2.2 + Math.sin(time * 8 + b) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      if (simmering) {
        const pct = Math.min(1, station.progress / SIMMER_DURATION);
        drawProgressBar(ctx, cx, y + 6, pct, '#f4b942');
      } else {
        drawPillBadge(ctx, cx, y + 8, 'BROTH READY!', '#2ea66f', '#fff');
      }
    }
    drawStationLabel(ctx, cx, y, station.label, '#ffe399');
    return;
  }

  if (station.kind === 'oven') {
    drawCounterCabinet(ctx, x, y, BISTRO_PALETTE.hearthStone, BISTRO_PALETTE.hearthFront, highlighted, 'stone');
    /* Brick & ember hearth dome */
    traceRoundedRect(ctx, x + 14, y + 6, TILE_W - 28, TILE_H - 24, 14);
    ctx.fillStyle = '#472a20';
    ctx.fill();
    ctx.strokeStyle = '#c47b47';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    const ember = ctx.createRadialGradient(cx, cy + 4, 2, cx, cy + 4, 22);
    ember.addColorStop(0, '#ffdf78');
    ember.addColorStop(0.5, '#e86826');
    ember.addColorStop(1, '#3b1b12');
    ctx.fillStyle = ember;
    ctx.beginPath();
    ctx.arc(cx, cy + 7, 17, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    if (station.item) {
      renderIngredientArt(ctx, station.item, cx, cy + 2, 0.82);
      drawApplianceGauge(ctx, cx, y + 6, station.progress, BAKE_DURATION, BAKE_BURN_DURATION, station.item === 'dough', station.burned, time, 'BAKED!', 'PULL!');
    }
    drawStationLabel(ctx, cx, y, station.label, '#ffd7a1');
    return;
  }

  if (station.kind === 'chop') {
    drawCounterCabinet(ctx, x, y, BISTRO_PALETTE.walnutTop, BISTRO_PALETTE.walnutFront, highlighted, 'walnut');
    traceRoundedRect(ctx, x + 15, y + 8, TILE_W - 30, TILE_H - 25, 6);
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
        ctx.arc(x + 22, y + 18, 11.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18, 13, 11, 0.92)';
        ctx.fill();
        ctx.strokeStyle = '#2ea66f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(x + 22, y + 18, 8.2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * station.progress);
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
    drawStationLabel(ctx, cx, y, station.label, '#f7e5c6');
    return;
  }

  if (station.kind === 'assembly') {
    drawCounterCabinet(ctx, x, y, BISTRO_PALETTE.marbleTop, BISTRO_PALETTE.marbleFront, highlighted, 'marble');
    traceRoundedRect(ctx, x + 12, y + 7, TILE_W - 24, TILE_H - 24, 8);
    ctx.fillStyle = 'rgba(216, 122, 50, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#c9a673';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    if (station.completedRecipeId) {
      renderPlatedDish(ctx, station.completedRecipeId, cx, cy, 0.96, true);
      const recipe = RECIPE_BY_ID[station.completedRecipeId];
      drawPillBadge(ctx, cx, y - 9, `READY: ${recipe.shortName.toUpperCase()}`, '#f4b942', '#1e140d');
    } else if (station.assemblyItems.length > 0) {
      renderMidAssemblyPlate(ctx, station.assemblyItems, cx, cy, 0.94);
      const matches = findMatchingRecipes(station.assemblyItems);
      const hintRecipe = matches[0];
      let hintText = `${station.assemblyItems.length}/3`;
      if (hintRecipe) {
        const missing = hintRecipe.ingredients.find((ing) => !station.assemblyItems.includes(ing));
        if (missing && INGREDIENTS[missing]) {
          hintText = `${station.assemblyItems.length}/3 +${INGREDIENTS[missing].short}`;
        }
      }
      drawPillBadge(ctx, cx, y - 9, hintText, '#2b2019', '#f9d878', '#f4b942');
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
    drawCounterCabinet(ctx, x, y, '#c78c40', '#794e1c', highlighted, 'walnut');
    traceRoundedRect(ctx, x + 12, y + 7, TILE_W - 24, TILE_H - 25, 6);
    ctx.fillStyle = '#3a291b';
    ctx.fill();
    ctx.strokeStyle = '#f4b942';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (station.item && station.item.kind === 'plate') {
      renderPlatedDish(ctx, station.item.recipeId, cx, cy - 2, 0.86, true);
      drawPillBadge(ctx, cx - 18, y - 10, 'READY TO SERVE!', '#2ea66f', '#fff', '#ffe699');
    } else {
      ctx.fillStyle = 'rgba(244, 185, 66, 0.45)';
      ctx.font = '800 10px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HOT PASS', cx, cy);
    }
    drawStationLabel(ctx, cx, y, station.label, '#ffe79c');
    return;
  }

  if (station.kind === 'serve') {
    drawCounterCabinet(ctx, x, y, '#cf9444', '#794e1c', highlighted, 'walnut');
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
    drawStationLabel(ctx, cx, y, station.label, '#ffe79c');
    return;
  }

  if (station.kind === 'trash') {
    drawCounterCabinet(ctx, x, y, '#4a4e54', '#2b2e33', highlighted, 'steel');
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
    drawStationLabel(ctx, cx, y, station.label, '#a8e6a3');
    return;
  }

  /* Prep & Decor Counters */
  drawCounterCabinet(ctx, x, y, BISTRO_PALETTE.walnutTop, BISTRO_PALETTE.walnutFront, highlighted, 'walnut');
  if (station.item) {
    if (station.item.kind === 'plate') {
      renderPlatedDish(ctx, station.item.recipeId, cx, cy, 0.94, true);
      drawPillBadge(ctx, cx, y - 7, 'READY PLATE', '#2ea66f', '#fff');
    } else {
      renderIngredientArt(ctx, station.item.id, cx, cy, 0.92);
    }
  } else if (station.decor) {
    drawCounterProps(ctx, cx, cy, station.decor);
  }
  drawStationLabel(ctx, cx, y, station.label, '#e9d8be');
}

function drawCounterProps(ctx, cx, cy, decor) {
  if (decor === 'copper_pots') {
    ctx.fillStyle = '#d87a32';
    ctx.strokeStyle = '#693210';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#9aa6b5';
    ctx.beginPath();
    ctx.arc(cx + 12, cy + 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d87a32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + 4);
    ctx.lineTo(cx + 2, cy + 12);
    ctx.stroke();
  } else if (decor === 'oil') {
    ctx.fillStyle = '#c89b32';
    traceRoundedRect(ctx, cx - 14, cy - 11, 10, 18, 3);
    ctx.fill();
    ctx.fillStyle = '#fcf4e3';
    traceRoundedRect(ctx, cx + 4, cy - 9, 9, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#3b2416';
    ctx.fillRect(cx - 11, cy - 14, 4, 3);
    ctx.fillRect(cx + 6, cy - 12, 5, 3);
  } else if (decor === 'plates') {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#fcf6ea';
      ctx.strokeStyle = '#cab794';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5 - i * 4.5, 19, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (decor === 'spice') {
    for (const [ox, col] of [[-12, '#e24b3a'], [0, '#f4b942'], [12, '#4ba85c']]) {
      ctx.fillStyle = col;
      ctx.strokeStyle = '#291c14';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx + ox, cy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (decor === 'rosemary') {
    ctx.fillStyle = '#b45c34';
    traceRoundedRect(ctx, cx - 10, cy, 20, 12, 4);
    ctx.fill();
    ctx.fillStyle = '#3ca65f';
    for (const [lx, ly] of [[-6, -6], [0, -10], [6, -6], [-3, -2], [4, -2]]) {
      ctx.beginPath();
      ctx.arc(cx + lx, cy + ly, 5.5, 0, Math.PI * 2);
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

function drawExpressiveChef(ctx, chef, kitchen, time) {
  for (const trail of chef.dashTrail) {
    ctx.save();
    ctx.globalAlpha = trail.life * 1.4;
    ctx.fillStyle = '#f4b942';
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
  ctx.scale(1.24, 1.24);

  /* Floor shadow */
  ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 18, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Chef Jacket */
  traceRoundedRect(ctx, -15, -6, 30, 23, 9);
  ctx.fillStyle = '#fcf8f0';
  ctx.fill();
  ctx.strokeStyle = '#3d2a20';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  /* Apron + Copper Trim */
  traceRoundedRect(ctx, -10.5, 1, 21, 16, 4.5);
  ctx.fillStyle = '#d97a32';
  ctx.fill();
  ctx.fillStyle = '#f4b942';
  ctx.fillRect(-10.5, 1, 21, 3.5);

  /* Saffron-Crimson Neckerchief */
  ctx.fillStyle = '#e04838';
  traceRoundedRect(ctx, -8, -6, 16, 5, 2.5);
  ctx.fill();

  /* Active Tool in Hand if Chopping or Searing */
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

  /* Head */
  ctx.fillStyle = '#f5cfa8';
  ctx.strokeStyle = '#3d2a20';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -14, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  /* Eyes & Smile */
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

  /* Tall Pleated Toque Hat */
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#b9a892';
  ctx.lineWidth = 1.5;
  traceRoundedRect(ctx, -11, -26, 22, 7.5, 3);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-6, -29.5, 7, 0, Math.PI * 2);
  ctx.arc(6, -29.5, 7, 0, Math.PI * 2);
  ctx.arc(0, -32.5, 8.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  /* Held Ingredient or Steaming Dish */
  if (chef.holding) {
    const hx = chef.facingX * 11;
    const hy = -42 + chef.facingY * 3;
    if (chef.holding.kind === 'plate') {
      renderPlatedDish(ctx, chef.holding.recipeId, hx, hy, 0.88, true);
      ctx.restore();
      drawPillBadge(ctx, x + hx * 1.2, y - 82, 'SERVE ->', '#f4b942', '#1d140d');
      return;
    }
    renderIngredientArt(ctx, chef.holding.id, hx, hy, 0.88);
  }

  ctx.restore();
}

function drawHeatLampGlow(ctx) {
  const passX = GRID_ORIGIN_X + 10.5 * TILE_W;
  const passY = GRID_ORIGIN_Y + 2.5 * TILE_H;
  const glow = ctx.createRadialGradient(passX, passY, 16, passX, passY, 130);
  glow.addColorStop(0, 'rgba(255, 214, 118, 0.34)');
  glow.addColorStop(0.55, 'rgba(255, 190, 88, 0.14)');
  glow.addColorStop(1, 'rgba(255, 190, 88, 0)');
  ctx.save();
  ctx.fillStyle = glow;
  ctx.fillRect(passX - 135, passY - 120, 270, 240);
  ctx.restore();
}

function drawDinnerLanternVignette(ctx) {
  const vig = ctx.createRadialGradient(CANVAS_WIDTH / 2, 420, 240, CANVAS_WIDTH / 2, 420, 680);
  vig.addColorStop(0, 'rgba(255, 195, 105, 0.04)');
  vig.addColorStop(1, 'rgba(18, 10, 6, 0.36)');
  ctx.save();
  ctx.fillStyle = vig;
  ctx.fillRect(0, PLAYFIELD_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAYFIELD_TOP);
  ctx.restore();
}
