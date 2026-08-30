/* ==========================================================================
   QUADRA — Quadratic Sandbox & Physics Graphing Simulator
   Interactive lab allowing players to adjust coefficients a, b, c and observe
   real-time changes to parabola graphs, vertices, roots, and physics themes.
   ========================================================================== */

class QuadraticSandbox {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.a = 1;
    this.b = -4;
    this.c = 3;
    this.activeTheme = 'graph'; // 'graph', 'rocket', 'sports', 'racing'
    this.animTime = 0;

    this.initControls();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startLoop();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.width = rect.width;
      this.height = rect.height;
    }
  }

  initControls() {
    const sliderA = document.getElementById('sandbox-slider-a');
    const sliderB = document.getElementById('sandbox-slider-b');
    const sliderC = document.getElementById('sandbox-slider-c');

    const valA = document.getElementById('sandbox-val-a');
    const valB = document.getElementById('sandbox-val-b');
    const valC = document.getElementById('sandbox-val-c');

    const updateValues = () => {
      this.a = parseFloat(sliderA.value);
      this.b = parseFloat(sliderB.value);
      this.c = parseFloat(sliderC.value);

      if (this.a === 0) this.a = 0.1; // prevent pure linear in quadratic sandbox

      if (valA) valA.innerText = this.a;
      if (valB) valB.innerText = this.b;
      if (valC) valC.innerText = this.c;

      this.updateStatsDisplay();
    };

    if (sliderA) sliderA.addEventListener('input', updateValues);
    if (sliderB) sliderB.addEventListener('input', updateValues);
    if (sliderC) sliderC.addEventListener('input', updateValues);

    const themeBtns = document.querySelectorAll('.btn-theme-select');
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTheme = btn.dataset.theme;
        if (window.soundEngine) window.soundEngine.playBeep(520, 'sine', 0.05);
      });
    });

    this.updateStatsDisplay();
  }

  updateStatsDisplay() {
    const statD = document.getElementById('sandbox-stat-d');
    const statRoots = document.getElementById('sandbox-stat-roots');
    const statVertex = document.getElementById('sandbox-stat-vertex');

    const D = MathEngine.calcDiscriminant(this.a, this.b, this.c);
    const roots = MathEngine.solveABC(this.a, this.b, this.c);
    const vertex = MathEngine.calcVertex(this.a, this.b, this.c);

    if (statD) statD.innerHTML = `D = ${D.toFixed(2)} (${D > 0 ? '2 Akar Berbeda' : D === 0 ? '1 Akar Kembar' : 'Akar Imajiner'})`;
    if (statRoots) {
      if (roots.type === 'complex') {
        statRoots.innerHTML = `<span style="color: #ff0077;">Tidak memotong sumbu X (Imajiner)</span>`;
      } else if (roots.type === 'single') {
        statRoots.innerHTML = `x = ${roots.x1.toFixed(2)} (Menyinggung sumbu X)`;
      } else {
        statRoots.innerHTML = `x₁ = ${roots.x1.toFixed(2)}, x₂ = ${roots.x2.toFixed(2)}`;
      }
    }
    if (statVertex) {
      statVertex.innerHTML = `(${vertex.xv.toFixed(2)}, ${vertex.yv.toFixed(2)}) [${this.a > 0 ? 'Lembah Minimum' : 'Puncak Maksimum'}]`;
    }
  }

  startLoop() {
    const loop = () => {
      this.animTime += 0.03;
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#060914';
    ctx.fillRect(0, 0, w, h);

    // Grid Coordinates
    const originX = w * 0.5;
    const originY = h * 0.6;
    const scale = 20; // 20px = 1 unit

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let x = originX % scale; x < w; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = originY % scale; y < h; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 2;
    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.stroke();
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // Plot Parabola f(x) = ax² + bx + c
    ctx.strokeStyle = '#ffbe0b';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let started = false;
    for (let px = 0; px < w; px += 2) {
      const mathX = (px - originX) / scale;
      const mathY = (this.a * mathX * mathX) + (this.b * mathX) + this.c;
      const py = originY - (mathY * scale);

      if (py >= -100 && py <= h + 100) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Draw Vertex Point
    const v = MathEngine.calcVertex(this.a, this.b, this.c);
    const vx = originX + (v.xv * scale);
    const vy = originY - (v.yv * scale);

    if (vx >= 0 && vx <= w && vy >= 0 && vy <= h) {
      ctx.fillStyle = '#ff0077';
      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`Vertex (${v.xv.toFixed(1)}, ${v.yv.toFixed(1)})`, vx + 8, vy - 8);
    }

    // Draw Animated Entity based on active theme
    if (this.activeTheme === 'rocket') {
      const t = (Math.sin(this.animTime) + 1) * 0.5; // 0..1
      const xRange = 8;
      const simX = -xRange / 2 + t * xRange;
      const simY = (this.a * simX * simX) + (this.b * simX) + this.c;
      const entX = originX + (simX * scale);
      const entY = originY - (simY * scale);

      ctx.save();
      ctx.translate(entX, entY);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffbe0b';
      ctx.fillText('🚀', -8, 6);
      ctx.restore();
    } else if (this.activeTheme === 'sports') {
      const t = (Math.sin(this.animTime * 1.5) + 1) * 0.5;
      const simX = -3 + t * 6;
      const simY = (this.a * simX * simX) + (this.b * simX) + this.c;
      const entX = originX + (simX * scale);
      const entY = originY - (simY * scale);

      ctx.fillStyle = '#ff6b35';
      ctx.beginPath();
      ctx.arc(entX, entY, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

window.QuadraticSandbox = QuadraticSandbox;
