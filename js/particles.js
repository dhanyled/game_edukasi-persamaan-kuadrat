/* ==========================================================================
   QUADRA — 64-Bit Particle Effects Engine
   Handles smoke, fire, sparks, coins, confetti, and fireworks.
   ========================================================================== */

class Particle {
  constructor(x, y, vx, vy, color, size, life, shape = 'circle', gravity = 0.1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
    this.shape = shape;
    this.gravity = gravity;
    this.alpha = 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life--;
    this.alpha = Math.max(0, this.life / this.maxLife);
    this.rotation += this.vRot;
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'square') {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    } else if (this.shape === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size, -Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (this.size / 2));
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.shape === 'spark') {
      ctx.fillRect(-this.size * 1.5, -this.size / 3, this.size * 3, this.size * 0.6);
    }

    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].update()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }

  clear() {
    this.particles = [];
  }

  createExplosion(x, y, count = 40) {
    const colors = ['#ff0055', '#ff5500', '#ffaa00', '#ffff55', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 5 + 2;
      const life = Math.floor(Math.random() * 30) + 20;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color, size, life, 'square', 0.15
      ));
    }
  }

  createSmoke(x, y, count = 3, color = 'rgba(200,210,230,0.4)') {
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 1.5;
      const vy = Math.random() * -1.5 - 0.5;
      const size = Math.random() * 6 + 4;
      const life = Math.floor(Math.random() * 25) + 20;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'circle', -0.02));
    }
  }

  createSparks(x, y, color = '#00f0ff', count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      const size = Math.random() * 3 + 1;
      const life = Math.floor(Math.random() * 20) + 15;
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, size, life, 'spark', 0.05));
    }
  }

  createCoins(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 5;
      const vy = Math.random() * -6 - 2;
      const size = Math.random() * 4 + 3;
      const life = Math.floor(Math.random() * 40) + 30;
      this.particles.push(new Particle(x, y, vx, vy, '#ffbe0b', size, life, 'circle', 0.25));
    }
  }

  createConfetti(x, y, count = 50) {
    const colors = ['#00f0ff', '#ff0077', '#ffbe0b', '#06d6a0', '#ffffff', '#8338ec'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 6 + 3;
      const life = Math.floor(Math.random() * 60) + 40;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color, size, life, 'square', 0.12
      ));
    }
  }

  createFireworks(x, y) {
    const colors = ['#00f0ff', '#ff0077', '#ffbe0b', '#00ff88', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const speed = Math.random() * 5 + 3;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color, 3, 40, 'star', 0.08
      ));
    }
  }

  // 256-BIT HIGH-FIDELITY PARTICLES & LIGHT EFFECTS
  createLaserTrail(x, y, color = '#00f0ff') {
    for (let i = 0; i < 3; i++) {
      const vx = (Math.random() - 0.5) * 1.2;
      const vy = (Math.random() - 0.5) * 1.2;
      const size = Math.random() * 3 + 1.5;
      const life = Math.floor(Math.random() * 15) + 10;
      this.particles.push(new Particle(x, y, vx, vy, color, size, life, 'circle', 0));
    }
  }

  createResonanceRings(x, y, color = '#00f0ff', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2.5;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color, 2.5, 25, 'circle', 0
      ));
    }
  }

  createAmbientMotes(width, height) {
    if (this.particles.length > 80) return;
    if (Math.random() < 0.3) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const vy = -0.3 - Math.random() * 0.4;
      const vx = (Math.random() - 0.5) * 0.4;
      const colors = ['rgba(0,240,255,0.3)', 'rgba(255,190,11,0.25)', 'rgba(6,214,160,0.3)'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(x, y, vx, vy, color, Math.random() * 2 + 1, 90, 'circle', 0));
    }
  }
}

window.ParticleSystem = ParticleSystem;
