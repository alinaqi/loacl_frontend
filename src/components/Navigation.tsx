import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const links = [
    { path: '/', label: 'Home' },
    { path: '/basic', label: 'Basic Demo' },
    { path: '/ecommerce', label: 'E-commerce Demo' },
    { path: '/support', label: 'Support Demo' },
    { path: '/features', label: 'Features' },
    { path: '/chatbot-playground', label: 'Playground' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-white shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                LOACL
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === link.path
                      ? 'border-b-2 border-indigo-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium ${
                    location.pathname === '/dashboard'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm font-medium ${
                    location.pathname === '/profile'
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 