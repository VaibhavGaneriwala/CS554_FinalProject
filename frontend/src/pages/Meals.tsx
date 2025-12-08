import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import MealForm from "../components/MealForm";
import MealList from "../components/MealList";

const Meals: React.FC = () => {
    const { user, logout } = useAuth();
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

            <div className="p-5 max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">🍽️ Meals</h2>

                {/* Add Meal Button */}
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        + Add Meal
                    </button>
                )}

                {/* Meal Form */}
                {showForm && (
                    <div className="mb-8 p-5 bg-white border border-gray-300 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3">Add a New Meal</h3>
                        <MealForm onMealCreated={handleMealCreated} />
                        <button
                            onClick={() => setShowForm(false)}
                            className="mt-2 text-sm text-gray-500 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Meal List */}
                <div className="p-5 bg-white border border-gray-300 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">Your Meals</h3>
                    <MealList key={mealsUpdated.toString()} /> {/* re-render on update */}
                </div>
            </div>
        </>
    );
};

export default Meals;