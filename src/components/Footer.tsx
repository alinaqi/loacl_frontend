import React from 'react';

export const Footer: React.FC = () => {
  return (
    <div className="text-center py-8 text-sm text-gray-500 border-t border-gray-200 mt-auto">
      <a 
        href="https://protaige.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="hover:text-gray-700"
      >
        © 2025 Protaige Pty Ltd | Singapore
      </a>
    </div>
  );
}; 