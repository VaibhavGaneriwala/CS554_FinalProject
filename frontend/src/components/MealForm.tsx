import React, { useState } from "react";
import { mealService } from "../services/mealService";

interface MealFormProps {
    onMealCreated: () => void;
}

const MealForm: React.FC<MealFormProps> = ({ onMealCreated }) => {
    const [name, setName] = useState("");
    const [mealType, setMealType] = useState("breakfast");
    //const [description, setDescription] = useState("");
    const [calories, setCalories] = useState(0);
    const [protein, setProtein] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fat, setFat] = useState(0);
    const [photos, setPhotos] = useState<File[] | null>(null);
    const [preview, setPreview] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files) as File[];

        setPhotos(files);
        setPreview(files.map((file) => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("mealType", mealType);
        formData.append("calories", String(calories || 0));
        formData.append("protein", String(protein || 0));
        formData.append("carbs", String(carbs || 0));
        formData.append("fat", String(fat || 0));

        photos?.forEach((file: File) => {
            formData.append("photos", file);
        });

        
            await mealService.createMeal(formData);
            setName("");
            setMealType("breakfast");
            setCalories("");
            setProtein("");
            setCarbs("");
            setFat("");
            setPhotos([]);
            setPreview([]);
            onMealCreated();
        } catch (err) {
            console.error(err);
            alert("Failed to log meal");
        } finally {
            setLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>           
                <label className="block mb-1 font-medium">Meal Name</label>
                <input
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Meal Type</label>
                <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
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
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Protein (g)</label>
                <input
                    type="number"
                    placeholder="Protein"
                    value={protein} 
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Carbohydrates (g)</label>
                <input
                    type="number"   
                    placeholder="Carbs"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Fat (g)</label>
                <input
                    type="number"   
                    placeholder="Fat"
                    value={fat}
                    onChange={(e) => setFat(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
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
                <div className="mt-2 flex space-x-2">
                    {preview.map((src, index) => (
                        <img 
                        key={index} 
                        src={src} 
                        alt={`Preview ${index}`} 
                        className="h-20 w-20 object-cover rounded" />
                    ))}
                </div>
                )}
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Saving..." : "Log Meal"}
            </button>
        </form>
    );
};

export default MealForm;
