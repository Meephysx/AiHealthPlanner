import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Activity, 
  Award,
  ChevronRight,
  Apple,
  Dumbbell,
  CheckCircle,
  Clock,
  Sparkles,
  Loader
} from 'lucide-react';
import { getBMICategory, calculateMacroTargets } from '../utils/calculations';
import { generatePersonalizedRecommendations, PersonalizedRecommendations } from '../utils/geminiApi';
import type { User } from '../types';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentDate] = useState(new Date());
  const [consumedFoods, setConsumedFoods] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadAIRecommendations(parsedUser);
    }

    // Load consumed foods for today
    const today = new Date().toISOString().split('T')[0];
    const savedConsumed = localStorage.getItem(`consumed-${today}`);
    if (savedConsumed) {
      setConsumedFoods(JSON.parse(savedConsumed));
    }
  }, []);

  const loadAIRecommendations = async (userData: User) => {
    setIsLoadingAI(true);
    setAiError(null);
    
    try {
      const recommendations = await generatePersonalizedRecommendations(
        userData.weight,
        userData.height,
        userData.age,
        userData.gender,
        userData.goal,
        userData.activityLevel
      );
      
      setAiRecommendations(recommendations);
      // Cache recommendations
      localStorage.setItem('aiRecommendations', JSON.stringify(recommendations));
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      setAiError('Gagal memuat rekomendasi AI. Menggunakan rekomendasi default.');
      
      // Try to load cached recommendations
      const cached = localStorage.getItem('aiRecommendations');
      if (cached) {
        setAiRecommendations(JSON.parse(cached));
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  const toggleFoodConsumption = (foodId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newConsumed = consumedFoods.includes(foodId)
      ? consumedFoods.filter(id => id !== foodId)
      : [...consumedFoods, foodId];
    
    setConsumedFoods(newConsumed);
    localStorage.setItem(`consumed-${today}`, JSON.stringify(newConsumed));
  };

  const getTodayNutrition = () => {
    if (!aiRecommendations) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    // Calculate based on consumed meals
    let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const meals = [aiRecommendations.meals.breakfast, aiRecommendations.meals.lunch, aiRecommendations.meals.dinner];
    meals.forEach((meal, index) => {
      const mealId = `meal-${index}`;
      if (consumedFoods.includes(mealId)) {
        totalNutrition.calories += meal.calories;
        // Estimate macros based on calories (rough calculation)
        totalNutrition.protein += Math.round(meal.calories * 0.25 / 4);
        totalNutrition.carbs += Math.round(meal.calories * 0.45 / 4);
        totalNutrition.fat += Math.round(meal.calories * 0.30 / 9);
      }
    });
    
    return totalNutrition;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const bmiInfo = getBMICategory(user.bmi);
  const macroTargets = calculateMacroTargets(user.dailyCalories, user.goal);
  const todayNutrition = getTodayNutrition();
  const caloriesRemaining = user.dailyCalories - todayNutrition.calories;

  const quickStats = [
    {
      label: 'Kalori Harian',
      value: user.dailyCalories,
      unit: 'kcal',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'BMI Saat Ini',
      value: user.bmi,
      unit: bmiInfo.category,
      icon: TrendingUp,
      color: bmiInfo.color,
      bg: 'bg-green-50'
    },
    {
      label: 'Target Berat',
      value: user.idealWeight,
      unit: 'kg',
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'AI Assistant',
      value: aiRecommendations ? 'Siap' : 'Loading',
      unit: '',
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  const todayProgress = [
    { label: 'Kalori', current: todayNutrition.calories, target: user.dailyCalories, unit: 'kcal', color: 'bg-blue-500' },
    { label: 'Protein', current: todayNutrition.protein, target: macroTargets.protein, unit: 'g', color: 'bg-green-500' },
    { label: 'Karbohidrat', current: todayNutrition.carbs, target: macroTargets.carbs, unit: 'g', color: 'bg-yellow-500' },
    { label: 'Lemak', current: todayNutrition.fat, target: macroTargets.fat, unit: 'g', color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Selamat datang kembali, {user.name}! 🤖
          </h1>
          <p className="text-gray-600 mt-2">
            Asisten AI fitness Anda telah menyiapkan rekomendasi personal
          </p>
        </div>

        {/* AI Loading State */}
        {isLoadingAI && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center">
              <Loader className="h-6 w-6 text-purple-600 animate-spin mr-3" />
              <span className="text-purple-800 font-medium">AI sedang menganalisis profil Anda...</span>
            </div>
          </div>
        )}

        {/* AI Error State */}
        {aiError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-yellow-800">{aiError}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <div className="flex items-baseline mt-2">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm ${stat.color}`}>{stat.unit}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Today's Nutrition Progress */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nutrisi Hari Ini</h2>
              <Link 
                to="/meals" 
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
              >
                Lihat Menu AI
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {consumedFoods.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Apple className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Mulai lacak makanan Anda</h3>
                <p className="mb-4">Centang makanan yang sudah Anda konsumsi untuk melihat progress harian</p>
                <Link 
                  to="/meals" 
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Lihat Rekomendasi AI
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {todayProgress.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(item.current)}/{item.target} {item.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (item.current / item.target) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>{caloriesRemaining > 0 ? `${Math.round(caloriesRemaining)} kalori tersisa` : `${Math.abs(Math.round(caloriesRemaining))} kalori melebihi target`}</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {caloriesRemaining > 0 
                      ? "Progress bagus! Lihat menu AI untuk opsi lainnya." 
                      : "Anda melebihi target harian. Besok adalah awal yang baru!"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Goal Assistant */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Asisten AI</h2>
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 capitalize mb-2">
                Program {user.goal.replace('-', ' ')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {user.goal === 'weight-loss' && 'Program AI untuk penurunan berat badan yang berkelanjutan'}
                {user.goal === 'weight-gain' && 'Nutrisi cerdas untuk penambahan berat badan sehat'}
                {user.goal === 'muscle-gain' && 'Program presisi untuk pembentukan otot lean'}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kalori Harian:</span>
                  <span className="font-medium">{user.dailyCalories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Protein:</span>
                  <span className="font-medium">{macroTargets.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level Aktivitas:</span>
                  <span className="font-medium capitalize">{user.activityLevel.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* AI Meal Recommendations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Apple className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Menu AI Personal</h2>
              </div>
              <Link 
                to="/meals" 
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
              >
                Lihat Lengkap
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {aiRecommendations ? (
              <div className="space-y-4">
                {[
                  { key: 'breakfast', label: 'Sarapan', data: aiRecommendations.meals.breakfast },
                  { key: 'lunch', label: 'Makan Siang', data: aiRecommendations.meals.lunch },
                  { key: 'dinner', label: 'Makan Malam', data: aiRecommendations.meals.dinner }
                ].map((meal, index) => (
                  <div key={meal.key} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{meal.label}</h3>
                      <span className="text-sm text-gray-500">{meal.data.calories} kcal</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {meal.data.menu}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600">
                        {meal.data.time} • {meal.data.portions}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <button
                          onClick={() => toggleFoodConsumption(`meal-${index}`)}
                          className={`flex items-center px-2 py-1 rounded transition-colors ${
                            consumedFoods.includes(`meal-${index}`)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <CheckCircle className={`h-3 w-3 mr-1 ${
                            consumedFoods.includes(`meal-${index}`) ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          {consumedFoods.includes(`meal-${index}`) ? 'Sudah' : 'Belum'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-800 font-medium">Alasan AI:</p>
                  <p className="text-xs text-purple-700 mt-1">{aiRecommendations.meals.generalReasoning}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Loader className="h-12 w-12 mx-auto mb-3 animate-spin" />
                <p>Memuat rekomendasi AI...</p>
              </div>
            )}
          </div>

          {/* AI Workout Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Dumbbell className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Program Latihan AI</h2>
              </div>
              <Link 
                to="/exercises" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                Mulai Latihan
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {aiRecommendations ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm font-medium">7 Hari</div>
                    <div className="text-xs text-gray-500">Program</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Target className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-sm font-medium">Personal</div>
                    <div className="text-xs text-gray-500">AI Curated</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {aiRecommendations.workout.weeklyPlan.slice(0, 3).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{day.day}</h3>
                        <p className="text-sm text-gray-600">{day.exercises}</p>
                        <p className="text-xs text-gray-500">{day.duration} • {day.intensity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium">Alasan AI:</p>
                  <p className="text-xs text-blue-700 mt-1">{aiRecommendations.workout.generalReasoning}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Loader className="h-12 w-12 mx-auto mb-3 animate-spin" />
                <p>Memuat program latihan...</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Link 
            to="/meals" 
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Menu AI
          </Link>
          <Link 
            to="/exercises" 
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Dumbbell className="h-5 w-5 mr-2" />
            Latihan AI
          </Link>
          <Link 
            to="/food-search" 
            className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Apple className="h-5 w-5 mr-2" />
            Cari AI
          </Link>
          <Link 
            to="/progress" 
            className="flex items-center justify-center p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Progress
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;