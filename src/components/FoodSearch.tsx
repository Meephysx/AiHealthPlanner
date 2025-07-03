import React, { useState } from 'react';
import { fetchMealRecommendations, MealSuggestion } from '../api/aiRecommendations';

export const FoodSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const fakeProfile = { age: 30, height: 170, weight: 70, goal: query };
    const res = await fetchMealRecommendations(fakeProfile);
    setResults(res);
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Cari tipe diet atau tujuan" />
      <button onClick={handleSearch} disabled={loading || !query}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      <ul>
        {results.map(m => (
          <li key={m.id}>{m.name} - {m.calories} kcal</li>
        ))}
      </ul>
    </div>
  );
};