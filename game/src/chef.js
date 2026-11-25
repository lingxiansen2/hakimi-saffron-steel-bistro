import {
  CHEF_DASH_COOLDOWN,
  CHEF_DASH_DURATION,
  CHEF_DASH_SPEED,
  CHEF_RADIUS,
  CHEF_SPEED,
  GRID_ORIGIN_X,
  GRID_ORIGIN_Y,
  TILE_H,
  TILE_W,
} from './config.js';
import { isWalkable, pxToTile, tileCenterPx } from './kitchen.js';

export function createChef(col = 5, row = 3) {
  const pos = tileCenterPx(col, row);
  return {
    x: pos.x,
    y: pos.y,
    vx: 0,
    vy: 0,
    facingX: 0,
    facingY: -1,
    holding: null,
    walkPhase: 0,
    dashTime: 0,
    dashCooldown: 0,
    autoPath: [],
    pendingInteract: null,
  };
}

export function triggerDash(chef) {
  if (chef.dashCooldown > 0 || chef.dashTime > 0) return false;
  chef.dashTime = CHEF_DASH_DURATION;
  chef.dashCooldown = CHEF_DASH_COOLDOWN;
  return true;
}

function canStandAt(kitchen, x, y) {
  const r = CHEF_RADIUS;
  const pts = [
    [x - r, y - r],
    [x + r, y - r],
    [x - r, y + r],
    [x + r, y + r],
  ];
  for (const [px, py] of pts) {
    const col = Math.floor((px - GRID_ORIGIN_X) / TILE_W);
    const row = Math.floor((py - GRID_ORIGIN_Y) / TILE_H);
    if (!isWalkable(kitchen, col, row)) return false;
  }
  return true;
}

export function stepChef(chef, kitchen, inputVec, dt, onArriveStation) {
  if (chef.dashCooldown > 0) chef.dashCooldown = Math.max(0, chef.dashCooldown - dt);
  if (chef.dashTime > 0) chef.dashTime = Math.max(0, chef.dashTime - dt);

  let moveX = inputVec.x;
  let moveY = inputVec.y;
  const manualInput = Math.hypot(moveX, moveY) > 0.05;

  if (manualInput) {
    chef.autoPath = [];
    chef.pendingInteract = null;
  } else if (chef.autoPath.length > 0) {
    const nextNode = chef.autoPath[0];
    const targetPx = tileCenterPx(nextNode.col, nextNode.row);
    const dx = targetPx.x - chef.x;
    const dy = targetPx.y - chef.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) {
      chef.x = targetPx.x;
      chef.y = targetPx.y;
      chef.autoPath.shift();
      if (chef.autoPath.length === 0 && chef.pendingInteract) {
        const st = chef.pendingInteract;
        chef.pendingInteract = null;
        const stPos = tileCenterPx(st.col, st.row);
        const fx = stPos.x - chef.x;
        const fy = stPos.y - chef.y;
        const fLen = Math.hypot(fx, fy) || 1;
        chef.facingX = fx / fLen;
        chef.facingY = fy / fLen;
        if (onArriveStation) onArriveStation(st);
      }
    } else {
      moveX = dx / dist;
      moveY = dy / dist;
    }
  } else if (chef.pendingInteract) {
    const st = chef.pendingInteract;
    const cur = pxToTile(chef.x, chef.y);
    if (Math.abs(cur.col - st.col) + Math.abs(cur.row - st.row) <= 1) {
      chef.pendingInteract = null;
      const stPos = tileCenterPx(st.col, st.row);
      const fx = stPos.x - chef.x;
      const fy = stPos.y - chef.y;
      const fLen = Math.hypot(fx, fy) || 1;
      chef.facingX = fx / fLen;
      chef.facingY = fy / fLen;
      if (onArriveStation) onArriveStation(st);
    }
  }

  const len = Math.hypot(moveX, moveY);
  if (len > 0.001) {
    const nx = moveX / len;
    const ny = moveY / len;
    chef.facingX = nx;
    chef.facingY = ny;
    const speed = chef.dashTime > 0 ? CHEF_DASH_SPEED : CHEF_SPEED;
    const stepX = nx * speed * dt;
    const stepY = ny * speed * dt;

    if (canStandAt(kitchen, chef.x + stepX, chef.y)) {
      chef.x += stepX;
    }
    if (canStandAt(kitchen, chef.x, chef.y + stepY)) {
      chef.y += stepY;
    }
    chef.vx = nx * speed;
    chef.vy = ny * speed;
    chef.walkPhase += dt * (chef.dashTime > 0 ? 18 : 11);
  } else {
    chef.vx = 0;
    chef.vy = 0;
  }
}
