import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import MealForm from "../components/MealForm";
import MealList from "../components/MealList";
import { Meal, MealFormData } from "../types";
import { mealService } from "../services/mealService";

const Meals: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [mealsUpdated, setMealsUpdated] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [formData, setFormData] = useState<MealFormData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMealCreated = () => {
        setMealsUpdated(prev => !prev);
        setShowForm(false);
        setEditingMeal(null);
    };

    const handleEdit = (meal: Meal) => {
        setEditingMeal(meal);
        setFormData({
            name: meal.name,
            mealType: meal.mealType,
            nutrition: meal.nutrition,
            date: meal.date.split("T")[0],
            photos: [],
        });
        setShowForm(true);
    };

    return (
        <>
            <Navbar isAuthenticated={true} onLogout={handleLogout} />

            <div className="p-5 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Meals</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
                    >
                        + New Meal
                    </button>
                </div>

                {showForm && (
                    <div className="mb-8 p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4">
                            {editingMeal ? "Edit Meal" : "Add a New Meal"}
                        </h2>
                        <MealForm
                            onMealCreated={handleMealCreated}
                            mealToEdit={editingMeal}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingMeal(null); }}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <MealList
                    key={mealsUpdated.toString()}
                    onCreateMeal={() => setShowForm(true)}
                    onEditMeal={handleEdit}
                    onDeleteMeal={async (mealId) => {
                        if (!window.confirm("Are you sure you want to delete this meal?")) return;
                        try {
                            await mealService.deleteMeal(mealId);
                            setMealsUpdated(prev => !prev);
                        } catch (err: any) {
                            alert(err.message || "Failed to delete meal");
                        }
                    }}
                />

            </div>
        </>
    );
};

export default Meals;