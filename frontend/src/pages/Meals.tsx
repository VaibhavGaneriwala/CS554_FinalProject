import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import MealForm from "../components/MealForm";
import MealList from "../components/MealList";

const Meals: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [mealsUpdated, setMealsUpdated] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    //const [mealsUpdated, setMealsUpdated] = useState(false);
    const handleMealCreated = () => {
        setMealsUpdated(prev => !prev); 
        setShowForm(false); 
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
                        <h2 className="text-2xl font-semibold mb-4">Add a New Meal</h2>
                        <MealForm onMealCreated={handleMealCreated} />
                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
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
                />
            </div>
        </>
    );
};

export default Meals;