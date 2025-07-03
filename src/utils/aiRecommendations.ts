import axios from 'axios';

const GEMINI_API_URL = 'https://api.openai.com/v1/engines/gemini/completions';
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export interface MealSuggestion {
  id: string;
  name: string;
  calories: number;
  ingredients: string[];
}

export async function fetchMealRecommendations(profile: any): Promise<MealSuggestion[]> {
  const prompt = `Suggest 5 balanced meals for someone with age ${profile.age}, height ${profile.height} cm, weight ${profile.weight} kg, diet goal: ${profile.goal}. Include name, calories, ingredients.`;

  const response = await axios.post(
    GEMINI_API_URL,
    {
      prompt,
      max_tokens: 300,
      temperature: 0.7
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    }
  );

  const text = response.data.choices[0].text as string;
  // parse JSON-like list from text
  try {
    const suggestions = JSON.parse(text);
    return suggestions;
  } catch (e) {
    console.error('Failed to parse Gemini response:', text);
    return [];
  }
}