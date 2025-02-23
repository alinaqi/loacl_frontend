import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chatbot } from '../types/chatbot';
import { chatbotApi } from '../services/chatbotApi';
import { ChatWidget } from '../components/ChatWidget';
import { ChatbotEmbedCodes } from '../components/ChatbotEmbedCodes';

export const ChatbotTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [displayMode, setDisplayMode] = useState<'in-page' | 'floating'>('in-page');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatbot = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await chatbotApi.getChatbotSettings(id);
        setChatbot(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chatbot');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatbot();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading chatbot...</div>
      </div>
    );
  }

  if (error || !chatbot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error || 'Chatbot not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Test Chatbot: {chatbot.name}
                </h1>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDisplayMode('in-page')}
                  className={`px-4 py-2 rounded-md ${
                    displayMode === 'in-page'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  In-page
                </button>
                <button
                  onClick={() => setDisplayMode('floating')}
                  className={`px-4 py-2 rounded-md ${
                    displayMode === 'floating'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Floating
                </button>
              </div>
            </div>
          </div>

          {/* Embed Codes */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Embed Codes</h2>
            {id && <ChatbotEmbedCodes assistantId={id} />}
          </div>

          {/* Test Area */}
          <div className="p-6">
            {displayMode === 'in-page' ? (
              <div className="border rounded-lg h-[600px] overflow-hidden">
                <ChatWidget
                  customStyles={{
                    '--primary-color': chatbot.design_settings.theme.primary_color,
                    '--secondary-color': chatbot.design_settings.theme.secondary_color,
                    '--text-color': chatbot.design_settings.theme.text_color,
                    '--bg-color': chatbot.design_settings.theme.background_color,
                    '--widget-width': '100%',
                    '--widget-height': '100%',
                  }}
                  features={{
                    showFileUpload: true,
                    showVoiceInput: true,
                    showEmoji: true,
                  }}
                  previewMode={true}
                  assistantId={id}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  The floating chatbot should appear in the bottom-right corner of the screen.
                </p>
                <ChatWidget
                  customStyles={{
                    '--primary-color': chatbot.design_settings.theme.primary_color,
                    '--secondary-color': chatbot.design_settings.theme.secondary_color,
                    '--text-color': chatbot.design_settings.theme.text_color,
                    '--bg-color': chatbot.design_settings.theme.background_color,
                  }}
                  position="right"
                  features={{
                    showFileUpload: true,
                    showVoiceInput: true,
                    showEmoji: true,
                  }}
                  previewMode={true}
                  assistantId={id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 