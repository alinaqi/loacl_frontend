import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from './UserMenu';

export const Navigation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/demos') {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                LOACL
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/') 
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </Link>
              <Link
                to="/demos"
                className={`${
                  isActive('/demos')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Demos
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`${
                    isActive('/dashboard')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/signin"
                  className={`${
                    isActive('/signin')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className={`${
                    isActive('/signup')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-indigo-600 hover:text-indigo-900'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 