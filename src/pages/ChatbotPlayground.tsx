import React, { useState } from 'react';
import { chatbotApi } from '../services/chatbotApi';

interface PlaygroundConfig {
  openaiKey: string;
  assistantId: string;
  name: string;
  description: string;
  uuid?: string;
  theme?: {
    primary_color: string;
    secondary_color: string;
    text_color: string;
    background_color: string;
  };
  chat_bubble_text?: string;
  initial_message?: string;
  features?: {
    showFileUpload: boolean;
    showVoiceInput: boolean;
    showEmoji: boolean;
  };
}

export const ChatbotPlayground: React.FC = () => {
  const [config, setConfig] = useState<PlaygroundConfig>({
    openaiKey: '',
    assistantId: '',
    name: '',
    description: '',
    theme: {
      primary_color: '#2563eb',
      secondary_color: '#1d4ed8',
      text_color: '#111827',
      background_color: '#ffffff'
    },
    chat_bubble_text: 'Chat with me!',
    initial_message: 'Hello! How can I help you today!',
    features: {
      showFileUpload: true,
      showVoiceInput: true,
      showEmoji: true
    }
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [creationProgress, setCreationProgress] = useState<string>('');

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreatingAssistant(true);
    setCreationProgress('Validating input...');

    try {
      // Validate all required fields
      const requiredFields = {
        openaiKey: 'OpenAI API Key',
        assistantId: 'Assistant ID',
        name: 'Assistant Name'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !config[key as keyof PlaygroundConfig])
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Please provide: ${missingFields.join(', ')}`);
      }

      // Validate Assistant ID format
      if (!config.assistantId.startsWith('asst_')) {
        throw new Error('Invalid Assistant ID format. It should start with "asst_"');
      }

      setCreationProgress('Creating assistant...');
      
      // Create the assistant using the chatbotApi service
      const createResponse = await chatbotApi.createChatbot({
        name: config.name,
        description: config.description,
        instructions: "You are a helpful assistant",
        model: "gpt-4-turbo-preview",
        api_key: config.openaiKey,
        assistant_id: config.assistantId,
        tools_enabled: ["code_interpreter"]
      });

      setCreationProgress('Assistant created successfully!');
      
      // Update config with the UUID for future API calls
      setConfig((prev: PlaygroundConfig) => ({ ...prev, uuid: createResponse.id }));
      setIsConfigured(true);

    } catch (error) {
      console.error('Full error:', error);
      setError(error instanceof Error ? error.message : 'Failed to configure assistant');
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Chatbot Playground
        </h1>
        {!isConfigured ? (
          <div>
            <form onSubmit={handleConfigSubmit} className="space-y-6">
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  id="openaiKey"
                  value={config.openaiKey}
                  onChange={(e) => setConfig((prev: PlaygroundConfig) => ({ ...prev, openaiKey: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="assistantId" className="block text-sm font-medium text-gray-700">
                  Assistant ID
                </label>
                <input
                  type="text"
                  id="assistantId"
                  value={config.assistantId}
                  onChange={(e) => setConfig((prev: PlaygroundConfig) => ({ ...prev, assistantId: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="asst_..."
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Assistant Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={config.name}
                  onChange={(e) => setConfig((prev: PlaygroundConfig) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig((prev: PlaygroundConfig) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={3}
                />
              </div>

              {isCreatingAssistant && (
                <div className="text-blue-600 text-sm bg-blue-50 p-3 rounded flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{creationProgress}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isCreatingAssistant}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingAssistant ? 'Creating Assistant...' : 'Start Testing'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Add your playground UI here */}
          </div>
        )}
      </div>
    </div>
  );
}; 