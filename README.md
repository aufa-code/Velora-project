# 🎓 Velora — Adaptive AI Learning Platform

> Platform belajar adaptif berbasis AI yang menyesuaikan materi, kuis, dan gaya belajar setiap murid secara personal.

---

## 🌐 Alamat Aplikasi

| Layanan | URL |
| --- | --- |
| **Aplikasi (Frontend)** | https://velora-frontend-phi.vercel.app |
| **API / Backend** | https://velora-project-98ar.vercel.app |
| **Dokumentasi API (Swagger)** | https://velora-project-98ar.vercel.app/docs |

> 💡 Aplikasi juga bisa **di-install seperti aplikasi (PWA)** langsung dari browser Chrome.

---

## 👥 Tim Pengembang

| Nama | NIM | Program Studi |
| --- | --- | --- |
| **Aufa Putra Satrio** | 24.01.53.0029 | Teknik Informatika |
| **Aditya Nugroho** | 24.01.53.0028 | Teknik Informatika |

**Universitas Stikubank (UNISBANK) Semarang — 2026**

---

## 📖 Tentang Velora

Velora adalah platform pembelajaran adaptif yang memanfaatkan Large Language Model (LLM) untuk membantu murid belajar secara personal. Murid cukup memasukkan materi & tujuan belajar, lalu Velora bertindak sebagai tutor AI yang menjelaskan materi, membuat kuis, melacak progres, dan menjaga motivasi lewat sistem gamifikasi.

---

## ✨ Fitur Utama

- 💬 **Tutor AI Adaptif** — chat belajar interaktif dengan penjelasan yang menyesuaikan pemahaman murid.
- 🎤 **Voice Mode** — belajar hands-free: bicara langsung ke Velora & jawaban dibacakan dengan suara (Bahasa Indonesia).
- 🎯 **Kuis & Flashcard** — soal pilihan ganda + flashcard otomatis dengan 3 tingkat kesulitan (Mudah / Sedang / Sulit).
- 🔁 **Spaced Repetition** — jadwal review otomatis (metode SM-2) supaya materi nempel jangka panjang.
- 📊 **Progress Tracking** — dashboard progres belajar per topik.
- 🎮 **Gamifikasi** — XP, level, streak harian, dan badge pencapaian untuk menjaga motivasi.
- 📄 **Import Materi (PDF)** — upload PDF, AI otomatis merangkum jadi topik + bahan kuis.
- 📱 **PWA** — bisa di-install & dipakai layaknya aplikasi native.

---

## 🛠️ Teknologi

**Frontend**
- React 19 (Create React App) + React Router
- Axios
- Progressive Web App (Service Worker + Manifest)

**Backend**
- Python + FastAPI
- Groq API — model `openai/gpt-oss-120b` (inferensi LLM)
- pypdf (ekstraksi teks PDF)

**Database & Deployment**
- Supabase (PostgreSQL)
- Vercel (hosting frontend & backend)

---

## 📁 Struktur Proyek

```
Velora-project/
├── api/                # Entry point FastAPI (main.py)
├── backend/
│   ├── routes/         # Endpoint: setup, session, progress, quiz, reviews, stats, materi
│   ├── services/       # Integrasi Groq & prompt builder
│   └── database/       # Koneksi Supabase
├── frontend/           # Aplikasi React (PWA)
│   ├── public/         # manifest.json, service-worker.js
│   └── src/pages/      # Setup, Session, Dashboard, Quiz, Review, Gamifikasi, ImportMateri
├── requirements.txt    # Dependency Python
└── vercel.json         # Konfigurasi deployment
```

---

## 🚀 Menjalankan Secara Lokal

### Backend
```bash
pip install -r requirements.txt
uvicorn api.main:app --reload
```
Buat file `.env`:
```
GROQ_API_KEY=your_groq_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Buat file `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000
```

---

## 🖼️ Poster

Softcopy poster proyek tersedia di repository ini: [`poster_velora.png`](./poster_velora.png)

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan tugas akademik di Universitas Stikubank (UNISBANK) Semarang, 2026.
