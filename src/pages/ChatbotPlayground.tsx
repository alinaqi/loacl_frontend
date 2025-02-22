import React, { useState } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';

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
  const { accessToken, isAuthenticated } = useAuth();
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
  const [isSaving, setIsSaving] = useState(false);
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
      
      // Create the assistant in our database
      const createResponse = await fetch('http://localhost:8000/api/v1/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: config.name,
          description: config.description || `Assistant ${config.name}`,
          instructions: "You are a helpful assistant",
          model: "gpt-4-turbo-preview",
          api_key: config.openaiKey,
          assistant_id: config.assistantId,
          tools_enabled: ["code_interpreter"]
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        if (Array.isArray(errorData.detail)) {
          throw new Error(errorData.detail.map((err: { msg: string }) => err.msg).join(', '));
        }
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'Failed to create assistant');
      }

      setCreationProgress('Assistant created successfully!');
      
      // Get the created assistant's UUID
      const assistantData = await createResponse.json();
      const assistantUuid = assistantData.id;

      // Update config with the UUID for future API calls
      setConfig(prev => ({ ...prev, uuid: assistantUuid }));
      setIsConfigured(true);

    } catch (error) {
      console.error('Full error:', error);
      setError(error instanceof Error ? error.message : 'Failed to configure assistant');
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated || !config.uuid) {
      setError('Not authenticated or assistant not properly configured');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Update assistant settings using the UUID
      const response = await fetch(`http://localhost:8000/api/v1/assistants/${config.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          theme: {
            primary_color: config.theme?.primary_color,
            secondary_color: config.theme?.secondary_color,
            text_color: config.theme?.text_color,
            background_color: config.theme?.background_color
          },
          chat_bubble_text: config.chat_bubble_text,
          initial_message: config.initial_message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'Failed to update assistant settings');
      }

      alert('Assistant settings saved successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save assistant settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">Authenticating...</h1>
          {error && (
            <div className="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Playground</h1>
          <p className="mt-2 text-gray-600">
            Test your OpenAI assistant by providing your API key and assistant ID
          </p>
        </div>

        {!isConfigured ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
            <form onSubmit={handleConfigSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assistant Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={config.name}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="My Assistant"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={config.description}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="A helpful assistant that..."
                  rows={3}
                />
              </div>

              <div>
                <label
                  htmlFor="openaiKey"
                  className="block text-sm font-medium text-gray-700"
                >
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  id="openaiKey"
                  value={config.openaiKey}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, openaiKey: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="sk-..."
                />
              </div>

              <div>
                <label
                  htmlFor="assistantId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assistant ID
                </label>
                <input
                  type="text"
                  id="assistantId"
                  value={config.assistantId}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, assistantId: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="asst_..."
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

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
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customization Panel */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Customize Your Chatbot</h2>
                <div className="space-y-6">
                  {/* Theme Colors */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Theme Colors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Primary Color</label>
                        <input
                          type="color"
                          value={config.theme?.primary_color || '#2563eb'}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              theme: {
                                ...prev.theme!,
                                primary_color: e.target.value
                              }
                            }));
                          }}
                          className="w-full h-10 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Secondary Color</label>
                        <input
                          type="color"
                          value={config.theme?.secondary_color || '#1d4ed8'}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              theme: {
                                ...prev.theme!,
                                secondary_color: e.target.value
                              }
                            }));
                          }}
                          className="w-full h-10 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Text Color</label>
                        <input
                          type="color"
                          value={config.theme?.text_color || '#111827'}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              theme: {
                                ...prev.theme!,
                                text_color: e.target.value
                              }
                            }));
                          }}
                          className="w-full h-10 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Background Color</label>
                        <input
                          type="color"
                          value={config.theme?.background_color || '#ffffff'}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              theme: {
                                ...prev.theme!,
                                background_color: e.target.value
                              }
                            }));
                          }}
                          className="w-full h-10 rounded border border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Messages</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Chat Bubble Text</label>
                        <input
                          type="text"
                          value={config.chat_bubble_text || 'Chat with me!'}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              chat_bubble_text: e.target.value
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Initial Message</label>
                        <input
                          type="text"
                          value={config.initial_message || 'Hello! How can I help you today!'}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              initial_message: e.target.value
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Features</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.features?.showFileUpload}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              features: {
                                ...prev.features!,
                                showFileUpload: e.target.checked
                              }
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">File Upload</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.features?.showVoiceInput}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              features: {
                                ...prev.features!,
                                showVoiceInput: e.target.checked
                              }
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Voice Input</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.features?.showEmoji}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              features: {
                                ...prev.features!,
                                showEmoji: e.target.checked
                              }
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Emoji Picker</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Chat Preview */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                </div>
                <div className="h-[800px]">
                  <ChatWidget
                    customStyles={{
                      '--widget-width': '100%',
                      '--widget-height': '100%',
                      '--border-radius': '0.5rem',
                      '--primary-color': config.theme?.primary_color,
                      '--secondary-color': config.theme?.secondary_color,
                      '--text-color': config.theme?.text_color,
                      '--bg-color': config.theme?.background_color,
                    }}
                    openaiKey={config.openaiKey}
                    assistantId={config.uuid || config.assistantId}
                    accessToken={accessToken}
                    previewMode={true}
                    features={config.features}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 