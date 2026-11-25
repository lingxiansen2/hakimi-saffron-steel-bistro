import { RECIPES } from './recipes.js';

const DISH_SPRITES = new Map();
let bannerSprite = null;
let floorTileSprite = null;

function loadDecodedImage(src) {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(() => resolve(img)).catch(() => resolve(img));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function preloadBistroAssets() {
  const jobs = [
    loadDecodedImage('./assets/bistro-banner.webp').then((img) => {
      bannerSprite = img;
    }),
    loadDecodedImage('./assets/floor-tile.webp').then((img) => {
      floorTileSprite = img;
    }),
    ...RECIPES.map((recipe) =>
      loadDecodedImage(`./assets/dishes/${recipe.id}.webp`).then((img) => {
        if (img) DISH_SPRITES.set(recipe.id, img);
      }),
    ),
  ];
  await Promise.allSettled(jobs);
}

export function getDishSprite(recipeId) {
  return DISH_SPRITES.get(recipeId) || null;
}

export function getBannerSprite() {
  return bannerSprite;
}

export function getFloorTileSprite() {
  return floorTileSprite;
}
