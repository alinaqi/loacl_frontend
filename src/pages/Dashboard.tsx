import React, { useState, useEffect } from 'react';
import { ChatbotList } from '../components/dashboard/ChatbotList';
import { ChatbotAnalytics } from '../components/dashboard/ChatbotAnalytics';
import { AddChatbotModal } from '../components/dashboard/AddChatbotModal';
import { Chatbot } from '../types/chatbot';
import { chatbotApi } from '../services/chatbotApi';

export const Dashboard: React.FC = () => {
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatbots = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have an API key
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) {
        // Don't show this as an error, just show empty state
        setError(null);
        setChatbots([]);
        setSelectedChatbot(null);
        setIsLoading(false);
        return;
      }

      const data = await chatbotApi.getChatbots();
      setChatbots(data);
      if (data.length > 0 && !selectedChatbot) {
        setSelectedChatbot(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chatbots');
      setChatbots([]);
      setSelectedChatbot(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatbots();
  }, []);

  const handleAddSuccess = () => {
    fetchChatbots();
  };

  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to LOACL!</h3>
      <p className="text-gray-500 mb-4">Get started by creating your first chatbot.</p>
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="text-indigo-600 hover:text-indigo-800 font-medium"
      >
        Click here to add a new chatbot →
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Chatbots</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New Chatbot
          </button>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chatbot List */}
          <div className="lg:col-span-1">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Loading chatbots...
              </div>
            ) : chatbots.length === 0 ? (
              <EmptyState />
            ) : (
              <ChatbotList
                chatbots={chatbots}
                selectedChatbot={selectedChatbot}
                onSelectChatbot={setSelectedChatbot}
              />
            )}
          </div>

          {/* Analytics Panel */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Loading analytics...
              </div>
            ) : selectedChatbot ? (
              <ChatbotAnalytics chatbot={selectedChatbot} />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                {chatbots.length === 0 ? (
                  <div className="text-gray-500">
                    Create your first chatbot to start viewing analytics and managing conversations.
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Chatbot</h3>
                    <p className="text-gray-500">
                      Choose a chatbot from the list to view its analytics and performance metrics.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Chatbot Modal */}
      <AddChatbotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}; 