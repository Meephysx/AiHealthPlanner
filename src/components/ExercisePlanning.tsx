import React, { useState } from 'react';
import { fetchWorkoutRecommendations } from '../utils/aiRecommendations';

type UserInput = {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
};

export default function ExercisePlanning() {
  const [input, setInput] = useState<UserInput>({
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
  });
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof UserInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        field === 'gender'
          ? (e.target.value as 'male' | 'female')
          : Number(e.target.value);
      setInput((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const plan = await fetchWorkoutRecommendations(input);
      setResult(plan);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Workout Planning AI</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label>Berat (kg): </label>
          <input
            type="number"
            value={input.weight}
            onChange={handleChange('weight')}
            required
            className="border p-1 rounded"
          />
        </div>
        <div>
          <label>Tinggi (cm): </label>
          <input
            type="number"
            value={input.height}
            onChange={handleChange('height')}
            required
            className="border p-1 rounded"
          />
        </div>
        <div>
          <label>Umur: </label>
          <input
            type="number"
            value={input.age}
            onChange={handleChange('age')}
            required
            className="border p-1 rounded"
          />
        </div>
        <div>
          <label>Gender: </label>
          <select
            value={input.gender}
            onChange={handleChange('gender')}
            className="border p-1 rounded"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Menghasilkan...' : 'Generate Workout'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {result && (
        <div className="mt-4">
          <h2 className="font-semibold">Rencana Workout AI:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{result}</pre>
        </div>
      )}
    </div>
);
}
