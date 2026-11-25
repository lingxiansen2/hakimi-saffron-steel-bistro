import { getStation, tileCenterPx } from './kitchen.js';

export function getShotParam() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const val = params.get('shot');
  return val ? val.toLowerCase() : null;
}

export function applyDeterministicShot(shotName, controller) {
  const { resetWorld, stepWorld, getWorld, showTitle, hideOverlays, showClear } = controller;

  if (shotName === 'title') {
    resetWorld(1);
    const world = getWorld();
    world.mode = 'title';
    world.timeRemaining = 95;
    const s1 = getStation(world.kitchen, 3, 0);
    s1.item = 'seared_steak';
    s1.progress = 3.8;
    const pot = getStation(world.kitchen, 5, 0);
    pot.item = 'saffron_broth';
    const oven = getStation(world.kitchen, 2, 5);
    oven.item = 'baked_bun';
    oven.progress = 3.5;
    getStation(world.kitchen, 4, 2).assemblyItems = ['baked_bun', 'seared_steak'];
    getStation(world.kitchen, 6, 2).completedRecipeId = 'wagyu';
    showTitle();
    return;
  }

  if (shotName === 'rush') {
    hideOverlays();
    resetWorld(1);
    const world = getWorld();
    world.mode = 'playing';
    world.timeRemaining = 78;
    world.elapsed = 14.2;

    /* 4 vivid tickets including 1 Golden VIP Critic Ticket */
    world.orders.orders = [
      { id: 4, recipeId: 'burger', totalPatience: 50, remaining: 36, isVip: false, flash: 0 },
      { id: 5, recipeId: 'wagyu', totalPatience: 52, remaining: 29, isVip: false, flash: 0 },
      { id: 6, recipeId: 'salmon_ramen', totalPatience: 56, remaining: 42, isVip: false, flash: 0 },
      { id: 7, recipeId: 'surf_turf', totalPatience: 60, remaining: 24, isVip: true, flash: 0 },
    ];
    world.orders.nextId = 8;
    world.orders.score = 640;
    world.orders.combo = 3;
    world.orders.maxCombo = 3;
    world.orders.comboTimer = 6.4;
    world.orders.servedCount = 4;

    /* Fresh prepped ingredients resting on counters */
    getStation(world.kitchen, 3, 2).item = { kind: 'ingredient', id: 'chopped_herb' };
    getStation(world.kitchen, 7, 2).item = { kind: 'ingredient', id: 'chopped_tomato' };

    /* Twin Copper Stoves + Simmering Stockpot + Wood-Fired Hearth Oven */
    const stove1 = getStation(world.kitchen, 3, 0);
    stove1.item = 'salmon';
    stove1.progress = 2.1;

    const stove2 = getStation(world.kitchen, 4, 0);
    stove2.item = 'seared_steak';
    stove2.progress = 4.4;

    const pot = getStation(world.kitchen, 5, 0);
    pot.item = 'saffron_broth';
    pot.progress = 3.2;

    const oven = getStation(world.kitchen, 2, 5);
    oven.item = 'dough';
    oven.progress = 1.9;

    /* Butcher Board 2 actively chopping tomato with Chef standing directly below */
    const board2 = getStation(world.kitchen, 7, 0);
    board2.item = 'tomato';
    board2.progress = 0.58;

    /* Dish mid-assembly on Marble Island A */
    const asmA = getStation(world.kitchen, 4, 2);
    asmA.assemblyItems = ['baked_bun', 'seared_steak'];
    asmA.completedRecipeId = null;

    /* Steaming plated Herb Wagyu glowing under heat lamps at Serve Pass beside Ring Bell */
    const pass = getStation(world.kitchen, 10, 2);
    pass.item = { kind: 'plate', recipeId: 'wagyu' };

    const chefSpot = tileCenterPx(7, 1);
    world.chef.x = chefSpot.x;
    world.chef.y = chefSpot.y + 9;
    world.chef.facingX = 0;
    world.chef.facingY = -1;
    world.chef.holding = null;

    /* Trigger genuine steam curls, sizzle sparks, slice confetti & score popup */
    const passPos = tileCenterPx(10, 2);
    world.particles.emitSteamCurl(passPos.x, passPos.y - 6, true);
    world.particles.emitSteamCurl(passPos.x + 6, passPos.y - 10, false);
    const potPos = tileCenterPx(5, 0);
    world.particles.emitSteamCurl(potPos.x, potPos.y - 6, true);
    const s1Pos = tileCenterPx(3, 0);
    world.particles.emitSizzleSpark(s1Pos.x, s1Pos.y);
    const boardPos = tileCenterPx(7, 0);
    world.particles.emitBurst(boardPos.x, boardPos.y - 6, '#ff6854', 7, 65);
    const popupPos = tileCenterPx(8, 3);
    world.particles.addScorePopup(popupPos.x, popupPos.y - 18, '+$210  x3 COMBO!', '#f4b942', 1.2);

    for (let i = 0; i < 16; i++) {
      stepWorld(0.02, true);
    }
    return;
  }

  if (shotName === 'sizzle') {
    hideOverlays();
    resetWorld(2);
    const world = getWorld();
    world.mode = 'playing';
    world.timeRemaining = 44;
    world.elapsed = 28.4;

    world.orders.orders = [
      { id: 9, recipeId: 'surf_turf', totalPatience: 54, remaining: 16, isVip: true, flash: 0 },
      { id: 10, recipeId: 'salmon_ramen', totalPatience: 50, remaining: 28, isVip: false, flash: 0 },
      { id: 11, recipeId: 'berry_tart', totalPatience: 42, remaining: 31, isVip: false, flash: 0 },
      { id: 12, recipeId: 'burger', totalPatience: 45, remaining: 37, isVip: false, flash: 0 },
    ];
    world.orders.score = 1120;
    world.orders.combo = 4;
    world.orders.maxCombo = 4;
    world.orders.comboTimer = 7.6;
    world.orders.servedCount = 6;

    const s1 = getStation(world.kitchen, 3, 0);
    s1.item = 'seared_steak';
    s1.progress = 5.9;

    const s2 = getStation(world.kitchen, 4, 0);
    s2.item = 'salmon';
    s2.progress = 2.4;

    const pot = getStation(world.kitchen, 5, 0);
    pot.item = 'dashi';
    pot.progress = 1.9;

    const oven = getStation(world.kitchen, 2, 5);
    oven.item = 'baked_bun';
    oven.progress = 4.2;

    const s3 = getStation(world.kitchen, 3, 5);
    s3.item = 'steak';
    s3.progress = 1.8;

    getStation(world.kitchen, 6, 0).item = 'chopped_berry';
    getStation(world.kitchen, 4, 2).assemblyItems = ['baked_bun', 'chopped_berry'];
    getStation(world.kitchen, 7, 2).item = { kind: 'ingredient', id: 'chopped_greens' };

    const chefPos = tileCenterPx(8, 2);
    world.chef.x = chefPos.x;
    world.chef.y = chefPos.y;
    world.chef.facingX = 1;
    world.chef.facingY = 0;
    world.chef.holding = { kind: 'plate', recipeId: 'surf_turf' };

    const popupPos = tileCenterPx(8, 4);
    world.particles.addScorePopup(popupPos.x, popupPos.y - 24, '+$320  VIP x4!', '#f4b942', 1.2);
    const s1Pos = tileCenterPx(3, 0);
    world.particles.emitSteamCurl(s1Pos.x, s1Pos.y - 10, true);
    world.particles.emitSteamCurl(s1Pos.x + 102, s1Pos.y - 10, false);

    for (let i = 0; i < 16; i++) {
      stepWorld(0.02, true);
    }
    return;
  }

  if (shotName === 'clear') {
    hideOverlays();
    resetWorld(1);
    const world = getWorld();
    world.mode = 'clear';
    world.timeRemaining = 0;
    world.orders.score = 1460;
    world.orders.servedCount = 8;
    world.orders.maxCombo = 4;
    world.orders.missedCount = 0;
    world.orders.dishBreakdown = {
      burger: 2,
      wagyu: 2,
      salmon_ramen: 1,
      berry_tart: 2,
      surf_turf: 1,
    };
    world.orders.orders = [];
    showClear();
  }
}
