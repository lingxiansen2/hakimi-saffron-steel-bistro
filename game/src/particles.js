export class KitchenParticleEngine {
  constructor() {
    this.particles = [];
    this.popups = [];
  }

  emitBurst(x, y, color, count = 8, speed = 92) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.45;
      const spd = speed * (0.45 + Math.random() * 0.75);
      this.particles.push({
        kind: 'spark',
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 26,
        life: 0.48 + Math.random() * 0.25,
        maxLife: 0.73,
        size: 3.2 + Math.random() * 3.5,
        color,
      });
    }
  }

  emitSteamCurl(x, y, warm = false) {
    this.particles.push({
      kind: 'steam_curl',
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      vx: (Math.random() - 0.5) * 12,
      vy: -34 - Math.random() * 18,
      life: 0.95,
      maxLife: 0.95,
      size: 7 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
      color: warm ? 'rgba(255, 198, 108, 0.62)' : 'rgba(255, 250, 240, 0.56)',
    });
  }

  emitSizzleSpark(x, y) {
    this.particles.push({
      kind: 'spark',
      x: x + (Math.random() - 0.5) * 18,
      y: y - 4,
      vx: (Math.random() - 0.5) * 58,
      vy: -54 - Math.random() * 32,
      life: 0.34,
      maxLife: 0.34,
      size: 2.5,
      color: '#ffd966',
    });
  }

  addScorePopup(x, y, text, color = '#f4b942', scale = 1) {
    this.popups.push({
      x,
      y,
      text,
      color,
      scale,
      life: 1.55,
      maxLife: 1.55,
    });
  }

  step(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'spark') {
        p.vy += 175 * dt;
      } else {
        p.size += 11 * dt;
        p.phase += dt * 6;
      }
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.life -= dt;
      pop.y -= 28 * dt;
      if (pop.life <= 0) this.popups.splice(i, 1);
    }
  }

  render(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.kind === 'steam_curl') {
        const sway = Math.sin(p.phase) * 5;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + 8);
        ctx.bezierCurveTo(p.x - 5 + sway, p.y + 2, p.x + 6 - sway, p.y - 6, p.x + sway * 0.5, p.y - 14);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const pop of this.popups) {
      const alpha = Math.min(1, pop.life * 1.6);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${Math.round(18 * pop.scale)}px "Trebuchet MS", "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = 'rgba(20, 14, 11, 0.94)';
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }
}
