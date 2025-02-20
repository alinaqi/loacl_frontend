import React from 'react';

const LandingPageDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to LOACL Demo</h1>
      </header>
      <main className="text-center">
        <p className="text-lg text-gray-600 mb-4">
          This is a simple landing page demo showcasing basic integration.
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Get Started
        </button>
      </main>
    </div>
  );
};

export default LandingPageDemo; 