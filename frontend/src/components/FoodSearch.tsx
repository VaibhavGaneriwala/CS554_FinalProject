// src/components/FoodSearch.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface FoodItem {
  name: string;
  image: string;
  perServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  servings: number;
}

interface Props {
  onSelect: (food: FoodItem, multiplier?: number) => void;
}

const FoodSearch: React.FC<Props> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken"); 
      const res = await axios.get(`/api/meals/search-food?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error searching food");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (food: FoodItem) => {
    const multiplier = 1; 
    onSelect(food, multiplier);
  };

  return (
    <div className="food-search">
      <input
        type="text"
        placeholder="Search food..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
        className="border p-2 rounded w-full"
      />
      <button onClick={handleSearch} className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">Search</button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {results.length > 0 && (
        <ul className="border mt-2 rounded max-h-60 overflow-y-auto">
          {results.map((food, idx) => (
            <li key={idx} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelect(food)}>
              <img src={food.image} alt={food.name} className="w-12 h-12 mr-2 rounded" />
              <div>
                <div className="font-semibold">{food.name}</div>
                <div className="text-sm text-gray-600">
                  {food.perServing.calories} kcal | {food.perServing.protein}g P | {food.perServing.carbs}g C | {food.perServing.fat}g F
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FoodSearch;
