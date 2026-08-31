/* ==========================================================================
   QUADRA — Dynamic Level Generator & Procedural Quest Engine
   Generates clean integer roots (f(r) = 0) with rich narrative context
   for all 7 worlds. Players can generate endless randomized fresh problems!
   ========================================================================== */

const BASE_LEVEL_TEMPLATES = [
  {
    id: 1,
    worldKey: 'village',
    name: 'Quadratic Village',
    icon: '🌱',
    subtitle: 'Pengenalan Bentuk & Akar',
    npc: {
      name: 'Elder Al-Khwarizmi',
      avatar: '🧙‍♂️',
      intro: 'Selamat datang di Dunia Quadra, Problem Solver! Kristal pelindung desa kehilangan kestabilan frekuensinya. Bantulah kami mengkalibrasi akar energi kristal!'
    },
    missionTitle: 'Kalibrasi Kristal Energi Desa',
    missionDesc: 'Frekuensi getaran kristal mengikuti persamaan kuadrat. Temukan akar-akar penyelesaian persamaan energi (f(x) = 0) agar portal desa terbuka kembali.',
    scenario: 'village_portal',
    problemType: 'root',
    optimalStrategy: 'factor',
    rewardScore: 100,
    bonusScore: 50,
    tags: ['Bentuk ax² + bx + c', 'Akar Persamaan (f(x)=0)', 'Faktorisasi Cepat'],
    conceptExplanation: 'Akar persamaan kuadrat adalah nilai x yang membuat persamaan bernilai 0. Frekuensi yang kamu masukkan berhasil menstabilkan getaran kristal energi!',
    generateProblem: () => {
      // Clean integer roots r1, r2 between 1 and 9
      const r1 = Math.floor(Math.random() * 4) + 2; // 2..5
      const r2 = r1 + Math.floor(Math.random() * 4) + 1; // r1+1..r1+4
      const a = 1;
      const b = -(r1 + r2);
      const c = r1 * r2;
      return {
        a, b, c,
        varName: 'x',
        displayStr: `x² ${b < 0 ? '- ' + Math.abs(b) : '+ ' + b}x + ${c} = 0`,
        targetLabel: 'Akar frekuensi kristal energi x',
        expectedRoots: [r1, r2],
        fastSolverPairs: [-r1, -r2]
      };
    }
  },
  {
    id: 2,
    worldKey: 'sports',
    name: 'Sports City',
    icon: '🏀',
    subtitle: 'Lintasan Bola Parabola',
    npc: {
      name: 'Coach Jordan',
      avatar: '⛹️',
      intro: 'Halo Solver! Kami sedang melatih lemparan 3-point. Ketinggian bola mengikuti kurva parabola gravitasi. Kapan bola mencapai ketinggian ring target?'
    },
    missionTitle: 'Tembakan Bola Masuk Ring',
    missionDesc: 'Persamaan ketinggian telah disederhanakan ke bentuk standar t² + bt + c = 0. Tentukan waktu t (detik) saat bola melewati ketinggian ring!',
    scenario: 'sports_hoop',
    problemType: 'root',
    optimalStrategy: 'factor',
    rewardScore: 150,
    bonusScore: 75,
    tags: ['Model Gerak Fisika', 'Lintasan Parabola', 'Waktu Target t'],
    conceptExplanation: 'Lintasan lemparan bola selalu melengkung membentuk parabola. Akar persamaan menunjukkan dua waktu saat bola naik dan turun melewati ketinggian ring!',
    generateProblem: () => {
      // Clean integer seconds t1, t2 between 1 and 5
      const t1 = Math.floor(Math.random() * 2) + 1; // 1..2
      const t2 = t1 + Math.floor(Math.random() * 3) + 1; // 2..5
      const a = 1;
      const b = -(t1 + t2);
      const c = t1 * t2;
      return {
        a, b, c,
        varName: 't',
        displayStr: `t² ${b < 0 ? '- ' + Math.abs(b) : '+ ' + b}t + ${c} = 0`,
        targetLabel: 'Waktu t (detik) bola mencapai ketinggian target',
        expectedRoots: [t1, t2],
        fastSolverPairs: [-t1, -t2]
      };
    }
  },
  {
    id: 3,
    worldKey: 'building',
    name: 'Building City',
    icon: '🏗️',
    subtitle: 'Dimensi & Konstruksi Lahan',
    npc: {
      name: 'Arsitek Maya',
      avatar: '👷‍♀️',
      intro: 'Proyek menara baru membutuhkan ukuran pondasi presisi! Panjang lahan beberapa meter lebih besar dari lebarnya. Berapa ukuran lebar lahan?'
    },
    missionTitle: 'Pembangunan Menara Quadra Sky',
    missionDesc: 'Jika lebar = x dan panjang = (x + d), maka Luas = x(x + d). Selesaikan persamaan x² + dx - Luas = 0 untuk menemukan lebar x positif!',
    scenario: 'building_tower',
    problemType: 'root',
    optimalStrategy: 'factor',
    rewardScore: 200,
    bonusScore: 100,
    tags: ['Geometri Luas', 'Model Persamaan', 'Akar Fisik Positif'],
    conceptExplanation: 'Dari dua akar aljabar, dimensi fisik bangunan harus bernilai positif. Menara berhasil didirikan dengan ukuran pondasi yang tepat!',
    generateProblem: () => {
      // Width x from 4 to 10, length diff d from 2 to 6
      const width = Math.floor(Math.random() * 6) + 4; // 4..9
      const diff = Math.floor(Math.random() * 4) + 2;  // 2..5
      const length = width + diff;
      const area = width * length;

      const a = 1;
      const b = diff;
      const c = -area;

      return {
        a, b, c,
        varName: 'x',
        displayStr: `x² + ${diff}x - ${area} = 0`,
        targetLabel: `Lebar lahan x positif (Luas: ${area} m², Panjang: x + ${diff} m)`,
        expectedRoots: [-length, width],
        positiveRootOnly: true,
        targetPositiveRoot: width,
        fastSolverPairs: [length, -width]
      };
    }
  },
  {
    id: 4,
    worldKey: 'space',
    name: 'Space Center',
    icon: '🚀',
    subtitle: 'Peluncuran Roket & Diskriminan',
    npc: {
      name: 'Dr. Astra',
      avatar: '👩‍🚀',
      intro: 'Roket luar angkasa Quadra-IV siap meluncur! Ketinggiannya dimodelkan dengan fungsi kuadrat gravitasi. Hitung kapan roket mendarat kembali saat h(t) = 0.'
    },
    missionTitle: 'Kalkulasi Waktu Pendaratan Roket',
    missionDesc: 'Selesaikan persamaan t² - dt = 0 untuk menghitung durasi total waktu roket di udara sebelum menyentuh landasan kembali.',
    scenario: 'space_rocket',
    problemType: 'root',
    optimalStrategy: 'factor',
    rewardScore: 250,
    bonusScore: 120,
    tags: ['Rumus ABC', 'Diskriminan D', 'Interpretasi Waktu Mendarat'],
    conceptExplanation: 'Akar t = 0 adalah waktu peluncuran di darat, dan akar positif adalah saat roket mendarat kembali di orbit stasiun (ketinggian h = 0).',
    generateProblem: () => {
      // Landing time between 10 and 24 seconds
      const landingTime = (Math.floor(Math.random() * 7) + 5) * 2; // 10, 12, 14, 16, 18, 20, 22
      const a = 1;
      const b = -landingTime;
      const c = 0;
      return {
        a, b, c,
        varName: 't',
        displayStr: `t² - ${landingTime}t = 0`,
        targetLabel: 'Waktu pendaratan roket t (detik) positif',
        expectedRoots: [0, landingTime],
        targetPositiveRoot: landingTime,
        fastSolverPairs: [0, -landingTime]
      };
    }
  },
  {
    id: 5,
    worldKey: 'business',
    name: 'Business City',
    icon: '💰',
    subtitle: 'Optimasi Keuntungan Maksimum',
    npc: {
      name: 'CEO Warren',
      avatar: '💼',
      intro: 'Pasar keuangan Quadra memerlukan keputusan strategi harga optimal! Fungsi laba berbentuk parabola terbalik. Tentukan harga tiket untuk laba tertinggi!'
    },
    missionTitle: 'Penetapan Harga Tiket Laba Maksimum',
    missionDesc: 'Gunakan rumus titik puncak parabola (Vertex) x = -b / (2a) untuk menentukan harga tiket optimal x.',
    scenario: 'business_profit',
    problemType: 'vertex',
    optimalStrategy: 'vertex',
    rewardScore: 300,
    bonusScore: 150,
    tags: ['Titik Puncak (Vertex)', 'Nilai Maksimum', 'Pengambilan Keputusan Bisnis'],
    conceptExplanation: 'Kurva laba membuka ke bawah (a < 0), sehingga titik puncak adalah satu-satunya harga tiket yang menghasilkan laba paling maksimal!',
    generateProblem: () => {
      // Optimal price between 10 and 35 (in thousand rupiah)
      const optimalPrice = (Math.floor(Math.random() * 6) + 3) * 5; // 15, 20, 25, 30, 35, 40
      const a = -2;
      const b = 4 * optimalPrice;
      const baseConstant = Math.floor(Math.random() * 300) + 400; // 400..700
      const maxProfit = (a * optimalPrice * optimalPrice) + (b * optimalPrice) + baseConstant;

      return {
        a, b, c: baseConstant,
        varName: 'x',
        displayStr: `P(x) = -2x² + ${b}x + ${baseConstant}`,
        targetLabel: 'Harga tiket x optimal untuk laba tertinggi (ribu Rp)',
        expectedVertex: { xv: optimalPrice, yv: maxProfit },
        expectedRoots: [optimalPrice]
      };
    }
  },
  {
    id: 6,
    worldKey: 'racing',
    name: 'Racing City',
    icon: '🏎️',
    subtitle: 'Lompatan Mobil Super Parabola',
    npc: {
      name: 'Speedster Mika',
      avatar: '🏁',
      intro: 'Sirkuit balap memiliki jurang rintangan berbahaya! Mobil melompat di tanjakan mengikuti lintasan parabola. Berapa meter jarak mobil mendarat?'
    },
    missionTitle: 'Kalkulasi Stunt Jump Mobil Balap',
    missionDesc: 'Tentukan jarak pendaratan x (meter) saat ketinggian y = 0 dengan menyelesaikan persamaan x² - dx = 0.',
    scenario: 'racing_jump',
    problemType: 'root',
    optimalStrategy: 'factor',
    rewardScore: 350,
    bonusScore: 175,
    tags: ['Simulasi Fisika', 'Lintasan Balap', 'Stunt Landing'],
    conceptExplanation: 'Mobil melayang dari x = 0m dan mendarat sempurna tepat di aspal seberang jurang tanpa benturan!',
    generateProblem: () => {
      // Landing distance 30, 40, 50, 60 meters
      const jumpDist = (Math.floor(Math.random() * 5) + 3) * 10; // 30, 40, 50, 60, 70
      const a = 1;
      const b = -jumpDist;
      const c = 0;
      return {
        a, b, c,
        varName: 'x',
        displayStr: `x² - ${jumpDist}x = 0`,
        targetLabel: 'Jarak pendaratan mobil x (meter) positif',
        expectedRoots: [0, jumpDist],
        targetPositiveRoot: jumpDist,
        fastSolverPairs: [0, -jumpDist]
      };
    }
  },
  {
    id: 7,
    worldKey: 'stadium',
    name: 'Stadium Architecture',
    icon: '🏟️',
    subtitle: 'Desain Atap Mega Stadion',
    npc: {
      name: 'Chief Engineer Kenzo',
      avatar: '🏛️',
      intro: 'Stadion Utama Quadra sedang dibangun! Atap kubah melengkung dirancang dengan rumus parabola y = -x² + bx + c. Hitung tinggi puncak atap stadion!'
    },
    missionTitle: 'Pembangunan Atap Megah Parabola',
    missionDesc: 'Cari titik puncak parabola (Vertex) dengan menghitung sumbu simetri x = -b/(2a), lalu substitusikan untuk menemukan tinggi atap y!',
    scenario: 'stadium_roof',
    problemType: 'vertex',
    optimalStrategy: 'vertex',
    rewardScore: 400,
    bonusScore: 200,
    tags: ['Arsitektur Parabola', 'Tinggi Maksimum', 'Mastery Problem'],
    conceptExplanation: 'Ketinggian puncak atap kubah parabola stadion berhasil dihitung dengan sempurna, menghasilkan konstruksi megah yang kokoh!',
    generateProblem: () => {
      // Center position 4..8, max height 30..60
      const xv = Math.floor(Math.random() * 5) + 4; // 4..8
      const b = 2 * xv;
      const baseC = Math.floor(Math.random() * 10) + 2; // 2..11
      const yv = -(xv * xv) + (b * xv) + baseC;

      return {
        a: -1, b, c: baseC,
        varName: 'x',
        displayStr: `y = -x² + ${b}x + ${baseC}`,
        targetLabel: 'Tinggi puncak atap stadion y (meter)',
        expectedVertex: { xv, yv },
        expectedRoots: [xv]
      };
    }
  }
];

class QuestManager {
  /**
   * Instantiate a level with a freshly randomized problem instance
   * where all roots are clean integers satisfying f(x) = 0!
   */
  static createLevelInstance(levelId) {
    const tmpl = BASE_LEVEL_TEMPLATES.find(t => t.id === levelId) || BASE_LEVEL_TEMPLATES[0];
    const generated = tmpl.generateProblem();

    return {
      id: tmpl.id,
      worldKey: tmpl.worldKey,
      name: tmpl.name,
      icon: tmpl.icon,
      subtitle: tmpl.subtitle,
      npc: tmpl.npc,
      mission: {
        title: tmpl.missionTitle,
        desc: tmpl.missionDesc,
        scenario: tmpl.scenario
      },
      equation: {
        a: generated.a,
        b: generated.b,
        c: generated.c,
        equals: 0,
        varName: generated.varName,
        displayStr: generated.displayStr,
        targetLabel: generated.targetLabel
      },
      problemType: tmpl.problemType,
      expectedRoots: generated.expectedRoots || [],
      expectedVertex: generated.expectedVertex || null,
      positiveRootOnly: generated.positiveRootOnly || false,
      targetPositiveRoot: generated.targetPositiveRoot || null,
      optimalStrategy: tmpl.optimalStrategy,
      fastSolverPairs: generated.fastSolverPairs || null,
      rewardScore: tmpl.rewardScore,
      bonusScore: tmpl.bonusScore,
      tags: tmpl.tags,
      conceptExplanation: tmpl.conceptExplanation
    };
  }

  /**
   * Generate an endless procedural quest
   */
  static generateRandomProceduralQuest(challengeIndex = 1) {
    const randomLevelId = Math.floor(Math.random() * BASE_LEVEL_TEMPLATES.length) + 1;
    const instance = this.createLevelInstance(randomLevelId);
    instance.id = 999;
    instance.isQuickChallenge = true;
    instance.challengeIndex = challengeIndex;
    instance.subtitle = `⚡ Tantangan Cepat #${challengeIndex}`;
    instance.mission.title = `⚡ Tantangan Cepat #${challengeIndex}: ${instance.name}`;
    instance.npc.intro = `⚡ Mode Tantangan Cepat #${challengeIndex} aktif! Pecahkan persamaan ${instance.name} secepat mungkin untuk meraih rekor kombo streak tertinggi!`;
    return instance;
  }
}

window.BASE_LEVEL_TEMPLATES = BASE_LEVEL_TEMPLATES;
window.QuestManager = QuestManager;
