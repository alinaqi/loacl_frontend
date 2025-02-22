import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

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
          <div className="flex space-x-8 items-center">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-900'
                } px-1 py-2 text-sm font-medium`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`${
                    location.pathname === '/dashboard'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-900'
                  } px-3 py-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  {user?.name && (
                    <span className="text-sm text-gray-500">
                      {user.name}
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className={`${
                    location.pathname === '/signin'
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-900'
                  } px-3 py-2 text-sm font-medium`}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 