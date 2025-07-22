# Gemini Deliberative Council (Cloud Run BYOK Proxy)

Aplikasi ini telah direfaktor untuk arsitektur hibrida: aplikasi full-stack yang aman dan dapat di-deploy ke Google Cloud Run, tetapi tetap mempertahankan fungsionalitas **Bring Your Own Key (BYOK)**.

## Arsitektur (Proxy Cerdas)

- **Backend (Node.js/Express):** Berjalan di Cloud Run. Server ini **TIDAK** menyimpan API key. Sebaliknya, ia bertindak sebagai **proxy**.
- **Frontend (React/Vite):** Pengguna memasukkan API key mereka di UI. Ketika pengguna mengirim pesan, frontend mengirimkan prompt **DAN** API key pengguna ke backend.
- **Alur Permintaan:**
  1.  Pengguna -> Frontend (memasukkan key & prompt)
  2.  Frontend -> Backend di Cloud Run (mengirim `{ prompt, apiKey }`)
  3.  Backend -> Google Gemini API (menggunakan key pengguna secara temporer)
  4.  Google Gemini API -> Backend
  5.  Backend -> Frontend (mengirimkan hasil)
  6.  Frontend -> Pengguna (menampilkan hasil)

Arsitektur ini memberikan keamanan dan skalabilitas Cloud Run, sambil memastikan biaya penggunaan model tetap ditanggung oleh pengguna akhir.

---

## Prasyarat

- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (opsional, untuk deployment)
- Akun Google Cloud dengan penagihan aktif (opsional, untuk deployment)

---

## Menjalankan Secara Lokal

1.  **Install Dependensi:**
    ```bash
    npm install
    ```

2.  **Jalankan Server Pengembangan:**
    Server akan secara otomatis menangani frontend dan backend. Tidak perlu API key di sisi server.
    ```bash
    npm run dev
    ```

3.  Buka [http://localhost:8080](http://localhost:8080) di browser Anda. Aplikasi akan meminta API Key Anda untuk digunakan.

---

## Deployment ke Google Cloud Run

1.  **Login ke gcloud:**
    ```bash
    gcloud auth login
    gcloud config set project [YOUR_PROJECT_ID]
    ```

2.  **Bangun Container Image:**
    Ganti `[YOUR_PROJECT_ID]` dengan ID Proyek Google Cloud Anda.
    ```bash
    gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/gemini-council-proxy
    ```

3.  **Deploy ke Cloud Run:**
    Perintah ini mendeploy image Anda ke Cloud Run. **Tidak perlu menyetel variabel API_KEY** karena server tidak menyimpannya.
    ```bash
    gcloud run deploy gemini-council-proxy \
      --image gcr.io/[YOUR_PROJECT_ID]/gemini-council-proxy \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```
    
    Setelah deployment selesai, gcloud CLI akan memberikan URL publik tempat aplikasi Anda berjalan. Pengguna yang mengunjungi URL ini akan diminta untuk memasukkan API key mereka sendiri.