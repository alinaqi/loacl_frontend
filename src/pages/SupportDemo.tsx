import React from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SupportDemo = () => {
  const { accessToken } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="font-bold text-xl text-gray-900">LOACL Support</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">Getting Started</a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">FAQs</a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">Contact Support</a>
                </li>
                <li>
                  <a href="#" className="text-indigo-600 hover:text-indigo-800">Documentation</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">How can we help?</h1>
              <div className="mb-8">
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">Popular Topics</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="text-gray-600">• How to get started with LOACL</li>
                    <li className="text-gray-600">• Integration guide</li>
                    <li className="text-gray-600">• Pricing and plans</li>
                    <li className="text-gray-600">• API documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playground Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-gray-600">
          Visit our{' '}
          <Link
            to="/chatbot-playground"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Interactive Playground
          </Link>
          {' '}to customize the chat widget to your needs.
        </p>
      </div>

      <ChatWidget accessToken={accessToken} />
    </div>
  );
}; 