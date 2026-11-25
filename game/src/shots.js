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

    /* Set 4 distinct tickets at staggered urgency */
    world.orders.orders = [
      { id: 4, recipeId: 'burger', totalPatience: 48, remaining: 34, enteredAt: 0, flash: 0 },
      { id: 5, recipeId: 'wagyu', totalPatience: 52, remaining: 29, enteredAt: 0, flash: 0 },
      { id: 6, recipeId: 'salmon_bowl', totalPatience: 50, remaining: 41, enteredAt: 0, flash: 0 },
      { id: 7, recipeId: 'surf_turf', totalPatience: 58, remaining: 19, enteredAt: 0, flash: 0 },
    ];
    world.orders.nextId = 8;
    world.orders.score = 640;
    world.orders.combo = 3;
    world.orders.maxCombo = 3;
    world.orders.comboTimer = 6.2;
    world.orders.servedCount = 4;

    /* Ingredients stocked on prep counters */
    getStation(world.kitchen, 5, 0).item = { kind: 'ingredient', id: 'chopped_greens' };
    getStation(world.kitchen, 3, 2).item = { kind: 'ingredient', id: 'chopped_herb' };
    getStation(world.kitchen, 7, 2).item = { kind: 'ingredient', id: 'chopped_tomato' };

    /* Twin copper stoves actively sizzling & seared */
    const stove1 = getStation(world.kitchen, 3, 0);
    stove1.item = 'salmon';
    stove1.progress = 2.05;

    const stove2 = getStation(world.kitchen, 4, 0);
    stove2.item = 'seared_steak';
    stove2.progress = 4.4;

    /* Cutting board actively chopping tomato */
    const board2 = getStation(world.kitchen, 7, 0);
    board2.item = 'tomato';
    board2.progress = 0.56;

    /* Dish mid-assembly on central Assembly A */
    const asmA = getStation(world.kitchen, 4, 2);
    asmA.assemblyItems = ['bun', 'seared_steak'];
    asmA.completedRecipeId = null;

    /* Finished plate ready to serve on Assembly B */
    const asmB = getStation(world.kitchen, 6, 2);
    asmB.assemblyItems = ['seared_steak', 'chopped_herb', 'chopped_tomato'];
    asmB.completedRecipeId = 'wagyu';

    /* Chef positioned at Cutting Board 2 chopping */
    const chefSpot = tileCenterPx(7, 1);
    world.chef.x = chefSpot.x;
    world.chef.y = chefSpot.y;
    world.chef.facingX = 0;
    world.chef.facingY = -1;
    world.chef.holding = null;

    /* Run real simulation steps so steam, sizzle sparks, and popups animate naturally */
    const passPos = tileCenterPx(9, 2);
    world.particles.addPopup(passPos.x - 10, passPos.y - 8, '+$210  x3 COMBO!', '#f4b942', 1.15);
    const boardPos = tileCenterPx(7, 0);
    world.particles.emitBurst(boardPos.x, boardPos.y - 6, '#ff6854', 7, 65);
    for (let i = 0; i < 18; i++) {
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
      { id: 9, recipeId: 'surf_turf', totalPatience: 51, remaining: 14, enteredAt: 0, flash: 0 },
      { id: 10, recipeId: 'bruschetta', totalPatience: 36, remaining: 24, enteredAt: 0, flash: 0 },
      { id: 11, recipeId: 'salmon_bowl', totalPatience: 44, remaining: 31, enteredAt: 0, flash: 0 },
      { id: 12, recipeId: 'burger', totalPatience: 42, remaining: 36, enteredAt: 0, flash: 0 },
    ];
    world.orders.score = 1120;
    world.orders.combo = 4;
    world.orders.maxCombo = 4;
    world.orders.comboTimer = 7.5;
    world.orders.servedCount = 6;

    const s1 = getStation(world.kitchen, 3, 0);
    s1.item = 'seared_steak';
    s1.progress = 5.9; /* Urgent PULL NOW pulse */

    const s2 = getStation(world.kitchen, 4, 0);
    s2.item = 'salmon';
    s2.progress = 2.4;

    const s3 = getStation(world.kitchen, 3, 5);
    s3.item = 'steak';
    s3.progress = 1.6;

    const b1 = getStation(world.kitchen, 6, 0);
    b1.item = 'chopped_herb';

    const asmA = getStation(world.kitchen, 4, 2);
    asmA.assemblyItems = ['bun', 'chopped_tomato'];

    getStation(world.kitchen, 7, 2).item = { kind: 'ingredient', id: 'chopped_greens' };

    const chefPos = tileCenterPx(8, 2);
    world.chef.x = chefPos.x;
    world.chef.y = chefPos.y;
    world.chef.facingX = 1;
    world.chef.facingY = 0;
    world.chef.holding = { kind: 'plate', recipeId: 'surf_turf' };

    const s1Pos = tileCenterPx(3, 0);
    world.particles.emitSteam(s1Pos.x, s1Pos.y - 12, true);
    world.particles.emitSteam(s1Pos.x + 102, s1Pos.y - 12, false);
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
    world.orders.score = 1380;
    world.orders.servedCount = 8;
    world.orders.maxCombo = 4;
    world.orders.missedCount = 0;
    world.orders.dishBreakdown = {
      burger: 2,
      wagyu: 2,
      salmon_bowl: 2,
      bruschetta: 1,
      surf_turf: 1,
    };
    world.orders.orders = [];
    showClear();
  }
}
