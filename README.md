markdown
# 🧠 FitAI - Aplikasi Rekomendasi Meals & Workout Berbasis Gemini AI

**FitAI** adalah aplikasi berbasis Artificial Intelligence yang dirancang untuk memberikan rekomendasi personal terkait **pola makan sehat (meals)** , **program olahraga (workout)** dan **Mencari nilai gizi makanan(AI Search)**. Menggunakan kekuatan **Gemini Pro** dari Google AI, aplikasi ini mampu menyesuaikan saran berdasarkan profil fisik pengguna seperti berat badan, tinggi badan, usia, dan gender.

---

## 🔍 Fitur Utama

### 🍽️ 1. Rekomendasi Meals Berbasis AI
- AI memberikan saran makanan harian secara otomatis.
- Disesuaikan dengan kebutuhan kalori, waktu makan (pagi, siang, malam), dan kondisi tubuh pengguna.
- Output disertai alasan pemilihan menu.

### 🏋️ 2. Workout Plan Personal
- Jadwal olahraga mingguan berbasis AI.
- Penyesuaian intensitas, durasi, dan jenis latihan berdasarkan profil pengguna.
- Cocok untuk pemula hingga tingkat menengah.

### 🤖 3. Integrasi Gemini AI (Google)
- Menggunakan model `gemini-pro` untuk pemrosesan bahasa alami.
- Input dikirim dalam bentuk prompt terstruktur dan personal.
- Output dihasilkan dalam Bahasa Indonesia yang komunikatif.

---

## 🧪 Contoh Alur Kerja AI

1. Pengguna mengisi data profil:
   - Berat badan (kg)
   - Tinggi badan (cm)
   - Usia (tahun)
   - Gender

2. Sistem membentuk prompt seperti:
   text
   Bertindaklah sebagai pelatih nutrisi dan kebugaran berbasis AI. Berdasarkan informasi berikut:
   - Berat badan: 70 kg
   - Tinggi badan: 175 cm
   - Umur: 28 tahun
   - Gender: Laki-laki

   Berikan rekomendasi:
   1. Menu makanan harian (pagi, siang, malam)
   2. Rencana workout mingguan (7 hari)

   Gunakan bahasa Indonesia yang ramah.


3. Prompt dikirim ke API Gemini.
4. Hasil AI ditampilkan ke pengguna.

---

## 🛠️ Teknologi yang Digunakan

| Layer         | Teknologi                                              |
| ------------- | ------------------------------------------------------ |
| Frontend      | React.js / React Native / Next.js *(pilih salah satu)* |
| Backend       | Node.js + Express                                      |
| AI Engine     | Gemini Pro (via Google AI Studio)                      |
| API Client    | Axios                                                  |
| Prompt Engine | Prompt dinamis berbasis profil pengguna                |
| Deployment    | *(misalnya: Vercel / Netlify / Firebase Hosting)*      |

---

## 🔐 Konfigurasi API

### .env File

```env
GEMINI_API_KEY=AIzaSyB0qggp5SxQhUIW5r9WuwoU21IwJbdnY78
```

### utils/geminiApi.js

```js
import axios from "axios";

const API_KEY = process.env.GEMINI_API_KEY;
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const genAI = async (prompt) => {
  try {
    const response = await axios.post(
      `${ENDPOINT}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return "Terjadi kesalahan saat memanggil AI.";
  }
};

export default genAI;
```

---

## 🚧 Rencana Pengembangan Selanjutnya

* [ ] Integrasi login user (Auth)
* [ ] Tracking progres olahraga dan berat badan
* [ ] Fitur komunitas dan tantangan mingguan
* [ ] Dark mode & UI redesign
* [ ] Offline caching AI result

---

## 📄 Lisensi

Proyek ini bersifat privat / open-source sesuai kebutuhan. Jika digunakan ulang, harap mencantumkan kredit pada pembuat AI prompt dan API handler.

---

## ✨ Kontribusi

Pull request sangat terbuka. Silakan fork project ini, buat branch baru, dan kirim PR.

---

## 📬 Kontak

* Developer: \[Aldiansyah]
* Email: \[[arthurartoria12@gmail.com](mailto:arthurartoria12@gmail.com)]
* GitHub: \[github.com/Meephysx]

