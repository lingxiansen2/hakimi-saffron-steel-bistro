import { drawPorcelainPlate, traceRoundedRect } from './drawPrimitives.js';

export function renderIngredientArt(ctx, itemId, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale * 1.32, scale * 1.32);

  switch (itemId) {
    case 'steak':
      drawRawWagyu(ctx);
      break;
    case 'seared_steak':
      drawSearedWagyu(ctx);
      break;
    case 'salmon':
      drawRawSalmon(ctx);
      break;
    case 'seared_salmon':
      drawSearedSalmon(ctx);
      break;
    case 'dashi':
      drawDashiCup(ctx);
      break;
    case 'saffron_broth':
      drawSaffronBrothBowl(ctx);
      break;
    case 'dough':
      drawBriocheDough(ctx);
      break;
    case 'baked_bun':
      drawBakedBrioche(ctx);
      break;
    case 'tomato':
      drawWholeTomato(ctx);
      break;
    case 'chopped_tomato':
      drawSlicedTomato(ctx);
      break;
    case 'greens':
      drawWholeGreens(ctx);
      break;
    case 'chopped_greens':
      drawShreddedGreens(ctx);
      break;
    case 'herb':
      drawWholeHerb(ctx);
      break;
    case 'chopped_herb':
      drawMincedHerb(ctx);
      break;
    case 'berry':
      drawWholeBerries(ctx);
      break;
    case 'chopped_berry':
      drawGlazedBerries(ctx);
      break;
    case 'burned':
      drawBurnedMass(ctx);
      break;
    default:
      break;
  }

  ctx.restore();
}

export function renderPlatedDish(ctx, recipeId, cx, cy, scale = 1, glow = false) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale * 1.3, scale * 1.3);

  drawPorcelainPlate(ctx, 25, glow);

  switch (recipeId) {
    case 'burger':
      drawBurgerDish(ctx);
      break;
    case 'wagyu':
      drawWagyuDish(ctx);
      break;
    case 'salmon_bowl':
      drawSalmonBowlDish(ctx);
      break;
    case 'bruschetta':
      drawBruschettaDish(ctx);
      break;
    case 'salmon_ramen':
      drawSalmonRamenDish(ctx);
      break;
    case 'berry_tart':
      drawBerryTartDish(ctx);
      break;
    case 'surf_turf':
      drawSurfTurfDish(ctx);
      break;
    default:
      break;
  }

  ctx.restore();
}

export function renderMidAssemblyPlate(ctx, items, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale * 1.3, scale * 1.3);

  drawPorcelainPlate(ctx, 25, false);

  const offsets = [
    [-9, 3],
    [8, -2],
    [0, -9],
  ];
  items.forEach((itemId, idx) => {
    const [ox, oy] = offsets[idx] || [0, 0];
    renderIngredientArt(ctx, itemId, ox, oy, 0.56);
  });

  if (items.length < 3) {
    ctx.strokeStyle = 'rgba(216, 122, 50, 0.85)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.6;
    const [gx, gy] = offsets[items.length];
    ctx.beginPath();
    ctx.arc(gx, gy, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawRawWagyu(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.26)';
  ctx.beginPath();
  ctx.ellipse(1, 5, 19, 13, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cf3535';
  ctx.strokeStyle = '#3b1512';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-17, -2);
  ctx.bezierCurveTo(-18, -14, 4, -15, 16, -6);
  ctx.bezierCurveTo(21, 2, 13, 13, -2, 12);
  ctx.bezierCurveTo(-14, 12, -18, 6, -17, -2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#ffded6';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-9, -4);
  ctx.quadraticCurveTo(-1, -1, 4, -6);
  ctx.moveTo(-6, 4);
  ctx.quadraticCurveTo(3, 5, 10, 1);
  ctx.stroke();
}

function drawSearedWagyu(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.26)';
  ctx.beginPath();
  ctx.ellipse(1, 5, 19, 13, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6f3220';
  ctx.strokeStyle = '#3a170c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 11.5, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#240f09';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10, -7);
  ctx.lineTo(-2, 7);
  ctx.moveTo(-1, -8);
  ctx.lineTo(7, 7);
  ctx.moveTo(7, -7);
  ctx.lineTo(12, 4);
  ctx.moveTo(-11, 2);
  ctx.lineTo(10, -4);
  ctx.stroke();
  ctx.fillStyle = '#f8cf54';
  traceRoundedRect(ctx, -5, -4, 9, 6, 1.5);
  ctx.fill();
  ctx.fillStyle = '#339e62';
  ctx.beginPath();
  ctx.arc(1, -2, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawRawSalmon(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(1, 5, 19, 11, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f67e56';
  ctx.strokeStyle = '#b9482e';
  ctx.lineWidth = 1.8;
  traceRoundedRect(ctx, -17, -9, 34, 18, 7);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#ffe5da';
  ctx.lineWidth = 2;
  for (let sx = -10; sx <= 10; sx += 7) {
    ctx.beginPath();
    ctx.moveTo(sx, -7);
    ctx.quadraticCurveTo(sx + 3, 0, sx - 1, 7);
    ctx.stroke();
  }
}

function drawSearedSalmon(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(1, 5, 19, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e5653e';
  ctx.strokeStyle = '#8b2f17';
  ctx.lineWidth = 2;
  traceRoundedRect(ctx, -17, -9, 34, 18, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(249, 210, 96, 0.88)';
  traceRoundedRect(ctx, -13, -7, 26, 5, 3);
  ctx.fill();
  ctx.strokeStyle = '#4e1a0c';
  ctx.lineWidth = 2;
  for (let sx = -9; sx <= 9; sx += 9) {
    ctx.beginPath();
    ctx.moveTo(sx, -6);
    ctx.lineTo(sx + 2, 7);
    ctx.stroke();
  }
}

function drawDashiCup(ctx) {
  ctx.fillStyle = '#38414a';
  ctx.strokeStyle = '#9aa8b8';
  ctx.lineWidth = 1.6;
  traceRoundedRect(ctx, -13, -8, 26, 18, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e2a33d';
  ctx.beginPath();
  ctx.ellipse(0, -6, 10, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2d7048';
  ctx.fillRect(-5, -8, 9, 4);
}

function drawSaffronBrothBowl(ctx) {
  ctx.fillStyle = '#2a2220';
  ctx.strokeStyle = '#d87a32';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 1, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const broth = ctx.createRadialGradient(0, 0, 2, 0, 0, 11);
  broth.addColorStop(0, '#ffe17a');
  broth.addColorStop(1, '#e89027');
  ctx.fillStyle = broth;
  ctx.beginPath();
  ctx.arc(0, 1, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 250, 224, 0.72)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 1, 6, 0.3, Math.PI * 1.4);
  ctx.stroke();
  ctx.fillStyle = '#d93d2c';
  ctx.fillRect(-3, -2, 6, 2);
}

function drawBriocheDough(ctx) {
  ctx.fillStyle = '#f2deb6';
  ctx.strokeStyle = '#bf9a5b';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-5, 2, 9, 0, Math.PI * 2);
  ctx.arc(6, -1, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawBakedBrioche(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 7, 17, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c47222';
  ctx.strokeStyle = '#5c2d09';
  ctx.lineWidth = 1.6;
  traceRoundedRect(ctx, -16, 1, 32, 9, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f3ae46';
  ctx.strokeStyle = '#6e370b';
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.arc(0, 2, 16, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff6d4';
  for (const [sx, sy] of [[-6, -7], [0, -9], [6, -6], [-3, -4], [4, -3]]) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 1.9, 1.2, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWholeTomato(ctx) {
  ctx.fillStyle = '#e8372c';
  ctx.strokeStyle = '#6b110d';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 1, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 212, 200, 0.62)';
  ctx.beginPath();
  ctx.ellipse(-5, -4, 4, 2.3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#48a143';
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(3, -8);
  ctx.lineTo(8, -10);
  ctx.lineTo(3, -5);
  ctx.lineTo(0, -1);
  ctx.lineTo(-3, -5);
  ctx.lineTo(-8, -10);
  ctx.lineTo(-3, -8);
  ctx.closePath();
  ctx.fill();
}

function drawSlicedTomato(ctx) {
  for (const [ox, oy] of [[-7, 3], [6, 4], [0, -4]]) {
    ctx.fillStyle = '#ea3f35';
    ctx.strokeStyle = '#9e1e18';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ox, oy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffbf9f';
    ctx.beginPath();
    ctx.arc(ox - 2, oy, 2.2, 0, Math.PI * 2);
    ctx.arc(ox + 2.2, oy + 1, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWholeGreens(ctx) {
  ctx.fillStyle = '#33883c';
  ctx.beginPath();
  ctx.arc(-5, 2, 10, 0, Math.PI * 2);
  ctx.arc(5, 2, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5fc257';
  ctx.strokeStyle = '#25662c';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -2, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#bbf59f';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(0, -8);
  ctx.stroke();
}

function drawShreddedGreens(ctx) {
  for (const [x, y, rot, col] of [
    [-9, 3, -0.4, '#47aa45'],
    [4, 4, 0.35, '#59c252'],
    [-3, -2, 0.15, '#7de06c'],
    [7, -3, -0.5, '#3b963d'],
    [-8, -5, 0.45, '#91ec7a'],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = col;
    traceRoundedRect(ctx, -7, -3, 14, 6, 3);
    ctx.fill();
    ctx.restore();
  }
}

function drawWholeHerb(ctx) {
  ctx.strokeStyle = '#216e47';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, 10);
  ctx.quadraticCurveTo(0, 0, 10, -10);
  ctx.stroke();
  ctx.fillStyle = '#35aa6b';
  for (const [lx, ly, ang] of [[-5, 4, -0.7], [1, 1, 0.5], [4, -4, -0.6], [-2, -2, 0.4]]) {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = '#f5be3e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, -5);
  ctx.lineTo(11, -11);
  ctx.moveTo(5, -3);
  ctx.lineTo(13, -4);
  ctx.stroke();
}

function drawMincedHerb(ctx) {
  ctx.fillStyle = '#2d995f';
  for (const [hx, hy] of [[-8, 3], [-2, 6], [6, 3], [0, -3], [-6, -4], [7, -4]]) {
    ctx.beginPath();
    ctx.arc(hx, hy, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f5c447';
  for (const [sx, sy] of [[-4, 1], [3, 0], [1, -6], [-7, -1]]) {
    ctx.fillRect(sx, sy, 4, 2);
  }
}

function drawWholeBerries(ctx) {
  for (const [bx, by, col] of [[-6, 3, '#c82b52'], [6, 4, '#3e4c9c'], [0, -5, '#df3862']]) {
    ctx.fillStyle = col;
    ctx.strokeStyle = '#27142e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(bx - 2, by - 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGlazedBerries(ctx) {
  ctx.fillStyle = 'rgba(182, 32, 74, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [bx, by, col] of [[-5, 1, '#ea466e'], [5, 2, '#4f62bf'], [0, -4, '#ff688c']]) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(bx, by, 4.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBurnedMass(ctx) {
  ctx.fillStyle = '#231f20';
  ctx.strokeStyle = '#4f4343';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 11, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#e0692b';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, -3);
  ctx.lineTo(2, 2);
  ctx.lineTo(7, -2);
  ctx.stroke();
}

function drawBurgerDish(ctx) {
  ctx.fillStyle = '#c87e30';
  traceRoundedRect(ctx, -14, 3, 28, 7, 3);
  ctx.fill();
  ctx.fillStyle = '#5eb854';
  traceRoundedRect(ctx, -15, -1, 30, 5, 2.5);
  ctx.fill();
  ctx.fillStyle = '#6b2f1d';
  traceRoundedRect(ctx, -14, -6, 28, 7, 3);
  ctx.fill();
  ctx.fillStyle = '#f0ab49';
  ctx.beginPath();
  ctx.arc(0, -5, 14, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff6d4';
  ctx.fillRect(-5, -13, 2.5, 1.8);
  ctx.fillRect(2, -14, 2.5, 1.8);
}

function drawWagyuDish(ctx) {
  ctx.fillStyle = '#70301e';
  ctx.strokeStyle = '#3d170c';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-2, 1, 14, 9.5, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#eb4438';
  ctx.beginPath();
  ctx.arc(10, -4, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2f9e64';
  ctx.beginPath();
  ctx.arc(-3, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6cc52';
  ctx.fillRect(-5, -6, 6, 3);
}

function drawSalmonBowlDish(ctx) {
  ctx.fillStyle = '#60c659';
  ctx.beginPath();
  ctx.arc(-5, 2, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eb4438';
  ctx.beginPath();
  ctx.arc(9, 4, 6, 0, Math.PI * 2);
  ctx.arc(8, -5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eb6c44';
  ctx.strokeStyle = '#923017';
  ctx.lineWidth = 1.4;
  traceRoundedRect(ctx, -12, -8, 19, 11, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f7d55c';
  ctx.beginPath();
  ctx.arc(-8, -9, 4, 0, Math.PI);
  ctx.fill();
}

function drawBruschettaDish(ctx) {
  for (const [bx, by] of [[-7, 2], [6, -2]]) {
    ctx.fillStyle = '#e59d45';
    ctx.strokeStyle = '#995b19';
    ctx.lineWidth = 1.3;
    traceRoundedRect(ctx, bx - 9, by - 5, 18, 11, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e93f33';
    ctx.beginPath();
    ctx.arc(bx - 2, by, 3.5, 0, Math.PI * 2);
    ctx.arc(bx + 3, by + 1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#33a368';
    ctx.beginPath();
    ctx.arc(bx, by - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSalmonRamenDish(ctx) {
  ctx.fillStyle = '#262120';
  ctx.strokeStyle = '#d87a32';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f0a636';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eb6d43';
  traceRoundedRect(ctx, -11, -6, 15, 9, 3);
  ctx.fill();
  ctx.fillStyle = '#53b856';
  ctx.beginPath();
  ctx.arc(8, 3, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff5df';
  ctx.beginPath();
  ctx.arc(6, -5, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4b942';
  ctx.beginPath();
  ctx.arc(6, -5, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBerryTartDish(ctx) {
  ctx.fillStyle = '#df9c45';
  ctx.strokeStyle = '#995c1c';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 1, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#c82b52';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [bx, by, col] of [[-4, -1, '#ff5f85'], [5, 1, '#4f62bf'], [1, -4, '#eb3d66']]) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(bx, by, 3.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#39ac68';
  ctx.beginPath();
  ctx.arc(-1, 3, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSurfTurfDish(ctx) {
  ctx.strokeStyle = '#f5ca52';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#6f301e';
  ctx.beginPath();
  ctx.ellipse(-6, 3, 11, 7.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ea6a41';
  traceRoundedRect(ctx, 1, -8, 15, 10, 4);
  ctx.fill();
  ctx.fillStyle = '#f5ca52';
  ctx.beginPath();
  ctx.arc(0, -1, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#35a96b';
  ctx.beginPath();
  ctx.arc(-5, -5, 3.5, 0, Math.PI * 2);
  ctx.fill();
}
