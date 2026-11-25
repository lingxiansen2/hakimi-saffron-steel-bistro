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

export const CHOP_DURATION = 1.35;
export const SEAR_DURATION = 3.2;
export const BURN_DURATION = 7.4;
export const COMBO_WINDOW = 9.0;

export const CHEF_SPEED = 325;
export const CHEF_DASH_SPEED = 640;
export const CHEF_DASH_DURATION = 0.18;
export const CHEF_DASH_COOLDOWN = 0.9;
export const CHEF_RADIUS = 20;

export const SHIFTS = [
  {
    id: 0,
    name: 'SHIFT 1: PREP SERVICE',
    shortName: 'Prep Service',
    duration: 95,
    maxOrders: 3,
    spawnInterval: 9.5,
    patienceScale: 1.18,
    allowedRecipes: ['burger', 'bruschetta', 'wagyu', 'salmon_bowl'],
    starTargets: [320, 560, 820],
  },
  {
    id: 1,
    name: 'SHIFT 2: LUNCH RUSH',
    shortName: 'Lunch Rush',
    duration: 110,
    maxOrders: 4,
    spawnInterval: 7.4,
    patienceScale: 1.0,
    allowedRecipes: ['burger', 'wagyu', 'salmon_bowl', 'bruschetta', 'surf_turf'],
    starTargets: [480, 820, 1180],
  },
  {
    id: 2,
    name: 'SHIFT 3: DINNER SERVICE',
    shortName: 'Dinner Service',
    duration: 120,
    maxOrders: 5,
    spawnInterval: 6.2,
    patienceScale: 0.88,
    allowedRecipes: ['burger', 'wagyu', 'salmon_bowl', 'bruschetta', 'surf_turf'],
    starTargets: [650, 1080, 1520],
  },
];

export const PALETTE = {
  floorLight: '#d8b792',
  floorDark: '#c49d74',
  floorGrout: '#96714d',
  wallBack: '#261d19',
  woodTop: '#9c663e',
  woodGrain: '#7e4e2d',
  woodFront: '#5a3620',
  butcherTop: '#dfb986',
  butcherSide: '#a87d4c',
  steelTop: '#768290',
  steelShine: '#99a7b8',
  steelFront: '#4b5561',
  copper: '#df7d35',
  copperDark: '#9d4c1c',
  saffron: '#f4b942',
  cream: '#fcf4e3',
  emerald: '#2ea66f',
  amber: '#e8962c',
  crimson: '#d9453a',
};
