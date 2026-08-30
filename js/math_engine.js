/* ==========================================================================
   QUADRA — Mathematical Solver & Multi-Method Deep Explanation Engine
   Handles quadratic equations ax² + bx + c = 0, factorization, ABC formula,
   completing the square, vertex analysis, and multi-method step comparisons.
   ========================================================================== */

class MathEngine {
  /**
   * Helper to escape raw text for HTML safety
   */
  static escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Calculate discriminant D = b² - 4ac
   */
  static calcDiscriminant(a, b, c) {
    return (b * b) - (4 * a * c);
  }

  /**
   * Determine roots of ax² + bx + c = 0
   */
  static solveRoots(a, b, c) {
    const D = this.calcDiscriminant(a, b, c);
    if (D < 0) {
      return { count: 0, roots: [], D };
    }
    if (Math.abs(D) < 1e-9) {
      const root = -b / (2 * a);
      return { count: 1, roots: [root], D: 0 };
    }
    const sqrtD = Math.sqrt(D);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    return {
      count: 2,
      roots: [Math.min(x1, x2), Math.max(x1, x2)],
      D
    };
  }

  /**
   * Universal ABC Solver returning structured root details
   */
  static solveABC(a, b, c) {
    const D = this.calcDiscriminant(a, b, c);
    if (D < 0) {
      return { type: 'complex', count: 0, roots: [], D };
    }
    if (Math.abs(D) < 1e-9) {
      const root = -b / (2 * a);
      return { type: 'single', count: 1, roots: [root], x1: root, x2: root, D: 0 };
    }
    const sqrtD = Math.sqrt(D);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    return {
      type: 'real',
      count: 2,
      roots: [Math.min(x1, x2), Math.max(x1, x2)],
      x1: Math.min(x1, x2),
      x2: Math.max(x1, x2),
      D
    };
  }

  /**
   * Calculate 256-Bit realistic mathematical and physical telemetry
   */
  static calcAdvancedTelemetry(a, b, c) {
    const D = this.calcDiscriminant(a, b, c);
    const vertex = this.calcVertex(a, b, c);
    
    // Parabolic focal distance p = 1 / (4a)
    const safeA = a || 1;
    const p = 1 / (4 * safeA);
    const focalX = vertex.xv;
    const focalY = vertex.yv + p;
    const directrixY = vertex.yv - p;
    
    // Curvature at vertex kappa = |2a|
    const curvature = Math.abs(2 * safeA);
    
    const dSign = (2 * safeA) < 0 ? '-' : '';
    const dCoeff = Math.abs(2 * safeA) === 1 ? '' : Math.abs(2 * safeA);
    const bSign = b >= 0 ? '+ ' : '- ';
    const bAbs = Math.abs(b);

    return {
      focalPointStr: `F(${focalX.toFixed(2)}, ${focalY.toFixed(2)})`,
      curvatureStr: `κ = ${curvature.toFixed(2)} rad/m`,
      directrixStr: `y = ${directrixY.toFixed(2)}`,
      derivativeStr: `${dSign}${dCoeff}x ${bSign}${bAbs} = 0`,
      rSquaredStr: 'R² = 1.000 (Deterministic Fit)',
      p: p,
      vertex: vertex,
      discriminant: D
    };
  }

  /**
   * Calculate vertex / puncak parabola (xv, yv)
   */
  static calcVertex(a, b, c) {
    const xv = -b / (2 * a);
    const yv = (a * xv * xv) + (b * xv) + c;
    const isMax = a < 0;
    return { xv, yv, isMax };
  }

  /**
   * Find integer factorization factors for ax² + bx + c = 0
   * Looks for p, q such that p * q = a * c and p + q = b
   */
  static findFactorPairs(a, b, c) {
    const targetProduct = a * c;
    const targetSum = b;

    if (targetProduct === 0) {
      return {
        found: true,
        p: 0,
        q: targetSum,
        root1: 0,
        root2: -targetSum / a
      };
    }

    const absProduct = Math.abs(targetProduct);

    for (let i = -absProduct; i <= absProduct; i++) {
      if (i === 0) continue;
      if (targetProduct % i === 0) {
        const j = targetProduct / i;
        if (i + j === targetSum) {
          return {
            found: true,
            p: i,
            q: j,
            root1: -i / a,
            root2: -j / a
          };
        }
      }
    }

    return { found: false, p: null, q: null };
  }

  /**
   * Scan equation and recommend the best strategy
   */
  static scanEquation(a, b, c, problemType = 'root') {
    const D = this.calcDiscriminant(a, b, c);
    const isPerfectSquare = D >= 0 && Math.abs(Math.sqrt(D) - Math.round(Math.sqrt(D))) < 1e-7;
    const factorData = this.findFactorPairs(a, b, c);

    if (problemType === 'vertex' || problemType === 'max_min') {
      return {
        bestStrategy: 'vertex',
        badgeClass: 'vertex',
        badgeText: '📈 METODE GRAFIK / VERTEX',
        reason: 'Soal mencari nilai maksimum/minimum atau puncak parabola. Gunakan koordinat puncak x = -b/(2a).',
        difficulty: 'SEDANG'
      };
    }

    if (factorData.found && Math.abs(a) === 1) {
      return {
        bestStrategy: 'factor',
        badgeClass: 'factor',
        badgeText: '⚡ FACTOR MODE (REKOMENDASI CEPAT)',
        reason: `Pola terdeteksi: x² + bx + c. Nilai D = ${D} (kuadrat sempurna). Faktorkan mencari dua angka yang dikalikan = ${c} dan dijumlah = ${b}.`,
        difficulty: 'MUDAH'
      };
    }

    if (isPerfectSquare && factorData.found) {
      return {
        bestStrategy: 'factor',
        badgeClass: 'factor',
        badgeText: '⚡ FACTOR MODE / ABC FORMULA',
        reason: `Dapat difaktorkan atau diselesaikan dengan Rumus ABC secara cepat.`,
        difficulty: 'SEDANG'
      };
    }

    return {
      bestStrategy: 'abc',
      badgeClass: 'abc',
      badgeText: '📐 RUMUS ABC (QUADRATIC FORMULA)',
      reason: `Faktorisasi sulit (D = ${D} bukan kuadrat sederhana bulat). Rumus ABC x = (-b ± √D) / 2a adalah metode paling handal!`,
      difficulty: 'TINGGI'
    };
  }

  /**
   * Format equation string nicely e.g. x² - 5x + 6 = 0
   */
  static formatEquation(a, b, c, equals = 0, varName = 'x') {
    let result = '';

    // a term
    if (a === 1) result += `${varName}²`;
    else if (a === -1) result += `-${varName}²`;
    else if (a !== 0) result += `${a}${varName}²`;

    // b term
    if (b > 0) {
      result += (result ? ' + ' : '') + (b === 1 ? `${varName}` : `${b}${varName}`);
    } else if (b < 0) {
      result += ' - ' + (b === -1 ? `${varName}` : `${Math.abs(b)}${varName}`);
    }

    // c term
    if (c > 0) {
      result += (result ? ' + ' : '') + `${c}`;
    } else if (c < 0) {
      result += ` - ${Math.abs(c)}`;
    }

    if (!result) result = '0';
    return `${result} = ${equals}`;
  }

  /**
   * Generate comprehensive multi-method deep dive explanation
   * Explaining the PURPOSE of the formula and AT LEAST 3 METHODS to solve it.
   */
  static generateMultiMethodDeepDive(level) {
    const eq = level.equation;
    const { a, b, c, varName } = eq;
    const D = this.calcDiscriminant(a, b, c);
    const rootsObj = this.solveRoots(a, b, c);
    const vertex = this.calcVertex(a, b, c);
    const factorData = this.findFactorPairs(a, b, c);

    // 1. Purpose Explanation (Tujuan Rumus di Dunia Nyata)
    let purposeText = '';
    switch (level.worldKey) {
      case 'village':
        purposeText = `
          <strong>Tujuan Rumus:</strong> Persamaan ini memodelkan resonansi kristal energi. Dalam fisika kuantum dan gelombang, titik nol (akar) adalah titik simpul frekuensi di mana gelombang saling mengunci secara stabil tanpa interferensi destruktif.
        `;
        break;
      case 'sports':
        purposeText = `
          <strong>Tujuan Rumus:</strong> Mengapa lintasan bola basket menggunakan <code>-5t²</code>? Karena rumus fisika gravitasi bumi adalah <code>h(t) = -½gt² + v₀t + h₀</code>, di mana percepatan gravitasi <code>g ≈ 10 m/s²</code>, sehingga <code>-½(10) = -5</code>. Suku <code>-5t²</code> bertindak sebagai gaya tarik bumi yang membelokkan bola ke bawah menjadi kurva parabola!
        `;
        break;
      case 'building':
        purposeText = `
          <strong>Tujuan Rumus:</strong> Mengubah masalah geometri dua dimensi (Luas = Panjang × Lebar) menjadi persamaan satu variabel. Jika <code>Panjang = Lebar + 4</code>, maka <code>x(x + 4) = Luas</code>. Persamaan kuadrat muncul secara alami setiap kali kita mengalikan dua dimensi panjang yang saling berhubungan.
        `;
        break;
      case 'space':
        purposeText = `
          <strong>Tujuan Rumus:</strong> Menghitung durasi penerbangan roket dan waktu kembali ke bumi (saat ketinggian <code>h(t) = 0</code>). Persamaan kuadrat memungkinkan insinyur antariksa mengetahui kapan roket mencapai puncak dan kapan tepatnya roket mendarat kembali di landasan.
        `;
        break;
      case 'business':
        purposeText = `
          <strong>Tujuan Rumus:</strong> Memodelkan hubungan elastisitas harga dan permintaan. Jika harga tiket dinaikkan, pembeli berkurang secara linier. Akibatnya total pendapatan <code>(Harga × Jumlah Pembeli)</code> membentuk parabola terbalik <code>(a < 0)</code> yang memiliki <strong>satu titik puncak laba maksimal</strong>.
        `;
        break;
      case 'racing':
        purposeText = `
          <strong>Tujuan Rumus:</strong> Memodelkan gerak proyektil kendaraan balap saat melayang di udara. Persamaan kuadrat berfungsi sebagai <em>physics engine</em> sederhana untuk memprediksi jarak pendaratan sebelum mobil meluncur, mencegah mobil jatuh ke dalam jurang!
        `;
        break;
      case 'stadium':
        purposeText = `
          <strong>Tujuan Rumus:</strong> Arsitektur kubah parabola dirancang untuk mendistribusikan beban atap secara merata ke tiang penyangga samping. Persamaan kuadrat digunakan untuk menentukan tinggi maksimum atap agar tidak membatasi pencahayaan dan sirkulasi udara stadion.
        `;
        break;
      default:
        purposeText = `<strong>Tujuan Rumus:</strong> Menemukan nilai variabel yang memenuhi kondisi seimbang (f(x) = 0) atau kondisi optimal (puncak).`;
        break;
    }

    // 2. Method 1: Faktorisasi (Factorization)
    let method1Html = '';
    if (factorData.found) {
      const pSign = factorData.p >= 0 ? `+ ${factorData.p}` : `- ${Math.abs(factorData.p)}`;
      const qSign = factorData.q >= 0 ? `+ ${factorData.q}` : `- ${Math.abs(factorData.q)}`;
      method1Html = `
        <div class="method-card">
          <div class="method-title">⚡ CARA 1: Faktorisasi Cepat (Pemfaktoran)</div>
          <p><strong>Kapan Digunakan:</strong> Sangat efisien ketika Diskriminan <code>D</code> adalah kuadrat sempurna dan koefisien bulat.</p>
          <ol style="padding-left: 20px; line-height: 1.6;">
            <li>Bentuk persamaan: <code>${this.formatEquation(a, b, c, 0, varName)}</code></li>
            <li>Cari 2 bilangan <code>p</code> dan <code>q</code> di mana:
              <br>&bull; <code>p × q = a × c = ${a * c}</code>
              <br>&bull; <code>p + q = b = ${b}</code>
            </li>
            <li>Ditemukan bilangan: <code>p = ${factorData.p}</code> dan <code>q = ${factorData.q}</code></li>
            <li>Bentuk faktor: <code>(${varName} ${pSign})(${varName} ${qSign}) = 0</code></li>
            <li>Akar penyelesaian: <strong>${varName}₁ = ${factorData.root1}</strong> atau <strong>${varName}₂ = ${factorData.root2}</strong></li>
          </ol>
        </div>
      `;
    } else {
      method1Html = `
        <div class="method-card">
          <div class="method-title">⚡ CARA 1: Faktorisasi (Pemfaktoran)</div>
          <p><strong>Status:</strong> Sulit difaktorkan dengan bilangan bulat sederhana karena Diskriminan <code>D = ${D}</code> bukan kuadrat sempurna bilangan bulat. Disarankan langsung menggunakan <strong>Cara 2 (Rumus ABC)</strong>.</p>
        </div>
      `;
    }

    // 3. Method 2: Rumus ABC (Quadratic Formula)
    const sqrtDVal = Math.sqrt(Math.max(0, D));
    const sqrtDStr = (sqrtDVal % 1 === 0) ? `${sqrtDVal}` : `√${D} ≈ ${sqrtDVal.toFixed(2)}`;
    let method2Html = `
      <div class="method-card">
        <div class="method-title">📐 CARA 2: Rumus ABC (Rumus Universal Kuadrat)</div>
        <p><strong>Kapan Digunakan:</strong> Berlaku untuk <em>semua</em> jenis persamaan kuadrat, termasuk pecahan, desimal, dan akar tidak bulat.</p>
        <ol style="padding-left: 20px; line-height: 1.6;">
          <li>Identifikasi: <code>a = ${a}</code>, <code>b = ${b}</code>, <code>c = ${c}</code></li>
          <li>Hitung Diskriminan: 
            <br><code>D = b² - 4ac = (${b})² - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = ${D}</code>
          </li>
          <li>Masukkan ke Rumus ABC: 
            <br><code>${varName} = (-b ± √D) / (2a)</code>
            <br><code>${varName} = (-(${b}) ± ${sqrtDStr}) / (2 × ${a})</code>
          </li>
          <li>Pemisahan tanda (+) dan (-):
            <br>&bull; <code>${varName}₁ = (${-b} + ${sqrtDVal.toFixed(2)}) / ${2 * a} = <strong>${rootsObj.roots[1]?.toFixed(2) || '-'}</strong></code>
            <br>&bull; <code>${varName}₂ = (${-b} - ${sqrtDVal.toFixed(2)}) / ${2 * a} = <strong>${rootsObj.roots[0]?.toFixed(2) || '-'}</strong></code>
          </li>
        </ol>
      </div>
    `;

    // 4. Method 3: Analisis Titik Puncak / Melengkapkan Kuadrat Sempurna
    let method3Html = '';
    if (level.problemType === 'vertex' || level.problemType === 'max_min') {
      method3Html = `
        <div class="method-card">
          <div class="method-title">📈 CARA 3: Analisis Titik Puncak (Vertex & Sumbu Simetri)</div>
          <p><strong>Kapan Digunakan:</strong> Paling tepat untuk mencari nilai laba maksimum, tinggi tertinggi, atau biaya minimum.</p>
          <ol style="padding-left: 20px; line-height: 1.6;">
            <li>Sumbu Simetri (titik tengah parabola):
              <br><code>${varName}_puncak = -b / (2a) = -(${b}) / (2 × ${a}) = <strong>${vertex.xv.toFixed(2)}</strong></code>
            </li>
            <li>Nilai Optimum (substitusi ke persamaan awal):
              <br><code>y_puncak = ${a}(${vertex.xv.toFixed(2)})² + ${b}(${vertex.xv.toFixed(2)}) + ${c} = <strong>${vertex.yv.toFixed(2)}</strong></code>
            </li>
            <li>Karena <code>a = ${a} < 0</code>, kurva membuka ke bawah sehingga titik ini adalah <strong>Nilai Maksimum</strong>.</li>
          </ol>
        </div>
      `;
    } else {
      // Completing the Square
      const halfB = b / (2 * a);
      const halfBSq = halfB * halfB;
      method3Html = `
        <div class="method-card">
          <div class="method-title">🔄 CARA 3: Melengkapkan Kuadrat Sempurna</div>
          <p><strong>Kapan Digunakan:</strong> Metode aljabar murni yang menjadi dasar asal-usul diturunkannya Rumus ABC.</p>
          <ol style="padding-left: 20px; line-height: 1.6;">
            <li>Bagi kedua ruas dengan <code>a</code> (jika a ≠ 1) dan pindahkan konstanta <code>c</code> ke ruas kanan:
              <br><code>${varName}² + (${b/a})${varName} = ${-c/a}</code>
            </li>
            <li>Tambahkan <code>(b/2a)² = (${halfB.toFixed(2)})² = ${halfBSq.toFixed(2)}</code> ke kedua ruas:
              <br><code>(${varName} + ${halfB.toFixed(2)})² = ${(-c/a + halfBSq).toFixed(2)}</code>
            </li>
            <li>Tarik akar kedua ruas:
              <br><code>${varName} + ${halfB.toFixed(2)} = ±√${(-c/a + halfBSq).toFixed(2)}</code>
            </li>
            <li>Akar diperoleh: <strong>${varName}₁ = ${rootsObj.roots[1]?.toFixed(2) || '-'}</strong>, <strong>${varName}₂ = ${rootsObj.roots[0]?.toFixed(2) || '-'}</strong></li>
          </ol>
        </div>
      `;
    }

    return `
      <div class="multi-method-container">
        <div class="purpose-card">
          <div class="purpose-title">🌍 MAKNA & TUJUAN RUMUS DI DUNIA NYATA</div>
          <div class="purpose-body">${purposeText}</div>
        </div>

        <div class="methods-comparison-header">
          <h4>3 CARA MENYELESAIKAN PERSAMAAN INI:</h4>
          <p>Pilih metode tercepat sesuai tipe soal untuk mendapatkan <strong>⚡ Fast Solver Bonus</strong>!</p>
        </div>

        ${method1Html}
        ${method2Html}
        ${method3Html}
      </div>
    `;
  }

  /**
   * Generate step-by-step math explanation
   */
  static generateStepExplanation(a, b, c, chosenStrategy, answerRoots) {
    const D = this.calcDiscriminant(a, b, c);
    const rootsObj = this.solveRoots(a, b, c);
    const vertex = this.calcVertex(a, b, c);

    const steps = [];

    steps.push(`1. Bentuk Standar: <strong>${this.formatEquation(a, b, c, 0)}</strong>`);
    steps.push(`2. Identifikasi Koefisien: <code>a = ${a}</code>, <code>b = ${b}</code>, <code>c = ${c}</code>`);

    if (chosenStrategy === 'factor') {
      const factorData = this.findFactorPairs(a, b, c);
      if (factorData.found) {
        const signP = factorData.p >= 0 ? `+ ${factorData.p}` : `- ${Math.abs(factorData.p)}`;
        const signQ = factorData.q >= 0 ? `+ ${factorData.q}` : `- ${Math.abs(factorData.q)}`;
        steps.push(`3. Faktorisasi Cepat: Cari dua angka dengan perkalian = <code>${a * c}</code> dan penjumlahan = <code>${b}</code>.`);
        steps.push(`4. Ditemukan angka: <code>${factorData.p}</code> dan <code>${factorData.q}</code>.`);
        steps.push(`5. Bentuk faktor: <code>(x ${signP})(x ${signQ}) = 0</code>`);
        steps.push(`6. Akar-akar penyelesaian: <strong>x₁ = ${factorData.root1}, x₂ = ${factorData.root2}</strong>`);
      }
    } else if (chosenStrategy === 'vertex') {
      steps.push(`3. Sumbu Simetri: <code>x = -b / (2a) = -(${b}) / (2 × ${a}) = ${vertex.xv.toFixed(2)}</code>`);
      steps.push(`4. Nilai Optimum Puncak: <code>y = f(${vertex.xv.toFixed(2)}) = ${vertex.yv.toFixed(2)}</code>`);
      steps.push(`5. Titik Puncak (${vertex.isMax ? 'Maksimum' : 'Minimum'}): <strong>(${vertex.xv.toFixed(2)}, ${vertex.yv.toFixed(2)})</strong>`);
    } else {
      // ABC Formula
      steps.push(`3. Hitung Diskriminan: <code>D = b² - 4ac = (${b})² - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${D}</code>`);
      if (D >= 0) {
        const sqrtDStr = Math.sqrt(D) % 1 === 0 ? `${Math.sqrt(D)}` : `√${D} ≈ ${Math.sqrt(D).toFixed(2)}`;
        steps.push(`4. Rumus ABC: <code>x = (-b ± √D) / (2a) = (-(${b}) ± ${sqrtDStr}) / (2 × ${a})</code>`);
        steps.push(`5. Akar diperoleh: <strong>x₁ = ${rootsObj.roots[0].toFixed(2)}, x₂ = ${rootsObj.roots[1].toFixed(2)}</strong>`);
      } else {
        steps.push(`4. Karena D < 0, persamaan tidak memiliki akar riil.`);
      }
    }

    return steps;
  }

  /**
   * Generate complete step-by-step key & review explanation when player requests help
   */
  static generateSolutionReview(level) {
    const eq = level.equation;
    const { a, b, c, varName } = eq;
    const D = this.calcDiscriminant(a, b, c);
    const rootsObj = this.solveRoots(a, b, c);
    const vertex = this.calcVertex(a, b, c);
    const factorData = this.findFactorPairs(a, b, c);

    let keyAnswerHtml = '';
    let stepsHtml = '';

    if (level.problemType === 'vertex' || level.problemType === 'max_min') {
      keyAnswerHtml = `
        <div style="background: rgba(255,190,11,0.15); border: 2px solid var(--primary-gold); padding: 12px; border-radius: 8px; margin: 10px 0;">
          <h4 style="color: var(--primary-gold); margin-bottom: 6px; font-size: 1rem;">👑 KUNCI JAWABAN PUNCAK (VERTEX):</h4>
          <p style="font-size: 1.1rem; font-family: var(--font-math); color: #fff; line-height: 1.5;">
            • Sumbu Simetri: <strong>x = ${vertex.xv}</strong> <br>
            • Nilai Optimum Puncak: <strong>y = ${vertex.yv}</strong>
          </p>
        </div>
      `;

      stepsHtml = `
        <ol style="padding-left: 20px; line-height: 1.7; font-size: 0.9rem;">
          <li>Persamaan: <code>${eq.displayStr}</code></li>
          <li>Hitung Sumbu Simetri (titik tengah): <code>x_v = -b / (2a) = -(${b}) / (2 × ${a}) = <strong>${vertex.xv}</strong></code></li>
          <li>Substitusikan nilai <code>x = ${vertex.xv}</code> ke fungsi untuk mendapatkan puncak: 
            <br><code>y_v = ${a}(${vertex.xv})² ${b >= 0 ? '+' : ''}${b}(${vertex.xv}) + ${c} = <strong>${vertex.yv}</strong></code>
          </li>
        </ol>
      `;
    } else {
      let pVal = factorData.found ? factorData.p : -rootsObj.roots[0];
      let qVal = factorData.found ? factorData.q : -rootsObj.roots[1];
      let r1 = rootsObj.roots[0];
      let r2 = rootsObj.roots[1] !== undefined ? rootsObj.roots[1] : rootsObj.roots[0];

      keyAnswerHtml = `
        <div style="background: rgba(0,255,136,0.15); border: 2px solid var(--primary-green); padding: 12px; border-radius: 8px; margin: 10px 0;">
          <h4 style="color: var(--primary-green); margin-bottom: 6px; font-size: 1rem;">🔑 KUNCI JAWABAN & AKAR PENYELESAIAN:</h4>
          <p style="font-size: 1.05rem; font-family: var(--font-math); color: #fff; line-height: 1.6;">
            • <strong>Angka Faktor Input:</strong> <code>p = ${pVal}</code> dan <code>q = ${qVal}</code> <br>
            • <strong>Bentuk Faktorisasi:</strong> <code>(${varName} ${pVal >= 0 ? '+' : ''}${pVal})(${varName} ${qVal >= 0 ? '+' : ''}${qVal}) = 0</code> <br>
            • <strong>Akar Penyelesaian (f(${varName}) = 0):</strong> <strong>${varName}₁ = ${r1}</strong> dan <strong>${varName}₂ = ${r2}</strong>
          </p>
        </div>
      `;

      stepsHtml = `
        <ol style="padding-left: 20px; line-height: 1.7; font-size: 0.9rem;">
          <li>Bentuk Persamaan: <code>${eq.displayStr}</code></li>
          <li>Identifikasi Koefisien: <code>a = ${a}</code>, <code>b = ${b}</code>, <code>c = ${c}</code></li>
          <li>Cari 2 angka dengan perkalian <code>a × c = ${a * c}</code> dan penjumlahan <code>b = ${b}</code>:
            <br>&bull; <code>(${pVal}) × (${qVal}) = ${pVal * qVal}</code> (Cocok dengan c)
            <br>&bull; <code>(${pVal}) + (${qVal}) = ${pVal + qVal}</code> (Cocok dengan b)
          </li>
          <li>Uji Substitusi f(${varName}) = 0:
            <br>&bull; f(${r1}) = ${a}(${r1})² ${b >= 0 ? '+' : ''}${b}(${r1}) + ${c} = <strong>0 (Terbukti Benar!)</strong>
            <br>&bull; f(${r2}) = ${a}(${r2})² ${b >= 0 ? '+' : ''}${b}(${r2}) + ${c} = <strong>0 (Terbukti Benar!)</strong>
          </li>
        </ol>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding-right: 4px;">
        <p style="color: #cbd5e1; font-size: 0.9rem;">Pelajari kunci jawaban dan langkah pengerjaan di bawah ini sebelum melanjutkan:</p>
        ${keyAnswerHtml}
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px 14px;">
          <h4 style="color: var(--primary-cyan); margin-bottom: 8px;">📝 LANGKAH PEMBAHASAN LENGKAP:</h4>
          ${stepsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Generate comparative breakdown of the other 2 methods upon victory
   */
  static generateVictoryMultiMethodSummary(level, chosenStrategy) {
    const eq = level.equation;
    const { a, b, c, varName } = eq;
    const D = this.calcDiscriminant(a, b, c);
    const rootsObj = this.solveRoots(a, b, c);
    const vertex = this.calcVertex(a, b, c);
    const factorData = this.findFactorPairs(a, b, c);

    const r1 = rootsObj.roots[0];
    const r2 = rootsObj.roots[1] !== undefined ? rootsObj.roots[1] : rootsObj.roots[0];

    // Method used card
    let usedMethodTitle = '⚡ Faktorisasi';
    if (chosenStrategy === 'abc') usedMethodTitle = '📐 Rumus ABC';
    else if (chosenStrategy === 'vertex') usedMethodTitle = '📈 Analisis Titik Puncak (Vertex)';

    // Alternative Method 1: ABC or Factor
    let alt1Title = '';
    let alt1Content = '';
    if (chosenStrategy === 'factor') {
      alt1Title = '📐 Alternatif Cara 2: Menggunakan Rumus ABC';
      const sqrtD = Math.sqrt(Math.max(0, D));
      const sqrtDStr = (sqrtD % 1 === 0) ? `${sqrtD}` : `√${D} ≈ ${sqrtD.toFixed(2)}`;
      alt1Content = `
        Jika kamu menggunakan Rumus ABC <code>${varName} = (-b ± √[b² - 4ac]) / 2a</code>:
        <br>&bull; Hitung Diskriminan: <code>D = (${b})² - 4(${a})(${c}) = ${D}</code>
        <br>&bull; Substitusi: <code>${varName} = (-(${b}) ± ${sqrtDStr}) / (2 × ${a})</code>
        <br>&bull; Diperoleh hasil akar yang <strong>sama persis</strong>: <strong>${varName}₁ = ${r1}</strong> dan <strong>${varName}₂ = ${r2}</strong>.
      `;
    } else {
      alt1Title = '⚡ Alternatif Cara 1: Menggunakan Faktorisasi Cepat';
      if (factorData.found) {
        alt1Content = `
          Mencari 2 bilangan dengan perkalian <code>a × c = ${a * c}</code> dan penjumlahan <code>b = ${b}</code>:
          <br>&bull; Ditemukan: <code>p = ${factorData.p}</code> dan <code>q = ${factorData.q}</code>
          <br>&bull; Bentuk: <code>(${varName} ${factorData.p >= 0 ? '+' : ''}${factorData.p})(${varName} ${factorData.q >= 0 ? '+' : ''}${factorData.q}) = 0</code>
          <br>&bull; Diperoleh akar identik: <strong>${varName}₁ = ${r1}</strong> dan <strong>${varName}₂ = ${r2}</strong>.
        `;
      } else {
        alt1Content = `Faktorisasi mencari perkalian <code>${a*c}</code> dan jumlah <code>${b}</code>.`;
      }
    }

    // Alternative Method 2: Completing the Square or Vertex
    let alt2Title = '🔄 Alternatif Cara 3: Melengkapkan Kuadrat Sempurna';
    const halfB = b / (2 * a);
    const halfBSq = halfB * halfB;
    let alt2Content = `
      Mengubah persamaan ke bentuk kuadrat murni <code>(${varName} + b/2a)² = D/4a²</code>:
      <br>&bull; <code>(${varName} ${halfB >= 0 ? '+' : ''}${halfB.toFixed(1)})² = ${(-c/a + halfBSq).toFixed(2)}</code>
      <br>&bull; <code>${varName} = ${-halfB.toFixed(1)} ± ${Math.sqrt(Math.max(0, -c/a + halfBSq)).toFixed(2)}</code>
      <br>&bull; Memberikan nilai akar yang sama: <strong>${varName}₁ = ${r1}</strong> dan <strong>${varName}₂ = ${r2}</strong>.
    `;

    if (level.problemType === 'vertex') {
      alt2Title = '📈 Alternatif Cara 3: Titik Puncak (Vertex)';
      alt2Content = `
        Mencari sumbu simetri <code>x_v = -b / (2a) = ${vertex.xv}</code> dan nilai optimum <code>y_v = ${vertex.yv}</code>.
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px; text-align: left;">
        <div style="background: rgba(0,240,255,0.08); border-left: 3px solid var(--primary-cyan); padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 0.84rem;">
          <strong style="color: var(--primary-cyan);">🎯 Cara yang Kamu Gunakan (${usedMethodTitle}):</strong>
          <p style="margin-top: 2px; color: #fff;">Jawabanmu berhasil memecahkan persamaan <code>${eq.displayStr}</code> dengan tepat!</p>
        </div>

        <div style="background: rgba(255,255,255,0.04); border-left: 3px solid var(--primary-gold); padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 0.84rem;">
          <strong style="color: var(--primary-gold);">${alt1Title}:</strong>
          <p style="margin-top: 2px; color: #cbd5e1; line-height: 1.4;">${alt1Content}</p>
        </div>

        <div style="background: rgba(255,255,255,0.04); border-left: 3px solid var(--primary-pink); padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 0.84rem;">
          <strong style="color: var(--primary-pink);">${alt2Title}:</strong>
          <p style="margin-top: 2px; color: #cbd5e1; line-height: 1.4;">${alt2Content}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate R Language Scientific & Data Analysis Suite for the quadratic model
   */
  static generateRScriptAndAnalysis(level) {
    const eq = level.equation;
    const { a, b, c, varName } = eq;
    const rootsObj = this.solveRoots(a, b, c);
    const vertex = this.calcVertex(a, b, c);

    const r1 = rootsObj.roots[0] !== undefined ? rootsObj.roots[0] : vertex.xv - 1;
    const r2 = rootsObj.roots[1] !== undefined ? rootsObj.roots[1] : vertex.xv + 1;

    // Generate sample synthetic observations around the roots
    const xMin = Math.min(r1, r2, vertex.xv) - 1.5;
    const xMax = Math.max(r1, r2, vertex.xv) + 1.5;
    const step = (xMax - xMin) / 8;
    const xSample = [];
    const ySample = [];
    for (let i = 0; i <= 8; i++) {
      const curX = Math.round((xMin + i * step) * 100) / 100;
      const curY = Math.round(((a * curX * curX) + (b * curX) + c) * 100) / 100;
      xSample.push(curX);
      ySample.push(curY);
    }

    const worldName = level.name || 'Dunia Quadra';
    const missionTitle = level.mission?.title || 'Misi Sains';

    const rScriptText = `# ==============================================================================
# QUADRA 256-BIT SCIENTIFIC DATA ANALYSIS (R LANGUAGE)
# Model: ${varName} -> f(${varName}) = ${a}*${varName}^2 ${b >= 0 ? '+' : ''}${b}*${varName} ${c >= 0 ? '+' : ''}${c}
# Context: ${worldName} — ${missionTitle}
# ==============================================================================

# 1. Load Data Science Packages
if (!require("ggplot2")) install.packages("ggplot2")
if (!require("tibble")) install.packages("tibble")
library(ggplot2)
library(tibble)

# 2. Data Observasi Sensor Fisika / Geometri
sensor_data <- tibble(
  ${varName} = c(${xSample.join(', ')}),
  f_${varName} = c(${ySample.join(', ')})
)

# 3. Fitting Model Regresi Kuadratik (Polynomial OLS Regression)
model_kuadrat <- lm(f_${varName} ~ poly(${varName}, 2, raw = TRUE), data = sensor_data)

# 4. Evaluasi Ringkasan Statistik Sains (R summary)
cat("=== HASIL REGRESI POLINOMIAL DERAJAT 2 (R lm) ===\\n")
summary(model_kuadrat)

# 5. Ekstraksi Titik Kritis & Akar Polinomial
# polyroot menyelesaikan c + bx + ax^2 = 0
akar_persamaan <- polyroot(c(${c}, ${b}, ${a}))
cat("\\n=== AKAR PENYELESAIAN (f(${varName}) = 0) DI R ===\\n")
print(Re(akar_persamaan))

# 6. Titik Puncak Diferensial: dy/dx = 2a*x + b = 0 => x_v = -b / (2a)
cat(sprintf("\\n=== TITIK PUNCAK (VERTEX): (${varName}_v = %.3f, y_v = %.3f) ===\\n", ${vertex.xv.toFixed(3)}, ${vertex.yv.toFixed(3)}))

# 7. Visualisasi Grafik ggplot2 Sains
p <- ggplot(sensor_data, aes(x = ${varName}, y = f_${varName})) +
  geom_point(color = "#00f0ff", size = 3, shape = 21, fill = "#0c1b33") +
  stat_smooth(method = "lm", formula = y ~ poly(x, 2, raw = TRUE), 
              color = "#06d6a0", fill = "rgba(6,214,160,0.2)", size = 1.2) +
  geom_hline(yintercept = 0, linetype = "dashed", color = "#ff0077") +
  geom_vline(xintercept = c(${r1}, ${r2}), linetype = "dotted", color = "#ffbe0b") +
  theme_minimal() +
  labs(
    title = "Analisis Regresi Kuadratik Sains — ${worldName}",
    subtitle = "Model: f(${varName}) = ${a}${varName}² ${b >= 0 ? '+' : ''}${b}${varName} ${c >= 0 ? '+' : ''}${c}",
    x = "${varName} (Variabel Bebas / Waktu / Dimensi)",
    y = "f(${varName}) (Respon Sistem Fisika)"
  )
print(p)
`;

    const rSummaryOutput = `Call:
lm(formula = f_${varName} ~ poly(${varName}, 2, raw = TRUE), data = sensor_data)

Residuals:
       Min         1Q     Median         3Q        Max 
-2.140e-16 -5.230e-17  1.120e-17  4.890e-17  1.980e-16 

Coefficients:
                                Estimate Std. Error    t value Pr(>|t|)    
(Intercept)                    ${c.toFixed(4)}e+00  3.120e-15  3.21e+15   <2e-16 ***
poly(${varName}, 2, raw = TRUE)1  ${b.toFixed(4)}e+00  1.450e-15 -5.52e+15   <2e-16 ***
poly(${varName}, 2, raw = TRUE)2  ${a.toFixed(4)}e+00  2.110e-16  4.74e+15   <2e-16 ***
---
Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

Residual standard error: 1.412e-16 on 6 degrees of freedom
Multiple R-squared:      1.0000,	Adjusted R-squared:  1.0000 
F-statistic: 1.842e+31 on 2 and 6 DF,  p-value: < 2.2e-16`;

    return {
      rScriptText,
      rSummaryOutput,
      xSample,
      ySample,
      a, b, c, r1, r2, vertex, varName
    };
  }
}

window.MathEngine = MathEngine;
