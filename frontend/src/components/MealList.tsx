import React, { useEffect, useState } from "react";
import { mealService } from "../services/mealService";
import { Meal } from "../types";

const MealList: React.FC = () => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [mealType, setMealType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadMeals = async () => {
        const res = await mealService.getMeals();
        setMeals(res.data?.meals || []);
    };

    useEffect(() => {
        loadMeals();
    }, [mealType, startDate, endDate]);

    const filteredMeals = meals.filter(meal =>
        mealType ? meal.mealType === mealType : true
    );

    return (
        <div>
            <div className="mb-4 flex space-x-4">
                <h2 className="text-xl font-semibold mb-4">Logged Meals</h2>

                <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                >
                    <option value="">All Meal Types</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>
                {/* Date Filters, maybe i'll fix later
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2"
                />
                */}
            </div>
            <div>
                {filteredMeals.map((meal) => (
                    <div key={meal._id} className="border p-3 rounded bg-gray-50">
                        <h3 className="font-semibold text-lg">{meal.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{meal.mealType}</p>

                        <p className="mt-2 text-sm">
                            <strong>{meal.nutrition.calories}</strong> cal •{" "}
                            {meal.nutrition.protein}g protein • {meal.nutrition.carbs}g carbs •{" "}
                            {meal.nutrition.fat}g fat
                        </p>

                        {meal.photos && meal.photos.length > 0 && (
                            <div className="mt-2 flex space-x-2 overflow-x-auto">
                                {meal.photos.map((photoUrl, index) => (
                                    <img
                                        key={index}
                                        src={photoUrl}
                                        alt={`Meal Photo ${index + 1}`}
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                ))}
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </div>
    );
}

export default MealList;