import { preloadBistroAssets } from './assets.js';
import { BistroSoundEngine } from './audio.js';
import { createChefState, stepChefMovement, triggerChefDash } from './chef.js';
import { BOTTOM_BAR_Y, CANVAS_HEIGHT, CANVAS_WIDTH, KITCHEN_UPGRADES, SHIFTS } from './config.js';
import {
  buildKitchenGrid,
  findBestAdjacentApproach,
  findPath,
  findTargetStationForChef,
  getStation,
  interactWithStation,
  isWalkable,
  pxToTile,
  stepKitchenStations,
  tileCenterPx,
} from './kitchen.js';
import { renderBistroKitchen } from './kitchenRenderer.js';
import { OrderTicketQueue } from './orders.js';
import { KitchenParticleEngine } from './particles.js';
import { applyDeterministicShot, getShotParam } from './shots.js';
import { populateDomOverlays, renderHudAndOrderRail, showClearScreen } from './ui.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const audio = new BistroSoundEngine();

let selectedShiftIndex = 1;
let world = null;
let sessionBank = 0;
const ownedUpgrades = new Set();
const keysDown = new Set();

export function createGameWorld(shiftIndex = selectedShiftIndex) {
  const kitchen = buildKitchenGrid();
  const patienceBoost = ownedUpgrades.has('heat_lamps') ? 1.25 : 1.0;
  const orders = new OrderTicketQueue(shiftIndex, patienceBoost);
  orders.seedInitialOrders(Math.min(3, orders.shift.maxOrders));
  const chefs = [createChefState(6, 1, 'ren'), createChefState(4, 3, 'hana')];
  const particles = new KitchenParticleEngine();

  const state = {
    mode: 'title',
    shiftIndex,
    kitchen,
    orders,
    chefs,
    activeChefIdx: 0,
    particles,
    timeRemaining: orders.shift.duration,
    elapsed: 0,
    hoverTile: null,
  };
  Object.defineProperty(state, 'chef', {
    get() {
      return this.chefs[this.activeChefIdx];
    },
    enumerable: true,
  });
  return state;
}

export function stepGameWorld(dt, freezeOrdersAndClock = false) {
  if (!world) return;
  world.elapsed += dt;

  if (world.mode === 'playing') {
    const events = [];
    const modifiers = {
      chopSpeedMult: ownedUpgrades.has('sharp_knives') ? 1.35 : 1.0,
      cookSpeedMult: ownedUpgrades.has('copper_burners') ? 1.25 : 1.0,
    };
    if (!freezeOrdersAndClock) {
      const vec = readMovementInputVector();
      const speedMult = ownedUpgrades.has('speed_boots') ? 1.2 : 1.0;
      world.chefs.forEach((chef, idx) => {
        const moveVec = idx === world.activeChefIdx ? vec : { x: 0, y: 0 };
        stepChefMovement(
          chef,
          world.kitchen,
          moveVec,
          dt,
          (arrivedStation) => {
            const arriveEvents = [];
            interactWithStation(world.kitchen, chef, arrivedStation, world.orders, arriveEvents);
            handleKitchenEvents(arriveEvents);
          },
          speedMult,
        );
      });
      stepKitchenStations(world.kitchen, world.chefs, dt, events, modifiers);
      world.orders.step(dt, events);
      world.timeRemaining = Math.max(0, world.timeRemaining - dt);
      if (world.timeRemaining <= 0) {
        world.mode = 'clear';
        sessionBank += world.orders.score;
        openClearOverlay();
      }
    } else {
      stepKitchenStations(world.kitchen, world.chefs, dt * 0.25, events, modifiers);
    }
    handleKitchenEvents(events);
  }

  world.particles.step(dt);
}

export async function bootBistroGame() {
  await preloadBistroAssets();
  populateDomOverlays();
  world = createGameWorld(selectedShiftIndex);
  bindInputListeners();

  const shot = getShotParam();
  if (shot) {
    applyDeterministicShot(shot, {
      resetWorld: (shiftIdx) => {
        world = createGameWorld(shiftIdx);
      },
      stepWorld: stepGameWorld,
      getWorld: () => world,
      showTitle: showTitleOverlay,
      hideOverlays: hideAllOverlays,
      showClear: (bankOverride, upgOverride) => {
        if (typeof bankOverride === 'number') sessionBank = bankOverride;
        if (upgOverride) {
          ownedUpgrades.clear();
          for (const id of upgOverride) ownedUpgrades.add(id);
        }
        openClearOverlay();
      },
    });
    renderFrame();
    if (typeof window !== 'undefined') window.__BISTRO_READY__ = true;
    return;
  }

  renderFrame();
  if (typeof window !== 'undefined') window.__BISTRO_READY__ = true;

  let lastTs = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
    lastTs = now;
    stepGameWorld(dt, false);
    renderFrame();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function openClearOverlay() {
  showClearScreen(world, sessionBank, ownedUpgrades, (upgId) => {
    const upg = KITCHEN_UPGRADES.find((u) => u.id === upgId);
    if (!upg || ownedUpgrades.has(upgId) || sessionBank < upg.cost) return;
    sessionBank -= upg.cost;
    ownedUpgrades.add(upgId);
    audio.playPlateReady();
    openClearOverlay();
  });
}

function switchActiveChef(nextIdx) {
  if (!world || !world.chefs || world.chefs.length < 2) return;
  const resolved = typeof nextIdx === 'number' ? nextIdx % world.chefs.length : (world.activeChefIdx + 1) % world.chefs.length;
  if (resolved === world.activeChefIdx) return;
  world.activeChefIdx = resolved;
  const chef = world.chef;
  audio.playPickup();
  world.particles.addScorePopup(chef.x, chef.y - 42, `${chef.name}!`, '#ffe388', 0.88);
}

function handleKitchenEvents(events) {
  for (const ev of events) {
    const pos = ev.col !== undefined ? tileCenterPx(ev.col, ev.row) : { x: CANVAS_WIDTH / 2, y: 120 };
    switch (ev.type) {
      case 'pickup':
        audio.playPickup();
        world.particles.emitBurst(pos.x, pos.y - 6, '#f9dc8a', 5, 55);
        break;
      case 'drop':
        audio.playDrop();
        break;
      case 'chop_tick':
        audio.playChop();
        world.particles.emitBurst(pos.x, pos.y - 6, '#ffd27d', 4, 55);
        break;
      case 'chop_done':
        audio.playChopDone();
        world.particles.emitBurst(pos.x, pos.y - 8, '#76e393', 10, 85);
        world.particles.addScorePopup(pos.x, pos.y - 24, 'PREPPED!', '#8ef2a7', 0.9);
        break;
      case 'sizzle':
        world.particles.emitSteamCurl(pos.x, pos.y - 12, ev.hot);
        if (Math.random() < 0.45) world.particles.emitSizzleSpark(pos.x, pos.y - 4);
        break;
      case 'sear_ready':
        audio.playSearReady();
        world.particles.emitBurst(pos.x, pos.y - 10, '#f4b942', 10, 75);
        world.particles.addScorePopup(pos.x, pos.y - 28, 'SEARED!', '#f7d358', 0.95);
        break;
      case 'perfect_sear':
        audio.playPlateReady();
        world.particles.emitBurst(pos.x, pos.y - 10, '#ffe47a', 12, 95);
        world.particles.addScorePopup(pos.x, pos.y - 34, `PERFECT SEAR! +$${ev.bonus}`, '#ffe47a', 0.95);
        break;
      case 'simmer_ready':
        audio.playSimmerReady();
        world.particles.emitBurst(pos.x, pos.y - 10, '#ffe27a', 10, 75);
        world.particles.addScorePopup(pos.x, pos.y - 28, 'BROTH READY!', '#ffe27a', 0.95);
        break;
      case 'bake_ready':
        audio.playBakeReady();
        world.particles.emitBurst(pos.x, pos.y - 10, '#f5b35d', 10, 75);
        world.particles.addScorePopup(pos.x, pos.y - 28, 'BAKED!', '#f5b35d', 0.95);
        break;
      case 'burned':
        audio.playBurn();
        world.particles.emitBurst(pos.x, pos.y - 10, '#625656', 12, 85);
        world.particles.addScorePopup(pos.x, pos.y - 28, 'BURNED!', '#ff6a5c', 1.0);
        break;
      case 'assemble':
        audio.playPickup();
        world.particles.emitBurst(pos.x, pos.y - 8, '#ffe299', 6, 65);
        break;
      case 'plate_ready':
        audio.playPlateReady();
        world.particles.emitBurst(pos.x, pos.y - 10, '#f4b942', 14, 100);
        world.particles.addScorePopup(pos.x, pos.y - 30, 'PLATE READY!', '#f4b942', 1.05);
        break;
      case 'pickup_plate':
        audio.playPickup();
        break;
      case 'serve_success':
        audio.playServe(ev.combo);
        world.particles.emitBurst(pos.x, pos.y - 10, '#72f0a5', 18, 130);
        world.particles.addScorePopup(
          pos.x - 108,
          pos.y - 24,
          ev.combo > 1 ? `+$${ev.earned}  ${ev.isVip ? 'VIP ' : ''}x${ev.combo}!` : `+$${ev.earned}`,
          '#f4b942',
          1.15,
        );
        break;
      case 'trash':
        audio.playDrop();
        world.particles.emitBurst(pos.x, pos.y - 6, '#90bf88', 7, 65);
        break;
      case 'warn':
        audio.playWarn();
        world.particles.addScorePopup(pos.x - 30, pos.y - 24, ev.message, '#ff8f70', 0.85);
        break;
      case 'order_expired':
        audio.playWarn();
        world.particles.addScorePopup(CANVAS_WIDTH / 2, 160, 'TICKET EXPIRED!', '#ff6a5c', 1.0);
        break;
      default:
        break;
    }
  }
}

function hideAllOverlays() {
  document.getElementById('title-overlay').classList.add('hidden');
  document.getElementById('guide-overlay').classList.add('hidden');
  document.getElementById('clear-overlay').classList.add('hidden');
}

function showTitleOverlay() {
  hideAllOverlays();
  document.getElementById('title-overlay').classList.remove('hidden');
}

function showGuideOverlay() {
  if (world.mode === 'playing') world.mode = 'paused';
  document.getElementById('guide-overlay').classList.remove('hidden');
  updatePauseLabel();
}

function closeGuideOverlay() {
  document.getElementById('guide-overlay').classList.add('hidden');
  if (world.mode === 'paused') world.mode = 'playing';
  updatePauseLabel();
}

function updatePauseLabel() {
  const btn = document.getElementById('btn-pause');
  if (btn) btn.textContent = world.mode === 'paused' ? 'Resume' : 'Pause';
}

function triggerChefAction() {
  if (!world || world.mode !== 'playing') return;
  const st = findTargetStationForChef(world.kitchen, world.chef);
  if (!st) return;
  const events = [];
  interactWithStation(world.kitchen, world.chef, st, world.orders, events);
  handleKitchenEvents(events);
}

function readMovementInputVector() {
  let x = 0;
  let y = 0;
  if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) x -= 1;
  if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) x += 1;
  if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) y -= 1;
  if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) y += 1;
  return { x, y };
}

function canvasPointFromEvent(ev) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((ev.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((ev.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
}

function handleCanvasClick(ev) {
  if (!world || world.mode !== 'playing') return;
  audio.ensureContext();
  const pt = canvasPointFromEvent(ev);

  /* Click bottom-bar Brigade pill to switch Ren <-> Hana */
  if (pt.y >= BOTTOM_BAR_Y && pt.x <= 200) {
    switchActiveChef();
    return;
  }

  /* Click directly on inactive chef to switch control to them */
  for (let i = 0; i < world.chefs.length; i++) {
    if (i === world.activeChefIdx) continue;
    const c = world.chefs[i];
    if (Math.hypot(pt.x - c.x, pt.y - (c.y - 10)) <= 28) {
      switchActiveChef(i);
      return;
    }
  }

  const target = pxToTile(pt.x, pt.y);
  const cur = pxToTile(world.chef.x, world.chef.y);

  const station = getStation(world.kitchen, target.col, target.row);
  if (station) {
    const manhattan = Math.abs(cur.col - station.col) + Math.abs(cur.row - station.row);
    if (manhattan <= 1) {
      const stPos = tileCenterPx(station.col, station.row);
      const dx = stPos.x - world.chef.x;
      const dy = stPos.y - world.chef.y;
      const len = Math.hypot(dx, dy) || 1;
      world.chef.facingX = dx / len;
      world.chef.facingY = dy / len;
      world.chef.autoPath = [];
      world.chef.pendingInteract = null;
      const events = [];
      interactWithStation(world.kitchen, world.chef, station, world.orders, events);
      handleKitchenEvents(events);
      return;
    }
    const approach = findBestAdjacentApproach(world.kitchen, cur.col, cur.row, station.col, station.row);
    if (approach) {
      world.chef.autoPath = approach.path;
      world.chef.pendingInteract = station;
    }
    return;
  }

  if (isWalkable(world.kitchen, target.col, target.row)) {
    const path = findPath(world.kitchen, cur.col, cur.row, target.col, target.row);
    if (path) {
      world.chef.autoPath = path;
      world.chef.pendingInteract = null;
    }
  }
}

function handleCanvasMove(ev) {
  if (!world || world.mode !== 'playing') return;
  const pt = canvasPointFromEvent(ev);
  const tile = pxToTile(pt.x, pt.y);
  world.hoverTile = getStation(world.kitchen, tile.col, tile.row) ? tile : null;
}

function startShift(shiftIdx) {
  selectedShiftIndex = Math.max(0, Math.min(SHIFTS.length - 1, shiftIdx));
  world = createGameWorld(selectedShiftIndex);
  world.mode = 'playing';
  hideAllOverlays();
  updatePauseLabel();
  audio.ensureContext();
}

function bindInputListeners() {
  window.addEventListener('keydown', (ev) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(ev.code)) {
      ev.preventDefault();
    }
    keysDown.add(ev.code);

    if (ev.repeat) return;
    if (ev.code === 'Tab') {
      if (world.mode === 'playing') switchActiveChef();
    } else if (ev.code === 'Digit1') {
      if (world.mode === 'playing') switchActiveChef(0);
    } else if (ev.code === 'Digit2') {
      if (world.mode === 'playing') switchActiveChef(1);
    } else if (ev.code === 'Space' || ev.code === 'KeyE') {
      if (world.mode === 'title') {
        startShift(selectedShiftIndex);
      } else if (world.mode === 'playing') {
        triggerChefAction();
      }
    } else if (ev.code === 'KeyQ' || ev.code === 'ShiftLeft' || ev.code === 'ShiftRight') {
      if (world.mode === 'playing' && triggerChefDash(world.chef)) {
        audio.playPickup();
      }
    } else if (ev.code === 'KeyM') {
      toggleSound();
    } else if (ev.code === 'KeyP' || ev.code === 'Escape') {
      togglePause();
    } else if (ev.key === '?') {
      if (document.getElementById('guide-overlay').classList.contains('hidden')) {
        showGuideOverlay();
      } else {
        closeGuideOverlay();
      }
    }
  });

  window.addEventListener('keyup', (ev) => {
    keysDown.delete(ev.code);
  });

  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('mousemove', handleCanvasMove);

  document.querySelectorAll('.shift-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shift-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedShiftIndex = Number(btn.dataset.shift || 1);
    });
  });

  document.getElementById('btn-open-kitchen').addEventListener('click', () => {
    startShift(selectedShiftIndex);
  });

  document.getElementById('btn-sound').addEventListener('click', toggleSound);
  document.getElementById('btn-guide').addEventListener('click', () => {
    if (document.getElementById('guide-overlay').classList.contains('hidden')) {
      showGuideOverlay();
    } else {
      closeGuideOverlay();
    }
  });
  document.getElementById('btn-close-guide').addEventListener('click', closeGuideOverlay);
  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-next-shift').addEventListener('click', () => {
    startShift((selectedShiftIndex + 1) % SHIFTS.length);
  });
  document.getElementById('btn-replay-shift').addEventListener('click', () => {
    startShift(selectedShiftIndex);
  });
}

function toggleSound() {
  audio.setMuted(!audio.muted);
  const btn = document.getElementById('btn-sound');
  if (btn) btn.textContent = audio.muted ? 'Sound: Off' : 'Sound: On';
}

function togglePause() {
  if (!world) return;
  if (world.mode === 'playing') {
    world.mode = 'paused';
    showGuideOverlay();
  } else if (world.mode === 'paused') {
    closeGuideOverlay();
  }
}

function renderFrame() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  renderBistroKitchen(ctx, world);
  renderHudAndOrderRail(ctx, world);
}

bootBistroGame();
