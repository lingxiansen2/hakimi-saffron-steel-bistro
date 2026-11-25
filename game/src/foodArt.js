function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPlateBase(ctx, radius, glow = false) {
  if (glow) {
    ctx.save();
    ctx.shadowColor = 'rgba(244, 185, 66, 0.85)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(244, 185, 66, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 1, radius + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 4, radius + 1, radius * 0.84, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fcf6ea';
  ctx.strokeStyle = '#d4c3a3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.84, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(216, 122, 50, 0.45)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.74, radius * 0.61, 0, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawIngredientIcon(ctx, itemId, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  switch (itemId) {
    case 'steak': {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(1, 5, 19, 13, -0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#bd3535';
      ctx.strokeStyle = '#f5d4cc';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-17, -2);
      ctx.bezierCurveTo(-18, -14, 4, -15, 16, -6);
      ctx.bezierCurveTo(21, 2, 13, 13, -2, 12);
      ctx.bezierCurveTo(-14, 12, -18, 6, -17, -2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 224, 218, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-9, -4);
      ctx.quadraticCurveTo(-1, -1, 4, -6);
      ctx.moveTo(-6, 4);
      ctx.quadraticCurveTo(3, 5, 10, 1);
      ctx.stroke();
      break;
    }

    case 'seared_steak': {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(1, 5, 19, 13, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6f3220';
      ctx.strokeStyle = '#3d190f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 17, 11.5, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#26100a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-9, -7);
      ctx.lineTo(-2, 7);
      ctx.moveTo(-1, -8);
      ctx.lineTo(6, 7);
      ctx.moveTo(7, -7);
      ctx.lineTo(12, 4);
      ctx.stroke();

      ctx.fillStyle = '#f6cc52';
      roundedRect(ctx, -5, -4, 9, 6, 1.5);
      ctx.fill();
      break;
    }

    case 'salmon': {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(1, 5, 19, 11, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f57c56';
      ctx.strokeStyle = '#b9482e';
      ctx.lineWidth = 1.8;
      roundedRect(ctx, -17, -9, 34, 18, 7);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffe0d4';
      ctx.lineWidth = 2;
      for (let sx = -10; sx <= 10; sx += 7) {
        ctx.beginPath();
        ctx.moveTo(sx, -7);
        ctx.quadraticCurveTo(sx + 3, 0, sx - 1, 7);
        ctx.stroke();
      }
      break;
    }

    case 'seared_salmon': {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(1, 5, 19, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e5653e';
      ctx.strokeStyle = '#8b2f17';
      ctx.lineWidth = 2;
      roundedRect(ctx, -17, -9, 34, 18, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(248, 206, 94, 0.85)';
      roundedRect(ctx, -13, -7, 26, 5, 3);
      ctx.fill();

      ctx.strokeStyle = '#531b0d';
      ctx.lineWidth = 2;
      for (let sx = -9; sx <= 9; sx += 9) {
        ctx.beginPath();
        ctx.moveTo(sx, -6);
        ctx.lineTo(sx + 2, 7);
        ctx.stroke();
      }
      break;
    }

    case 'bun': {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 7, 17, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cb8032';
      roundedRect(ctx, -16, 1, 32, 9, 4);
      ctx.fill();

      ctx.fillStyle = '#eda949';
      ctx.strokeStyle = '#a8631f';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 2, 16, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff3cf';
      for (const [sx, sy] of [[-6, -7], [0, -9], [6, -6], [-3, -4], [4, -3]]) {
        ctx.beginPath();
        ctx.ellipse(sx, sy, 1.7, 1, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'tomato': {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(1, 6, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e4382f';
      ctx.strokeStyle = '#991b16';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 1, 13.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 196, 184, 0.55)';
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
      break;
    }

    case 'chopped_tomato': {
      const slices = [[-7, 3], [6, 4], [0, -4]];
      for (const [ox, oy] of slices) {
        ctx.fillStyle = '#ea3f35';
        ctx.strokeStyle = '#9e1e18';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ox, oy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffb39b';
        ctx.beginPath();
        ctx.arc(ox - 2, oy, 2.2, 0, Math.PI * 2);
        ctx.arc(ox + 2.2, oy + 1, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'greens': {
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

      ctx.strokeStyle = '#b4f29b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(0, -8);
      ctx.moveTo(0, 0);
      ctx.lineTo(-5, -4);
      ctx.moveTo(0, -1);
      ctx.lineTo(5, -5);
      ctx.stroke();
      break;
    }

    case 'chopped_greens': {
      const shreds = [
        [-9, 3, -0.4, '#47aa45'],
        [4, 4, 0.35, '#59c252'],
        [-3, -2, 0.15, '#7de06c'],
        [7, -3, -0.5, '#3b963d'],
        [-8, -5, 0.45, '#8ee878'],
      ];
      for (const [x, y, rot, col] of shreds) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = col;
        roundedRect(ctx, -7, -3, 14, 6, 3);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'herb': {
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
      break;
    }

    case 'chopped_herb': {
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
      break;
    }

    case 'burned': {
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
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

export function drawPlatedDish(ctx, recipeId, cx, cy, scale = 1, glow = false) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  drawPlateBase(ctx, 25, glow);

  switch (recipeId) {
    case 'burger': {
      ctx.fillStyle = '#c87e30';
      roundedRect(ctx, -14, 3, 28, 7, 3);
      ctx.fill();
      ctx.fillStyle = '#5eb854';
      roundedRect(ctx, -15, -1, 30, 5, 2.5);
      ctx.fill();
      ctx.fillStyle = '#6b2f1d';
      roundedRect(ctx, -14, -6, 28, 7, 3);
      ctx.fill();
      ctx.fillStyle = '#eda949';
      ctx.beginPath();
      ctx.arc(0, -5, 14, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff4cf';
      ctx.fillRect(-5, -13, 2.5, 1.8);
      ctx.fillRect(2, -14, 2.5, 1.8);
      break;
    }

    case 'wagyu': {
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
      break;
    }

    case 'salmon_bowl': {
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
      roundedRect(ctx, -12, -8, 19, 11, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f7d55c';
      ctx.beginPath();
      ctx.arc(-8, -9, 4, 0, Math.PI);
      ctx.fill();
      break;
    }

    case 'bruschetta': {
      for (const [bx, by] of [[-7, 2], [6, -2]]) {
        ctx.fillStyle = '#e59d45';
        ctx.strokeStyle = '#995b19';
        ctx.lineWidth = 1.3;
        roundedRect(ctx, bx - 9, by - 5, 18, 11, 4);
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
      break;
    }

    case 'surf_turf': {
      ctx.fillStyle = '#6f301e';
      ctx.beginPath();
      ctx.ellipse(-6, 3, 11, 7.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea6a41';
      roundedRect(ctx, 1, -8, 15, 10, 4);
      ctx.fill();
      ctx.fillStyle = '#f5ca52';
      ctx.beginPath();
      ctx.arc(0, -1, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#35a96b';
      ctx.beginPath();
      ctx.arc(-5, -5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

export function drawAssemblyProgress(ctx, items, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  drawPlateBase(ctx, 25, false);

  const offsets = [
    [-9, 3],
    [8, -2],
    [0, -9],
  ];
  items.forEach((itemId, idx) => {
    const [ox, oy] = offsets[idx] || [0, 0];
    drawIngredientIcon(ctx, itemId, ox, oy, 0.56);
  });

  if (items.length < 3) {
    ctx.strokeStyle = 'rgba(216, 122, 50, 0.8)';
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
