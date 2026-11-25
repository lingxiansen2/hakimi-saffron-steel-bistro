export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.popups = [];
  }

  emitBurst(x, y, color, count = 8, speed = 90) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.45;
      const spd = speed * (0.45 + Math.random() * 0.75);
      this.particles.push({
        kind: 'spark',
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 24,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        size: 3 + Math.random() * 3.5,
        color,
      });
    }
  }

  emitSteam(x, y, warm = false) {
    this.particles.push({
      kind: 'steam',
      x: x + (Math.random() - 0.5) * 18,
      y: y - 8,
      vx: (Math.random() - 0.5) * 14,
      vy: -32 - Math.random() * 18,
      life: 0.85,
      maxLife: 0.85,
      size: 6 + Math.random() * 5,
      color: warm ? 'rgba(255, 195, 110, 0.58)' : 'rgba(255, 249, 238, 0.55)',
    });
  }

  addPopup(x, y, text, color = '#f4b942', scale = 1) {
    this.popups.push({
      x,
      y,
      text,
      color,
      scale,
      life: 1.45,
      maxLife: 1.45,
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
        p.vy += 170 * dt;
      } else {
        p.size += 10 * dt;
      }
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.life -= dt;
      pop.y -= 28 * dt;
      if (pop.life <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const pop of this.popups) {
      const alpha = Math.min(1, pop.life * 1.6);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${Math.round(17 * pop.scale)}px "Trebuchet MS", "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(20, 14, 11, 0.92)';
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }
}
