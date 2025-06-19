import React, { useState } from 'react';
import { Search, Loader, Info } from 'lucide-react';

interface FoodDetail {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

const AISearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    const apiKey = "AIzaSyB0qggp5SxQhUIW5r9WuwoU21IwJbdnY78"; // Replace with your actual API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `Sebagai ahli nutrisi, berikan informasi nutrisi lengkap untuk '${searchQuery}' dalam format JSON. Sertakan nama makanan, kalori, protein, karbohidrat, lemak, dan ukuran porsi. Jika ada beberapa variasi, berikan beberapa opsi. Contoh format:\n[\n  {\n    \"name\": \"Nasi Putih\",\n    \"calories\": 130,\n    \"protein\": 2.7,\n    \"carbs\": 28,\n    \"fat\": 0.3,\n    \"servingSize\": \"100 gram\"\n  },\n  {\n    \"name\": \"Nasi Goreng\",\n    \"calories\": 250,\n    \"protein\": 8,\n    \"carbs\": 35,\n    \"fat\": 10,\n    \"servingSize\": \"1 porsi\"\n  }\n]`;

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
        throw new Error("No response text from AI for food search");
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

      console.log('AI Search Response:', cleanedText); // Debug log

      const foods: FoodDetail[] = JSON.parse(cleanedText);
      setSearchResults(foods);

    } catch (err) {
      console.error('Error during AI search:', err);
      setError(`Gagal mencari makanan: ${err.message}. Pastikan Anda menggunakan kunci API yang valid dan format respons AI benar.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pencarian Makanan AI</h1>
        <p className="text-gray-600 mb-8">Cari informasi nutrisi untuk berbagai makanan menggunakan AI.</p>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
            <input
              type="text"
              placeholder="Cari makanan, contoh: 'nasi goreng', 'ayam bakar'"
              className="flex-grow p-3 outline-none rounded-l-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="p-3 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
        </div>

        {isLoading && searchQuery.trim() !== '' && (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 text-purple-500 animate-spin mr-3" />
            <p className="text-lg text-gray-600">Mencari informasi nutrisi...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hasil Pencarian</h2>
            <div className="space-y-4">
              {searchResults.map((food, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">{food.name}</h3>
                  <p className="text-sm text-gray-600">Porsi: {food.servingSize}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm">
                    <p><span className="font-medium">Kalori:</span> {food.calories} kcal</p>
                    <p><span className="font-medium">Protein:</span> {food.protein} g</p>
                    <p><span className="font-medium">Karbohidrat:</span> {food.carbs} g</p>
                    <p><span className="font-medium">Lemak:</span> {food.fat} g</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && searchQuery.trim() !== '' && searchResults.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <Info className="h-12 w-12 mx-auto mb-4 text-blue-400" />
            <p>Tidak ada hasil yang ditemukan untuk "{searchQuery}". Coba kata kunci lain.</p>
          </div>
        )}

        {!isLoading && searchQuery.trim() === '' && searchResults.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Masukkan nama makanan untuk mencari informasi nutrisi.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearch;