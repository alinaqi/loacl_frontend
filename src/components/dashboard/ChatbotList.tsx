import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chatbot } from '../../types/chatbot';
import { EmbedCodesModal } from './EmbedCodesModal';

interface ChatbotListProps {
  chatbots: Chatbot[];
  selectedChatbot: Chatbot | null;
  onSelectChatbot: (chatbot: Chatbot) => void;
}

export const ChatbotList: React.FC<ChatbotListProps> = ({
  chatbots,
  selectedChatbot,
  onSelectChatbot,
}) => {
  const navigate = useNavigate();
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [selectedForEmbed, setSelectedForEmbed] = useState<string | null>(null);

  const handleOpenEmbedModal = (chatbotId: string) => {
    setSelectedForEmbed(chatbotId);
    setEmbedModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Chatbots</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {chatbots.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No chatbots yet. Create your first one!
            </div>
          ) : (
            chatbots.map((chatbot) => (
              <div
                key={chatbot.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedChatbot?.id === chatbot.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => onSelectChatbot(chatbot)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {chatbot.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created {new Date(chatbot.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        chatbot.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {chatbot.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      className="text-gray-400 hover:text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEmbedModal(chatbot.id);
                      }}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-indigo-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chatbot/${chatbot.id}/test`);
                      }}
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedForEmbed && (
        <EmbedCodesModal
          isOpen={embedModalOpen}
          onClose={() => {
            setEmbedModalOpen(false);
            setSelectedForEmbed(null);
          }}
          assistantId={selectedForEmbed}
        />
      )}
    </>
  );
}; 