import React, { useState, useEffect } from 'react';
import { Plus, Clock, Utensils, ChevronLeft, ChevronRight, Check, Sparkles, Info } from 'lucide-react';
import { generateMealRecommendations } from '../utils/aiRecommendations';
import { SAMPLE_FOODS } from '../utils/constants';
import type { User, Food } from '../types';

const MealPlanning: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [consumedFoods, setConsumedFoods] = useState<string[]>([]);
  const [customMealPlan, setCustomMealPlan] = useState({
    breakfast: [] as Food[],
    lunch: [] as Food[],
    dinner: [] as Food[],
    snacks: [] as Food[]
  });
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [showAiRecommendations, setShowAiRecommendations] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Generate AI meal recommendations
      const recommendations = generateMealRecommendations(parsedUser);
      setAiRecommendations(recommendations);
    }

    // Load consumed foods for current date
    const dateKey = formatDateKey(currentDate);
    const savedConsumed = localStorage.getItem(`consumed-${dateKey}`);
    if (savedConsumed) {
      setConsumedFoods(JSON.parse(savedConsumed));
    }
  }, [currentDate]);

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

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

  const getCurrentMealPlan = () => {
    return showAiRecommendations ? aiRecommendations : customMealPlan;
  };

  const getTotalNutrition = () => {
    if (showAiRecommendations) {
      return aiRecommendations.reduce((total, meal) => ({
        calories: total.calories + meal.totalCalories,
        protein: total.protein + meal.totalProtein,
        carbs: total.carbs + meal.totalCarbs,
        fat: total.fat + meal.totalFat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
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
    
    if (showAiRecommendations) {
      aiRecommendations.forEach(meal => {
        meal.foods.forEach((food: Food) => {
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
  const targetCalories = user?.dailyCalories || 2000;

  const mealTimes = {
    breakfast: '8:00 AM',
    lunch: '12:30 PM',
    dinner: '7:00 PM',
    snacks: 'Various'
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Meal Planning</h1>
            <p className="text-gray-600 mt-2">Personalized nutrition recommendations for your goals</p>
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
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
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
                AI Recommendations
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
                Custom Plan
              </button>
            </div>
            
            {showAiRecommendations && (
              <div className="flex items-center text-sm text-purple-600">
                <Sparkles className="h-4 w-4 mr-1" />
                Optimized for {user.goal.replace('-', ' ')}
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Daily Nutrition Summary</h2>
            <div className="text-sm text-gray-600">
              Target: {targetCalories} kcal
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(consumedNutrition.calories)}</div>
              <div className="text-sm text-gray-600">Consumed</div>
              <div className="text-xs text-gray-500 mt-1">of {Math.round(totalNutrition.calories)} planned</div>
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
              <div className="text-xs text-gray-500 mt-1">of {Math.round(totalNutrition.protein)} planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{Math.round(consumedNutrition.carbs)}</div>
              <div className="text-sm text-gray-600">Carbs (g)</div>
              <div className="text-xs text-gray-500 mt-1">of {Math.round(totalNutrition.carbs)} planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{Math.round(consumedNutrition.fat)}</div>
              <div className="text-sm text-gray-600">Fat (g)</div>
              <div className="text-xs text-gray-500 mt-1">of {Math.round(totalNutrition.fat)} planned</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">
                Remaining calories: {Math.max(0, targetCalories - consumedNutrition.calories)} kcal
              </span>
              {consumedNutrition.calories >= targetCalories * 0.8 && (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">On track!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meal Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          {showAiRecommendations ? (
            // AI Recommendations View
            aiRecommendations.map((mealRec, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{mealIcons[mealRec.meal as keyof typeof mealIcons]}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{mealRec.meal}</h3>
                      <p className="text-sm text-gray-600">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {mealTimes[mealRec.meal as keyof typeof mealTimes]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-purple-600">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">AI Optimized</span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800">{mealRec.reasoning}</p>
                  </div>
                </div>

                {/* Meal Items */}
                <div className="space-y-3 mb-4">
                  {mealRec.foods.map((food: Food, foodIndex: number) => (
                    <div key={`${food.id}-${foodIndex}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleFoodConsumption(food.id)}
                          className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                            consumedFoods.includes(food.id)
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {consumedFoods.includes(food.id) && <Check className="h-3 w-3" />}
                        </button>
                        <div>
                          <h4 className={`font-medium ${consumedFoods.includes(food.id) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {food.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {food.calories} kcal • {food.protein}g protein • {food.servingSize}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meal Nutrition Summary */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{Math.round(mealRec.totalCalories)}</div>
                      <div className="text-xs text-gray-500">kcal</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{Math.round(mealRec.totalProtein)}</div>
                      <div className="text-xs text-gray-500">protein</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{Math.round(mealRec.totalCarbs)}</div>
                      <div className="text-xs text-gray-500">carbs</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{Math.round(mealRec.totalFat)}</div>
                      <div className="text-xs text-gray-500">fat</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Custom Meal Plan View
            (Object.keys(customMealPlan) as Array<keyof typeof customMealPlan>).map((mealType) => (
              <div key={mealType} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{mealIcons[mealType]}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{mealType}</h3>
                      <p className="text-sm text-gray-600">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {mealTimes[mealType]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMeal(mealType);
                      setShowFoodSelector(true);
                    }}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Food
                  </button>
                </div>

                {/* Meal Items */}
                <div className="space-y-3 mb-4">
                  {customMealPlan[mealType].length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No foods added yet</p>
                      <p className="text-sm">Add some foods to start planning your {mealType}</p>
                    </div>
                  ) : (
                    customMealPlan[mealType].map((food, index) => (
                      <div key={`${food.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{food.name}</h4>
                          <p className="text-sm text-gray-600">
                            {food.calories} kcal • {food.protein}g protein • {food.servingSize}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFoodFromMeal(food.id, mealType)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Food Selector Modal */}
        {showFoodSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-96 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Food to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
                  </h3>
                  <button
                    onClick={() => setShowFoodSelector(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-80">
                <div className="grid gap-3">
                  {SAMPLE_FOODS.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => addFoodToMeal(food)}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div>
                        <h5 className="font-medium text-gray-900">{food.name}</h5>
                        <p className="text-sm text-gray-600">
                          {food.calories} kcal • {food.protein}g protein • {food.servingSize}
                        </p>
                      </div>
                      <Plus className="h-5 w-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );z
};

export default MealPlanning;