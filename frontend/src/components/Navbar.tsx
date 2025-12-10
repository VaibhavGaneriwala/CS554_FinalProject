import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface NavbarProps {
  isAuthenticated: boolean;
  userName?: string;
  onLogout: () => void;
}

const Navbar = ({ isAuthenticated, userName, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-transparent flex-shrink-0">
                <img 
                  src="./logo_app.png" 
                  alt="FitTracker" 
                  className="w-full h-full object-cover object-center scale-125" 
                />
              </div>
              <span className="text-xl font-bold text-white">FitTracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-200 hover:text-white transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/workouts"
                  className="text-gray-200 hover:text-white transition-colors font-medium"
                >
                  Workouts
                </Link>
                <Link
                  to="/meals"
                  className="text-gray-200 hover:text-white transition-colors font-medium"
                >
                  Meals
                </Link>
                <Link
                  to="/progress"
                  className="text-gray-200 hover:text-white transition-colors font-medium"
                >
                  Progress
                </Link>
                <Link
                  to="/feed"
                  className="text-gray-200 hover:text-white transition-colors font-medium"
                >
                  Feed
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-200 hover:text-white transition-colors font-medium"
                >
                  Profile
                </Link>

                {userName && (
                  <div className="flex items-center space-x-2 text-gray-100 text-sm">
                    <span className="font-medium">Hi, {userName}</span>
                  </div>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white transition-colors font-medium px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-200 hover:text-white transition-colors font-medium"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-200 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
              {userName && (
                  <div className="px-3 py-2 text-gray-200 text-sm font-medium">
                    Logged in as {userName}
                  </div>
                )}
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/workouts"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Workouts
                </Link>
                <Link
                  to="/meals"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Meals
                </Link>
                <Link
                  to="/progress"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Progress
                </Link>
                <Link
                  to="/feed"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Feed
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="px-3 py-2 border-t border-gray-700 mt-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors font-medium px-4 py-2 rounded text-center"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;