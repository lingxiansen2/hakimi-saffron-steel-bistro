export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const HUD_HEIGHT = 54;
export const RAIL_TOP = 54;
export const RAIL_HEIGHT = 114;
export const PLAYFIELD_TOP = 168;
export const BOTTOM_BAR_Y = 678;

export const GRID_COLS = 11;
export const GRID_ROWS = 6;
export const TILE_W = 102;
export const TILE_H = 78;
export const COUNTER_BEVEL = 18;
export const GRID_ORIGIN_X = 22;
export const GRID_ORIGIN_Y = 180;
export const DINING_STRIP_X = 1150;

export const CHOP_DURATION = 1.25;
export const SEAR_DURATION = 3.1;
export const SEAR_BURN_DURATION = 7.4;
export const SIMMER_DURATION = 2.9;
export const BAKE_DURATION = 2.8;
export const BAKE_BURN_DURATION = 9.2;
export const COMBO_WINDOW = 9.5;

export const CHEF_SPEED = 330;
export const CHEF_DASH_SPEED = 650;
export const CHEF_DASH_DURATION = 0.18;
export const CHEF_DASH_COOLDOWN = 0.85;
export const CHEF_RADIUS = 20;

export const SHIFTS = [
  {
    id: 0,
    name: 'SHIFT 1: PREP SERVICE',
    shortName: 'Prep Service',
    lighting: 'daylight',
    duration: 95,
    maxOrders: 3,
    spawnInterval: 9.0,
    patienceScale: 1.18,
    allowedRecipes: ['burger', 'bruschetta', 'wagyu', 'berry_tart', 'salmon_bowl', 'salmon_brioche'],
    vipChance: 0.15,
    starTargets: [360, 650, 960],
  },
  {
    id: 1,
    name: 'SHIFT 2: LUNCH RUSH',
    shortName: 'Lunch Rush',
    lighting: 'daylight',
    duration: 110,
    maxOrders: 4,
    spawnInterval: 7.1,
    patienceScale: 1.0,
    allowedRecipes: ['burger', 'wagyu', 'salmon_bowl', 'bruschetta', 'salmon_ramen', 'berry_tart', 'wagyu_ramen', 'salmon_brioche'],
    vipChance: 0.25,
    starTargets: [540, 920, 1340],
  },
  {
    id: 2,
    name: 'SHIFT 3: DINNER SERVICE',
    shortName: 'Dinner Service',
    lighting: 'lantern',
    duration: 120,
    maxOrders: 5,
    spawnInterval: 6.0,
    patienceScale: 0.9,
    allowedRecipes: ['burger', 'wagyu', 'salmon_bowl', 'salmon_ramen', 'berry_tart', 'wagyu_ramen', 'salmon_brioche'],
    vipChance: 0.35,
    starTargets: [740, 1220, 1740],
  },
];

export const KITCHEN_UPGRADES = [
  { id: 'copper_burners', name: 'Copper Burners', desc: '+25% Sear & Bake', cost: 350 },
  { id: 'sharp_knives', name: 'Damascus Knives', desc: '+35% Chop Speed', cost: 320 },
  { id: 'speed_boots', name: 'Brigade Boots', desc: '+20% Move Speed', cost: 300 },
  { id: 'heat_lamps', name: 'Brass Heat Lamps', desc: '+25% Ticket Patience', cost: 400 },
];

export const DINING_REGULARS = [
  { id: 'claire', name: 'Claire', hair: '#5a3420', coat: '#3c5a75', skin: '#f5cfa8', isVip: false },
  { id: 'kenji', name: 'Kenji', hair: '#1d1c24', coat: '#634636', skin: '#eec29b', isVip: false },
  { id: 'margot', name: 'Margot', hair: '#a44d2a', coat: '#2f6b56', skin: '#f8d7b8', isVip: false },
  { id: 'critic', name: 'Critic Auguste', hair: '#d8d4ce', coat: '#2a2228', skin: '#f3caa6', isVip: true },
];

export const BISTRO_PALETTE = {
  floorLight: '#d8b48b',
  floorDark: '#bf9469',
  floorGrout: '#8d6644',
  walnutTop: '#9d663c',
  walnutPlank: '#84502b',
  walnutFront: '#532f19',
  marbleTop: '#efe7d6',
  marbleVein: '#c9bba4',
  marbleFront: '#9c8b76',
  butcherTop: '#e3be8a',
  butcherSide: '#a57947',
  steelTop: '#7c8896',
  steelShine: '#a4b2c2',
  steelFront: '#46505c',
  hearthStone: '#6b473a',
  hearthFront: '#3f261f',
  copper: '#df7d35',
  saffron: '#f4b942',
  cream: '#fcf4e3',
  emerald: '#2ea66f',
  amber: '#e8962c',
  crimson: '#d9453a',
};
