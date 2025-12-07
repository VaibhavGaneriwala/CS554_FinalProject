import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import MealForm from "../components/MealForm";
import MealList from "../components/MealList";

const Meals: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    //const [mealsUpdated, setMealsUpdated] = useState(false);
    return (
        <>
            <Navbar isAuthenticated={true} onLogout={handleLogout} />

            <div className="p-5 max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">🍽️ Meals</h2>

                <div className="mb-8 p-5 bg-white border border-gray-300 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">Add a New Meal</h3>
                    <MealForm onMealCreated={() => {}} />
                </div>

                <div className="p-5 bg-white border border-gray-300 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">Your Meals</h3>
                    <MealList />
                </div>
            </div>
        </>
    );
};

export default Meals;