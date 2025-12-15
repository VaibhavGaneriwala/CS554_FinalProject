import React, { useCallback, useEffect, useState } from "react";
import { mealService } from "../services/mealService";
import { Meal } from "../types";

interface MealListProps {
    onCreateMeal?: () => void;
    onEditMeal?: (meal: Meal) => void;
    onDeleteMeal?: (mealId: string) => void;
}

const MealList: React.FC<MealListProps> = ({ onCreateMeal, onEditMeal, onDeleteMeal }) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [mealType, setMealType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadMeals = useCallback(async () => {
        try {
            setLoading(true);
            const res = await mealService.getMeals(
                undefined,
                mealType || undefined,
                startDate || undefined,
                endDate || undefined
            );
            setMeals(res.data?.meals || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load meals");
            setMeals([]);
        } finally {
            setLoading(false);
        }
    }, [mealType]);

    useEffect(() => {
        loadMeals();
    }, [loadMeals]);

    const filteredMeals = meals.filter(meal =>
        mealType ? meal.mealType === mealType : true
    );

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">Your Meals</h2>
                    {!loading && filteredMeals.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                            {filteredMeals.length} meal{filteredMeals.length !== 1 ? "s" : ""} found
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Filter:</label>
                    <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All meal types</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-gray-600">Loading meals...</p>
                </div>
            ) : filteredMeals.length === 0 ? (
                <div className="text-center py-10 bg-white border border-gray-300 rounded-lg">
                    <p className="text-gray-600 mb-4">No meals yet. Log your first meal to get started!</p>
                    {onCreateMeal && (
                        <button
                            onClick={onCreateMeal}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
                        >
                            + Create Meal
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMeals.map((meal) => (
                        <div key={meal._id} className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold mb-1">{meal.name}</h3>

                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                                            {meal.mealType}
                                        </span>
                                        <span>{formatDate(meal.date)}</span>
                                        <span>
                                            <span className="font-semibold">{meal.nutrition.calories}</span> cal
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => onEditMeal?.(meal)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDeleteMeal?.(meal._id)}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-4">
                                <span className="font-semibold">Macros:</span> {meal.nutrition.protein}g protein •{" "}
                                {meal.nutrition.carbs}g carbs • {meal.nutrition.fat}g fat
                            </p>

                            {meal.photos && meal.photos.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Photos:</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {meal.photos.map((photoUrl, index) => (
                                            <img
                                                key={index}
                                                src={photoUrl}
                                                alt={`Meal ${index + 1}`}
                                                className="w-full h-28 object-cover rounded border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MealList;