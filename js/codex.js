/* ==========================================================================
   QUADRA — Quadra Codex (Math & Quadratic Knowledge Base)
   Interactive Encyclopedia of Quadratic Equations, Real-World Modeling,
   Discriminant, Factorization, ABC Formula, and Vertex Extrema.
   ========================================================================== */

const CODEX_ARTICLES = [
  {
    title: 'Bentuk Umum Persamaan Kuadrat',
    icon: '📜',
    formula: 'ax² + bx + c = 0  (dengan a ≠ 0)',
    content: `
      <p>Persamaan kuadrat adalah persamaan polinomial berderajat dua. Karakteristik utamanya adalah adanya variabel dengan pangkat tertinggi 2.</p>
      <ul>
        <li><code>a</code> = Koefisien kuadrat (menentukan kelengkungan parabola). Jika <code>a > 0</code> parabola terbuka ke atas; jika <code>a < 0</code> terbuka ke bawah.</li>
        <li><code>b</code> = Koefisien linier (mempengaruhi posisi sumbu simetri).</li>
        <li><code>c</code> = Konstanta (titik potong grafik dengan sumbu Y).</li>
      </ul>
    `
  },
  {
    title: 'Makna Akar Persamaan di Dunia Nyata',
    icon: '🌱',
    formula: 'f(x) = 0 ⟹ Titik Potong Sumbu X',
    content: `
      <p>Akar persamaan kuadrat bukan sekadar angka abstrak di atas kertas. Di dunia Quadra dan dunia nyata:</p>
      <ul>
        <li>🏀 <strong>Olahraga:</strong> Waktu ketika bola basket berada pada ketinggian tertentu.</li>
        <li>🚀 <strong>Antariksa:</strong> Waktu ketika roket menyentuh tanah kembali setelah terbang tinggi.</li>
        <li>🏎️ <strong>Balap Mobil:</strong> Jarak meter di mana kendaraan mendarat setelah melompati jurang rintangan.</li>
        <li>🏗️ <strong>Konstruksi:</strong> Dimensi ukuran panjang dan lebar lahan tanah.</li>
      </ul>
    `
  },
  {
    title: 'Faktorisasi Kilat (Factor Mode)',
    icon: '⚡',
    formula: 'x² + bx + c = (x + p)(x + q) = 0',
    content: `
      <p>Strategi tercepat ketika persamaan memiliki koefisien <code>a = 1</code> dan akar-akar bulat sederhana.</p>
      <p><strong>Langkah:</strong></p>
      <ul>
        <li>Cari dua bilangan <code>p</code> dan <code>q</code> sedemikian sehingga:</li>
        <li><code>p × q = c</code> (hasil kali sama dengan konstanta)</li>
        <li><code>p + q = b</code> (hasil jumlah sama dengan koefisien tengah)</li>
        <li>Maka akar-akarnya adalah <code>x₁ = -p</code> dan <code>x₂ = -q</code>.</li>
      </ul>
    `
  },
  {
    title: 'Rumus ABC & Diskriminan (D)',
    icon: '📐',
    formula: 'x = (-b ± √D) / 2a  di mana  D = b² - 4ac',
    content: `
      <p>Rumus ABC adalah rumus universal yang selalu berhasil untuk semua persamaan kuadrat, bahkan ketika faktorisasi sulit dilakukan.</p>
      <ul>
        <li><strong>D > 0:</strong> Parabola memotong sumbu X di <strong>2 titik berbeda</strong> (2 akar riil).</li>
        <li><strong>D = 0:</strong> Parabola menyinggung sumbu X di <strong>1 titik puncak</strong> (akar kembar).</li>
        <li><strong>D < 0:</strong> Parabola mengapung tanpa menyentuh sumbu X (tidak memiliki akar riil).</li>
      </ul>
    `
  },
  {
    title: 'Titik Puncak Parabola (Vertex)',
    icon: '👑',
    formula: 'x_puncak = -b / (2a) ,  y_puncak = f(x_puncak)',
    content: `
      <p>Parabola selalu memiliki satu titik ekstrim tertinggi (Maksimum) atau terendah (Minimum).</p>
      <ul>
        <li>💰 <strong>Bisnis & Keuangan:</strong> Digunakan untuk menentukan harga produk yang menghasilkan keuntungan maksimal.</li>
        <li>🏟️ <strong>Arsitektur:</strong> Menghitung ketinggian maksimum lengkungan atap kubah stadion atau kabel jembatan gantung.</li>
      </ul>
    `
  },
  {
    title: 'Strategi Memilih Metode Penyelesaian',
    icon: '🧠',
    formula: 'Scan Pola ⟹ Pilih Metode Paling Efisien',
    content: `
      <p>Di Dunia Quadra, Problem Solver yang cerdas tidak hanya menghafal satu rumus, tetapi tahu kapan metode tertentu lebih unggul:</p>
      <ul>
        <li>Jika <code>a = 1</code> dan <code>D</code> kuadrat sempurna ⟹ <strong>Gunakan Faktorisasi Cepat</strong> (+Fast Solver Bonus!).</li>
        <li>Jika koefisien rumit / pecahan / desimal ⟹ <strong>Gunakan Rumus ABC</strong>.</li>
        <li>Jika ditanya nilai tertinggi / terendah / optimasi ⟹ <strong>Gunakan Titik Puncak (Vertex)</strong>.</li>
      </ul>
    `
  }
];

class CodexSystem {
  static renderArticles(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    CODEX_ARTICLES.forEach(art => {
      const card = document.createElement('div');
      card.className = 'codex-article';
      card.innerHTML = `
        <h3><span>${art.icon}</span> ${art.title}</h3>
        <div class="codex-formula-tag">${art.formula}</div>
        ${art.content}
      `;
      containerEl.appendChild(card);
    });
  }
}

window.CodexSystem = CodexSystem;
