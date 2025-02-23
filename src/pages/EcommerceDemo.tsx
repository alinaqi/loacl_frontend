import React from 'react';

// Extend Window interface to include our widget initialization function
declare global {
  interface Window {
    initLOACLWidget: (config: {
      position: 'floating' | 'inpage';
      containerId: string;
      apiKey: string;
      assistantId: string;
      apiUrl: string;
      styles?: {
        primary: string;
        textPrimary: string;
        background: string;
        borderRadius: string;
        width: string;
        height: string;
      };
    }) => void;
  }
}

export const EcommerceDemo = () => {
  const BACKEND_KEY = import.meta.env.VITE_BACKEND_KEY;
  const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;

  // Initialize widget when component mounts
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = '/widgets/examples/embed.js';
    script.async = true;
    script.onload = () => {
      // Initialize the widget with our environment variables
      window.initLOACLWidget({
        position: 'floating',
        containerId: 'loacl-widget-container', // Dummy ID for floating widget
        apiKey: BACKEND_KEY,
        assistantId: ASSISTANT_ID,
        apiUrl: 'http://localhost:8000',
        styles: {
          primary: '#4F46E5', // indigo-600 to match the site theme
          textPrimary: '#FFFFFF',
          background: '#FFFFFF',
          borderRadius: '0.5rem',
          width: '384px',
          height: '600px'
        }
      });
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
      // Remove widget container if it exists
      const container = document.getElementById('loacl-widget-container');
      if (container) {
        container.remove();
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-gray-900">LOACL Shop</div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">Cart (0)</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Sign In
            </button>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product Cards */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Product {item}</h3>
                <p className="text-gray-600 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-gray-900 font-bold">$99.99</span>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            Need help? Click the chat button in the bottom-right corner to talk to our AI assistant.
          </p>
        </div>
      </footer>
    </div>
  );
}; 