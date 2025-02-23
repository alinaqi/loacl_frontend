import React, { useState } from 'react';

interface SimpleWidgetProps {
  position?: 'inpage' | 'floating';
  className?: string;
}

export const SimpleWidget: React.FC<SimpleWidgetProps> = ({ position = 'inpage', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const baseStyles = position === 'floating' 
    ? 'fixed bottom-4 right-4 z-50'
    : 'relative w-full';

  return (
    <div className={`${baseStyles} ${className}`}>
      {/* Chat Button */}
      {position === 'floating' && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {(isOpen || position === 'inpage') && (
        <div className={`bg-white rounded-lg shadow-xl ${position === 'floating' ? 'w-96' : 'w-full'}`}>
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Simple Chat Widget</h3>
            {position === 'floating' && (
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Chat Content */}
          <div className="h-96 p-4 bg-gray-50 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-blue-100 p-3 rounded-lg max-w-[80%]">
                Hello! This is a simple demo message.
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  console.log('Message sent:', message);
                  setMessage('');
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 