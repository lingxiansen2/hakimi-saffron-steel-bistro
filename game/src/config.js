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
export const GRID_ORIGIN_X = Math.floor((CANVAS_WIDTH - GRID_COLS * TILE_W) / 2);
export const GRID_ORIGIN_Y = 180;

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
    spawnInterval: 9.2,
    patienceScale: 1.18,
    allowedRecipes: ['burger', 'bruschetta', 'wagyu', 'berry_tart', 'salmon_bowl'],
    vipChance: 0.12,
    starTargets: [360, 620, 920],
  },
  {
    id: 1,
    name: 'SHIFT 2: LUNCH RUSH',
    shortName: 'Lunch Rush',
    lighting: 'daylight',
    duration: 110,
    maxOrders: 4,
    spawnInterval: 7.2,
    patienceScale: 1.0,
    allowedRecipes: ['burger', 'wagyu', 'salmon_bowl', 'bruschetta', 'salmon_ramen', 'berry_tart'],
    vipChance: 0.24,
    starTargets: [520, 880, 1280],
  },
  {
    id: 2,
    name: 'SHIFT 3: DINNER SERVICE',
    shortName: 'Dinner Service',
    lighting: 'lantern',
    duration: 120,
    maxOrders: 5,
    spawnInterval: 6.1,
    patienceScale: 0.9,
    allowedRecipes: ['burger', 'wagyu', 'salmon_bowl', 'salmon_ramen', 'berry_tart', 'surf_turf'],
    vipChance: 0.34,
    starTargets: [720, 1180, 1680],
  },
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
