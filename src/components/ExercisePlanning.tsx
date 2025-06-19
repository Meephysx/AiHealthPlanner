import React, { useState, useEffect } from 'react';
import { Sparkles, Loader, RefreshCw, Info } from 'lucide-react';

interface User {
  weight: number;
  height: number;
  age: number;
  gender: string;
  goal: string;
  activityLevel: string;
  dailyCalories: number; // Assuming dailyCalories is still relevant for overall health context
}

interface WorkoutPlan {
  day: string;
  focus: string;
  exercises: string[];
  duration: string;
  intensity: string;
  reasoning: string;
}

const AIWorkouts: React.FC = () => {
  const [user] = useState<User>({
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male',
    goal: 'build-muscle',
    activityLevel: 'moderate',
    dailyCalories: 2500 // Example, adjust as needed
  });

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan[] | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const generateAIWorkoutPlan = async () => {
    setIsLoadingAI(true);
    setAiError(null);

    const apiKey = "AIzaSyB0qggp5SxQhUIW5r9WuwoU21IwJbdnY78"; // Re-using the same API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `Sebagai pelatih fitness AI, buatkan rencana latihan 7 hari yang dipersonalisasi untuk pengguna berikut:\n\nPROFIL PENGGUNA:\n- Berat badan: ${user.weight} kg\n- Tinggi badan: ${user.height} cm\n- Usia: ${user.age} tahun\n- Jenis kelamin: ${user.gender}\n- Tujuan fitness: ${user.goal}\n- Tingkat aktivitas: ${user.activityLevel}\n\nINSTRUKSI:\n1. Buat rencana latihan 7 hari yang bervariasi (contoh: kardio, kekuatan, fleksibilitas, istirahat aktif)\n2. Sesuaikan dengan tujuan fitness pengguna (contoh: 'build-muscle', 'lose-weight', 'maintain-fitness')\n3. Berikan durasi dan intensitas untuk setiap sesi latihan\n4. Sertakan penjelasan singkat mengapa rencana ini cocok untuk profil pengguna\n5. Pastikan output dalam format JSON array, setiap objek mewakili satu hari latihan.\n\nFORMAT OUTPUT (JSON array saja tanpa teks tambahan):\n[\n  {\n    \"day\": \"Senin\",\n    \"focus\": \"Kardio Ringan\",\n    \"exercises\": [\"Jalan cepat 30 menit\", \"Jogging ringan 15 menit\"],\n    \"duration\": \"45 menit\",\n    \"intensity\": \"Rendah hingga Sedang\",\n    \"reasoning\": \"Memulai minggu dengan meningkatkan detak jantung dan sirkulasi.\"\n  },\n  {\n    \"day\": \"Selasa\",\n    \"focus\": \"Latihan Kekuatan Tubuh Atas\",\n    \"exercises\": [\"Push-up (3 set x 10 repetisi)\", \"Pull-up (3 set x 8 repetisi)\", \"Dumbbell Shoulder Press (3 set x 12 repetisi)\"],\n    \"duration\": \"60 menit\",\n    \"intensity\": \"Sedang hingga Tinggi\",\n    \"reasoning\": \"Membangun massa otot dan kekuatan di tubuh bagian atas.\"\n  }\n  // ... tambahkan 5 hari lainnya sesuai format
]\n`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!text) {
        throw new Error("No response text from AI for workout plan");
      }

      let cleanedText = text.trim();
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\s*\n?/, '').replace(/\n?\s*```/, '');
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```\s*\n?/, '').replace(/\n?\s*```/, '');
      }

      const jsonStart = cleanedText.indexOf('[');
      const jsonEnd = cleanedText.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }

      console.log('AI Workout Plan Response:', cleanedText); // Debug log

      const plan: WorkoutPlan[] = JSON.parse(cleanedText);
      setWorkoutPlan(plan);

    } catch (error) {
      console.error('Error generating AI workout plan:', error);
      setAiError(`Gagal menghasilkan rencana latihan: ${error.message}`);
      // Fallback with sample data if AI fails
      setWorkoutPlan([
        {
          day: "Senin",
          focus: "Kardio Ringan",
          exercises: ["Jalan cepat 30 menit", "Jogging ringan 15 menit"],
          duration: "45 menit",
          intensity: "Rendah hingga Sedang",
          reasoning: "Memulai minggu dengan meningkatkan detak jantung dan sirkulasi."
        },
        {
          day: "Selasa",
          focus: "Latihan Kekuatan Tubuh Atas",
          exercises: ["Push-up (3 set x 10 repetisi)", "Pull-up (3 set x 8 repetisi)", "Dumbbell Shoulder Press (3 set x 12 repetisi)"],
          duration: "60 menit",
          intensity: "Sedang hingga Tinggi",
          reasoning: "Membangun massa otot dan kekuatan di tubuh bagian atas."
        },
        {
          day: "Rabu",
          focus: "Latihan Kekuatan Tubuh Bawah",
          exercises: ["Squat (3 set x 12 repetisi)", "Lunges (3 set x 10 repetisi per kaki)", "Deadlift (3 set x 8 repetisi)"],
          duration: "60 menit",
          intensity: "Sedang hingga Tinggi",
          reasoning: "Memperkuat otot kaki dan inti untuk stabilitas dan kekuatan."
        },
        {
          day: "Kamis",
          focus: "Fleksibilitas & Keseimbangan",
          exercises: ["Yoga (30 menit)", "Peregangan statis (15 menit)"],
          duration: "45 menit",
          intensity: "Rendah",
          reasoning: "Meningkatkan jangkauan gerak dan mengurangi risiko cedera."
        },
        {
          day: "Jumat",
          focus: "Kardio Intensitas Sedang",
          exercises: ["Bersepeda 45 menit", "Renang 30 menit"],
          duration: "45-60 menit",
          intensity: "Sedang",
          reasoning: "Meningkatkan daya tahan kardiovaskular."
        },
        {
          day: "Sabtu",
          focus: "Latihan Fungsional & Inti",
          exercises: ["Plank (3 set x 60 detik)", "Burpees (3 set x 10 repetisi)", "Russian Twists (3 set x 15 repetisi per sisi)"],
          duration: "40 menit",
          intensity: "Sedang",
          reasoning: "Meningkatkan kekuatan inti dan fungsional untuk aktivitas sehari-hari."
        },
        {
          day: "Minggu",
          focus: "Istirahat Aktif / Pemulihan",
          exercises: ["Jalan santai 30 menit", "Peregangan ringan"],
          duration: "30-45 menit",
          intensity: "Sangat Rendah",
          reasoning: "Memungkinkan tubuh pulih sambil tetap aktif."
        }
      ]);
      setAiError("Menggunakan rencana latihan cadangan. Coba perbarui untuk mendapatkan rekomendasi AI terbaru.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    generateAIWorkoutPlan();
  }, [user]); // Regenerate plan if user profile changes

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Program Latihan AI</h1>
            <p className="text-gray-600 mt-2">Rencana latihan personal untuk mencapai tujuan fitness Anda</p>
          </div>
          <button
            onClick={generateAIWorkoutPlan}
            disabled={isLoadingAI}
            className="flex items-center px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingAI ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Perbarui Rencana Latihan AI
          </button>
        </div>

        {aiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {aiError}</span>
          </div>
        )}

        {isLoadingAI && !workoutPlan && (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 text-purple-500 animate-spin mr-3" />
            <p className="text-lg text-gray-600">Menghasilkan rencana latihan AI...</p>
          </div>
        )}

        {workoutPlan && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutPlan.map((dayPlan, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{dayPlan.day} - {dayPlan.focus}</h2>
                <p className="text-sm text-gray-600 mb-3">Durasi: {dayPlan.duration} | Intensitas: {dayPlan.intensity}</p>
                <ul className="list-disc list-inside text-gray-700 mb-4">
                  {dayPlan.exercises.map((exercise, exIndex) => (
                    <li key={exIndex}>{exercise}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500">Alasan: {dayPlan.reasoning}</p>
              </div>
            ))}
          </div>
        )}

        {!workoutPlan && !isLoadingAI && !aiError && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
            <p>Tekan tombol 'Perbarui Rencana Latihan AI' untuk mendapatkan rencana latihan personal Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWorkouts;


