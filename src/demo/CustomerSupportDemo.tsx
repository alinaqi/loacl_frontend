import React from 'react';

const CustomerSupportDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Customer Support</h1>
        <p className="text-gray-600 mb-6">How can we help you today?</p>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="name">Name</label>
            <input type="text" id="name" className="w-full border border-gray-300 rounded p-2" placeholder="Your name" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
            <input type="email" id="email" className="w-full border border-gray-300 rounded p-2" placeholder="you@example.com" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="message">Message</label>
            <textarea id="message" className="w-full border border-gray-300 rounded p-2" placeholder="Your issue or query" rows={4}></textarea>
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default CustomerSupportDemo; 