import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { formatHeight } from '../utils/heightConverter';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar isAuthenticated={true} onLogout={handleLogout} />
      <div className="p-5 max-w-7xl mx-auto">
        <div className="p-5 bg-gray-100 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome Back, {user?.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase() : ''}!
          </h2>
          <p className="text-gray-700 mb-2">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 bg-blue-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">🏋️ Workouts</h3>
            <p className="text-gray-600">Track your exercises and routines</p>
          </div>

          <div
            className="p-5 bg-purple-50 rounded-lg text-center cursor-pointer hover:bg-purple-100 transition"
            onClick={() => navigate("/meals")}
          >
            <h3 className="text-xl font-semibold mb-2">🍽️ Meals</h3>
            <p className="text-gray-600">Log your nutrition and calories</p>
          </div>

          <div className="p-5 bg-green-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">📈 Progress</h3>
            <p className="text-gray-600">Monitor your fitness journey</p>
          </div>

          <div className="p-5 bg-orange-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">📱 Social Feed</h3>
            <p className="text-gray-600">Connect with other users</p>
          </div>
        </div>

        <div className="mt-10 p-5 bg-white border border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
          <p className="mb-3">This is your fitness tracking dashboard. Here you can:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Log your workouts and track exercises</li>
            <li>Record meals and monitor nutrition</li>
            <li>Track your progress with weight, PRs, and photos</li>
            <li>Share your fitness journey with others</li>
            <li>View and interact with other users' posts</li>
          </ul>
          <p className="mt-4 italic text-gray-600">
            More features coming soon...
          </p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;