import React, { useState } from 'react';
import { ChatbotList } from '../components/dashboard/ChatbotList';
import { ChatbotAnalytics } from '../components/dashboard/ChatbotAnalytics';
import { AddChatbotModal } from '../components/dashboard/AddChatbotModal';
import { Chatbot } from '../types/chatbot';

export const Dashboard: React.FC = () => {
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // TODO: Replace with actual API call
  const [chatbots] = useState<Chatbot[]>([]);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chatbot List */}
          <div className="lg:col-span-1">
            <ChatbotList
              chatbots={chatbots}
              selectedChatbot={selectedChatbot}
              onSelectChatbot={setSelectedChatbot}
            />
          </div>

          {/* Analytics Panel */}
          <div className="lg:col-span-2">
            {selectedChatbot ? (
              <ChatbotAnalytics chatbot={selectedChatbot} />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a chatbot to view analytics
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Chatbot Modal */}
      <AddChatbotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}; 