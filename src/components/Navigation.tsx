import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation = () => {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home' },
    { path: '/basic', label: 'Basic Demo' },
    { path: '/ecommerce', label: 'E-commerce Demo' },
    { path: '/support', label: 'Support Demo' },
    { path: '/features', label: 'Features' },
    { path: '/playground', label: 'Playground' },
  ];

  return (
    <div className="bg-white shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 h-16 items-center">
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
      </div>
    </div>
  );
}; 