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

export const BasicDemo = () => {
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
        position: 'inpage',
        containerId: 'chat-widget-container',
        apiKey: BACKEND_KEY,
        assistantId: ASSISTANT_ID,
        apiUrl: 'http://localhost:8000',
        styles: {
          primary: '#3B82F6',
          textPrimary: '#FFFFFF',
          background: '#FFFFFF',
          borderRadius: '0.5rem',
          width: '100%',
          height: '100%'
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Basic Integration Demo</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to LOACL Chat</h2>
            <p className="text-gray-600 mb-4">
              This is a basic integration example showing how LOACL can be embedded in any webpage.
            </p>
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Integration Code</h3>
                <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
                  {`<div id="chat-widget-container">
  <!-- LOACL Chat will be mounted here -->
</div>

<script src="/widgets/examples/embed.js"></script>
<script>
  initLOACLWidget({
    position: 'inpage',
    containerId: 'chat-widget-container',
    apiKey: 'YOUR_API_KEY',
    assistantId: '${ASSISTANT_ID}',
    apiUrl: 'http://localhost:8000'
  });
</script>`}
                </pre>
              </div>
              <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Fully customizable UI</li>
                  <li>• Real-time streaming responses</li>
                  <li>• Typing indicators</li>
                  <li>• Error handling</li>
                  <li>• Thread management</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chat Widget Container */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden h-[600px]">
            <div id="chat-widget-container" className="h-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 