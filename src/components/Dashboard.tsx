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
  Clock
} from 'lucide-react';
import { getBMICategory, calculateMacroTargets } from '../utils/calculations';
import { generateMealRecommendations, generateWorkoutRecommendation } from '../utils/aiRecommendations';

import type { User } from '../types';


const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [consumedFoods, setConsumedFoods] = useState<string[]>([]);
  const [mealRecommendations, setMealRecommendations] = useState<any[]>([]);
  const [workoutRecommendation, setWorkoutRecommendation] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Generate AI recommendations
      const meals = await fetchMealRecommendations(parsedUser);
      const workout = generateWorkoutRecommendation(parsedUser);
      
      setMealRecommendations(meals);
      setWorkoutRecommendation(workout);
    }

    // Load consumed foods for today
    const today = new Date().toISOString().split('T')[0];
    const savedConsumed = localStorage.getItem(`consumed-${today}`);
    if (savedConsumed) {
      setConsumedFoods(JSON.parse(savedConsumed));
    }
  }, []);

  const toggleFoodConsumption = (foodId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newConsumed = consumedFoods.includes(foodId)
      ? consumedFoods.filter(id => id !== foodId)
      : [...consumedFoods, foodId];
    
    setConsumedFoods(newConsumed);
    localStorage.setItem(`consumed-${today}`, JSON.stringify(newConsumed));
  };

  const getTodayNutrition = () => {
    if (!mealRecommendations.length) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    mealRecommendations.forEach(meal => {
      meal.foods.forEach((food: any) => {
        if (consumedFoods.includes(food.id)) {
          totalNutrition.calories += food.calories;
          totalNutrition.protein += food.protein;
          totalNutrition.carbs += food.carbs;
          totalNutrition.fat += food.fat;
        }
      });
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
      label: 'Daily Calories',
      value: user.dailyCalories,
      unit: 'kcal',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Current BMI',
      value: user.bmi,
      unit: bmiInfo.category,
      icon: TrendingUp,
      color: bmiInfo.color,
      bg: 'bg-green-50'
    },
    {
      label: 'Target Weight',
      value: user.idealWeight,
      unit: 'kg',
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'AI Recommendations',
      value: 'Ready',
      unit: '',
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  const todayProgress = [
    { label: 'Calories', current: todayNutrition.calories, target: user.dailyCalories, unit: 'kcal', color: 'bg-blue-500' },
    { label: 'Protein', current: todayNutrition.protein, target: macroTargets.protein, unit: 'g', color: 'bg-green-500' },
    { label: 'Carbs', current: todayNutrition.carbs, target: macroTargets.carbs, unit: 'g', color: 'bg-yellow-500' },
    { label: 'Fat', current: todayNutrition.fat, target: macroTargets.fat, unit: 'g', color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}! 🤖
          </h1>
          <p className="text-gray-600 mt-2">
            Your AI fitness assistant has personalized recommendations ready
          </p>
        </div>

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
              <h2 className="text-xl font-semibold text-gray-900">Today's Nutrition</h2>
              <Link 
                to="/meals" 
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
              >
                View Meal Plan
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {consumedFoods.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Apple className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Track your meals to see progress</h3>
                <p className="mb-4">Check off foods as you eat them to monitor your daily nutrition</p>
                <Link 
                  to="/meals" 
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Apple className="h-4 w-4 mr-2" />
                  View AI Meal Plan
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
                    <strong>{caloriesRemaining > 0 ? `${Math.round(caloriesRemaining)} calories remaining` : `${Math.abs(Math.round(caloriesRemaining))} calories over target`}</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {caloriesRemaining > 0 
                      ? "Great progress! Check your meal plan for more options." 
                      : "You've exceeded your daily target. Tomorrow is a fresh start!"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Goal Assistant */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Assistant</h2>
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 capitalize mb-2">
                {user.goal.replace('-', ' ')} Plan
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {user.goal === 'weight-loss' && 'AI-optimized plan for sustainable weight loss'}
                {user.goal === 'weight-gain' && 'Smart nutrition for healthy weight gain'}
                {user.goal === 'muscle-gain' && 'Precision plan for lean muscle development'}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Calories:</span>
                  <span className="font-medium">{user.dailyCalories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein Target:</span>
                  <span className="font-medium">{macroTargets.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Activity Level:</span>
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
                <h2 className="text-xl font-semibold text-gray-900">AI Meal Plan</h2>
              </div>
              <Link 
                to="/meals" 
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
              >
                View Full Plan
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {mealRecommendations.slice(0, 3).map((meal, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 capitalize">{meal.meal}</h3>
                    <span className="text-sm text-gray-500">{Math.round(meal.totalCalories)} kcal</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {meal.foods.map((food: any) => food.name).join(', ')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">
                      P: {Math.round(meal.totalProtein)}g | C: {Math.round(meal.totalCarbs)}g | F: {Math.round(meal.totalFat)}g
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      AI Optimized
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Workout Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Dumbbell className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">AI Workout Plan</h2>
              </div>
              <Link 
                to="/exercises" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                Start Workout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {workoutRecommendation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm font-medium">{workoutRecommendation.totalDuration} min</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Target className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-sm font-medium">{workoutRecommendation.totalCalories}</div>
                    <div className="text-xs text-gray-500">Calories</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {workoutRecommendation.exercises.slice(0, 3).map((exercise: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                        <p className="text-sm text-gray-600">{exercise.duration} min • {exercise.difficulty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{exercise.caloriesBurned}</p>
                        <p className="text-xs text-gray-500">kcal</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium">AI Reasoning:</p>
                  <p className="text-xs text-blue-700 mt-1">{workoutRecommendation.reasoning}</p>
                </div>
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
            <Calendar className="h-5 w-5 mr-2" />
            AI Meal Plan
          </Link>
          <Link 
            to="/exercises" 
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Dumbbell className="h-5 w-5 mr-2" />
            AI Workouts
          </Link>
          <Link 
            to="/food-search" 
            className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Apple className="h-5 w-5 mr-2" />
            AI Search
          </Link>
          <Link 
            to="/progress" 
            className="flex items-center justify-center p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Track Progress
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;