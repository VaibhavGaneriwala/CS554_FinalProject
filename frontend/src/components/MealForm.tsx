import React, { useEffect, useState } from "react";
import { mealService } from "../services/mealService";
import { FoodItem, Meal, MealFormData } from "../types";

interface MealFormProps {
    onMealCreated: () => void;
    mealToEdit?: Meal | null;
};

const MealForm: React.FC<MealFormProps> = ({ onMealCreated, mealToEdit }) => {
    const [name, setName] = useState("");
    const [mealType, setMealType] = useState<MealFormData["mealType"]>("breakfast");
    const [calories, setCalories] = useState(0);
    const [protein, setProtein] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fat, setFat] = useState(0);
    const [photos, setPhotos] = useState<File[] | null>(null);
    const [preview, setPreview] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [foodQuery, setFoodQuery] = useState("");
    const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (mealToEdit) {
            setName(mealToEdit.name);
            setMealType(mealToEdit.mealType);
            setCalories(mealToEdit.nutrition.calories);
            setProtein(mealToEdit.nutrition.protein);
            setCarbs(mealToEdit.nutrition.carbs);
            setFat(mealToEdit.nutrition.fat);
        }
    }, [mealToEdit]);


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files) as File[];

        setPhotos(files);
        setPreview(files.map((file) => URL.createObjectURL(file)));
    };

    const handleFoodSearch = async () => {
        if (!foodQuery.trim()) return;
        setSearchLoading(true);
        setError(null);
        try {
            const res = await mealService.searchFood(foodQuery);
            if (res.success) {
                setFoodResults(res.data || []);
            } else {
                setFoodResults([]);
                setError(res.message || "Food search failed");
            }
        } catch (err: any) {
            console.error(err);
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Food search failed";
            setError(msg);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectFood = (food: FoodItem) => {
        setName(food.name);
        setCalories(food.perServing.calories);
        setProtein(food.perServing.protein);
        setCarbs(food.perServing.carbs);
        setFat(food.perServing.fat);
        setFoodResults([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null); try {
            const data: MealFormData = {
                name,
                mealType,
                nutrition: {
                    calories: Number(calories),
                    protein: Number(protein),
                    carbs: Number(carbs),
                    fat: Number(fat),
                },
                photos: photos || undefined,
            };

            if (mealToEdit) {
                await mealService.updateMeal(mealToEdit._id, data);
            } else {
                await mealService.createMeal(data);
            }
        
            setMealType("breakfast");
            setCalories(0);
            setProtein(0);
            setCarbs(0);
            setFat(0);
            setPhotos([]);
            setPreview([]);
            setFoodQuery("");
            setFoodResults([]);
            onMealCreated();
        } catch (err) {
            console.error(err);
            setError("Failed to log meal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
            <div>
                <label className="block mb-1 font-medium">Search Food</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search food..."
                        value={foodQuery}
                        onChange={(e) => setFoodQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={handleFoodSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium"
                    >
                        {searchLoading ? "Searching..." : "Search"}
                    </button>
                    {foodResults.length > 0 && (
                        <ul className="border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto bg-white absolute z-10 w-full shadow">
                            {foodResults.map((food, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectFood(food)}
                                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    <img src={food.image} alt={food.name} className="h-10 w-10 object-cover rounded mr-2" />
                                    <div>
                                        <div className="font-semibold">{food.name}</div>
                                        <div className="text-sm text-gray-600">
                                            {food.perServing.calories} kcal | {food.perServing.protein}g P | {food.perServing.carbs}g C |{" "}
                                            {food.perServing.fat}g F
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Meal Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Meal Type</label>
                <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>
            </div>
            <div>
                <label className="block mb-1 font-medium">Calories</label>
                <input
                    type="number"
                    placeholder="Calories"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Protein (g)</label>
                <input
                    type="number"
                    placeholder="Protein"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Carbohydrates (g)</label>
                <input
                    type="number"
                    placeholder="Carbs"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Fat (g)</label>
                <input
                    type="number"
                    placeholder="Fat"
                    value={fat}
                    onChange={(e) => setFat(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Photos (optional)</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full"
                />
                {preview.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {preview.map((src, index) => (
                            <img
                                key={index}
                                src={src}
                                alt={`Preview ${index}`}
                                className="w-full h-28 object-cover rounded border" />
                        ))}
                    </div>
                )}
            </div>
            <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Saving..." : mealToEdit ? "Update Meal" : "Log Meal"}
            </button>
        </form>
    );
};

export default MealForm;