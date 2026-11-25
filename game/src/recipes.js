export const INGREDIENTS = {
  steak: {
    id: 'steak',
    name: 'Wagyu',
    short: 'Wagyu',
    color: '#b83939',
    accent: '#f2c6c2',
    action: 'sear',
  },
  seared_steak: {
    id: 'seared_steak',
    name: 'Seared Wagyu',
    short: 'Seared Steak',
    color: '#6e3423',
    accent: '#df8c4c',
    action: 'ready',
  },
  salmon: {
    id: 'salmon',
    name: 'Salmon',
    short: 'Salmon',
    color: '#f27c5c',
    accent: '#ffd4c4',
    action: 'sear',
  },
  seared_salmon: {
    id: 'seared_salmon',
    name: 'Seared Salmon',
    short: 'Seared Salmon',
    color: '#e86842',
    accent: '#f7ca72',
    action: 'ready',
  },
  bun: {
    id: 'bun',
    name: 'Brioche',
    short: 'Brioche',
    color: '#e29e44',
    accent: '#f9d896',
    action: 'ready',
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    short: 'Tomato',
    color: '#e23b32',
    accent: '#59a646',
    action: 'chop',
  },
  chopped_tomato: {
    id: 'chopped_tomato',
    name: 'Sliced Tomato',
    short: 'Dice Tomato',
    color: '#eb493b',
    accent: '#ffd3b0',
    action: 'ready',
  },
  greens: {
    id: 'greens',
    name: 'Greens',
    short: 'Greens',
    color: '#469e46',
    accent: '#9be06c',
    action: 'chop',
  },
  chopped_greens: {
    id: 'chopped_greens',
    name: 'Crisp Greens',
    short: 'Cut Greens',
    color: '#5eb854',
    accent: '#bef28d',
    action: 'ready',
  },
  herb: {
    id: 'herb',
    name: 'Saffron Herb',
    short: 'Herb',
    color: '#2c8a5e',
    accent: '#f4b942',
    action: 'chop',
  },
  chopped_herb: {
    id: 'chopped_herb',
    name: 'Minced Herb',
    short: 'Minced Herb',
    color: '#34a36e',
    accent: '#ffd569',
    action: 'ready',
  },
  burned: {
    id: 'burned',
    name: 'Charred Pan',
    short: 'Burned!',
    color: '#2a2626',
    accent: '#685959',
    action: 'trash',
  },
};

export const CHOP_RESULTS = {
  tomato: 'chopped_tomato',
  greens: 'chopped_greens',
  herb: 'chopped_herb',
};

export const SEAR_RESULTS = {
  steak: 'seared_steak',
  salmon: 'seared_salmon',
};

export const RECIPES = [
  {
    id: 'burger',
    name: 'Classic Bistro Burger',
    shortName: 'Bistro Burger',
    ingredients: ['bun', 'seared_steak', 'chopped_greens'],
    reward: 140,
    patience: 48,
    badgeColor: '#f0b14d',
  },
  {
    id: 'wagyu',
    name: 'Herb-Seared Wagyu',
    shortName: 'Herb Wagyu',
    ingredients: ['seared_steak', 'chopped_herb', 'chopped_tomato'],
    reward: 180,
    patience: 52,
    badgeColor: '#e26a4b',
  },
  {
    id: 'salmon_bowl',
    name: 'Citrus Salmon Bowl',
    shortName: 'Salmon Bowl',
    ingredients: ['seared_salmon', 'chopped_greens', 'chopped_tomato'],
    reward: 170,
    patience: 50,
    badgeColor: '#f38c5a',
  },
  {
    id: 'bruschetta',
    name: 'Tomato Basil Bruschetta',
    shortName: 'Bruschetta',
    ingredients: ['bun', 'chopped_tomato', 'chopped_herb'],
    reward: 115,
    patience: 40,
    badgeColor: '#77c772',
  },
  {
    id: 'surf_turf',
    name: 'Surf & Turf Platter',
    shortName: 'Surf & Turf',
    ingredients: ['seared_steak', 'seared_salmon', 'chopped_herb'],
    reward: 240,
    patience: 58,
    badgeColor: '#f4ca52',
  },
];

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
