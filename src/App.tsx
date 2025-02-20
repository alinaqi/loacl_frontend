import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { BasicDemo } from './pages/BasicDemo';
import { EcommerceDemo } from './pages/EcommerceDemo';
import { SupportDemo } from './pages/SupportDemo';

const Home = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to LOACL</h1>
      <p className="text-gray-600 mb-4">Your AI-powered chat interface is ready!</p>
      <p className="text-gray-600">Use the navigation above to explore different demo implementations.</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/basic" element={<BasicDemo />} />
          <Route path="/ecommerce" element={<EcommerceDemo />} />
          <Route path="/support" element={<SupportDemo />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
