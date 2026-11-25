import {
  BURN_DURATION,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COUNTER_BEVEL,
  GRID_COLS,
  GRID_ORIGIN_X,
  GRID_ORIGIN_Y,
  GRID_ROWS,
  PALETTE,
  PLAYFIELD_TOP,
  SEAR_DURATION,
  TILE_H,
  TILE_W,
} from './config.js';
import { drawAssemblyProgress, drawIngredientIcon, drawPlatedDish } from './foodArt.js';
import { findTargetStationForChef, isWalkable, pxToTile } from './kitchen.js';
import { INGREDIENTS, RECIPE_BY_ID, findMatchingRecipes } from './recipes.js';

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBadge(ctx, cx, cy, text, bgColor, textColor = '#1c1410', borderColor = '#fff4dc') {
  ctx.save();
  ctx.font = '900 11px "Trebuchet MS", "Segoe UI", sans-serif';
  const w = Math.max(44, ctx.measureText(text).width + 14);
  const h = 18;
  roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 9);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 0.5);
  ctx.restore();
}

function drawFloor(ctx, kitchen) {
  const grad = ctx.createLinearGradient(0, PLAYFIELD_TOP, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#2a201b');
  grad.addColorStop(1, '#181210');
  ctx.fillStyle = grad;
  ctx.fillRect(0, PLAYFIELD_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - PLAYFIELD_TOP);

  const floorX = GRID_ORIGIN_X - 8;
  const floorY = GRID_ORIGIN_Y - 8;
  const floorW = GRID_COLS * TILE_W + 16;
  const floorH = GRID_ROWS * TILE_H + COUNTER_BEVEL + 14;

  roundRectPath(ctx, floorX, floorY, floorW, floorH, 12);
  ctx.fillStyle = '#33261f';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#5c4230';
  ctx.stroke();

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tx = GRID_ORIGIN_X + c * TILE_W;
      const ty = GRID_ORIGIN_Y + r * TILE_H;
      const even = (r + c) % 2 === 0;
      ctx.fillStyle = even ? PALETTE.floorLight : PALETTE.floorDark;
      ctx.fillRect(tx + 1, ty + 1, TILE_W - 2, TILE_H - 2);

      ctx.fillStyle = 'rgba(255, 250, 240, 0.08)';
      ctx.fillRect(tx + 2, ty + 2, TILE_W - 4, 4);
      ctx.strokeStyle = PALETTE.floorGrout;
      ctx.lineWidth = 1;
      ctx.strokeRect(tx + 0.5, ty + 0.5, TILE_W - 1, TILE_H - 1);

      if (isWalkable(kitchen, c, r) && r === 1) {
        ctx.fillStyle = 'rgba(40, 26, 18, 0.14)';
        ctx.fillRect(tx, ty, TILE_W, 8);
      }
    }
  }
}

function drawCounterBase(ctx, x, y, topColor, frontColor, highlight) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
  roundRectPath(ctx, x + 3, y + 6, TILE_W - 4, TILE_H + COUNTER_BEVEL - 4, 8);
  ctx.fill();

  /* Front 2.5D bevel */
  roundRectPath(ctx, x + 2, y + TILE_H - 8, TILE_W - 4, COUNTER_BEVEL + 6, 6);
  ctx.fillStyle = frontColor;
  ctx.fill();
  ctx.strokeStyle = '#241711';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* Top face */
  roundRectPath(ctx, x + 2, y + 2, TILE_W - 4, TILE_H - 6, 8);
  ctx.fillStyle = topColor;
  ctx.fill();
  ctx.strokeStyle = highlight ? '#f4b942' : '#432d1e';
  ctx.lineWidth = highlight ? 3 : 1.6;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 246, 224, 0.14)';
  ctx.fillRect(x + 6, y + 4, TILE_W - 12, 4);
}

function drawStationLabel(ctx, cx, yTileTop, label, accent = '#f5e8d0') {
  ctx.save();
  ctx.font = '800 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(22, 16, 13, 0.88)';
  const w = ctx.measureText(label).width + 10;
  const labelY = yTileTop + TILE_H - 12;
  roundRectPath(ctx, cx - w / 2, labelY - 7, w, 14, 4);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.fillText(label, cx, labelY);
  ctx.restore();
}

function drawStationDecor(ctx, cx, cy, decor) {
  if (decor === 'pots') {
    ctx.fillStyle = '#d87a32';
    ctx.strokeStyle = '#6c3412';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 4, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#8b99a8';
    ctx.beginPath();
    ctx.arc(cx + 12, cy + 2, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (decor === 'oil') {
    ctx.fillStyle = '#c89b32';
    roundRectPath(ctx, cx - 14, cy - 10, 10, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#fcf4e3';
    roundRectPath(ctx, cx + 4, cy - 8, 9, 14, 3);
    ctx.fill();
  } else if (decor === 'plates') {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#fcf6ea';
      ctx.strokeStyle = '#cab794';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4 - i * 4, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (decor === 'spice') {
    for (const [ox, col] of [[-12, '#e24b3a'], [0, '#f4b942'], [12, '#4ba85c']]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx + ox, cy - 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawStation(ctx, station, time, highlighted) {
  const x = GRID_ORIGIN_X + station.col * TILE_W;
  const y = GRID_ORIGIN_Y + station.row * TILE_H;
  const cx = x + TILE_W * 0.5;
  const cy = y + TILE_H * 0.42;

  if (station.kind === 'crate') {
    drawCounterBase(ctx, x, y, PALETTE.woodTop, PALETTE.woodFront, highlighted);
    roundRectPath(ctx, x + 13, y + 7, TILE_W - 26, TILE_H - 25, 6);
    ctx.fillStyle = '#5c381f';
    ctx.fill();
    ctx.strokeStyle = '#b98350';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawIngredientIcon(ctx, station.itemType, cx - 10, cy - 2, 0.82);
    drawIngredientIcon(ctx, station.itemType, cx + 10, cy + 1, 0.82);
    drawStationLabel(ctx, cx, y, station.label, '#ffe4a8');
    return;
  }

  if (station.kind === 'stove') {
    drawCounterBase(ctx, x, y, PALETTE.steelTop, PALETTE.steelFront, highlighted);
    const active = Boolean(station.item);
    const hot = station.item === 'seared_steak' || station.item === 'seared_salmon';
    const warning = hot && station.progress > BURN_DURATION - 2.2;

    /* Copper burner ring */
    ctx.fillStyle = '#25292e';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = active ? (warning ? '#ff5938' : '#f49c36') : '#b56327';
    ctx.lineWidth = active ? 3.5 : 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 19.5, 0, Math.PI * 2);
    ctx.stroke();

    if (active) {
      const pulseR = 20.5 + Math.sin(time * 14) * 1.5;
      ctx.strokeStyle = warning ? 'rgba(255, 80, 48, 0.88)' : 'rgba(92, 208, 255, 0.78)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* Cast-iron skillet */
    ctx.fillStyle = '#2b2e34';
    ctx.strokeStyle = '#525864';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 16.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* Skillet handle */
    ctx.strokeStyle = '#d87a32';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy + 5);
    ctx.lineTo(cx + 28, cy + 12);
    ctx.stroke();
    ctx.lineCap = 'butt';

    if (station.item) {
      drawIngredientIcon(ctx, station.item, cx, cy, 0.86);
      const barW = 70;
      const barX = cx - barW / 2;
      const barY = y + 4;
      roundRectPath(ctx, barX - 2, barY - 2, barW + 4, 10, 5);
      ctx.fillStyle = 'rgba(18, 13, 11, 0.92)';
      ctx.fill();

      if (station.burned) {
        drawBadge(ctx, cx, y + 8, 'BURNED!', '#d9453a', '#fff');
      } else if (station.item === 'steak' || station.item === 'salmon') {
        const pct = Math.min(1, station.progress / SEAR_DURATION);
        roundRectPath(ctx, barX, barY, Math.max(4, barW * pct), 6, 3);
        ctx.fillStyle = '#f4b942';
        ctx.fill();
      } else {
        const burnPct = Math.min(1, (station.progress - SEAR_DURATION) / (BURN_DURATION - SEAR_DURATION));
        const flash = warning && Math.sin(time * 18) > 0;
        roundRectPath(ctx, barX, barY, Math.max(4, barW * (1 - burnPct)), 6, 3);
        ctx.fillStyle = warning ? (flash ? '#ff4f3d' : '#ff9838') : '#38c77b';
        ctx.fill();
        drawBadge(
          ctx,
          cx,
          y + 8,
          warning ? 'PULL NOW!' : 'SEARED!',
          warning ? '#e64937' : '#2ea66f',
          '#fff',
        );
      }
    }
    drawStationLabel(ctx, cx, y, station.label, '#f7c488');
    return;
  }

  if (station.kind === 'chop') {
    drawCounterBase(ctx, x, y, PALETTE.woodTop, PALETTE.woodFront, highlighted);
    roundRectPath(ctx, x + 15, y + 8, TILE_W - 30, TILE_H - 25, 6);
    ctx.fillStyle = PALETTE.butcherTop;
    ctx.fill();
    ctx.strokeStyle = PALETTE.butcherSide;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (station.item) {
      drawIngredientIcon(ctx, station.item, cx - 4, cy, 0.9);
      if (station.progress > 0 && station.progress < 1) {
        const slash = Math.sin(time * 24) * 5;
        ctx.save();
        ctx.translate(cx + 12, cy - 6 + slash);
        ctx.rotate(-0.45);
        ctx.fillStyle = '#e7edf3';
        ctx.fillRect(-13, -3, 21, 6);
        ctx.fillStyle = '#3b2416';
        ctx.fillRect(8, -2, 9, 4);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + 22, y + 18, 11, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18, 13, 11, 0.92)';
        ctx.fill();
        ctx.strokeStyle = '#2ea66f';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(x + 22, y + 18, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * station.progress);
        ctx.stroke();
        ctx.restore();
      } else {
        drawBadge(ctx, cx, y + 8, 'READY!', '#2ea66f', '#fff');
      }
    } else {
      ctx.save();
      ctx.translate(cx + 12, cy - 2);
      ctx.rotate(-0.55);
      ctx.fillStyle = '#cfd8e3';
      ctx.fillRect(-13, -3, 20, 6);
      ctx.fillStyle = '#4a2c18';
      ctx.fillRect(7, -2.5, 10, 5);
      ctx.restore();
    }
    drawStationLabel(ctx, cx, y, station.label, '#f7e5c6');
    return;
  }

  if (station.kind === 'assembly') {
    drawCounterBase(ctx, x, y, '#b77f4f', '#6d4425', highlighted);
    roundRectPath(ctx, x + 12, y + 7, TILE_W - 24, TILE_H - 24, 8);
    ctx.fillStyle = '#ebd6b3';
    ctx.fill();
    ctx.strokeStyle = '#8b5d33';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (station.completedRecipeId) {
      drawPlatedDish(ctx, station.completedRecipeId, cx, cy, 0.98, true);
      const recipe = RECIPE_BY_ID[station.completedRecipeId];
      drawBadge(ctx, cx, y - 9, `READY: ${recipe.shortName.toUpperCase()}`, '#f4b942', '#1e140d');
    } else if (station.assemblyItems.length > 0) {
      drawAssemblyProgress(ctx, station.assemblyItems, cx, cy, 0.94);
      const matches = findMatchingRecipes(station.assemblyItems);
      const hintRecipe = matches[0];
      let hintText = `${station.assemblyItems.length}/3`;
      if (hintRecipe) {
        const missing = hintRecipe.ingredients.find((ing) => !station.assemblyItems.includes(ing));
        if (missing && INGREDIENTS[missing]) {
          hintText = `${station.assemblyItems.length}/3 +${INGREDIENTS[missing].short}`;
        }
      }
      drawBadge(ctx, cx, y - 8, hintText, '#32251d', '#f9d878', '#f4b942');
    } else {
      ctx.strokeStyle = 'rgba(139, 93, 51, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    drawStationLabel(ctx, cx, y, station.label, '#fff1cf');
    return;
  }

  if (station.kind === 'serve') {
    drawCounterBase(ctx, x, y, '#c78c40', '#794e1c', highlighted);

    const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 44);
    glow.addColorStop(0, 'rgba(255, 224, 125, 0.48)');
    glow.addColorStop(1, 'rgba(255, 224, 125, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, TILE_W, TILE_H);

    roundRectPath(ctx, x + 14, y + 7, TILE_W - 28, TILE_H - 25, 6);
    ctx.fillStyle = '#3a291b';
    ctx.fill();
    ctx.strokeStyle = '#f4b942';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (station.hasBell) {
      ctx.fillStyle = '#d1982b';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8d05a';
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
      drawStationLabel(ctx, cx, y, 'SERVE BELL', '#ffe79c');
    } else {
      ctx.fillStyle = '#f4b942';
      ctx.font = '900 12px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RING BELL', cx, cy);
      drawStationLabel(ctx, cx, y, 'SERVE PASS', '#ffe79c');
    }
    return;
  }

  if (station.kind === 'trash') {
    drawCounterBase(ctx, x, y, '#4a4e54', '#2b2e33', highlighted);
    roundRectPath(ctx, x + 22, y + 8, TILE_W - 44, TILE_H - 27, 8);
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

  /* Generic prep / staging counter */
  drawCounterBase(ctx, x, y, PALETTE.woodTop, PALETTE.woodFront, highlighted);
  if (station.item) {
    if (station.item.kind === 'plate') {
      drawPlatedDish(ctx, station.item.recipeId, cx, cy, 0.94, true);
      drawBadge(ctx, cx, y - 7, 'READY PLATE', '#2ea66f', '#fff');
    } else {
      drawIngredientIcon(ctx, station.item.id, cx, cy, 0.92);
    }
  } else if (station.decor) {
    drawStationDecor(ctx, cx, cy, station.decor);
  }
  drawStationLabel(ctx, cx, y, station.label, '#e5d4bb');
}

function drawChef(ctx, chef) {
  const bob = Math.abs(Math.sin(chef.walkPhase)) * 3.5;
  const x = chef.x;
  const y = chef.y - bob;

  ctx.save();
  /* Drop shadow */
  ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
  ctx.beginPath();
  ctx.ellipse(chef.x, chef.y + 18, 19, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Dash aura */
  if (chef.dashTime > 0) {
    ctx.fillStyle = 'rgba(244, 185, 66, 0.35)';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Body / Chef Jacket */
  roundRectPath(ctx, x - 17, y - 6, 34, 25, 10);
  ctx.fillStyle = '#fcf8f0';
  ctx.fill();
  ctx.strokeStyle = '#3d2a20';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* Saffron & Copper Apron */
  roundRectPath(ctx, x - 12, y + 1, 24, 17, 5);
  ctx.fillStyle = '#d97a32';
  ctx.fill();
  ctx.fillStyle = '#f4b942';
  ctx.fillRect(x - 12, y + 1, 24, 4);

  /* Saffron neck scarf */
  ctx.fillStyle = '#e04f3e';
  roundRectPath(ctx, x - 8, y - 6, 16, 5, 2.5);
  ctx.fill();

  /* Head */
  ctx.fillStyle = '#f5cfa8';
  ctx.strokeStyle = '#3d2a20';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(x, y - 14, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  /* Eyes pointing in facing direction */
  const ex = chef.facingX * 3.2;
  const ey = chef.facingY * 2.0;
  ctx.fillStyle = '#241812';
  ctx.beginPath();
  ctx.arc(x - 4.2 + ex, y - 14 + ey, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 4.2 + ex, y - 14 + ey, 2.2, 0, Math.PI * 2);
  ctx.fill();

  /* Chef's Toque Hat */
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#b9a892';
  ctx.lineWidth = 1.7;
  roundRectPath(ctx, x - 11.5, y - 27, 23, 8, 3);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - 6, y - 30, 7.5, 0, Math.PI * 2);
  ctx.arc(x + 6, y - 30, 7.5, 0, Math.PI * 2);
  ctx.arc(x, y - 33, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  /* Held item overhead */
  if (chef.holding) {
    const hx = x + chef.facingX * 14;
    const hy = y - 40 + chef.facingY * 4;
    if (chef.holding.kind === 'plate') {
      drawPlatedDish(ctx, chef.holding.recipeId, hx, hy, 0.92, true);
      drawBadge(ctx, hx, hy - 26, 'SERVE ->', '#f4b942', '#1d140d');
    } else {
      drawIngredientIcon(ctx, chef.holding.id, hx, hy, 0.92);
    }
  }

  ctx.restore();
}

export function renderKitchenWorld(ctx, world) {
  drawFloor(ctx, world.kitchen);

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
      drawStation(ctx, station, world.elapsed, isHighlighted);
    }
    if (row === chefRow) {
      drawChef(ctx, world.chef);
    }
  }

  world.particles.draw(ctx);
}
