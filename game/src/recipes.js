export const INGREDIENTS = {
  steak: { id: 'steak', name: 'Wagyu Cut', short: 'Wagyu', action: 'sear' },
  seared_steak: { id: 'seared_steak', name: 'Seared Wagyu', short: 'Seared Steak', action: 'ready' },
  salmon: { id: 'salmon', name: 'Salmon Fillet', short: 'Salmon', action: 'sear' },
  seared_salmon: { id: 'seared_salmon', name: 'Seared Salmon', short: 'Seared Salmon', action: 'ready' },
  dashi: { id: 'dashi', name: 'Dashi Base', short: 'Dashi Base', action: 'simmer' },
  saffron_broth: { id: 'saffron_broth', name: 'Saffron Broth', short: 'Saffron Broth', action: 'ready' },
  dough: { id: 'dough', name: 'Brioche Dough', short: 'Dough', action: 'bake' },
  baked_bun: { id: 'baked_bun', name: 'Baked Brioche', short: 'Brioche', action: 'ready' },
  tomato: { id: 'tomato', name: 'Heirloom Tomato', short: 'Tomato', action: 'chop' },
  chopped_tomato: { id: 'chopped_tomato', name: 'Sliced Tomato', short: 'Dice Tomato', action: 'ready' },
  greens: { id: 'greens', name: 'Bistro Greens', short: 'Greens', action: 'chop' },
  chopped_greens: { id: 'chopped_greens', name: 'Crisp Greens', short: 'Cut Greens', action: 'ready' },
  herb: { id: 'herb', name: 'Saffron Herb', short: 'Herb', action: 'chop' },
  chopped_herb: { id: 'chopped_herb', name: 'Minced Herb', short: 'Minced Herb', action: 'ready' },
  berry: { id: 'berry', name: 'Forest Berries', short: 'Berries', action: 'chop' },
  chopped_berry: { id: 'chopped_berry', name: 'Glazed Berries', short: 'Glaze Berries', action: 'ready' },
  burned: { id: 'burned', name: 'Charred Pan', short: 'Burned!', action: 'trash' },
};

export const CHOP_RESULTS = {
  tomato: 'chopped_tomato',
  greens: 'chopped_greens',
  herb: 'chopped_herb',
  berry: 'chopped_berry',
};

export const SEAR_RESULTS = {
  steak: 'seared_steak',
  salmon: 'seared_salmon',
};

export const SIMMER_RESULTS = {
  dashi: 'saffron_broth',
};

export const BAKE_RESULTS = {
  dough: 'baked_bun',
};

export const RECIPES = [
  {
    id: 'burger',
    name: 'Classic Bistro Burger',
    shortName: 'Bistro Burger',
    ingredients: ['baked_bun', 'seared_steak', 'chopped_greens'],
    reward: 150,
    patience: 50,
    isVip: false,
  },
  {
    id: 'wagyu',
    name: 'Herb-Seared Wagyu',
    shortName: 'Herb Wagyu',
    ingredients: ['seared_steak', 'chopped_herb', 'chopped_tomato'],
    reward: 185,
    patience: 52,
    isVip: false,
  },
  {
    id: 'salmon_bowl',
    name: 'Citrus Salmon Bowl',
    shortName: 'Salmon Bowl',
    ingredients: ['seared_salmon', 'chopped_greens', 'chopped_tomato'],
    reward: 175,
    patience: 50,
    isVip: false,
  },
  {
    id: 'bruschetta',
    name: 'Tomato Basil Bruschetta',
    shortName: 'Bruschetta',
    ingredients: ['baked_bun', 'chopped_tomato', 'chopped_herb'],
    reward: 135,
    patience: 44,
    isVip: false,
  },
  {
    id: 'salmon_ramen',
    name: 'Saffron Salmon Ramen',
    shortName: 'Salmon Ramen',
    ingredients: ['saffron_broth', 'seared_salmon', 'chopped_greens'],
    reward: 230,
    patience: 56,
    isVip: false,
  },
  {
    id: 'berry_tart',
    name: 'Warm Berry Tart',
    shortName: 'Berry Tart',
    ingredients: ['baked_bun', 'chopped_berry', 'chopped_herb'],
    reward: 165,
    patience: 46,
    isVip: false,
  },
  {
    id: 'wagyu_ramen',
    name: 'Saffron Wagyu Ramen',
    shortName: 'Wagyu Ramen',
    ingredients: ['saffron_broth', 'seared_steak', 'chopped_herb'],
    reward: 245,
    patience: 56,
    isVip: false,
  },
  {
    id: 'salmon_brioche',
    name: 'Glazed Salmon Brioche',
    shortName: 'Salmon Melt',
    ingredients: ['baked_bun', 'seared_salmon', 'chopped_tomato'],
    reward: 195,
    patience: 50,
    isVip: false,
  },
  {
    id: 'surf_turf',
    name: 'VIP Surf & Turf',
    shortName: 'VIP Surf & Turf',
    ingredients: ['seared_steak', 'seared_salmon', 'saffron_broth'],
    reward: 320,
    patience: 60,
    isVip: true,
  },
  {
    id: 'royal_tasting',
    name: 'VIP Berry Glaze Wagyu',
    shortName: 'VIP Royal Wagyu',
    ingredients: ['seared_steak', 'chopped_berry', 'saffron_broth'],
    reward: 340,
    patience: 60,
    isVip: true,
  },
];

export const MENU_CARDS = RECIPES.filter((r) => !r.isVip);
export const VIP_RECIPE_IDS = RECIPES.filter((r) => r.isVip).map((r) => r.id);
export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export function isReadyIngredient(itemId) {
  const meta = INGREDIENTS[itemId];
  return Boolean(meta && meta.action === 'ready');
}

export function canChopItem(itemId) {
  return Boolean(CHOP_RESULTS[itemId]);
}

export function canSearItem(itemId) {
  return Boolean(SEAR_RESULTS[itemId]);
}

export function canSimmerItem(itemId) {
  return Boolean(SIMMER_RESULTS[itemId]);
}

export function canBakeItem(itemId) {
  return Boolean(BAKE_RESULTS[itemId]);
}

export function findMatchingRecipes(heldIngredients) {
  if (!heldIngredients || heldIngredients.length === 0) return [];
  const counts = {};
  for (const id of heldIngredients) {
    counts[id] = (counts[id] || 0) + 1;
  }
  return RECIPES.filter((recipe) => {
    const req = {};
    for (const ing of recipe.ingredients) {
      req[ing] = (req[ing] || 0) + 1;
    }
    for (const [id, n] of Object.entries(counts)) {
      if ((req[id] || 0) < n) return false;
    }
    return true;
  });
}

export function matchCompleteRecipe(heldIngredients) {
  if (!heldIngredients || heldIngredients.length !== 3) return null;
  const sorted = [...heldIngredients].sort().join('|');
  return RECIPES.find((r) => [...r.ingredients].sort().join('|') === sorted) || null;
}

export function canAcceptIngredient(assemblyItems, candidateId) {
  if (!isReadyIngredient(candidateId)) return false;
  if (assemblyItems.length >= 3) return false;
  return findMatchingRecipes([...assemblyItems, candidateId]).length > 0;
}
