/* ==========================================================================
   QUADRA — Master Game Controller & State Machine
   Orchestrates Dynamic Quests, Universal Navigation, Breadcrumbs,
   Interactive Diagnostics, and Solution Autofill.
   ========================================================================== */

class QuadraGame {
  constructor() {
    this.currentScreen = 'title';
    this.currentLevelId = 1;
    this.currentLevel = null;
    this.mobileViewMode = 'solve';

    // Player Save State
    this.playerState = {
      score: 0,
      strategyScore: 0,
      unlockedLevels: [1], // Level 1 is always unlocked
      levelStars: {},
      fastSolverBadges: 0
    };

    this.loadSaveData();

    // Engines
    this.renderer = null;
    this.solverUI = null;
    this.sandbox = null;

    this.initDOM();
    this.initMobileViewTabs();
    this.initScreens();
  }

  loadSaveData() {
    try {
      const saved = localStorage.getItem('quadra_save_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitizeNumber = (val, defaultVal = 0) => (typeof val === 'number' && Number.isFinite(val) && val >= 0) ? Math.floor(val) : defaultVal;

        const unlockedLevels = Array.isArray(parsed.unlockedLevels)
          ? parsed.unlockedLevels.filter(lvl => Number.isInteger(lvl) && lvl >= 1 && lvl <= 100)
          : [1];

        const sanitizedStars = {};
        if (parsed.levelStars && typeof parsed.levelStars === 'object') {
          for (const k in parsed.levelStars) {
            const keyNum = parseInt(k, 10);
            const valNum = parseInt(parsed.levelStars[k], 10);
            if (!isNaN(keyNum) && !isNaN(valNum)) {
              sanitizedStars[keyNum] = Math.min(3, Math.max(0, valNum));
            }
          }
        }

        this.playerState = {
          score: sanitizeNumber(parsed.score, 0),
          strategyScore: sanitizeNumber(parsed.strategyScore, 0),
          unlockedLevels: unlockedLevels.length > 0 ? unlockedLevels : [1],
          levelStars: sanitizedStars,
          fastSolverBadges: sanitizeNumber(parsed.fastSolverBadges, 0)
        };
      }
    } catch (e) {
      console.warn("Could not load localStorage save.", e);
      this.playerState = {
        score: 0,
        strategyScore: 0,
        unlockedLevels: [1],
        levelStars: {},
        fastSolverBadges: 0
      };
    }
  }

  saveData() {
    try {
      localStorage.setItem('quadra_save_data', JSON.stringify(this.playerState));
    } catch (e) {
      console.warn("Could not save to localStorage.", e);
    }
  }

  initDOM() {
    this.updateHUDStats();

    // Top Bar Navigation
    const navLogo = document.getElementById('nav-logo');
    if (navLogo) navLogo.addEventListener('click', () => this.switchScreen('title'));
    
    const navMap = document.getElementById('nav-map-btn');
    if (navMap) navMap.addEventListener('click', () => this.switchScreen('map'));
    
    const navCodex = document.getElementById('nav-codex-btn');
    if (navCodex) navCodex.addEventListener('click', () => this.switchScreen('codex'));
    
    const navSandbox = document.getElementById('nav-sandbox-btn');
    if (navSandbox) navSandbox.addEventListener('click', () => this.switchScreen('sandbox'));

    // Audio & CRT toggles
    const sfxBtn = document.getElementById('btn-toggle-sfx');
    const musicBtn = document.getElementById('btn-toggle-music');
    const crtBtn = document.getElementById('btn-toggle-crt');

    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        const active = window.soundEngine.toggleSound();
        sfxBtn.innerHTML = active ? '🔊' : '🔇';
        this.showToast(active ? 'Suara Efek: ON' : 'Suara Efek: OFF');
      });
    }

    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        const active = window.soundEngine.toggleMusic();
        musicBtn.innerHTML = active ? '🎵' : '🎼';
        if (active) {
          window.soundEngine.playTrack(this.currentLevel?.worldKey || 'title');
        } else {
          window.soundEngine.stopMusic();
        }
        this.showToast(active ? 'Musik Retro: ON' : 'Musik Retro: OFF');
      });
    }

    if (crtBtn) {
      crtBtn.addEventListener('click', () => {
        const crt = document.getElementById('crt-screen-overlay');
        if (crt) {
          crt.classList.toggle('disabled');
          const isEnabled = !crt.classList.contains('disabled');
          this.showToast(isEnabled ? 'Efek CRT 64-Bit: ON' : 'Efek CRT: OFF');
        }
      });
    }

    // Title Screen buttons
    const playCampBtn = document.getElementById('btn-play-campaign');
    if (playCampBtn) {
      playCampBtn.addEventListener('click', () => {
        this.switchScreen('map');
        if (window.soundEngine) window.soundEngine.playBeep(580, 'square', 0.1);
      });
    }

    const openCodexBtn = document.getElementById('btn-open-codex') || document.getElementById('btn-open-codex-main');
    if (openCodexBtn) {
      openCodexBtn.addEventListener('click', () => this.switchScreen('codex'));
    }

    const openSandboxBtn = document.getElementById('btn-open-sandbox') || document.getElementById('btn-open-sandbox-main');
    if (openSandboxBtn) {
      openSandboxBtn.addEventListener('click', () => this.switchScreen('sandbox'));
    }

    const endlessBtn = document.getElementById('btn-endless-challenge') || document.getElementById('btn-play-quick');
    if (endlessBtn) {
      endlessBtn.addEventListener('click', () => {
        this.quickChallengeStreak = 0;
        this.quickChallengeIndex = 1;
        const proceduralQuest = QuestManager.generateRandomProceduralQuest(this.quickChallengeIndex);
        this.startLevelDirectly(proceduralQuest);
      });
    }

    // In-game top controls
    const simResetBtn = document.getElementById('btn-sim-reset');
    if (simResetBtn) {
      simResetBtn.addEventListener('click', () => {
        if (this.renderer) this.renderer.resetSimulation();
        this.solverUI.resetInputFields();
        if (window.soundEngine) window.soundEngine.playBeep(350, 'triangle', 0.08);
      });
    }

    const simBackMapBtn = document.getElementById('btn-sim-back-map');
    if (simBackMapBtn) {
      simBackMapBtn.addEventListener('click', () => this.switchScreen('map'));
    }

    const simToMenuBtn = document.getElementById('btn-sim-to-menu');
    if (simToMenuBtn) {
      simToMenuBtn.addEventListener('click', () => this.switchScreen('title'));
    }

    // Solver Panel Navigation Buttons
    const solverToMapBtn = document.getElementById('btn-solver-to-map');
    if (solverToMapBtn) {
      solverToMapBtn.addEventListener('click', () => this.switchScreen('map'));
    }

    const solverToMenuBtn = document.getElementById('btn-solver-to-menu');
    if (solverToMenuBtn) {
      solverToMenuBtn.addEventListener('click', () => this.switchScreen('title'));
    }

    // Map Screen back buttons
    const mapToTitleBtn = document.getElementById('btn-map-to-title');
    if (mapToTitleBtn) mapToTitleBtn.addEventListener('click', () => this.switchScreen('title'));
    
    const mapToSandboxBtn = document.getElementById('btn-map-to-sandbox');
    if (mapToSandboxBtn) mapToSandboxBtn.addEventListener('click', () => this.switchScreen('sandbox'));

    // Codex Screen back buttons
    const codexToMap = document.getElementById('btn-codex-to-map');
    const codexBottomMap = document.getElementById('btn-codex-bottom-map');
    const codexToTitle = document.getElementById('btn-codex-to-title');
    if (codexToMap) codexToMap.addEventListener('click', () => this.switchScreen('map'));
    if (codexBottomMap) codexBottomMap.addEventListener('click', () => this.switchScreen('map'));
    if (codexToTitle) codexToTitle.addEventListener('click', () => this.switchScreen('title'));

    // Sandbox Screen back buttons
    const sandboxToMap = document.getElementById('btn-sandbox-to-map');
    const sandboxBottomMap = document.getElementById('btn-sandbox-bottom-map');
    const sandboxToTitle = document.getElementById('btn-sandbox-to-title');
    if (sandboxToMap) sandboxToMap.addEventListener('click', () => this.switchScreen('map'));
    if (sandboxBottomMap) sandboxBottomMap.addEventListener('click', () => this.switchScreen('map'));
    if (sandboxToTitle) sandboxToTitle.addEventListener('click', () => this.switchScreen('title'));

    // Multi-Method Educational Deep Dive Button
    const multiMethodBtn = document.getElementById('btn-show-multi-method');
    if (multiMethodBtn) {
      multiMethodBtn.addEventListener('click', () => this.openMultiMethodModal());
    }

    const closeMultiMethodBtn = document.getElementById('btn-close-multi-method');
    if (closeMultiMethodBtn) {
      closeMultiMethodBtn.addEventListener('click', () => {
        const modal = document.getElementById('multi-method-modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    }

    // Setup Simulation Canvas
    const canvas = document.getElementById('simulation-canvas');
    if (canvas) {
      this.renderer = new SimulationRenderer(canvas);
    }

    // Setup Solver UI
    this.solverUI = new SolverUI(this);

    // Setup Codex
    const codexGrid = document.getElementById('codex-articles-grid');
    if (codexGrid && window.CodexSystem) {
      window.CodexSystem.renderArticles(codexGrid);
    }

    // Setup Sandbox
    const sandboxCanvas = document.getElementById('sandbox-canvas');
    if (sandboxCanvas && window.QuadraticSandbox) {
      this.sandbox = new QuadraticSandbox(sandboxCanvas);
    }

    // Modal result action buttons
    const nextBtn = document.getElementById('btn-modal-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.closeModal();
        if (this.currentLevel && this.currentLevel.isQuickChallenge) {
          this.quickChallengeIndex = (this.quickChallengeIndex || 1) + 1;
          const nextQuest = QuestManager.generateRandomProceduralQuest(this.quickChallengeIndex);
          this.startLevelDirectly(nextQuest);
          this.showToast(`⚡ Tantangan #${this.quickChallengeIndex} Dimulai!`);
          return;
        }
        const nextLevelId = this.currentLevelId + 1;
        if (nextLevelId <= (window.BASE_LEVEL_TEMPLATES || []).length) {
          this.loadLevelById(nextLevelId);
        } else {
          this.switchScreen('map');
        }
      });
    }

    const retryBtn = document.getElementById('btn-modal-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.closeModal();
        if (this.renderer) this.renderer.resetSimulation();
        this.solverUI.resetInputFields();
        this.setMobileViewMode('solve');
      });
    }

    const autofillBtn = document.getElementById('btn-modal-autofill-solution');
    if (autofillBtn) {
      autofillBtn.addEventListener('click', () => {
        this.showSolutionReviewModal();
      });
    }

    const applyAndSimBtn = document.getElementById('btn-modal-apply-and-sim');
    if (applyAndSimBtn) {
      applyAndSimBtn.addEventListener('click', () => {
        this.closeModal();
        this.solverUI.autofillCorrectSolution();
        this.setMobileViewMode('solve');
        this.showToast('✅ Jawaban benar diterapkan! Memulai simulasi...');
        setTimeout(() => {
          this.solverUI.evaluateSolution();
        }, 1200);
      });
    }

    const tryMyselfBtn = document.getElementById('btn-modal-try-myself');
    if (tryMyselfBtn) {
      tryMyselfBtn.addEventListener('click', () => {
        this.closeModal();
        this.setMobileViewMode('solve');
        this.showToast('✍️ Silakan masukkan angka jawaban ke form!');
      });
    }

    const modalMultiMethodBtn = document.getElementById('btn-modal-view-multi-method');
    if (modalMultiMethodBtn) {
      modalMultiMethodBtn.addEventListener('click', () => {
        this.openMultiMethodModal();
      });
    }

    const mapModalBtn = document.getElementById('btn-modal-map');
    if (mapModalBtn) {
      mapModalBtn.addEventListener('click', () => {
        this.closeModal();
        this.switchScreen('map');
      });
    }
  }

  initMobileViewTabs() {
    const tabSim = document.getElementById('tab-mobile-view-sim');
    const tabSolve = document.getElementById('tab-mobile-view-solve');

    if (tabSim && tabSolve) {
      tabSim.addEventListener('click', () => {
        this.setMobileViewMode('sim');
        if (window.soundEngine) window.soundEngine.playBeep(450, 'sine', 0.05);
      });

      tabSolve.addEventListener('click', () => {
        this.setMobileViewMode('solve');
        if (window.soundEngine) window.soundEngine.playBeep(450, 'sine', 0.05);
      });
    }
  }

  setMobileViewMode(mode) {
    this.mobileViewMode = mode;
    const gameScreen = document.getElementById('screen-game');
    const tabSim = document.getElementById('tab-mobile-view-sim');
    const tabSolve = document.getElementById('tab-mobile-view-solve');

    if (gameScreen) {
      gameScreen.classList.toggle('mobile-view-sim', mode === 'sim');
      gameScreen.classList.toggle('mobile-view-solve', mode === 'solve');
    }

    if (tabSim && tabSolve) {
      tabSim.classList.toggle('active', mode === 'sim');
      tabSolve.classList.toggle('active', mode === 'solve');
    }

    if (this.renderer) {
      this.renderer.resize();
      setTimeout(() => this.renderer.resize(), 50);
      setTimeout(() => this.renderer.resize(), 150);
    }
  }

  openMultiMethodModal() {
    if (!this.currentLevel) return;
    this.closeModal();
    const modal = document.getElementById('multi-method-modal-backdrop');
    const bodyEl = document.getElementById('multi-method-modal-body');

    if (modal && bodyEl) {
      bodyEl.innerHTML = MathEngine.generateMultiMethodDeepDive(this.currentLevel);
      modal.classList.add('active');
      if (window.soundEngine) window.soundEngine.playBeep(700, 'sine', 0.1);
    }
  }

  initScreens() {
    this.renderWorldMap();
    this.switchScreen('title');
  }

  switchScreen(screenId) {
    this.closeModal();
    this.currentScreen = screenId;

    document.querySelectorAll('.game-screen').forEach(scr => scr.classList.remove('active'));

    const target = document.getElementById(`screen-${screenId}`);
    if (target) target.classList.add('active');

    if (this.renderer && typeof this.renderer.setActiveScreen === 'function') {
      this.renderer.setActiveScreen(screenId === 'game');
    }
    if (this.sandbox && typeof this.sandbox.setActiveScreen === 'function') {
      this.sandbox.setActiveScreen(screenId === 'sandbox');
    }

    if (screenId === 'game') {
      this.setMobileViewMode('solve');
      if (this.renderer) setTimeout(() => this.renderer.resize(), 60);
    } else if (screenId === 'sandbox' && this.sandbox) {
      setTimeout(() => this.sandbox.resize(), 60);
      this.showToast('🧪 Membuka Lab Sandbox Parabola');
    } else if (screenId === 'map') {
      this.renderWorldMap();
      this.showToast('🗺️ Membuka Peta Dunia Quadra');
    } else if (screenId === 'codex') {
      this.showToast('📖 Membuka Panduan Quadra Codex');
    } else if (screenId === 'title') {
      this.showToast('🏠 Kembali ke Menu Utama');
    }

    if (window.soundEngine) {
      window.soundEngine.playBeep(520, 'sine', 0.05);
    }

    if (window.soundEngine && window.soundEngine.musicEnabled) {
      if (screenId === 'game' && this.currentLevel) {
        window.soundEngine.playTrack(this.currentLevel.worldKey);
      } else {
        window.soundEngine.playTrack('title');
      }
    }
  }

  renderWorldMap() {
    const grid = document.getElementById('world-map-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const templates = window.BASE_LEVEL_TEMPLATES || BASE_LEVEL_TEMPLATES || [];
    const unlockedList = Array.isArray(this.playerState?.unlockedLevels) && this.playerState.unlockedLevels.length > 0 
      ? this.playerState.unlockedLevels 
      : [1];

    templates.forEach((tmpl) => {
      const isUnlocked = unlockedList.includes(tmpl.id);
      const stars = (this.playerState.levelStars && this.playerState.levelStars[tmpl.id]) || 0;
      const starsStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? '' : 'locked'}`;
      const safeName = MathEngine.escapeHtml(tmpl.name);
      const safeSubtitle = MathEngine.escapeHtml(tmpl.subtitle);
      const safeMissionDesc = MathEngine.escapeHtml(tmpl.missionDesc);

      card.title = isUnlocked ? `Klik untuk memainkan ${safeName}` : `Level ${tmpl.id} masih terkunci`;
      card.innerHTML = `
        <div class="level-card-top">
          <span class="level-badge">LVL 0${tmpl.id}</span>
          <span class="level-stars">${isUnlocked ? starsStr : '🔒 TERKUNCI'}</span>
        </div>
        <div class="level-title-wrap">
          <div class="level-icon">${MathEngine.escapeHtml(tmpl.icon)}</div>
          <div class="level-info">
            <h3>${safeName}</h3>
            <span>${safeSubtitle}</span>
          </div>
        </div>
        <p class="level-desc">${safeMissionDesc}</p>
        <div class="level-math-tags">
          ${tmpl.tags.map(t => `<span class="math-tag">${MathEngine.escapeHtml(t)}</span>`).join('')}
        </div>
      `;

      card.addEventListener('click', () => {
        if (isUnlocked) {
          this.loadLevelById(tmpl.id);
          if (window.soundEngine) window.soundEngine.playBeep(650, 'square', 0.08);
        } else {
          if (window.soundEngine) window.soundEngine.playWrong();
          this.showToast(`🔒 Level ${tmpl.id} (${tmpl.name}) masih terkunci! Selesaikan level sebelumnya terlebih dahulu.`);
        }
      });

      grid.appendChild(card);
    });
  }

  loadLevelById(levelId) {
    this.currentLevelId = levelId;
    const freshLevelInstance = QuestManager.createLevelInstance(levelId);
    this.startLevelDirectly(freshLevelInstance);
  }

  randomizeCurrentLevel() {
    if (this.currentLevelId) {
      const freshLevelInstance = QuestManager.createLevelInstance(this.currentLevelId);
      this.startLevelDirectly(freshLevelInstance);
    }
  }

  startLevelDirectly(level) {
    this.currentLevel = level;
    this.switchScreen('game');

    // Update Quick Challenge Banner if in quick challenge mode
    const bannerEl = document.getElementById('challenge-active-banner');
    const bannerTitleEl = document.getElementById('challenge-banner-title');
    const streakCountEl = document.getElementById('challenge-streak-count');
    if (bannerEl) {
      if (level.isQuickChallenge) {
        bannerEl.style.display = 'flex';
        if (bannerTitleEl) bannerTitleEl.innerText = level.subtitle || '⚡ TANTANGAN CEPAT';
        if (streakCountEl) streakCountEl.innerText = Math.max(1, this.quickChallengeStreak || 1);
      } else {
        bannerEl.style.display = 'none';
      }
    }

    // Update World Info in Canvas HUD
    const worldTitleEl = document.getElementById('env-world-title');
    if (worldTitleEl) worldTitleEl.innerHTML = `<span>${MathEngine.escapeHtml(level.icon)}</span> ${MathEngine.escapeHtml(level.name)}`;
    
    const missionSubEl = document.getElementById('env-mission-subtitle');
    if (missionSubEl) missionSubEl.innerText = level.subtitle;

    // Update Dialogue
    const avatarEl = document.getElementById('dialogue-npc-avatar');
    if (avatarEl) avatarEl.innerText = level.npc.avatar;
    
    const npcNameEl = document.getElementById('dialogue-npc-name');
    if (npcNameEl) npcNameEl.innerText = level.npc.name;
    
    const npcTextEl = document.getElementById('dialogue-npc-text');
    if (npcTextEl) npcTextEl.innerText = level.npc.intro;

    // Configure Renderer Scenario
    if (this.renderer) {
      this.renderer.setScenario(
        level.worldKey,
        level.mission.scenario,
        level.equation,
        level.expectedRoots,
        level.expectedVertex
      );
    }

    // Configure Solver UI
    if (this.solverUI) {
      this.solverUI.loadLevel(level);
    }

    // Play Level Music
    if (window.soundEngine && window.soundEngine.musicEnabled) {
      window.soundEngine.playTrack(level.worldKey);
    }
  }

  onSolutionSubmitted(result) {
    const { isCorrect, level } = result;

    // Switch to Simulation View on mobile so animation is visible!
    if (window.innerWidth <= 860) {
      this.setMobileViewMode('sim');
    }

    // Start Simulation Animation
    if (this.renderer) {
      if (isCorrect) {
        if (level.worldKey === 'space' && window.soundEngine) window.soundEngine.playLaunch();
        else if (level.worldKey === 'sports' && window.soundEngine) window.soundEngine.playBounce();
        else if (level.worldKey === 'building' && window.soundEngine) window.soundEngine.playBuild();
        else if (level.worldKey === 'business' && window.soundEngine) window.soundEngine.playCash();
        else if (level.worldKey === 'racing' && window.soundEngine) window.soundEngine.playEngine();
        else if (window.soundEngine) window.soundEngine.playBeep(880, 'sine', 0.2);
      } else {
        if (level.worldKey === 'space' && window.soundEngine) window.soundEngine.playExplosion();
        else if (window.soundEngine) window.soundEngine.playWrong();
      }

      this.renderer.startSimulation(isCorrect, (simSuccess) => {
        this.showSimulationOutcomeModal(result);
      });
    }
  }

  showSimulationOutcomeModal(result) {
    const { isCorrect, fastSolverBonus, level, diagnosticNote } = result;
    const modal = document.getElementById('outcome-modal-backdrop');
    const iconEl = document.getElementById('modal-result-icon');
    const titleEl = document.getElementById('modal-result-title');
    const bodyEl = document.getElementById('modal-result-body');
    const nextBtn = document.getElementById('btn-modal-next');
    const retryBtn = document.getElementById('btn-modal-retry');
    const autofillBtn = document.getElementById('btn-modal-autofill-solution');

    if (isCorrect) {
      if (window.soundEngine) window.soundEngine.playCorrect();

      const earnedScore = level.rewardScore + (fastSolverBonus ? level.bonusScore : 0);
      this.playerState.score += earnedScore;
      if (fastSolverBonus) {
        this.playerState.strategyScore += level.bonusScore;
        this.playerState.fastSolverBadges++;
      }

      const stars = fastSolverBonus ? 3 : 2;
      this.playerState.levelStars[level.id] = Math.max(this.playerState.levelStars[level.id] || 0, stars);

      // Unlock next level
      const nextLevelId = level.id + 1;
      const templates = window.BASE_LEVEL_TEMPLATES || BASE_LEVEL_TEMPLATES || [];
      if (!this.playerState.unlockedLevels.includes(nextLevelId) && nextLevelId <= templates.length) {
        this.playerState.unlockedLevels.push(nextLevelId);
      }

      this.saveData();
      this.updateHUDStats();

      if (iconEl) iconEl.innerText = fastSolverBonus ? '⚡' : '🎉';
      if (titleEl) {
        titleEl.className = 'modal-title success';
        titleEl.innerText = fastSolverBonus ? 'MISI SELESAI — FAST SOLVER!' : 'MISI SELESAI DENGAN SUKSES!';
      }

      let strategyBonusHtml = '';
      if (fastSolverBonus) {
        strategyBonusHtml = `
          <div class="strategy-score-card">
            <span class="strategy-score-title">⚡ STRATEGY BONUS: Pilihan Metode Tercepat & Tepat!</span>
            <span class="strategy-bonus-pill">+${level.bonusScore} BONUS</span>
          </div>
        `;
      } else {
        strategyBonusHtml = `
          <div class="strategy-score-card" style="border-color: rgba(255,255,255,0.2);">
            <span class="strategy-score-title" style="color: #cbd5e1;">💡 Tips: Gunakan metode rekomendasi scanner untuk mendapatkan Fast Solver Bonus!</span>
            <span class="strategy-bonus-pill" style="background:#556677;">+0</span>
          </div>
        `;
      }

      const multiMethodComparativeHtml = MathEngine.generateVictoryMultiMethodSummary(level, result.chosenStrategy);

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <p style="margin-bottom: 2px;"><strong>${level.npc.name}:</strong> <em>"Luar biasa! Masalah berhasil terpecahkan dengan simulasi yang sempurna!"</em></p>
            <p style="color: #a5f3fc; font-size: 0.86rem; line-height: 1.4;">${level.conceptExplanation}</p>
            ${strategyBonusHtml}
            <div style="margin-top: 6px; border-top: 1px dashed rgba(0,240,255,0.3); padding-top: 8px;">
              <h4 style="color: var(--primary-gold); font-size: 0.92rem; margin-bottom: 4px;">🧠 PEMBAHASAN 3 CARA PENYELESAIAN PERSAMAAN INI:</h4>
              <p style="font-size: 0.8rem; color: #94a3b8;">Lihat bagaimana 2 metode lainnya menghasilkan akar yang sama persis:</p>
              ${multiMethodComparativeHtml}
            </div>
            <p style="margin-top: 8px; font-family: var(--font-math); color: #ffbe0b; font-size: 0.95rem;">
              Skor Diperoleh: +${earnedScore} Poin | Bintang: ${'⭐'.repeat(stars)}
            </p>
          </div>
        `;
      }

      if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        nextBtn.innerHTML = level.isQuickChallenge ? '<span>⚡</span> TANTANGAN BERIKUTNYA' : '<span>➡️</span> LEVEL SELANJUTNYA';
      }
      const modalMultiMethodBtn = document.getElementById('btn-modal-view-multi-method');
      if (modalMultiMethodBtn) modalMultiMethodBtn.style.display = 'inline-flex';
      if (retryBtn) {
        retryBtn.style.display = 'inline-flex';
        retryBtn.innerHTML = level.isQuickChallenge ? '<span>🔄</span> COBA TANTANGAN LAGI' : '<span>🔄</span> COBA LAGI DENGAN CARA LAIN';
      }
      if (autofillBtn) autofillBtn.style.display = 'none';
      if (level.isQuickChallenge) {
        this.quickChallengeStreak = (this.quickChallengeStreak || 0) + 1;
      }
    } else {
      if (level.isQuickChallenge) {
        this.quickChallengeStreak = 0;
      }
      if (window.soundEngine) window.soundEngine.playWrong();

      if (iconEl) iconEl.innerText = '💥';
      if (titleEl) {
        titleEl.className = 'modal-title fail';
        titleEl.innerText = 'SIMULASI GAGAL!';
      }

      let expectedStr = '';
      if (level.problemType === 'vertex') {
        const v = level.expectedVertex || MathEngine.calcVertex(level.equation.a, level.equation.b, level.equation.c);
        expectedStr = `Koordinat Puncak: <strong>x = ${v.xv}, y = ${v.yv}</strong>`;
      } else {
        expectedStr = `Akar yang membuat f(x) = 0: <strong>x₁ = ${level.expectedRoots[0]}, x₂ = ${level.expectedRoots[1]}</strong>`;
      }

      if (bodyEl) {
        bodyEl.innerHTML = `
          <p style="margin-bottom: 8px;"><strong>${level.npc.name}:</strong> <em>"Kalkulasinya belum tepat! Lintasan tidak mencapai target."</em></p>
          <div style="background: rgba(255,0,110,0.1); border: 1px solid var(--primary-pink); padding: 10px; border-radius: 6px; margin: 8px 0; font-size: 0.85rem;">
            ${diagnosticNote || 'Nilai yang dimasukkan belum membuat persamaan bernilai 0.'}
          </div>
          <p style="color: #ffbe0b; margin-top: 6px;">💡 Kunci Jawaban Singkat: ${expectedStr}</p>
          <p style="font-size: 0.82rem; color: #cbd5e1; margin-top: 6px;">Klik <strong>Beri Jawaban Benar & Pembahasan</strong> untuk membaca langkah pengerjaan lengkap dan mencoba kembali!</p>
        `;
      }

      if (nextBtn) nextBtn.style.display = 'none';
      const modalMultiMethodBtn = document.getElementById('btn-modal-view-multi-method');
      if (modalMultiMethodBtn) modalMultiMethodBtn.style.display = 'none';
      if (retryBtn) {
        retryBtn.style.display = 'inline-flex';
        retryBtn.innerHTML = level.isQuickChallenge ? '<span>🔄</span> COBA TANTANGAN LAGI' : '<span>🔄</span> COBA LAGI DENGAN CARA LAIN';
      }
      if (autofillBtn) autofillBtn.style.display = 'inline-flex';
    }

    const applyAndSimBtn = document.getElementById('btn-modal-apply-and-sim');
    const tryMyselfBtn = document.getElementById('btn-modal-try-myself');
    if (applyAndSimBtn) applyAndSimBtn.style.display = 'none';
    if (tryMyselfBtn) tryMyselfBtn.style.display = 'none';

    if (modal) modal.classList.add('active');
  }

  showSolutionReviewModal() {
    if (!this.currentLevel) return;
    const modal = document.getElementById('outcome-modal-backdrop');
    const iconEl = document.getElementById('modal-result-icon');
    const titleEl = document.getElementById('modal-result-title');
    const bodyEl = document.getElementById('modal-result-body');

    const nextBtn = document.getElementById('btn-modal-next');
    const retryBtn = document.getElementById('btn-modal-retry');
    const autofillBtn = document.getElementById('btn-modal-autofill-solution');
    const applyAndSimBtn = document.getElementById('btn-modal-apply-and-sim');
    const tryMyselfBtn = document.getElementById('btn-modal-try-myself');
    const mapBtn = document.getElementById('btn-modal-map');

    if (iconEl) iconEl.innerText = '💡';
    if (titleEl) {
      titleEl.className = 'modal-title';
      titleEl.innerText = 'KUNCI JAWABAN & PEMBAHASAN LENGKAP';
    }
    if (bodyEl) {
      bodyEl.innerHTML = MathEngine.generateSolutionReview(this.currentLevel);
    }

    if (nextBtn) nextBtn.style.display = 'none';
    if (retryBtn) retryBtn.style.display = 'none';
    if (autofillBtn) autofillBtn.style.display = 'none';
    if (applyAndSimBtn) applyAndSimBtn.style.display = 'inline-flex';
    if (tryMyselfBtn) tryMyselfBtn.style.display = 'inline-flex';
    if (mapBtn) mapBtn.style.display = 'inline-flex';

    if (modal) modal.classList.add('active');
    if (window.soundEngine) window.soundEngine.playBeep(650, 'sine', 0.1);
  }

  showCustomModal(title, htmlContent, buttonText = 'Tutup') {
    const modal = document.getElementById('outcome-modal-backdrop');
    const iconEl = document.getElementById('modal-result-icon');
    if (iconEl) iconEl.innerText = '💡';
    
    const titleEl = document.getElementById('modal-result-title');
    if (titleEl) {
      titleEl.className = 'modal-title';
      titleEl.innerText = title;
    }
    
    const bodyEl = document.getElementById('modal-result-body');
    if (bodyEl) bodyEl.innerHTML = htmlContent;

    const nextBtn = document.getElementById('btn-modal-next');
    if (nextBtn) nextBtn.style.display = 'none';
    
    const retryBtn = document.getElementById('btn-modal-retry');
    if (retryBtn) retryBtn.style.display = 'none';
    
    const autofillBtn = document.getElementById('btn-modal-autofill-solution');
    if (autofillBtn) autofillBtn.style.display = 'none';

    const applyAndSimBtn = document.getElementById('btn-modal-apply-and-sim');
    const tryMyselfBtn = document.getElementById('btn-modal-try-myself');
    if (applyAndSimBtn) applyAndSimBtn.style.display = 'none';
    if (tryMyselfBtn) tryMyselfBtn.style.display = 'none';

    const mapBtn = document.getElementById('btn-modal-map');
    if (mapBtn) mapBtn.innerText = buttonText;

    if (modal) modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('outcome-modal-backdrop');
    if (modal) modal.classList.remove('active');
    const multi = document.getElementById('multi-method-modal-backdrop');
    if (multi) multi.classList.remove('active');
    const mapBtn = document.getElementById('btn-modal-map');
    if (mapBtn) mapBtn.innerText = '🗺️ Peta Dunia';
  }

  updateHUDStats() {
    const scoreVal = document.getElementById('hud-player-score');
    const stratVal = document.getElementById('hud-strategy-badges');
    if (scoreVal) scoreVal.innerText = this.playerState.score;
    if (stratVal) stratVal.innerText = this.playerState.fastSolverBadges;
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<span>🎮</span> <span>${MathEngine.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2400);
  }
}

// Instantiate game on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new QuadraGame();
});
