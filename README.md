# Gemini Deliberative Council (Evo 0.3.4)

Project ini adalah sebuah aplikasi web antarmuka chat yang memanfaatkan kekuatan model AI generatif dari Google, Gemini. Aplikasi ini mengimplementasikan konsep "Dewan Musyawarah" (Deliberative Council) di mana beberapa persona AI dengan peran berbeda berkolaborasi untuk menghasilkan jawaban yang komprehensif dan telah ditinjau dari berbagai sudut pandang.

## ✨ Fitur Utama

-   **Antarmuka Chat Interaktif**: UI yang bersih dan responsif untuk berkomunikasi dengan AI.
-   **Dewan Musyawarah AI**: Sebuah sistem multi-agen di mana beberapa persona AI (seperti Al-Khatib, Al-Faqih, Al-Hypothesis) berdebat dan berkolaborasi untuk membentuk satu jawaban akhir.
-   **Orkestrasi Proses**: Logika backend-for-frontend yang mengelola alur musyawarah, mulai dari input pengguna hingga respons final.
-   **Visualisasi Proses**: Menampilkan status dan pernyataan dari setiap persona AI selama proses musyawarah.
-   **Dukungan Penuh Markdown**: Respons dari AI dapat diformat menggunakan Markdown untuk keterbacaan yang lebih baik.

## 🚀 Teknologi yang Digunakan

-   **Frontend**: [React](https://react.dev/) & [Vite](https://vitejs.dev/)
-   **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
-   **Model AI**: [Google Gemini API](https://ai.google.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🛠️ Instalasi dan Menjalankan Proyek

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut.

### 1. Prasyarat

-   [Node.js](https://nodejs.org/en) (versi 18 atau lebih baru)
-   [npm](https://www.npmjs.com/) (biasanya terinstal bersama Node.js)
-   Kunci API Google Gemini. Anda bisa mendapatkannya dari [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Kloning Repositori

```bash
git clone https://github.com/nama-pengguna-anda/gemini-deliberative-council.git
cd gemini-deliberative-council
```

### 3. Instalasi Dependensi

Instal semua paket yang dibutuhkan menggunakan npm.

```bash
npm install
```

### 4. Konfigurasi Lingkungan

Buat file `.env.local` di direktori root proyek. File ini akan menyimpan kunci API Anda dengan aman.

```bash
touch .env.local
```

Buka file `.env.local` dan tambahkan variabel berikut:

```
GEMINI_API_KEY=KUNCI_API_ANDA_DI_SINI
```

Ganti `KUNCI_API_ANDA_DI_SINI` dengan kunci API Google Gemini Anda.

### 5. Jalankan Aplikasi

Setelah konfigurasi selesai, jalankan server pengembangan Vite.

```bash
npm run dev
```

Aplikasi akan tersedia di `http://localhost:5173` (atau port lain jika 5173 sudah digunakan).

## 📂 Struktur Proyek

Berikut adalah gambaran singkat tentang struktur direktori utama:

```
/
├── public/               # Aset statis
├── src/
│   ├── components/       # Komponen React (UI)
│   ├── services/         # Logika bisnis dan interaksi API
│   │   ├── DebateManager.ts # Logika inti untuk proses musyawarah
│   │   ├── orchestrator.ts  # Menghubungkan UI dengan logika bisnis
│   │   └── geminiService.ts   # Berinteraksi langsung dengan Gemini API
│   ├── App.tsx             # Komponen utama aplikasi
│   └── index.tsx           # Titik masuk aplikasi React
├── .env.local            # File konfigurasi lingkungan (dibuat manual)
├── package.json          # Dependensi dan skrip proyek
└── README.md             # Anda sedang membacanya
```

## 📄 Lisensi

Proyek ini dilisensikan di bawah [LICENSE](LICENSE) yang tersedia.
