const GEMINI_API_KEY = 'AIzaSyB0qggp5SxQhUIW5r9WuwoU21IwJbdnY78';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface PersonalizedRecommendations {
  meals: {
    breakfast: {
      menu: string;
      calories: number;
      portions: string;
      time: string;
      reasoning: string;
    };
    lunch: {
      menu: string;
      calories: number;
      portions: string;
      time: string;
      reasoning: string;
    };
    dinner: {
      menu: string;
      calories: number;
      portions: string;
      time: string;
      reasoning: string;
    };
    totalCalories: number;
    generalReasoning: string;
  };
  workout: {
    weeklyPlan: Array<{
      day: string;
      exercises: string;
      duration: string;
      intensity: string;
      focus: string;
    }>;
    generalReasoning: string;
    tips: string;
  };
}

export const generatePersonalizedRecommendations = async (
  weight: number,
  height: number,
  age: number,
  gender: string,
  goal: string,
  activityLevel: string
): Promise<PersonalizedRecommendations> => {
  const prompt = `
Bertindaklah sebagai pelatih nutrisi dan kebugaran berbasis AI yang sangat berpengalaman. Berdasarkan informasi berikut:

- Berat badan: ${weight} kg  
- Tinggi badan: ${height} cm  
- Umur: ${age} tahun  
- Gender: ${gender}
- Tujuan: ${goal === 'weight-loss' ? 'menurunkan berat badan' : goal === 'weight-gain' ? 'menaikkan berat badan' : 'membangun otot'}
- Tingkat aktivitas: ${activityLevel}

Berikan rekomendasi yang sangat personal dalam format JSON yang tepat:

{
  "meals": {
    "breakfast": {
      "menu": "Nama menu sarapan lengkap dengan bahan-bahan",
      "calories": 400,
      "portions": "Ukuran porsi yang tepat",
      "time": "07:00 - 08:00",
      "reasoning": "Alasan mengapa menu ini cocok untuk profil user"
    },
    "lunch": {
      "menu": "Nama menu makan siang lengkap",
      "calories": 500,
      "portions": "Ukuran porsi yang tepat",
      "time": "12:00 - 13:00",
      "reasoning": "Alasan pemilihan menu ini"
    },
    "dinner": {
      "menu": "Nama menu makan malam lengkap",
      "calories": 450,
      "portions": "Ukuran porsi yang tepat",
      "time": "18:00 - 19:00",
      "reasoning": "Alasan menu malam ini optimal"
    },
    "totalCalories": 1350,
    "generalReasoning": "Penjelasan umum mengapa kombinasi makanan ini cocok untuk profil user"
  },
  "workout": {
    "weeklyPlan": [
      {
        "day": "Senin",
        "exercises": "Jenis latihan yang spesifik",
        "duration": "30-45 menit",
        "intensity": "Sedang/Tinggi/Rendah",
        "focus": "Area tubuh atau tujuan latihan"
      }
    ],
    "generalReasoning": "Mengapa program latihan ini efektif untuk profil user",
    "tips": "Tips tambahan untuk memaksimalkan hasil"
  }
}

PENTING: 
- Berikan 7 hari workout plan lengkap
- Gunakan makanan Indonesia yang mudah didapat
- Sesuaikan kalori dengan kebutuhan BMR user
- Berikan alasan ilmiah tapi mudah dipahami
- Gunakan bahasa Indonesia yang ramah dan komunikatif
- Pastikan output adalah JSON yang valid
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    return recommendations;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Fallback recommendations if API fails
    return getFallbackRecommendations(weight, height, age, gender, goal);
  }
};

const getFallbackRecommendations = (
  weight: number,
  height: number,
  age: number,
  gender: string,
  goal: string
): PersonalizedRecommendations => {
  const bmr = gender === 'male' 
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;
  
  const targetCalories = Math.round(bmr * 1.5);

  return {
    meals: {
      breakfast: {
        menu: "Oatmeal dengan pisang dan kacang almond",
        calories: Math.round(targetCalories * 0.25),
        portions: "1 mangkuk sedang (80g oats, 1 pisang, 15g almond)",
        time: "07:00 - 08:00",
        reasoning: "Memberikan energi berkelanjutan untuk memulai hari dengan serat dan protein yang cukup"
      },
      lunch: {
        menu: "Nasi merah dengan ayam panggang dan sayur bayam",
        calories: Math.round(targetCalories * 0.35),
        portions: "1 piring (100g nasi merah, 120g ayam, 150g bayam)",
        time: "12:00 - 13:00",
        reasoning: "Kombinasi karbohidrat kompleks dan protein tinggi untuk energi siang hari"
      },
      dinner: {
        menu: "Ikan salmon panggang dengan kentang rebus dan brokoli",
        calories: Math.round(targetCalories * 0.30),
        portions: "1 porsi (150g salmon, 100g kentang, 100g brokoli)",
        time: "18:00 - 19:00",
        reasoning: "Omega-3 dan protein untuk pemulihan otot, karbohidrat untuk energi malam"
      },
      totalCalories: targetCalories,
      generalReasoning: "Menu dirancang untuk memberikan nutrisi seimbang sesuai kebutuhan kalori harian Anda"
    },
    workout: {
      weeklyPlan: [
        {
          day: "Senin",
          exercises: "Cardio ringan (jalan cepat/jogging)",
          duration: "30 menit",
          intensity: "Sedang",
          focus: "Kardiovaskular"
        },
        {
          day: "Selasa",
          exercises: "Latihan kekuatan (push-up, squat, plank)",
          duration: "25 menit",
          intensity: "Sedang",
          focus: "Kekuatan tubuh"
        },
        {
          day: "Rabu",
          exercises: "Yoga atau stretching",
          duration: "20 menit",
          intensity: "Rendah",
          focus: "Fleksibilitas"
        },
        {
          day: "Kamis",
          exercises: "Cardio interval",
          duration: "25 menit",
          intensity: "Tinggi",
          focus: "Pembakaran kalori"
        },
        {
          day: "Jumat",
          exercises: "Latihan kekuatan (dumbbell/resistance)",
          duration: "30 menit",
          intensity: "Sedang",
          focus: "Pembentukan otot"
        },
        {
          day: "Sabtu",
          exercises: "Aktivitas outdoor (bersepeda/hiking)",
          duration: "45 menit",
          intensity: "Sedang",
          focus: "Endurance"
        },
        {
          day: "Minggu",
          exercises: "Istirahat atau yoga ringan",
          duration: "15 menit",
          intensity: "Rendah",
          focus: "Pemulihan"
        }
      ],
      generalReasoning: "Program latihan dirancang bertahap untuk membangun stamina dan kekuatan secara konsisten",
      tips: "Mulai dengan intensitas rendah dan tingkatkan secara bertahap. Jangan lupa pemanasan dan pendinginan."
    }
  };
};

export const generateSmartFoodSearch = async (query: string, userProfile: any): Promise<string> => {
  const prompt = `
Sebagai ahli nutrisi AI, jawab pertanyaan berikut dengan detail dan praktis:

Pertanyaan: "${query}"

Profil user:
- Berat: ${userProfile.weight}kg
- Tinggi: ${userProfile.height}cm  
- Umur: ${userProfile.age} tahun
- Gender: ${userProfile.gender}
- Tujuan: ${userProfile.goal}

Berikan jawaban dalam bahasa Indonesia yang:
1. Langsung menjawab pertanyaan
2. Memberikan rekomendasi makanan spesifik dengan porsi
3. Menjelaskan alasan nutrisi di balik rekomendasi
4. Disesuaikan dengan profil dan tujuan user

Jawaban maksimal 200 kata, gunakan bahasa yang ramah dan mudah dipahami.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300,
        }
      })
    });

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'Maaf, tidak dapat memproses pertanyaan Anda saat ini.';

  } catch (error) {
    console.error('Error in smart food search:', error);
    return 'Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi.';
  }
};