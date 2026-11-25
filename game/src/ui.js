import {
  BOTTOM_BAR_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COMBO_WINDOW,
  HUD_HEIGHT,
  RAIL_HEIGHT,
  RAIL_TOP,
} from './config.js';
import { traceRoundedRect } from './drawPrimitives.js';
import { renderIngredientArt, renderPlatedDish } from './foodArt.js';
import { describeItemLabel } from './kitchen.js';
import { INGREDIENTS, MENU_CARDS, RECIPE_BY_ID } from './recipes.js';

export function renderHudAndOrderRail(ctx, world) {
  const hudGrad = ctx.createLinearGradient(0, 0, 0, HUD_HEIGHT);
  hudGrad.addColorStop(0, '#241c18');
  hudGrad.addColorStop(1, '#16110f');
  ctx.fillStyle = hudGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);

  ctx.fillStyle = '#d87a32';
  ctx.fillRect(0, HUD_HEIGHT - 2, CANVAS_WIDTH, 2);

  /* Brand & Shift Pill */
  ctx.fillStyle = '#f4b942';
  ctx.font = '900 20px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SAFFRON & STEEL', 18, 27);

  traceRoundedRect(ctx, 214, 13, 194, 28, 14);
  ctx.fillStyle = 'rgba(244, 185, 66, 0.16)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 185, 66, 0.55)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#fce8bd';
  ctx.font = '800 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.orders.shift.name, 311, 28);

  /* Timer Box */
  const urgent = world.timeRemaining <= 20;
  traceRoundedRect(ctx, 434, 8, 144, 38, 10);
  ctx.fillStyle = urgent ? 'rgba(217, 69, 58, 0.34)' : 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.strokeStyle = urgent ? '#ff6a5c' : 'rgba(244, 185, 66, 0.45)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = '#cbbba4';
  ctx.font = '800 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TIMER', 448, 19);
  ctx.fillStyle = urgent ? '#ff9d94' : '#ffffff';
  ctx.font = '900 22px "Consolas", "Courier New", monospace';
  ctx.fillText(formatClock(world.timeRemaining), 447, 36);

  /* Score Box */
  traceRoundedRect(ctx, 594, 8, 152, 38, 10);
  ctx.fillStyle = 'rgba(46, 166, 111, 0.18)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(110, 227, 166, 0.52)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = '#9fe9be';
  ctx.font = '800 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('REVENUE', 608, 19);
  ctx.fillStyle = '#fff6dc';
  ctx.font = '900 21px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText(`$${world.orders.score}`, 608, 36);

  /* Combo Box */
  const comboActive = world.orders.combo > 1 && world.orders.comboTimer > 0;
  traceRoundedRect(ctx, 762, 8, 168, 38, 10);
  ctx.fillStyle = comboActive ? 'rgba(244, 185, 66, 0.28)' : 'rgba(255, 255, 255, 0.06)';
  ctx.fill();
  ctx.strokeStyle = comboActive ? '#f4b942' : 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = comboActive ? '#f7d56b' : '#b7a995';
  ctx.font = '900 16px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  const comboLabel = world.orders.combo > 1 ? `x${world.orders.combo} COMBO!` : 'NO COMBO';
  ctx.fillText(comboLabel, 846, 24);

  if (world.orders.comboTimer > 0) {
    const ratio = Math.min(1, world.orders.comboTimer / COMBO_WINDOW);
    traceRoundedRect(ctx, 774, 36, 144 * ratio, 5, 2.5);
    ctx.fillStyle = '#f4b942';
    ctx.fill();
  }

  /* Stainless Order Rail */
  const railGrad = ctx.createLinearGradient(0, RAIL_TOP, 0, RAIL_TOP + RAIL_HEIGHT);
  railGrad.addColorStop(0, '#30343b');
  railGrad.addColorStop(0.5, '#25282e');
  railGrad.addColorStop(1, '#1d1f24');
  ctx.fillStyle = railGrad;
  ctx.fillRect(0, RAIL_TOP, CANVAS_WIDTH, RAIL_HEIGHT);

  ctx.fillStyle = '#6c7682';
  ctx.fillRect(14, RAIL_TOP + 6, CANVAS_WIDTH - 28, 6);
  ctx.fillStyle = '#9aa6b4';
  ctx.fillRect(14, RAIL_TOP + 6, CANVAS_WIDTH - 28, 2);

  const activeAssemblySet = new Set();
  for (const st of world.kitchen.stations.values()) {
    if (st.kind === 'assembly' && !st.completedRecipeId) {
      for (const ing of st.assemblyItems) activeAssemblySet.add(ing);
    }
  }

  const orders = world.orders.orders;
  const ticketW = 228;
  const ticketH = 98;
  const gap = 16;
  const startX = 24;

  orders.forEach((order, idx) => {
    const recipe = RECIPE_BY_ID[order.recipeId];
    const tx = startX + idx * (ticketW + gap);
    const ty = RAIL_TOP + 10;
    const pct = Math.max(0, Math.min(1, order.remaining / order.totalPatience));
    const headerColor = order.isVip ? '#eab035' : pct > 0.5 ? '#2ea66f' : pct > 0.25 ? '#e8962c' : '#d9453a';

    ctx.fillStyle = order.isVip ? '#f4b942' : '#c9d2dc';
    ctx.fillRect(tx + ticketW / 2 - 12, ty - 5, 24, 9);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
    traceRoundedRect(ctx, tx + 2, ty + 4, ticketW, ticketH, 8);
    ctx.fill();

    traceRoundedRect(ctx, tx, ty, ticketW, ticketH, 8);
    ctx.fillStyle = order.isVip ? '#fff9e6' : '#fcf4e3';
    ctx.fill();
    ctx.strokeStyle = order.isVip ? '#f4b942' : pct < 0.25 ? '#d9453a' : '#cbb899';
    ctx.lineWidth = order.isVip || pct < 0.25 ? 2.5 : 1.5;
    ctx.stroke();

    traceRoundedRect(ctx, tx + 1, ty + 1, ticketW - 2, 24, 7);
    ctx.fillStyle = headerColor;
    ctx.fill();

    ctx.fillStyle = order.isVip ? '#1f150c' : '#ffffff';
    ctx.font = '900 12px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const titlePrefix = order.isVip ? `★ #${order.id}` : `#${order.id}`;
    ctx.fillText(`${titlePrefix} ${recipe.shortName.toUpperCase()}`, tx + 8, ty + 13);

    ctx.textAlign = 'right';
    ctx.fillStyle = order.isVip ? '#2e1a05' : '#fff5c8';
    ctx.fillText(`+$${recipe.reward}`, tx + ticketW - 8, ty + 13);

    renderPlatedDish(ctx, recipe.id, tx + 34, ty + 55, 0.88, false);

    recipe.ingredients.forEach((ingId, stepIdx) => {
      const ix = tx + 88 + stepIdx * 46;
      const iy = ty + 53;
      const matched = activeAssemblySet.has(ingId);
      traceRoundedRect(ctx, ix - 19, iy - 19, 38, 38, 8);
      ctx.fillStyle = matched ? 'rgba(46, 166, 111, 0.2)' : 'rgba(130, 92, 54, 0.14)';
      ctx.fill();
      ctx.strokeStyle = matched ? '#2ea66f' : 'rgba(130, 92, 54, 0.35)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      renderIngredientArt(ctx, ingId, ix, iy, 0.6);
      if (matched) {
        ctx.fillStyle = '#2ea66f';
        ctx.beginPath();
        ctx.arc(ix + 13, iy - 13, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ix + 9.5, iy - 13);
        ctx.lineTo(ix + 12, iy - 10.5);
        ctx.lineTo(ix + 16.5, iy - 15.5);
        ctx.stroke();
      }
    });

    traceRoundedRect(ctx, tx + 8, ty + ticketH - 15, ticketW - 50, 8, 4);
    ctx.fillStyle = '#dfd0b8';
    ctx.fill();
    traceRoundedRect(ctx, tx + 8, ty + ticketH - 15, (ticketW - 50) * pct, 8, 4);
    ctx.fillStyle = pct > 0.5 ? '#2ea66f' : pct > 0.25 ? '#e8962c' : '#d9453a';
    ctx.fill();

    ctx.fillStyle = '#4a3525';
    ctx.font = '800 11px "Consolas", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(order.remaining)}s`, tx + ticketW - 8, ty + ticketH - 11);
  });

  if (orders.length === 0) {
    ctx.fillStyle = '#b4bcc7';
    ctx.font = '700 14px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ticket Rail Clear — New Orders Incoming!', CANVAS_WIDTH / 2, RAIL_TOP + 58);
  }

  /* Bottom Bar */
  ctx.fillStyle = '#171210';
  ctx.fillRect(0, BOTTOM_BAR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - BOTTOM_BAR_Y);
  ctx.fillStyle = 'rgba(216, 122, 50, 0.45)';
  ctx.fillRect(0, BOTTOM_BAR_Y, CANVAS_WIDTH, 2);

  const heldLabel = world.chef.holding
    ? `CARRYING: ${describeItemLabel(world.chef.holding).toUpperCase()}`
    : 'HANDS FREE — GRAB INGREDIENTS OR CLICK STATIONS';
  ctx.fillStyle = world.chef.holding ? '#f4b942' : '#d2c2aa';
  ctx.font = '800 13px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(heldLabel, 20, BOTTOM_BAR_Y + 22);

  ctx.fillStyle = '#b9a892';
  ctx.font = '700 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    'WASD / Arrows: Move  •  Space / E: Interact  •  Q / Shift: Dash  •  Click Any Station to Auto-Route',
    CANVAS_WIDTH - 20,
    BOTTOM_BAR_Y + 22,
  );
}

export function populateDomOverlays() {
  const strip = document.getElementById('title-recipe-strip');
  const guideGrid = document.getElementById('guide-recipes');
  if (!strip || !guideGrid) return;

  strip.innerHTML = '';
  guideGrid.innerHTML = '';

  for (const recipe of MENU_CARDS) {
    const stepNames = recipe.ingredients.map((id) => INGREDIENTS[id]?.short || id);

    const card = document.createElement('div');
    card.className = 'recipe-mini';

    const dot = document.createElement('canvas');
    dot.width = 64;
    dot.height = 64;
    dot.style.width = '36px';
    dot.style.height = '36px';
    renderPlatedDish(dot.getContext('2d'), recipe.id, 32, 32, 0.88, false);

    const nameEl = document.createElement('div');
    nameEl.className = 'dish-name';
    nameEl.textContent = recipe.shortName;

    const priceEl = document.createElement('div');
    priceEl.className = 'dish-price';
    priceEl.textContent = `$${recipe.reward}`;

    const stepsEl = document.createElement('div');
    stepsEl.className = 'dish-steps';
    stepsEl.textContent = stepNames.join(' + ');

    card.append(dot, nameEl, priceEl, stepsEl);
    strip.appendChild(card);
  }

  for (const recipe of Object.values(RECIPE_BY_ID)) {
    const stepNames = recipe.ingredients.map((id) => INGREDIENTS[id]?.short || id);
    const gItem = document.createElement('div');
    gItem.className = 'guide-item';

    const gCanvas = document.createElement('canvas');
    gCanvas.width = 64;
    gCanvas.height = 64;
    gCanvas.style.width = '40px';
    gCanvas.style.height = '40px';
    renderPlatedDish(gCanvas.getContext('2d'), recipe.id, 32, 32, 0.88, Boolean(recipe.isVip));

    const gText = document.createElement('div');
    gText.style.flex = '1';
    const gTitle = document.createElement('strong');
    gTitle.textContent = recipe.name;
    const gDesc = document.createElement('span');
    gDesc.textContent = stepNames.join('  •  ');
    gText.append(gTitle, gDesc);

    const gPrice = document.createElement('div');
    gPrice.className = 'guide-price';
    gPrice.textContent = `$${recipe.reward}`;

    gItem.append(gCanvas, gText, gPrice);
    guideGrid.appendChild(gItem);
  }
}

export function showClearScreen(world) {
  const clearEl = document.getElementById('clear-overlay');
  if (!clearEl) return;

  const stars = world.orders.computeStars();
  document.getElementById('clear-stars').textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
  document.getElementById('clear-subtitle').textContent = `${world.orders.shift.shortName.toUpperCase()} CLOSED`;
  document.getElementById('clear-score').textContent = `$${world.orders.score}`;
  document.getElementById('clear-served').textContent = String(world.orders.servedCount);
  document.getElementById('clear-combo').textContent = `x${world.orders.maxCombo}`;
  document.getElementById('clear-missed').textContent = String(world.orders.missedCount);

  const breakdownEl = document.getElementById('clear-breakdown');
  breakdownEl.innerHTML = '';
  const entries = Object.entries(world.orders.dishBreakdown);
  if (entries.length === 0) {
    const chip = document.createElement('span');
    chip.className = 'breakdown-chip';
    chip.textContent = 'Warm-up Shift Complete!';
    breakdownEl.appendChild(chip);
  } else {
    for (const [recipeId, count] of entries) {
      const chip = document.createElement('span');
      chip.className = 'breakdown-chip';
      chip.textContent = `${count}x ${RECIPE_BY_ID[recipeId]?.shortName || recipeId}`;
      breakdownEl.appendChild(chip);
    }
  }

  clearEl.classList.remove('hidden');
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
