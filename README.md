# 🪐 QUADRA — The Quadratic World
### ⚡ 256-Bit Ultra High-Fidelity Mathematical Problem Solver Adventure

> **Game edukasi matematika interaktif berbasis web (browser) yang mengubah konsep abstrak Persamaan Kuadrat menjadi petualangan pemecahan masalah dunia nyata dengan simulasi fisika 60 FPS.**

---

## 🎮 Fitur Utama Game

1. **7 Level Dunia Petualangan Interaktif**:
   - 🌾 **Level 01: Quadratic Village** — Pengenalan Bentuk Standar & Akar Kalibrasi Frekuensi Kristal ($ax^2 + bx + c = 0$).
   - 🏀 **Level 02: Sports City** — Pemodelan Lintasan Gerak Parabola Bola Basket ($h(t) = -5t^2 + v_0t + h_0$).
   - 🏗️ **Level 03: Building City** — Geometri Luas Lahan & Optimasi Dimensi Konstruksi.
   - 🚀 **Level 04: Space Center** — Durasi Peluncuran & Pendaratan Roket Antariksa.
   - 💰 **Level 05: Business City** — Pemodelan Kurva Elastisitas Permintaan & Titik Laba Maksimum.
   - 🏎️ **Level 06: Racing City** — Prediksi Jarak Pendaratan Akrobatik Mobil Balap.
   - 🏛️ **Level 07: Stadium Architecture** — Arsitektur Kubah Parabola & Distribusi Beban Atap.

2. **🧠 Multi-Metode Matematika Lengkap**:
   - ⚡ **Faktorisasi Cepat (Pemfaktoran)**: Mencari pasangan faktor $(x + p)(x + q) = 0$.
   - 📐 **Rumus ABC (Universal Formula)**: Menghitung diskriminan $D = b^2 - 4ac$ dan akar $x = \frac{-b \pm \sqrt{D}}{2a}$.
   - 📈 **Analisis Titik Puncak (Vertex)**: Menemukan sumbu simetri $x_v = -\frac{b}{2a}$ dan nilai optimum $y_v$.
   - 🔄 **Melengkapkan Kuadrat Sempurna**: Penurunan aljabar murni dasar rumus kuadrat.

3. **📡 Telemetri Fisika & Statistik 256-Bit**:
   - Titik Fokus Optik Parabola: $F\left(x_v, y_v + \frac{1}{4a}\right)$
   - Kelengkungan Kurva: $\kappa = |2a|\text{ rad/m}$
   - Garis Direktris: $y = y_v - \frac{1}{4a}$
   - Gradien Diferensial Stasioner: $\frac{dy}{dx} = 2ax + b = 0$
   - Koefisien Determinasi Model: $R^2 = 1.000\text{ (Exact Fit)}$

4. **🎲 Generator Soal Acak Tak Terbatas**:
   - Tombol **"Acak Soal Baru"** menghasilkan variasi soal tanpa henti dengan jaminan akar bilangan bulat yang memenuhi kondisi persamaan $= 0$.

5. **🧪 Lab Sandbox Parabola & Quadra Codex**:
   - Eksperimen bebas mengubah slider koefisien $a, b, c$ secara *real-time*.
   - Ensiklopedia konsep matematika lengkap di dalam game.

6. **📱 100% Responsif di Seluruh Perangkat**:
   - Lancar dimainkan di Desktop, Laptop, Tablet, maupun Smartphone (Portrait & Landscape).

---

## 🚀 Cara Menjalankan Game

Game ini dibuat dengan murni HTML5 Canvas, Vanilla JavaScript ES6, dan CSS3 modern tanpa dependensi berat.

### Opsi 1: Langsung Buka di Browser
Cukup klik ganda atau buka file `index.html` di browser apa pun (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Opsi 2: Menggunakan Local Server (Opsional)
```bash
# Menggunakan Python
python -m http.server 8080

# Lalu buka di browser:
http://localhost:8080/index.html
```

### Opsi 3: GitHub Pages
Aktifkan **GitHub Pages** pada repositori ini di menu *Settings > Pages > Branch: main / root* untuk memainkannya secara online gratis.

---

## 📁 Struktur Direktori

```text
Game_matematika_persamaan_kuadrat/
├── index.html            # File utama aplikasi & markup semantik
├── README.md             # Dokumentasi proyek
├── book.txt              # Dokumen desain & referensi game
├── css/
│   ├── style.css         # Layout utama, tema CRT, navigasi & responsive grid
│   └── retro-ui.css      # Komponen UI 256-bit, HUD kanvas, keypad virtual & modal
└── js/
    ├── audio.js          # Web Audio API Synthesizer (BGM & efek suara SFX)
    ├── math_engine.js    # Mesin matematika, kalkulus, telemetri & pembuktian multi-metode
    ├── game_data.js      # Template 7 level dunia, dialog NPC & quest generator
    ├── particles.js      # Sistem partikel 256-bit (laser trail, aura kristal, koin)
    ├── renderer.js       # Engine render kanvas 2D, fisika proyektil & trajektori
    ├── solver_ui.js      # Controller papan hitung, stepper angka & scanner AI
    ├── codex.js          # Controller ensiklopedia rumus Quadra Codex
    ├── sandbox.js        # Controller laboratorium eksperimen kurva parabola
    └── game.js           # Master game loop, state management & screen transitions
```

---

## 📜 Lisensi & Kredit
Dibuat dengan ❤️ untuk pendidikan matematika interaktif dan sains data.
