import { COMBO_WINDOW, SHIFTS } from './config.js';
import { RECIPE_BY_ID, VIP_RECIPE_IDS } from './recipes.js';

export class OrderTicketQueue {
  constructor(shiftIndex = 1, patienceBoost = 1.0) {
    this.shift = SHIFTS[shiftIndex] || SHIFTS[1];
    this.patienceBoost = patienceBoost;
    this.orders = [];
    this.nextId = 1;
    this.spawnCooldown = 1.0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 1;
    this.comboTimer = 0;
    this.servedCount = 0;
    this.missedCount = 0;
    this.dishBreakdown = {};
    this.rngState = (shiftIndex + 1) * 48271;
  }

  nextRand() {
    this.rngState = (this.rngState * 16807) % 2147483647;
    return (this.rngState - 1) / 2147483646;
  }

  seedInitialOrders(count = 3) {
    for (let i = 0; i < count; i++) {
      this.spawnOrder(1 - i * 0.14);
    }
    this.spawnCooldown = this.shift.spawnInterval;
  }

  spawnOrder(initialPatienceRatio = 1) {
    if (this.orders.length >= this.shift.maxOrders) return null;
    const hasVip = this.orders.some((o) => RECIPE_BY_ID[o.recipeId]?.isVip);
    let recipeId;
    if (!hasVip && this.orders.length >= 2 && this.nextRand() < this.shift.vipChance) {
      recipeId = VIP_RECIPE_IDS[Math.floor(this.nextRand() * VIP_RECIPE_IDS.length)];
    } else {
      const pool = this.shift.allowedRecipes;
      const recentIds = this.orders.slice(-2).map((o) => o.recipeId);
      const filtered = pool.filter((id) => !recentIds.includes(id));
      const choices = filtered.length > 0 ? filtered : pool;
      recipeId = choices[Math.floor(this.nextRand() * choices.length)];
    }

    const recipe = RECIPE_BY_ID[recipeId];
    const totalPatience = Math.round(recipe.patience * this.shift.patienceScale * this.patienceBoost);
    const ticket = {
      id: this.nextId++,
      recipeId,
      totalPatience,
      remaining: totalPatience * initialPatienceRatio,
      isVip: Boolean(recipe.isVip),
      flash: 1,
    };
    this.orders.push(ticket);
    return ticket;
  }

  step(dt, events) {
    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer === 0) this.combo = 0;
    }

    for (let i = this.orders.length - 1; i >= 0; i--) {
      const order = this.orders[i];
      order.remaining -= dt;
      if (order.flash > 0) order.flash = Math.max(0, order.flash - dt * 2.5);
      if (order.remaining <= 0) {
        this.orders.splice(i, 1);
        this.missedCount++;
        this.combo = 0;
        this.comboTimer = 0;
        events.push({ type: 'order_expired', recipeId: order.recipeId });
      }
    }

    this.spawnCooldown -= dt;
    if (this.orders.length < 2) {
      this.spawnCooldown = Math.min(this.spawnCooldown, 1.3);
    }
    if (this.spawnCooldown <= 0 && this.orders.length < this.shift.maxOrders) {
      this.spawnOrder(1);
      this.spawnCooldown = this.shift.spawnInterval;
    }
  }

  tryServe(recipeId) {
    let bestIdx = -1;
    let lowestRemaining = Infinity;
    for (let i = 0; i < this.orders.length; i++) {
      const o = this.orders[i];
      if (o.recipeId === recipeId && o.remaining < lowestRemaining) {
        lowestRemaining = o.remaining;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) return null;

    const ticket = this.orders.splice(bestIdx, 1)[0];
    const recipe = RECIPE_BY_ID[recipeId];
    this.combo = this.comboTimer > 0 ? Math.min(6, this.combo + 1) : 1;
    this.comboTimer = COMBO_WINDOW;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const speedBonus = Math.round((ticket.remaining / ticket.totalPatience) * (recipe.isVip ? 70 : 45));
    const comboMult = 1 + (this.combo - 1) * 0.25;
    const earned = Math.round((recipe.reward + speedBonus) * comboMult);

    this.score += earned;
    this.servedCount++;
    this.dishBreakdown[recipeId] = (this.dishBreakdown[recipeId] || 0) + 1;

    return {
      recipeId,
      recipeName: recipe.shortName,
      isVip: Boolean(recipe.isVip),
      earned,
      combo: this.combo,
      speedBonus,
    };
  }

  computeStars() {
    const [s1, s2, s3] = this.shift.starTargets;
    if (this.score >= s3) return 3;
    if (this.score >= s2) return 2;
    if (this.score >= s1) return 1;
    return 0;
  }
}
