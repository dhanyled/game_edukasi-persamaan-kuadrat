/* ==========================================================================
   QUADRA — 64-Bit Canvas 2D & Physics Simulation Renderer
   Renders retro pseudo-3D environments, animated physics simulations,
   dynamic trajectory parabolas, and math visualization overlays.
   ========================================================================== */

class SimulationRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = new ParticleSystem();

    this.width = canvas.width || 600;
    this.height = canvas.height || 400;

    this.currentWorld = 'village';
    this.scenario = 'village_portal';

    // Simulation animation state
    this.simRunning = false;
    this.simProgress = 0; // 0 to 1
    this.simSpeed = 0.008; // Smooth ~2.5 second animation
    this.simSuccess = false;
    this.simOutcomeChecked = false;
    this.onSimComplete = null;

    // Mathematical parameters for dynamic parabola
    this.a = 1;
    this.b = -7;
    this.c = 12;
    this.roots = [3, 4];
    this.vertex = { xv: 3.5, yv: -0.25 };

    this.showGraphOverlay = false;
    this.timeTick = 0;

    this.resizeTimeout = null;
    this.isActiveScreen = false;
    this.animFrameId = null;

    this.resize();
    window.addEventListener('resize', () => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.resize(), 100);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopRenderLoop();
      } else if (this.isActiveScreen) {
        this.startRenderLoop();
      }
    });

    this.startRenderLoop();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform matrix
      this.ctx.scale(dpr, dpr);
      this.width = rect.width;
      this.height = rect.height;
    }
  }

  setScenario(worldKey, scenario, equation, roots, vertex) {
    this.currentWorld = worldKey;
    this.scenario = scenario;
    this.a = equation.a;
    this.b = equation.b;
    this.c = equation.c;
    this.roots = roots || [];
    this.vertex = vertex || MathEngine.calcVertex(this.a, this.b, this.c);

    this.simRunning = false;
    this.simProgress = 0;
    this.simSuccess = false;
    this.simOutcomeChecked = false;
    this.particles.clear();
    this.resize();
  }

  startSimulation(isSuccess, onComplete) {
    this.simRunning = true;
    this.simProgress = 0;
    this.simSuccess = isSuccess;
    this.simOutcomeChecked = false;
    this.onSimComplete = onComplete;
    this.particles.clear();
  }

  resetSimulation() {
    this.simRunning = false;
    this.simProgress = 0;
    this.particles.clear();
  }

  startRenderLoop() {
    if (this.animFrameId) return;
    const loop = () => {
      if (!document.hidden && this.isActiveScreen) {
        this.update();
        this.render();
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stopRenderLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  setActiveScreen(active) {
    this.isActiveScreen = active;
    if (active && !document.hidden) {
      this.startRenderLoop();
    } else if (!active) {
      this.stopRenderLoop();
    }
  }

  update() {
    this.timeTick += 0.03;
    this.particles.update();

    if (this.simRunning) {
      this.simProgress += this.simSpeed;

      // Emit world-specific active particles during simulation
      this.emitSimulationParticles();

      if (this.simProgress >= 1) {
        this.simProgress = 1;
        this.simRunning = false;
        if (this.onSimComplete && !this.simOutcomeChecked) {
          this.simOutcomeChecked = true;
          setTimeout(() => {
            if (this.onSimComplete) this.onSimComplete(this.simSuccess);
          }, 400); // 400ms pause so player sees the final landing
        }
      }
    }
  }

  emitSimulationParticles() {
    const w = this.width;
    const h = this.height;

    if (this.scenario === 'village_portal') {
      const px = w * 0.5;
      const py = h * 0.65;
      if (this.simSuccess) {
        this.particles.createSparks(px + (Math.random() - 0.5) * 60, py - 90 + (Math.random() - 0.5) * 60, '#00ff88', 2);
      } else {
        this.particles.createSmoke(px, py - 90, 1, 'rgba(255,50,50,0.5)');
      }
    } else if (this.scenario === 'space_rocket') {
      const pos = this.getRocketPos();
      if (!this.simSuccess && this.simProgress > 0.6) {
        this.particles.createExplosion(pos.x, pos.y, 2);
      } else {
        this.particles.createSmoke(pos.x, pos.y + 15, 2, 'rgba(255,160,50,0.7)');
        this.particles.createSparks(pos.x, pos.y + 15, '#ffbe0b', 3);
      }
    } else if (this.scenario === 'racing_jump') {
      const pos = this.getCarPos();
      this.particles.createSparks(pos.x - 15, pos.y + 5, '#00f0ff', 2);
    } else if (this.scenario === 'business_profit') {
      if (this.simSuccess && Math.random() < 0.3) {
        this.particles.createCoins(w * 0.5 + (Math.random() - 0.5) * 200, h * 0.4, 2);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw World Environment
    switch (this.scenario) {
      case 'village_portal':
        this.renderVillage(ctx);
        break;
      case 'sports_hoop':
        this.renderSports(ctx);
        break;
      case 'building_tower':
        this.renderBuilding(ctx);
        break;
      case 'space_rocket':
        this.renderSpace(ctx);
        break;
      case 'business_profit':
        this.renderBusiness(ctx);
        break;
      case 'racing_jump':
        this.renderRacing(ctx);
        break;
      case 'stadium_roof':
        this.renderStadium(ctx);
        break;
      default:
        this.renderGenericParabola(ctx);
        break;
    }

    // 2. Draw Math Graph Curve Overlay if enabled
    if (this.showGraphOverlay) {
      this.renderGraphOverlay(ctx);
    }

    // 3. Draw Particle Systems
    this.particles.draw(ctx);

    // 4. Draw Simulation Status Banner
    if (this.simRunning) {
      this.renderSimulationStatusBanner(ctx);
    }
  }

  renderSimulationStatusBanner(ctx) {
    const w = this.width;
    ctx.save();
    ctx.fillStyle = 'rgba(8, 14, 30, 0.85)';
    ctx.strokeStyle = 'var(--primary-cyan)';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.5 - 140, 20, 280, 36);
    ctx.fillRect(w * 0.5 - 140, 20, 280, 36);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    const dots = '.'.repeat((Math.floor(this.timeTick * 4) % 4));
    ctx.fillText(`⚡ SIMULASI BERJALAN${dots}`, w * 0.5, 42);
    ctx.restore();
  }

  // =========================================================================
  // WORLD SCENARIOS (64-bit retro inspired)
  // =========================================================================

  /* 1. Quadratic Village */
  renderVillage(ctx) {
    const w = this.width;
    const h = this.height;

    // Retro sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0c1b33');
    sky.addColorStop(0.6, '#183852');
    sky.addColorStop(1, '#0e2624');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Mystical mountain silhouettes
    ctx.fillStyle = '#081721';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.lineTo(w * 0.25, h * 0.45);
    ctx.lineTo(w * 0.55, h * 0.75);
    ctx.lineTo(w * 0.8, h * 0.5);
    ctx.lineTo(w, h * 0.7);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Grass terrain with 64-bit blocky tiles
    ctx.fillStyle = '#1b4d3e';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);
    ctx.fillStyle = '#2d6a4f';
    for (let x = 0; x < w; x += 32) {
      ctx.fillRect(x, h * 0.65, 30, 8);
    }

    // Portal Stone Arch Pillars
    const px = w * 0.5;
    const py = h * 0.65;
    ctx.fillStyle = '#3a4a5e';
    ctx.fillRect(px - 110, py - 180, 26, 180);
    ctx.fillRect(px + 84, py - 180, 26, 180);
    ctx.fillRect(px - 120, py - 195, 240, 25);

    // Central Energy Crystal
    const crystalFloat = Math.sin(this.timeTick * 2) * 8;
    const cy = py - 90 + crystalFloat;

    // Parabolic Energy Resonance Beam between Pillars
    const isActivating = this.simRunning || this.simSuccess;
    const beamP = this.simRunning ? this.simProgress : (this.simSuccess ? 1 : 0.3);

    ctx.save();
    ctx.strokeStyle = this.simSuccess ? '#00ff88' : (this.simRunning ? '#00f0ff' : 'rgba(0,240,255,0.4)');
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px - 95, py - 90);
    ctx.quadraticCurveTo(px, py - 90 - (100 * beamP), px + 95, py - 90);
    ctx.stroke();

    // Glowing Central Energy Crystal
    ctx.translate(px, cy);
    const crystalGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 80);
    const activeColor = this.simSuccess ? 'rgba(0, 255, 136, 0.75)' : 'rgba(0, 240, 255, 0.5)';
    crystalGlow.addColorStop(0, activeColor);
    crystalGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = crystalGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Rune Rings
    ctx.rotate(this.timeTick * (isActivating ? 1.5 : 0.5));
    ctx.strokeStyle = this.simSuccess ? '#00ff88' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-30, -30, 60, 60);

    // Octahedron Crystal Shape
    ctx.fillStyle = this.simSuccess ? '#00ff88' : '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(24, 0);
    ctx.lineTo(0, 38);
    ctx.lineTo(-24, 0);
    ctx.closePath();
    ctx.fill();

    // Crystal highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(24, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /* 2. Sports City - Basketball Simulation */
  renderSports(ctx) {
    const w = this.width;
    const h = this.height;

    // Arena background
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, 0, w, h);

    // Floodlight cones
    const light1 = ctx.createRadialGradient(w * 0.2, 0, 10, w * 0.2, h * 0.7, w * 0.6);
    light1.addColorStop(0, 'rgba(255,255,255,0.15)');
    light1.addColorStop(1, 'transparent');
    ctx.fillStyle = light1;
    ctx.fillRect(0, 0, w, h);

    // Basketball Wooden Court floor
    const floorY = h * 0.78;
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.fillStyle = '#a06834';
    for (let x = 0; x < w; x += 40) {
      ctx.fillRect(x, floorY, 36, h - floorY);
    }
    // Court lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w * 0.8, floorY, 90, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Basketball Hoop & Backboard
    const hoopX = w * 0.82;
    const hoopY = h * 0.42;
    // Pole
    ctx.fillStyle = '#556677';
    ctx.fillRect(hoopX + 15, hoopY - 30, 8, floorY - (hoopY - 30));
    // Backboard
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(hoopX + 10, hoopY - 50, 6, 60);
    // Rim
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(hoopX - 25, hoopY, 35, 6);
    // Net
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hoopX - 25, hoopY + 6);
    ctx.lineTo(hoopX - 15, hoopY + 28);
    ctx.lineTo(hoopX + 5, hoopY + 28);
    ctx.lineTo(hoopX + 10, hoopY + 6);
    ctx.stroke();

    // Target Height Indicator Marker
    ctx.fillStyle = '#ffbe0b';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('🎯 Target Ring (3m)', hoopX - 55, hoopY - 12);

    // Player shooting
    const playerX = w * 0.15;
    const playerY = floorY - 50;
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(playerX, playerY, 20, 50); // Body
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(playerX + 2, playerY - 16, 16, 16); // Head

    // Parabolic Ball Trajectory
    const ballOrigin = { x: playerX + 25, y: playerY - 5 };
    const ballTarget = this.simSuccess ? { x: hoopX - 10, y: hoopY + 4 } : { x: hoopX + 50, y: floorY - 10 };

    let currentBallX = ballOrigin.x;
    let currentBallY = ballOrigin.y;

    if (this.simRunning || this.simProgress > 0) {
      const p = this.simProgress;
      currentBallX = ballOrigin.x + (ballTarget.x - ballOrigin.x) * p;
      const apex = 130;
      currentBallY = (ballOrigin.y + (ballTarget.y - ballOrigin.y) * p) - 4 * apex * p * (1 - p);

      // Trajectory dotted trace
      ctx.strokeStyle = 'rgba(255, 107, 53, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ballOrigin.x, ballOrigin.y);
      ctx.quadraticCurveTo((ballOrigin.x + ballTarget.x) / 2, ballOrigin.y - apex * 2, currentBallX, currentBallY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball shadow on court
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(currentBallX, floorY + 6, Math.max(2, 12 * (1 - (floorY - currentBallY) / 300)), 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Basketball
      ctx.fillStyle = '#ff6b35';
      ctx.beginPath();
      ctx.arc(currentBallX, currentBallY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Swish particle burst on completion
      if (this.simProgress > 0.95 && this.simSuccess && Math.random() < 0.5) {
        this.particles.createSparks(hoopX - 10, hoopY + 10, '#ffbe0b', 3);
      }
    } else {
      ctx.fillStyle = '#ff6b35';
      ctx.beginPath();
      ctx.arc(ballOrigin.x, ballOrigin.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* 3. Building City - Isometric Construction */
  renderBuilding(ctx) {
    const w = this.width;
    const h = this.height;

    // Urban twilight sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(1, '#1e293b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Distant city silhouette
    ctx.fillStyle = '#111827';
    for (let i = 0; i < 8; i++) {
      const bx = i * (w / 7) - 20;
      const bh = 100 + ((i * 37) % 120);
      ctx.fillRect(bx, h * 0.7 - bh, w / 8, bh);
    }

    // Construction Ground Grid
    const groundY = h * 0.72;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, groundY, w, h - groundY);

    // Blueprints grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Tower Construction Zone
    const towerX = w * 0.5 - 70;
    const towerW = 140;
    const maxFloors = 6;
    const currentFloors = this.simSuccess ? Math.min(maxFloors, Math.floor((this.simRunning ? this.simProgress : 1) * maxFloors) + 1) : 2;

    for (let f = 0; f < currentFloors; f++) {
      const fy = groundY - (f + 1) * 35;
      // Building block
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(towerX, fy, towerW, 33);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(towerX, fy, towerW, 33);

      // Windows
      ctx.fillStyle = '#fde047';
      for (let win = 0; win < 5; win++) {
        ctx.fillRect(towerX + 12 + win * 25, fy + 8, 14, 16);
      }
    }

    // Crane on top
    const topY = groundY - currentFloors * 35;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(towerX + towerW / 2 - 4, topY - 50, 8, 50);
    ctx.fillRect(towerX - 20, topY - 55, towerW + 40, 6);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Dimensi: x × (x + d)`, towerX + 10, groundY + 24);
  }

  /* 4. Space Center - Rocket Launch */
  getRocketPos() {
    const w = this.width;
    const h = this.height;
    const startX = w * 0.2;
    const startY = h * 0.75;
    const endX = w * 0.8;
    const endY = this.simSuccess ? h * 0.75 : h * 0.6;

    const p = this.simProgress;
    const x = startX + (endX - startX) * p;
    const apex = 280;
    let y = (startY + (endY - startY) * p) - 4 * apex * p * (1 - p);

    if (!this.simSuccess && p > 0.6) {
      y += (p - 0.6) * 400; // Crash drop
    }

    return { x, y };
  }

  renderSpace(ctx) {
    const w = this.width;
    const h = this.height;

    // Deep space background
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, h);
    spaceGrad.addColorStop(0, '#030712');
    spaceGrad.addColorStop(0.7, '#0f172a');
    spaceGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137) % w);
      const sy = ((i * 97) % (h * 0.7));
      const sSize = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(sx, sy, sSize, sSize);
    }

    // Launchpad ground
    const groundY = h * 0.78;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, groundY, w, h - groundY);

    // Launch Gantry Tower
    ctx.fillStyle = '#64748b';
    ctx.fillRect(w * 0.16, groundY - 140, 16, 140);
    ctx.fillRect(w * 0.16, groundY - 130, 35, 8);

    // Rocket Quadra-IV
    const rPos = (this.simRunning || this.simProgress > 0) ? this.getRocketPos() : { x: w * 0.2, y: groundY - 30 };

    ctx.save();
    ctx.translate(rPos.x, rPos.y);

    let angle = -Math.PI / 2;
    if (this.simRunning) {
      const p = this.simProgress;
      angle = Math.atan2((p - 0.5) * 3, 1) * 0.8;
      if (!this.simSuccess && p > 0.6) angle += this.timeTick * 4;
    }
    ctx.rotate(angle);

    // Rocket body
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-10, -35, 20, 50);
    // Rocket cone
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.lineTo(10, -35);
    ctx.lineTo(-10, -35);
    ctx.closePath();
    ctx.fill();
    // Rocket fins
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-18, 0, 8, 15);
    ctx.fillRect(10, 0, 8, 15);

    // Thruster fire
    if (this.simRunning) {
      ctx.fillStyle = '#ffbe0b';
      ctx.beginPath();
      ctx.moveTo(-6, 15);
      ctx.lineTo(6, 15);
      ctx.lineTo(0, 35 + Math.random() * 15);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /* 5. Business City - Profit Optimization */
  renderBusiness(ctx) {
    const w = this.width;
    const h = this.height;

    // Cyberpunk Megacity
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0a001a');
    sky.addColorStop(1, '#1b003a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Neon Grid Cityscape
    ctx.fillStyle = '#120524';
    for (let i = 0; i < 10; i++) {
      const bx = i * (w / 9) - 10;
      const bh = 140 + ((i * 53) % 150);
      ctx.fillRect(bx, h * 0.75 - bh, w / 10, bh);
      ctx.fillStyle = (i % 2 === 0) ? '#ff0077' : '#00f0ff';
      ctx.fillRect(bx + 6, h * 0.75 - bh + 10, 6, bh - 20);
      ctx.fillStyle = '#120524';
    }

    // Profit Parabola Chart
    const peakX = w * 0.5;
    const peakY = h * 0.35;
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.75);
    ctx.quadraticCurveTo(peakX, peakY - 40, w * 0.85, h * 0.75);
    ctx.stroke();

    // Vertex Beacon
    ctx.fillStyle = '#ffbe0b';
    ctx.beginPath();
    ctx.arc(peakX, peakY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('👑 Puncak Laba Maksimum (Vertex)', peakX - 110, peakY - 18);
  }

  /* 6. Racing City - Stunt Ramp Jump */
  getCarPos() {
    const w = this.width;
    const h = this.height;
    const startX = w * 0.15;
    const startY = h * 0.68;
    const endX = w * 0.85;
    const endY = this.simSuccess ? h * 0.68 : h * 0.95;

    const p = this.simProgress;
    const x = startX + (endX - startX) * p;
    const apex = 160;
    let y = (startY + (endY - startY) * p) - 4 * apex * p * (1 - p);

    return { x, y };
  }

  renderRacing(ctx) {
    const w = this.width;
    const h = this.height;

    // Synthwave Sunset Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#2e0854');
    sky.addColorStop(0.5, '#791e77');
    sky.addColorStop(1, '#ff8000');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Synthwave Sun
    ctx.fillStyle = '#ffbe0b';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.45, 60, 0, Math.PI * 2);
    ctx.fill();

    // Ramp & Landing Road
    const roadY = h * 0.72;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, roadY);
    ctx.lineTo(w * 0.2, roadY - 25);
    ctx.lineTo(w * 0.2, h);
    ctx.lineTo(0, h);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.75, roadY - 15);
    ctx.lineTo(w, roadY);
    ctx.lineTo(w, h);
    ctx.lineTo(w * 0.75, h);
    ctx.fill();

    // Canyon Warning
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('⚠️ JURANG PARABOLA ⚠️', w * 0.4, h * 0.88);

    // Sports Car
    const carPos = (this.simRunning || this.simProgress > 0) ? this.getCarPos() : { x: w * 0.1, y: roadY - 15 };

    ctx.save();
    ctx.translate(carPos.x, carPos.y);

    let angle = 0;
    if (this.simRunning) {
      angle = (this.simProgress - 0.5) * 0.6;
    }
    ctx.rotate(angle);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-20, -10, 40, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, -16, 16, 7);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-12, 6, 6, 0, Math.PI * 2);
    ctx.arc(12, 6, 6, 0, Math.PI * 2);
    ctx.fill();

    if (this.simRunning) {
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-28, -6, 8, 4);
    }

    ctx.restore();
  }

  /* 7. Stadium Architecture */
  renderStadium(ctx) {
    const w = this.width;
    const h = this.height;

    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Spotlight beams
    ctx.save();
    const beamAngle = Math.sin(this.timeTick) * 0.4;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h);
    ctx.lineTo(w * 0.4 + beamAngle * 100, 0);
    ctx.lineTo(w * 0.5 + beamAngle * 100, 0);
    ctx.fill();
    ctx.restore();

    // Bleachers
    const baseFloor = h * 0.75;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, baseFloor, w, h - baseFloor);

    // Stadium Arch Roof
    const archPeakY = h * 0.25;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, baseFloor);
    ctx.quadraticCurveTo(w * 0.5, archPeakY - 40, w * 0.9, baseFloor);
    ctx.stroke();

    // Truss Ribs
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.35)';
    ctx.lineWidth = 2;
    for (let x = w * 0.15; x < w * 0.85; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, baseFloor);
      ctx.lineTo(w * 0.5, archPeakY);
      ctx.stroke();
    }

    // Peak Vertex Beacon
    ctx.fillStyle = '#ffbe0b';
    ctx.beginPath();
    ctx.arc(w * 0.5, archPeakY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('🏛️ Puncak Atap Parabola', w * 0.5 - 80, archPeakY - 18);

    if (this.simSuccess) {
      if (Math.random() < 0.25) {
        this.particles.createFireworks(w * 0.5 + (Math.random() - 0.5) * 300, h * 0.25 + Math.random() * 80);
      }
    }
  }

  renderGenericParabola(ctx) {
    ctx.fillStyle = '#060914';
    ctx.fillRect(0, 0, this.width, this.height);
  }

  renderGraphOverlay(ctx) {
    const w = this.width;

    ctx.save();
    ctx.fillStyle = 'rgba(6, 10, 24, 0.75)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 190, 75);
    ctx.fillRect(10, 10, 190, 75);

    ctx.fillStyle = '#ffbe0b';
    ctx.font = '10px monospace';
    ctx.fillText(`📐 PARABOLA ENGINE`, 18, 26);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.fillText(`Koef: a=${this.a}, b=${this.b}, c=${this.c}`, 18, 42);

    const D = MathEngine.calcDiscriminant(this.a, this.b, this.c);
    ctx.fillText(`Diskriminan D: ${D}`, 18, 56);
    ctx.fillText(`Akar: [${this.roots.join(', ')}]`, 18, 70);
    ctx.restore();
  }
}

window.SimulationRenderer = SimulationRenderer;
