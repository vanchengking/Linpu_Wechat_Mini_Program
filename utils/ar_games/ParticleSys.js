class ParticleSys {
  constructor(canvasWidth, canvasHeight) {
    this.particles = [];
    this.width = canvasWidth;
    this.height = canvasHeight;
  }

  emit(x, y, count, options = {}) {
    const { color = '#ffffff', speed = 2, life = 60, size = 3 } = options;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: life + Math.random() * 20,
        maxLife: life + 20,
        color,
        size: size + Math.random() * 2
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vy += 0.05; // gravity

      if (p.life <= 0 || p.y > this.height) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (let p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }
}

export default ParticleSys;
