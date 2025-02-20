import React from 'react';

const EcommerceProductDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        <img src="https://via.placeholder.com/400x300" alt="Product" className="w-full" />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Awesome Product</h2>
          <p className="text-gray-700 mb-4">
            This is a demonstration of an e-commerce product page. The product is amazing!
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-gray-900">$99.99</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceProductDemo; 