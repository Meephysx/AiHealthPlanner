import React, { useState, useEffect } from 'react';
import { Plus, Clock, ChevronLeft, ChevronRight, Check, Sparkles, Info, Loader, RefreshCw } from 'lucide-react';

// Sample foods data
const SAMPLE_FOODS = [
  {
    id: '1',
    name: 'Nasi Merah dengan Ayam Bakar',
    calories: 450,
    protein: 35,
    carbs: 45,
    fat: 12,
    servingSize: '1 porsi'
  },
  {
    id: '2',
    name: 'Salad Sayuran dengan Tahu',
    calories: 280,
    protein: 15,
    carbs: 25,
    fat: 8,
    servingSize: '1 mangkuk'
  },
  {
    id: '3',
    name: 'Smoothie Pisang Protein',
    calories: 320,
    protein: 25,
    carbs: 35,
    fat: 8,
    servingSize: '1 gelas'
  },
  {
    id: '4',
    name: 'Ikan Salmon Panggang',
    calories: 380,
    protein: 40,
    carbs: 5,
    fat: 18,
    servingSize: '150g'
  },
  {
    id: '5',
    name: 'Oatmeal dengan Buah',
    calories: 300,
    protein: 12,
    carbs: 45,
    fat: 8,
    servingSize: '1 mangkuk'
  }
];

// Types
interface User {
  weight: number;
  height: number;
  age: number;
  gender: string;
  goal: string;
  activityLevel: string;
  dailyCalories: number;
}

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

interface AIMealPlan {
  breakfast: {
    menu: string;
    calories: number;
    time: string;
    reasoning: string;
    portions: string;
  };
  lunch: {
    menu: string;
    calories: number;
    time: string;
    reasoning: string;
    portions: string;
  };
  dinner: {
    menu: string;
    calories: number;
    time: string;
    reasoning: string;
    portions: string;
  };
  snacks?: {
    menu: string;
    calories: number;
    time: string;
    reasoning: string;
    portions: string;
  };
  totalCalories: number;
  nutritionTips?: string;
  hydrationGoal?: string;
}

const MealPlanning: React.FC = () => {
  // Default user for demo purposes
  const [user] = useState<User>({
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male',
    goal: 'maintain-weight',
    activityLevel: 'moderate',
    dailyCalories: 2200
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');
  const [aiMealPlan, setAiMealPlan] = useState<AIMealPlan | null>(null);
  const [consumedFoods, setConsumedFoods] = useState<string[]>([]);
  const [customMealPlan, setCustomMealPlan] = useState({
    breakfast: [] as Food[],
    lunch: [] as Food[],
    dinner: [] as Food[],
    snacks: [] as Food[]
  });
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [showAiRecommendations, setShowAiRecommendations] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  useEffect(() => {
    // Load consumed foods for current date
    const dateKey = formatDateKey(currentDate);
    const savedConsumed = JSON.parse(localStorage.getItem(`consumed-${dateKey}`) || '[]');
    setConsumedFoods(savedConsumed);
  }, [currentDate]);

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // AI Meal Plan Generation using your existing API
  const generateAIMealPlan = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    
    const apiKey = "AIzaSyB0qggp5SxQhUIW5r9WuwoU21IwJbdnY78";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Enhanced prompt for better meal planning
    const prompt = `Sebagai ahli nutrisi AI, buatkan rencana makan sehat dan lengkap untuk 1 hari penuh dengan profil pengguna berikut:\n\nPROFIL PENGGUNA:\n- Berat badan: ${user.weight} kg\n- Tinggi badan: ${user.height} cm  \n- Usia: ${user.age} tahun\n- Jenis kelamin: ${user.gender}\n- Tujuan fitness: ${user.goal}\n- Tingkat aktivitas: ${user.activityLevel}\n- Target kalori harian: ${user.dailyCalories} kcal\n\nINSTRUKSI:\n1. Buat menu menggunakan makanan Indonesia yang mudah didapat dimana saja\n2. Pastikan distribusi kalori seimbang (sarapan 25%, makan siang 35%, makan malam 30%, sisanya snack)\n3. Sesuaikan dengan tujuan fitness pengguna\n4. Berikan penjelasan mengapa menu tersebut cocok untuk profil pengguna\n5. Sertakan estimasi porsi yang realistis\n\nFORMAT OUTPUT (JSON saja tanpa teks tambahan):\n{\n  \"breakfast\": {\n    \"menu\": \"Menu sarapan lengkap (contoh: Oatmeal dengan pisang dan kacang almond)\",\n    \"calories\": 550,\n    \"time\": \"07:00 - 08:00\",\n    \"reasoning\": \"Penjelasan kenapa menu ini cocok untuk profil pengguna\",\n    \"portions\": \"Ukuran porsi detail (contoh: 1 mangkuk besar oatmeal + 1 buah pisang sedang)\"\n  },\n  \"lunch\": {\n    \"menu\": \"Menu makan siang lengkap\",\n    \"calories\": 770,\n    \"time\": \"12:00 - 13:00\", \n    \"reasoning\": \"Penjelasan kenapa menu ini cocok\",\n    \"portions\": \"Ukuran porsi detail\"\n  },\n  \"dinner\": {\n    \"menu\": \"Menu makan malam lengkap\",\n    \"calories\": 660,\n    \"time\": \"18:00 - 19:00\",\n    \"reasoning\": \"Penjelasan kenapa menu ini cocok\", \n    \"portions\": \"Ukuran porsi detail\"\n  },\n  \"snacks\": {\n    \"menu\": \"Snack sehat\",\n    \"calories\": 220,\n    \"time\": \"15:00 - 16:00\",\n    \"reasoning\": \"Penjelasan kenapa snack ini cocok\",\n    \"portions\": \"Ukuran porsi snack\"\n  },\n  \"totalCalories\": ${user.dailyCalories},\n  \"nutritionTips\": \"Tips nutrisi khusus untuk tujuan ${user.goal}\",\n  \"hydrationGoal\": \"Target minum air per hari\"\n}`;

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
        throw new Error("No response text from AI");
      }
      
      // Clean and parse JSON - handle various response formats
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\s*\n?/, '').replace(/\n?\s*```/, '');
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```\s*\n?/, '').replace(/\n?\s*```/, '');
      }
      
      // Find JSON object in the response
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('AI Response:', cleanedText); // Debug log
      
      const mealPlan = JSON.parse(cleanedText);
      
      // Validate the response structure
      if (!mealPlan.breakfast || !mealPlan.lunch || !mealPlan.dinner) {
        throw new Error("Invalid meal plan structure from AI");
      }
      
      setAiMealPlan(mealPlan);
      
      // Cache the result with expiry
      // Store in memory instead of localStorage for this environment
      setAiMealPlan(mealPlan);
      
    } catch (error) {
      console.error('Error generating AI meal plan:', error);
      setAiError(`Gagal menghasilkan rencana makan: ${error.message}`);
      
      // Fallback with sample data if API fails
      const fallbackPlan = {
        breakfast: {
          menu: "Oatmeal dengan buah pisang dan madu",
          calories: Math.round(user.dailyCalories * 0.25),
          time: "07:00 - 08:00",
          reasoning: "Memberikan energi tahan lama untuk memulai hari dengan serat dan karbohidrat kompleks",
          portions: "1 mangkuk oatmeal + 1 buah pisang sedang + 1 sdm madu"
        },
        lunch: {
          menu: "Nasi merah dengan ayam bakar dan sayur bayam",
          calories: Math.round(user.dailyCalories * 0.35),
          time: "12:00 - 13:00",
          reasoning: "Kombinasi protein tinggi dan karbohidrat kompleks untuk energi siang hari",
          portions: "1 piring nasi merah + 100g dada ayam + 1 mangkuk sayur bayam"
        },
        dinner: {
          menu: "Ikan salmon panggang dengan kentang rebus dan brokoli",
          calories: Math.round(user.dailyCalories * 0.30),
          time: "18:00 - 19:00",
          reasoning: "Protein berkualitas tinggi dan omega-3 untuk pemulihan otot malam hari",
          portions: "150g ikan salmon + 200g kentang rebus + 1 mangkuk brokoli"
        },
        snacks: {
          menu: "Greek yogurt dengan kacang almond",
          calories: Math.round(user.dailyCalories * 0.10),
          time: "15:00 - 16:00",
          reasoning: "Protein dan lemak sehat untuk mengatasi lapar sore",
          portions: "1 cup Greek yogurt + 10 butir kacang almond"
        },
        totalCalories: user.dailyCalories,
        nutritionTips: "Pastikan minum air putih 8-10 gelas per hari",
        hydrationGoal: "2.5 liter air per hari"
      };
      
      setAiMealPlan(fallbackPlan);
      setAiError("Menggunakan rencana makan cadangan. Coba perbarui untuk mendapatkan rekomendasi AI terbaru.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Load cached AI meal plan (memory-based caching for this environment)
  const loadCachedMealPlan = () => {
    // In this environment, we'll generate fresh meal plans each time
    // but you can implement memory-based caching if needed
    return false;
  };

  // Load AI meal plan on component mount or date change
  useEffect(() => {
    if (showAiRecommendations && !loadCachedMealPlan()) {
      generateAIMealPlan();
    }
  }, [currentDate, showAiRecommendations]);

  const toggleFoodConsumption = (foodId: string) => {
    const dateKey = formatDateKey(currentDate);
    const newConsumed = consumedFoods.includes(foodId)
      ? consumedFoods.filter(id => id !== foodId)
      : [...consumedFoods, foodId];
    
    setConsumedFoods(newConsumed);
    localStorage.setItem(`consumed-${dateKey}`, JSON.stringify(newConsumed));
  };

  const addFoodToMeal = (food: Food) => {
    setCustomMealPlan(prev => ({
      ...prev,
      [selectedMeal]: [...prev[selectedMeal], food]
    }));
    setShowFoodSelector(false);
  };

  const removeFoodFromMeal = (foodId: string, mealType: keyof typeof customMealPlan) => {
    setCustomMealPlan(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(food => food.id !== foodId)
    }));
  };

  const getTotalNutrition = () => {
    if (showAiRecommendations && aiMealPlan) {
      return {
        calories: aiMealPlan.totalCalories,
        protein: Math.round(aiMealPlan.totalCalories * 0.25 / 4),
        carbs: Math.round(aiMealPlan.totalCalories * 0.45 / 4),
        fat: Math.round(aiMealPlan.totalCalories * 0.30 / 9)
      };
    } else {
      const allFoods = [...customMealPlan.breakfast, ...customMealPlan.lunch, ...customMealPlan.dinner, ...customMealPlan.snacks];
      return allFoods.reduce((total, food) => ({
        calories: total.calories + food.calories,
        protein: total.protein + food.protein,
        carbs: total.carbs + food.carbs,
        fat: total.fat + food.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  };

  const getConsumedNutrition = () => {
    let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    if (showAiRecommendations && aiMealPlan) {
      const meals = [aiMealPlan.breakfast, aiMealPlan.lunch, aiMealPlan.dinner];
      meals.forEach((meal, index) => {
        const mealId = `ai-meal-${index}`;
        if (consumedFoods.includes(mealId)) {
          totalNutrition.calories += meal.calories;
          totalNutrition.protein += Math.round(meal.calories * 0.25 / 4);
          totalNutrition.carbs += Math.round(meal.calories * 0.45 / 4);
          totalNutrition.fat += Math.round(meal.calories * 0.30 / 9);
        }
      });
    } else {
      // Handle custom meal plan consumption
      Object.entries(customMealPlan).forEach(([,foods]) => {
        foods.forEach(food => {
          if (consumedFoods.includes(food.id)) {
            totalNutrition.calories += food.calories;
            totalNutrition.protein += food.protein;
            totalNutrition.carbs += food.carbs;
            totalNutrition.fat += food.fat;
          }
        });
      });
    }
    
    return totalNutrition;
  };

  const totalNutrition = getTotalNutrition();
  const consumedNutrition = getConsumedNutrition();
  const targetCalories = user.dailyCalories;

  const mealTimes = {
    breakfast: '07:00 - 08:00',
    lunch: '12:00 - 13:00',
    dinner: '18:00 - 19:00',
    snacks: 'Kapan saja'
  };

  const mealIcons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '🍎'
  };

  const previousDay = () => {
    setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
  };

  const nextDay = () => {
    setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
  };

  // Filter foods based on search query
  const filteredFoods = SAMPLE_FOODS.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perencanaan Menu AI</h1>
            <p className="text-gray-600 mt-2">Rekomendasi nutrisi personal untuk tujuan Anda</p>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={previousDay}
              className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
              <div className="text-sm text-gray-500">
                {currentDate.getFullYear()}
              </div>
            </div>
            <button
              onClick={nextDay}
              className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* AI Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAiRecommendations(true)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showAiRecommendations 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Rekomendasi AI
              </button>
              <button
                onClick={() => setShowAiRecommendations(false)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  !showAiRecommendations 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Menu Kustom
              </button>
            </div>
            
            {showAiRecommendations && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm text-purple-600">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Dioptimalkan untuk {user.goal.replace('-',' ')}
                </div>
                <button
                  onClick={generateAIMealPlan}
                  disabled={isLoadingAI}
                  className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingAI ? 'animate-spin' : ''}`} />
                  Perbarui
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Ringkasan Nutrisi Harian</h2>
            <div className="text-sm text-gray-600">
              Target: {targetCalories} kcal
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(consumedNutrition.calories)}</div>
              <div className="text-sm text-gray-600">Dikonsumsi</div>
              <div className="text-xs text-gray-500 mt-1">dari {Math.round(totalNutrition.calories)} direncanakan</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (consumedNutrition.calories / targetCalories) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(consumedNutrition.protein)}</div>
              <div className="text-sm text-gray-600">Protein (g)</div>
              <div className="text-xs text-gray-500 mt-1">dari {Math.round(totalNutrition.protein)} direncanakan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{Math.round(consumedNutrition.carbs)}</div>
              <div className="text-sm text-gray-600">Karbohidrat (g)</div>
              <div className="text-xs text-gray-500 mt-1">dari {Math.round(totalNutrition.carbs)} direncanakan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{Math.round(consumedNutrition.fat)}</div>
              <div className="text-sm text-gray-600">Lemak (g)</div>
              <div className="text-xs text-gray-500 mt-1">dari {Math.round(totalNutrition.fat)} direncanakan</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">
                Sisa kalori: {Math.max(0, targetCalories - consumedNutrition.calories)} kcal
              </span>
              {consumedNutrition.calories >= targetCalories * 0.8 && (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Sesuai target!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meal Sections */}
        <div className="grid lg:grid-cols-1 gap-8">
          {showAiRecommendations ? (
            // AI Recommendations View
            <div className="space-y-6">
              {isLoadingAI ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Loader className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI sedang menyiapkan menu personal...</h3>
                  <p className="text-gray-600">Menganalisis profil dan kebutuhan nutrisi Anda</p>
                </div>
              ) : aiError ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal memuat rekomendasi AI</h3>
                  <p className="text-gray-600 mb-4">{aiError}</p>
                  <button
                    onClick={generateAIMealPlan}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : aiMealPlan ? (
                <>
                  {[
                    { key: 'breakfast', label: 'Sarapan', data: aiMealPlan.breakfast },
                    { key: 'lunch', label: 'Makan Siang', data: aiMealPlan.lunch },
                    { key: 'dinner', label: 'Makan Malam', data: aiMealPlan.dinner },
                    ...(aiMealPlan.snacks ? [{ key: 'snacks', label: 'Snack', data: aiMealPlan.snacks }] : [])
                  ].map((meal, index) => (
                    <div key={meal.key} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center mb-4">
                        <span className="text-3xl mr-3">{mealIcons[meal.key as keyof typeof mealIcons]}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{meal.label}</h3>
                          <p className="text-sm text-gray-500 flex items-center"><Clock className="h-4 w-4 mr-1" /> {meal.data.time}</p>
                        </div>
                      </div>
                      <p className="text-lg font-medium text-gray-800 mb-2">{meal.data.menu}</p>
                      <p className="text-sm text-gray-600 mb-3">{meal.data.portions}</p>
                      <div className="flex items-center text-sm text-gray-700 mb-4">
                        <Info className="h-4 w-4 mr-1 text-blue-500" />
                        <span>{meal.data.calories} kcal</span>
                      </div>
                      <p className="text-sm text-gray-500 italic">\"{meal.data.reasoning}\"</p>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => toggleFoodConsumption(`ai-meal-${index}`)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            consumedFoods.includes(`ai-meal-${index}`)
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          {consumedFoods.includes(`ai-meal-${index}`) ? 'Sudah Dikonsumsi' : 'Tandai Dikonsumsi'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {aiMealPlan.nutritionTips && (
                    <div className="bg-blue-50 rounded-xl shadow-sm p-6">
                      <h3 className="text-xl font-semibold text-blue-800 mb-3">Tips Nutrisi Tambahan</h3>
                      <p className="text-blue-700 mb-2">{aiMealPlan.nutritionTips}</p>
                      {aiMealPlan.hydrationGoal && (
                        <p className="text-blue-700 flex items-center"><Info className="h-4 w-4 mr-1" /> Target Hidrasi: {aiMealPlan.hydrationGoal}</p>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ) : (
            // Custom Meal View
            <div className="space-y-6">
              {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => (
                <div key={mealType} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{mealIcons[mealType as keyof typeof mealIcons]}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {mealType === 'breakfast' ? 'Sarapan' :
                           mealType === 'lunch' ? 'Makan Siang' :
                           mealType === 'dinner' ? 'Makan Malam' :
                           'Snack'}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center"><Clock className="h-4 w-4 mr-1" /> {mealTimes[mealType as keyof typeof mealTimes]}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMeal(mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks');
                        setShowFoodSelector(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 inline-block mr-1" /> Tambah Makanan
                    </button>
                  </div>
                  
                  {customMealPlan[mealType as keyof typeof customMealPlan].length === 0 ? (
                    <p className="text-gray-500 italic">Belum ada makanan ditambahkan untuk {mealType === 'breakfast' ? 'sarapan' : mealType === 'lunch' ? 'makan siang' : mealType === 'dinner' ? 'makan malam' : 'snack'}.</p>
                  ) : (
                    <div className="space-y-3">
                      {customMealPlan[mealType as keyof typeof customMealPlan].map((food) => (
                        <div key={food.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{food.name}</p>
                            <p className="text-sm text-gray-600">{food.calories} kcal | {food.servingSize}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleFoodConsumption(food.id)}
                              className={`p-2 rounded-full ${
                                consumedFoods.includes(food.id)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeFoodFromMeal(food.id, mealType as keyof typeof customMealPlan)}
                              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                            >
                              <Plus className="h-4 w-4 rotate-45" /> {/* Using Plus icon rotated for a close/remove effect */}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Food Selector Modal */}
      {showFoodSelector && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Pilih Makanan</h2>
              <button
                onClick={() => setShowFoodSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Cari makanan..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
              {filteredFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{food.name}</p>
                    <p className="text-sm text-gray-600">{food.calories} kcal | {food.servingSize}</p>
                  </div>
                  <button
                    onClick={() => addFoodToMeal(food)}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Tambah
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowFoodSelector(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanning;


