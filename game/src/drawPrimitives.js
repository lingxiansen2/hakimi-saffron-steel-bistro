export function traceRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawPillBadge(ctx, cx, cy, text, bgColor, textColor = '#1c1410', borderColor = '#fff4dc') {
  ctx.save();
  ctx.font = '900 11px "Trebuchet MS", "Segoe UI", sans-serif';
  const w = Math.max(46, ctx.measureText(text).width + 16);
  const h = 19;
  traceRoundedRect(ctx, cx - w / 2, cy - h / 2, w, h, 9.5);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 0.5);
  ctx.restore();
}

export function drawWoodgrainPlanks(ctx, x, y, w, h, grainColor) {
  ctx.save();
  ctx.strokeStyle = grainColor;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.36;
  for (let py = y + 10; py < y + h - 8; py += 12) {
    ctx.beginPath();
    ctx.moveTo(x + 4, py);
    ctx.bezierCurveTo(x + w * 0.35, py - 1.5, x + w * 0.65, py + 1.5, x + w - 4, py);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawMarbleVeins(ctx, x, y, w, h, veinColor) {
  ctx.save();
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + h * 0.28);
  ctx.bezierCurveTo(x + w * 0.34, y + h * 0.16, x + w * 0.6, y + h * 0.45, x + w - 10, y + h * 0.25);
  ctx.moveTo(x + 12, y + h * 0.72);
  ctx.bezierCurveTo(x + w * 0.42, y + h * 0.58, x + w * 0.72, y + h * 0.84, x + w - 8, y + h * 0.68);
  ctx.stroke();
  ctx.restore();
}

export function drawPorcelainPlate(ctx, radius, glow = false) {
  if (glow) {
    ctx.save();
    ctx.shadowColor = 'rgba(244, 185, 66, 0.92)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(244, 185, 66, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 1, radius + 5, (radius + 5) * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 4.5, radius + 1.5, radius * 0.86, 0, 0, Math.PI * 2);
  ctx.fill();

  const rimGrad = ctx.createLinearGradient(0, -radius, 0, radius);
  rimGrad.addColorStop(0, '#ffffff');
  rimGrad.addColorStop(1, '#ebe0cc');
  ctx.fillStyle = rimGrad;
  ctx.strokeStyle = '#c9b38c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(216, 122, 50, 0.58)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.76, radius * 0.63, 0, 0, Math.PI * 2);
  ctx.stroke();
}
