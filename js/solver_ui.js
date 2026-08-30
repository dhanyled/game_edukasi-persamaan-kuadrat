/* ==========================================================================
   QUADRA — Interactive Math Solver UI Controller
   Handles Steppers, Virtual Keypad, Scanner, Multi-Strategy Inputs & Autofill.
   ========================================================================== */

class SolverUI {
  constructor(game) {
    this.game = game;
    this.currentStrategy = 'factor'; // 'factor', 'abc', 'vertex'
    this.currentLevel = null;
    this.activeInput = null;

    this.initEventListeners();
    this.initSteppers();
    this.initVirtualKeypad();
  }

  initEventListeners() {
    // Strategy Tab switching
    const tabButtons = document.querySelectorAll('.btn-strategy-tab');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const strat = btn.dataset.strategy;
        this.switchStrategy(strat);
        if (window.soundEngine) window.soundEngine.playBeep(480, 'sine', 0.05);
      });
    });

    // Execute Button
    const execBtn = document.getElementById('btn-execute-solution');
    if (execBtn) {
      execBtn.addEventListener('click', () => {
        this.evaluateSolution();
      });
    }

    // Hint toggle
    const hintLink = document.getElementById('hint-link');
    if (hintLink) {
      hintLink.addEventListener('click', () => {
        this.showHint();
      });
    }

    // Randomize Equation button
    const randBtn = document.getElementById('btn-randomize-level-eq');
    if (randBtn) {
      randBtn.addEventListener('click', () => {
        if (this.game) {
          this.game.randomizeCurrentLevel();
          this.game.showToast('🎲 Soal baru berhasil di-generate!');
        }
      });
    }

    // Track active focused input
    const allInputs = document.querySelectorAll('.math-input');
    allInputs.forEach(inp => {
      inp.addEventListener('focus', () => {
        this.activeInput = inp;
      });
      inp.addEventListener('click', () => {
        this.activeInput = inp;
      });
    });
  }

  initSteppers() {
    const stepperButtons = document.querySelectorAll('.stepper-btn');
    stepperButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.dataset.target;
        const dir = parseFloat(btn.dataset.dir) || 1;
        const inputEl = document.getElementById(targetId);

        if (inputEl) {
          this.activeInput = inputEl;
          let currentVal = parseFloat(inputEl.value);
          if (isNaN(currentVal)) currentVal = 0;
          inputEl.value = Math.round((currentVal + dir) * 10) / 10;
          if (window.soundEngine) window.soundEngine.playBeep(520, 'square', 0.03);
        }
      });
    });
  }

  initVirtualKeypad() {
    const toggleBtn = document.getElementById('btn-toggle-keypad');
    const keypadPanel = document.getElementById('virtual-keypad');

    if (toggleBtn && keypadPanel) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = keypadPanel.style.display === 'none';
        keypadPanel.style.display = isHidden ? 'grid' : 'none';
        toggleBtn.innerText = isHidden ? '❌ Tutup Keypad Angka' : '⌨️ Tampilkan Keypad Angka Sentuh';
        if (window.soundEngine) window.soundEngine.playBeep(450, 'sine', 0.05);
      });

      const keys = keypadPanel.querySelectorAll('.btn-keypad');
      keys.forEach(k => {
        k.addEventListener('click', () => {
          this.handleKeypadPress(k.dataset.key);
        });
      });
    }
  }

  handleKeypadPress(key) {
    if (!this.activeInput) {
      // Default to first active input in current strategy
      if (this.currentStrategy === 'factor') this.activeInput = document.getElementById('factor-p');
      else if (this.currentStrategy === 'abc') this.activeInput = document.getElementById('abc-x1');
      else if (this.currentStrategy === 'vertex') this.activeInput = document.getElementById('vertex-x');
    }

    if (!this.activeInput) return;

    if (window.soundEngine) window.soundEngine.playBeep(550, 'square', 0.03);

    if (key === 'backspace') {
      this.activeInput.value = this.activeInput.value.slice(0, -1);
    } else if (key === 'clear') {
      this.activeInput.value = '';
    } else if (key === '-') {
      if (this.activeInput.value.startsWith('-')) {
        this.activeInput.value = this.activeInput.value.slice(1);
      } else {
        this.activeInput.value = '-' + this.activeInput.value;
      }
    } else if (key === 'ok') {
      // Move to next input or execute
      this.moveToNextInput();
    } else {
      this.activeInput.value += key;
    }
  }

  moveToNextInput() {
    if (this.activeInput?.id === 'factor-p') {
      const q = document.getElementById('factor-q');
      if (q) { q.focus(); this.activeInput = q; }
    } else if (this.activeInput?.id === 'abc-x1') {
      const x2 = document.getElementById('abc-x2');
      if (x2) { x2.focus(); this.activeInput = x2; }
    } else if (this.activeInput?.id === 'vertex-x') {
      const vy = document.getElementById('vertex-y');
      if (vy) { vy.focus(); this.activeInput = vy; }
    }
  }

  loadLevel(level) {
    this.currentLevel = level;
    const eq = level.equation;

    // Display equation banner
    document.getElementById('solver-equation-text').innerText = eq.displayStr;
    document.getElementById('solver-equation-target').innerText = `🎯 Target: ${eq.targetLabel}`;
    document.getElementById('mission-title-text').innerText = level.mission.title;
    document.getElementById('mission-desc-text').innerText = level.mission.desc;

    // Run Scanner Tool
    this.runScanner(eq.a, eq.b, eq.c, level.problemType);

    // Update 256-Bit Mathematical & Physical Telemetry Widget
    this.updateTelemetry(eq.a, eq.b, eq.c);

    // Auto-select optimal strategy tab or default
    const recommended = level.optimalStrategy || 'factor';
    this.switchStrategy(recommended);

    // Reset inputs
    this.resetInputFields();
  }

  updateTelemetry(a, b, c) {
    const tel = MathEngine.calcAdvancedTelemetry(a, b, c);
    const focalEl = document.getElementById('tel-focal-val');
    const curvEl = document.getElementById('tel-curvature-val');
    const dirEl = document.getElementById('tel-directrix-val');
    const derivEl = document.getElementById('tel-derivative-val');

    if (focalEl) focalEl.innerText = tel.focalPointStr;
    if (curvEl) curvEl.innerText = tel.curvatureStr;
    if (dirEl) dirEl.innerText = tel.directrixStr;
    if (derivEl) derivEl.innerText = tel.derivativeStr;
  }

  runScanner(a, b, c, problemType) {
    const scanResult = MathEngine.scanEquation(a, b, c, problemType);
    const badgeEl = document.getElementById('scanner-badge');
    const reasonEl = document.getElementById('scanner-reason');

    if (badgeEl && reasonEl) {
      badgeEl.className = `scanner-badge ${scanResult.badgeClass}`;
      badgeEl.innerText = scanResult.badgeText;
      reasonEl.innerText = scanResult.reason;
    }
    if (window.soundEngine) window.soundEngine.playScan();
  }

  switchStrategy(strategy) {
    this.currentStrategy = strategy;

    // Update tab buttons active state
    document.querySelectorAll('.btn-strategy-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.strategy === strategy);
    });

    // Toggle workspaces
    document.getElementById('workspace-factor').classList.toggle('active', strategy === 'factor');
    document.getElementById('workspace-abc').classList.toggle('active', strategy === 'abc');
    document.getElementById('workspace-vertex').classList.toggle('active', strategy === 'vertex');

    // Populate auto fields in ABC & Vertex
    if (this.currentLevel) {
      const eq = this.currentLevel.equation;
      if (strategy === 'abc') {
        document.getElementById('abc-input-a').value = eq.a;
        document.getElementById('abc-input-b').value = eq.b;
        document.getElementById('abc-input-c').value = eq.c;
      } else if (strategy === 'vertex') {
        document.getElementById('vertex-input-a').value = eq.a;
        document.getElementById('vertex-input-b').value = eq.b;
        document.getElementById('vertex-input-c').value = eq.c;
      }
    }
  }

  resetInputFields() {
    const fP = document.getElementById('factor-p');
    const fQ = document.getElementById('factor-q');
    if (fP) fP.value = '';
    if (fQ) fQ.value = '';

    const abcX1 = document.getElementById('abc-x1');
    const abcX2 = document.getElementById('abc-x2');
    if (abcX1) abcX1.value = '';
    if (abcX2) abcX2.value = '';

    const vX = document.getElementById('vertex-x');
    const vY = document.getElementById('vertex-y');
    if (vX) vX.value = '';
    if (vY) vY.value = '';

    this.activeInput = null;
  }

  autofillCorrectSolution() {
    if (!this.currentLevel) return;
    const level = this.currentLevel;
    const eq = level.equation;

    if (level.problemType === 'vertex' || level.problemType === 'max_min') {
      this.switchStrategy('vertex');
      const expectedV = level.expectedVertex || MathEngine.calcVertex(eq.a, eq.b, eq.c);
      document.getElementById('vertex-x').value = expectedV.xv;
      document.getElementById('vertex-y').value = expectedV.yv;
    } else {
      // If factor mode is optimal
      if (level.optimalStrategy === 'factor') {
        this.switchStrategy('factor');
        const factorData = MathEngine.findFactorPairs(eq.a, eq.b, eq.c);
        if (factorData.found) {
          document.getElementById('factor-p').value = factorData.p;
          document.getElementById('factor-q').value = factorData.q;
        } else {
          document.getElementById('factor-p').value = level.expectedRoots[0];
          document.getElementById('factor-q').value = level.expectedRoots[1];
        }
      } else {
        this.switchStrategy('abc');
        document.getElementById('abc-x1').value = level.expectedRoots[0];
        document.getElementById('abc-x2').value = level.expectedRoots[1];
      }
    }

    this.game.showToast('🛠️ Jawaban benar telah diisi ke form!');
  }

  showHint() {
    if (!this.currentLevel) return;
    const eq = this.currentLevel.equation;
    const steps = MathEngine.generateStepExplanation(eq.a, eq.b, eq.c, this.currentStrategy, this.currentLevel.expectedRoots);
    
    let hintHtml = `<ul style="padding-left: 18px; line-height: 1.6;">`;
    steps.forEach(s => {
      hintHtml += `<li>${s}</li>`;
    });
    hintHtml += `</ul>`;

    this.game.showCustomModal('💡 Petunjuk Strategi Singkat', hintHtml, 'Tutup');
    if (window.soundEngine) window.soundEngine.playBeep(600, 'sine', 0.1);
  }

  evaluateSolution() {
    if (!this.currentLevel) return;
    const level = this.currentLevel;
    const eq = level.equation;

    let isCorrect = false;
    let submittedRoots = [];
    let submittedVertex = null;
    let diagnosticNote = '';

    if (this.currentStrategy === 'factor') {
      const p = parseFloat(document.getElementById('factor-p').value);
      const q = parseFloat(document.getElementById('factor-q').value);

      if (isNaN(p) || isNaN(q)) {
        this.game.showToast('⚠️ Masukkan kedua angka p dan q (atau gunakan tombol [-] [+])!');
        return;
      }

      // Check if p * q = a * c and p + q = b
      // Or if player entered roots directly (x1, x2)
      const correctRoots = level.expectedRoots;

      const matchFactors = (Math.abs(p * q - eq.a * eq.c) < 0.01 && Math.abs((p + q) - eq.b) < 0.01);
      const matchRootsDirectly = (
        (Math.abs(p - correctRoots[0]) < 0.01 && Math.abs(q - correctRoots[1]) < 0.01) ||
        (Math.abs(p - correctRoots[1]) < 0.01 && Math.abs(q - correctRoots[0]) < 0.01)
      );

      if (matchFactors || matchRootsDirectly) {
        isCorrect = true;
        submittedRoots = correctRoots;
      } else {
        const prod = p * q;
        const sum = p + q;
        diagnosticNote = `Kamu memasukkan angka <code>${p}</code> dan <code>${q}</code>. Perkalian = <code>${prod}</code> (harus <code>${eq.a * eq.c}</code>), Penjumlahan = <code>${sum}</code> (harus <code>${eq.b}</code>).`;
      }
    } else if (this.currentStrategy === 'abc') {
      const x1 = parseFloat(document.getElementById('abc-x1').value);
      const x2 = parseFloat(document.getElementById('abc-x2').value);

      if (isNaN(x1)) {
        this.game.showToast('⚠️ Masukkan nilai x₁ hasil perhitungan Rumus ABC!');
        return;
      }

      const expected = level.expectedRoots;
      const val2 = isNaN(x2) ? x1 : x2;

      // Evaluate polynomial f(x) = a*x² + b*x + c
      const fx1 = (eq.a * x1 * x1) + (eq.b * x1) + eq.c;
      const fx2 = (eq.a * val2 * val2) + (eq.b * val2) + eq.c;

      if (Math.abs(fx1) < 0.1 && (expected.length === 1 || Math.abs(fx2) < 0.1)) {
        isCorrect = true;
        submittedRoots = [x1, val2];
      } else {
        diagnosticNote = `Jika x = <code>${x1}</code> dimasukkan ke rumus <code>${eq.a !== 1 ? eq.a : ''}x² ${eq.b >= 0 ? '+' : ''}${eq.b}x + ${eq.c}</code>, hasilnya adalah <strong>${fx1.toFixed(2)}</strong>, bukan <strong>0</strong>!`;
      }
    } else if (this.currentStrategy === 'vertex') {
      const vx = parseFloat(document.getElementById('vertex-x').value);
      const vy = parseFloat(document.getElementById('vertex-y').value);

      if (isNaN(vx) && isNaN(vy)) {
        this.game.showToast('⚠️ Masukkan nilai puncak x atau y!');
        return;
      }

      const expectedV = level.expectedVertex || MathEngine.calcVertex(eq.a, eq.b, eq.c);
      const vxMatch = isNaN(vx) || Math.abs(vx - expectedV.xv) < 0.1;
      const vyMatch = isNaN(vy) || Math.abs(vy - expectedV.yv) < 0.1;

      if (vxMatch && vyMatch) {
        isCorrect = true;
        submittedVertex = expectedV;
      } else {
        diagnosticNote = `Koordinat puncak yang kamu masukkan (${isNaN(vx) ? '-' : vx}, ${isNaN(vy) ? '-' : vy}) belum tepat. Titik puncak yang membuat fungsi optimum bernilai (${expectedV.xv}, ${expectedV.yv}).`;
      }
    }

    const isOptimalStrategy = (this.currentStrategy === level.optimalStrategy);
    const fastSolverBonus = (isCorrect && isOptimalStrategy);

    this.game.onSolutionSubmitted({
      isCorrect,
      chosenStrategy: this.currentStrategy,
      isOptimalStrategy,
      fastSolverBonus,
      level,
      submittedRoots,
      submittedVertex,
      diagnosticNote
    });
  }
}

window.SolverUI = SolverUI;
