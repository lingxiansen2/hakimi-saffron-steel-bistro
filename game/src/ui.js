import {
  BOTTOM_BAR_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COMBO_WINDOW,
  HUD_HEIGHT,
  KITCHEN_UPGRADES,
  RAIL_HEIGHT,
  RAIL_TOP,
} from './config.js';
import { traceRoundedRect } from './drawPrimitives.js';
import { renderIngredientArt, renderPlatedDish } from './foodArt.js';
import { describeItemLabel } from './kitchen.js';
import { INGREDIENTS, MENU_CARDS, RECIPE_BY_ID } from './recipes.js';

export function renderHudAndOrderRail(ctx, world) {
  const hudGrad = ctx.createLinearGradient(0, 0, 0, HUD_HEIGHT);
  hudGrad.addColorStop(0, '#261d19');
  hudGrad.addColorStop(1, '#16110f');
  ctx.fillStyle = hudGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);

  ctx.fillStyle = '#d87a32';
  ctx.fillRect(0, HUD_HEIGHT - 2, CANVAS_WIDTH, 2);

  ctx.fillStyle = '#f4b942';
  ctx.font = '900 20px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SAFFRON & STEEL', 18, 27);

  traceRoundedRect(ctx, 212, 13, 194, 28, 14);
  ctx.fillStyle = 'rgba(244, 185, 66, 0.16)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 185, 66, 0.55)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#fce8bd';
  ctx.font = '800 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.orders.shift.name, 309, 28);

  const urgent = world.timeRemaining <= 20;
  traceRoundedRect(ctx, 424, 7, 168, 40, 10);
  ctx.fillStyle = urgent ? '#7a1f19' : '#2a221c';
  ctx.fill();
  ctx.strokeStyle = urgent ? '#ff7c6e' : '#f4b942';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawClockDialGlyph(ctx, 447, 27, urgent);

  ctx.fillStyle = urgent ? '#ffd0ca' : '#f4d38a';
  ctx.font = '900 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TIMER', 470, 17);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "Consolas", "Courier New", monospace';
  ctx.fillText(formatClock(world.timeRemaining), 469, 36);

  traceRoundedRect(ctx, 604, 7, 150, 40, 10);
  ctx.fillStyle = 'rgba(46, 166, 111, 0.22)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(110, 227, 166, 0.6)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = '#a8f2c6';
  ctx.font = '800 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('REVENUE', 618, 17);
  ctx.fillStyle = '#fff8e2';
  ctx.font = '900 22px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText(`$${world.orders.score}`, 618, 36);

  const comboActive = world.orders.combo > 1 && world.orders.comboTimer > 0;
  traceRoundedRect(ctx, 766, 7, 168, 40, 10);
  ctx.fillStyle = comboActive ? 'rgba(244, 185, 66, 0.28)' : 'rgba(255, 255, 255, 0.06)';
  ctx.fill();
  ctx.strokeStyle = comboActive ? '#f4b942' : 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = comboActive ? '#ffe078' : '#b7a995';
  ctx.font = '900 16px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  const comboLabel = world.orders.combo > 1 ? `x${world.orders.combo} COMBO!` : 'NO COMBO';
  ctx.fillText(comboLabel, 850, 23);

  if (world.orders.comboTimer > 0) {
    const ratio = Math.min(1, world.orders.comboTimer / COMBO_WINDOW);
    traceRoundedRect(ctx, 778, 36, 144 * ratio, 5, 2.5);
    ctx.fillStyle = '#f4b942';
    ctx.fill();
  }

  /* Stainless Order Rail */
  const railGrad = ctx.createLinearGradient(0, RAIL_TOP, 0, RAIL_TOP + RAIL_HEIGHT);
  railGrad.addColorStop(0, '#363b42');
  railGrad.addColorStop(0.5, '#292d34');
  railGrad.addColorStop(1, '#1e2127');
  ctx.fillStyle = railGrad;
  ctx.fillRect(0, RAIL_TOP, CANVAS_WIDTH, RAIL_HEIGHT);

  ctx.fillStyle = '#7c8694';
  ctx.fillRect(14, RAIL_TOP + 6, CANVAS_WIDTH - 28, 6);
  ctx.fillStyle = '#b4c0cf';
  ctx.fillRect(14, RAIL_TOP + 6, CANVAS_WIDTH - 28, 2);

  const activeAssemblySet = new Set();
  for (const st of world.kitchen.stations.values()) {
    if (st.kind === 'assembly' && !st.completedRecipeId) {
      for (const ing of st.assemblyItems) activeAssemblySet.add(ing);
    }
  }

  const orders = world.orders.orders;
  const ticketW = 228;
  const ticketH = 99;
  const gap = 16;
  const startX = 24;

  orders.forEach((order, idx) => {
    const recipe = RECIPE_BY_ID[order.recipeId];
    const tx = startX + idx * (ticketW + gap);
    const ty = RAIL_TOP + 10;
    const pct = Math.max(0, Math.min(1, order.remaining / order.totalPatience));
    const barColor = pct > 0.5 ? '#2d8a5b' : pct > 0.25 ? '#d97e24' : '#c9382e';
    const headerColor = order.isVip ? '#d4911a' : barColor;

    ctx.fillStyle = '#d3dce6';
    ctx.strokeStyle = '#535d69';
    ctx.lineWidth = 1.2;
    traceRoundedRect(ctx, tx + ticketW / 2 - 14, ty - 6, 28, 10, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    traceRoundedRect(ctx, tx + 2, ty + 4, ticketW, ticketH, 8);
    ctx.fill();

    const paperGrad = ctx.createLinearGradient(tx, ty, tx, ty + ticketH);
    paperGrad.addColorStop(0, order.isVip ? '#fff9e6' : '#fff7e6');
    paperGrad.addColorStop(1, order.isVip ? '#f9e3ad' : '#f2e2c2');
    traceRoundedRect(ctx, tx, ty, ticketW, ticketH, 8);
    ctx.fillStyle = paperGrad;
    ctx.fill();
    ctx.strokeStyle = order.isVip ? '#f4b942' : pct < 0.25 ? '#d9453a' : '#b89d72';
    ctx.lineWidth = order.isVip || pct < 0.25 ? 2.4 : 1.6;
    ctx.stroke();

    traceRoundedRect(ctx, tx + 1, ty + 1, ticketW - 2, 25, 7);
    ctx.fillStyle = headerColor;
    ctx.fill();

    ctx.textBaseline = 'middle';
    if (order.isVip) {
      drawCrownGlyph(ctx, tx + 13, ty + 14);
      ctx.fillStyle = '#1f1204';
      ctx.font = '900 11.5px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      const vipLabel = recipe.shortName.replace(/^VIP\s+/i, '').toUpperCase();
      ctx.fillText(`VIP #${order.id} ${vipLabel}`, tx + 24, ty + 14);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#291702';
      ctx.fillText(`+$${recipe.reward}`, tx + ticketW - 8, ty + 14);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 12px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${order.id} ${recipe.shortName.toUpperCase()}`, tx + 9, ty + 14);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff6cf';
      ctx.fillText(`+$${recipe.reward}`, tx + ticketW - 8, ty + 14);
    }

    renderPlatedDish(ctx, recipe.id, tx + 35, ty + 55, 0.8, false);

    recipe.ingredients.forEach((ingId, stepIdx) => {
      const ix = tx + 88 + stepIdx * 46;
      const iy = ty + 54;
      const matched = activeAssemblySet.has(ingId);
      traceRoundedRect(ctx, ix - 19, iy - 19, 38, 38, 8);
      ctx.fillStyle = matched ? 'rgba(45, 138, 91, 0.22)' : 'rgba(92, 62, 34, 0.12)';
      ctx.fill();
      ctx.strokeStyle = matched ? '#2d8a5b' : 'rgba(110, 78, 44, 0.42)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      renderIngredientArt(ctx, ingId, ix, iy, 0.57);
      if (matched) {
        ctx.fillStyle = '#2d8a5b';
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
    ctx.fillStyle = '#d7c4a1';
    ctx.fill();
    traceRoundedRect(ctx, tx + 8, ty + ticketH - 15, (ticketW - 50) * pct, 8, 4);
    ctx.fillStyle = barColor;
    ctx.fill();

    ctx.fillStyle = '#332215';
    ctx.font = '900 11px "Consolas", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(order.remaining)}s`, tx + ticketW - 8, ty + ticketH - 11);
  });

  if (orders.length === 0) {
    ctx.fillStyle = '#c9d0da';
    ctx.font = '700 14px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ticket Rail Clear — New Orders Incoming!', CANVAS_WIDTH / 2, RAIL_TOP + 58);
  }

  /* Bottom Bar with Active Chef Brigade Pill */
  ctx.fillStyle = '#171210';
  ctx.fillRect(0, BOTTOM_BAR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - BOTTOM_BAR_Y);
  ctx.fillStyle = 'rgba(216, 122, 50, 0.45)';
  ctx.fillRect(0, BOTTOM_BAR_Y, CANVAS_WIDTH, 2);

  const activeChef = (world.chefs && world.chefs[world.activeChefIdx || 0]) || world.chef;
  const isHana = activeChef.id === 'hana';
  traceRoundedRect(ctx, 16, BOTTOM_BAR_Y + 8, 178, 26, 13);
  ctx.fillStyle = isHana ? '#204e59' : '#57311a';
  ctx.fill();
  ctx.strokeStyle = '#f4b942';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#fff5d6';
  ctx.font = '900 11.5px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`ACTIVE: ${activeChef.name} [TAB]`, 105, BOTTOM_BAR_Y + 21);

  const heldLabel = activeChef.holding
    ? `CARRYING: ${describeItemLabel(activeChef.holding).toUpperCase()}`
    : 'HANDS FREE — GRAB OR CLICK STATIONS';
  ctx.fillStyle = activeChef.holding ? '#f4b942' : '#d2c2aa';
  ctx.font = '800 12.5px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(heldLabel, 210, BOTTOM_BAR_Y + 21);

  ctx.fillStyle = '#b9a892';
  ctx.font = '700 11.5px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    'WASD: Move  •  Space/E: Act  •  Tab: Switch Chef  •  Q: Dash  •  Click Station',
    CANVAS_WIDTH - 18,
    BOTTOM_BAR_Y + 21,
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
    dot.style.width = '40px';
    dot.style.height = '40px';
    renderPlatedDish(dot.getContext('2d'), recipe.id, 32, 32, 0.78, false);

    const info = document.createElement('div');
    info.className = 'dish-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'dish-name';
    nameEl.textContent = `${recipe.shortName} · `;
    const priceSpan = document.createElement('span');
    priceSpan.className = 'dish-price';
    priceSpan.textContent = `$${recipe.reward}`;
    nameEl.appendChild(priceSpan);

    const stepsEl = document.createElement('div');
    stepsEl.className = 'dish-steps';
    stepsEl.textContent = stepNames.join(' + ');

    info.append(nameEl, stepsEl);
    card.append(dot, info);
    strip.appendChild(card);
  }

  for (const recipe of Object.values(RECIPE_BY_ID)) {
    const stepNames = recipe.ingredients.map((id) => INGREDIENTS[id]?.short || id);
    const gItem = document.createElement('div');
    gItem.className = 'guide-item';

    const gCanvas = document.createElement('canvas');
    gCanvas.width = 64;
    gCanvas.height = 64;
    gCanvas.style.width = '36px';
    gCanvas.style.height = '36px';
    renderPlatedDish(gCanvas.getContext('2d'), recipe.id, 32, 32, 0.78, Boolean(recipe.isVip));

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

export function showClearScreen(world, sessionBank = 0, ownedUpgrades = new Set(), onBuyUpgrade = null) {
  const clearEl = document.getElementById('clear-overlay');
  if (!clearEl) return;

  const stars = world.orders.computeStars();
  document.getElementById('clear-stars').textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
  document.getElementById('clear-subtitle').textContent = `${world.orders.shift.shortName.toUpperCase()} CLOSED`;
  document.getElementById('clear-score').textContent = `$${world.orders.score}`;
  document.getElementById('clear-served').textContent = String(world.orders.servedCount);
  document.getElementById('clear-combo').textContent = `x${world.orders.maxCombo}`;
  document.getElementById('clear-bank').textContent = `$${sessionBank}`;

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
      const mini = document.createElement('canvas');
      mini.width = 28;
      mini.height = 28;
      mini.style.width = '18px';
      mini.style.height = '18px';
      renderPlatedDish(mini.getContext('2d'), recipeId, 14, 14, 0.36, false);
      const txt = document.createElement('span');
      txt.textContent = `${count}x ${RECIPE_BY_ID[recipeId]?.shortName || recipeId}`;
      chip.append(mini, txt);
      breakdownEl.appendChild(chip);
    }
  }

  const shopEl = document.getElementById('upgrade-shop');
  if (shopEl) {
    shopEl.innerHTML = '';
    for (const upg of KITCHEN_UPGRADES) {
      const owned = ownedUpgrades.has(upg.id);
      const card = document.createElement('div');
      card.className = `upgrade-card${owned ? ' owned' : ''}`;

      const title = document.createElement('strong');
      title.textContent = upg.name;
      const desc = document.createElement('span');
      desc.textContent = upg.desc;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `upgrade-btn${owned ? ' owned' : ''}`;
      btn.dataset.upgradeId = upg.id;
      btn.textContent = owned ? 'OWNED ✓' : `BUY $${upg.cost}`;
      btn.disabled = owned || sessionBank < upg.cost;
      if (!owned && onBuyUpgrade) {
        btn.addEventListener('click', () => onBuyUpgrade(upg.id));
      }

      card.append(title, desc, btn);
      shopEl.appendChild(card);
    }
  }

  clearEl.classList.remove('hidden');
}

function drawClockDialGlyph(ctx, cx, cy, urgent) {
  ctx.save();
  ctx.fillStyle = urgent ? '#ffdfdc' : '#fff6de';
  ctx.strokeStyle = urgent ? '#ff6a5c' : '#d87a32';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#291a10';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - 6);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 5, cy + 2);
  ctx.stroke();
  ctx.restore();
}

function drawCrownGlyph(ctx, cx, cy) {
  ctx.save();
  ctx.fillStyle = '#291702';
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 4);
  ctx.lineTo(cx - 7, cy - 3);
  ctx.lineTo(cx - 3, cy);
  ctx.lineTo(cx, cy - 5);
  ctx.lineTo(cx + 3, cy);
  ctx.lineTo(cx + 7, cy - 3);
  ctx.lineTo(cx + 6, cy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
