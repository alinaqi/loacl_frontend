import React, { useState, useEffect } from 'react';
import { ChatWidget } from '../components/ChatWidget';

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

interface AuthState {
  accessToken: string;
  isAuthenticated: boolean;
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
  const [auth, setAuth] = useState<AuthState>({
    accessToken: '',
    isAuthenticated: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Authenticate on component mount
  useEffect(() => {
    const authenticate = async () => {
      try {
        const formData = new URLSearchParams();
        formData.append('username', 'ashaheen+system@workhub.ai');
        formData.append('password', 'uraan123');
        formData.append('grant_type', 'password');

        const response = await fetch('http://localhost:8000/api/v1/auth/login/access-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        setAuth({
          accessToken: data.access_token,
          isAuthenticated: true,
        });
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate. Please try again later.');
      }
    };

    authenticate();
  }, []);

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      setError(`Please provide: ${missingFields.join(', ')}`);
      return;
    }

    // Validate Assistant ID format
    if (!config.assistantId.startsWith('asst_')) {
      setError('Invalid Assistant ID format. It should start with "asst_"');
      return;
    }

    try {
      // First create the assistant in our database
      const createResponse = await fetch('http://localhost:8000/api/v1/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`,
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
        console.error('Assistant Creation Error:', errorData);
        
        if (Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail
            .map((err: { msg: string; loc: string[] }) => `${err.msg} at ${err.loc.join('.')}`)
            .join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'Failed to create assistant');
      }

      // Get the created assistant's UUID
      const assistantData = await createResponse.json();
      const assistantUuid = assistantData.id;

      // Now create a thread using the UUID
      const threadResponse = await fetch(`http://localhost:8000/api/v1/assistant-streaming/threads/stream?assistant_id=${assistantUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: "Hello!"
          }]
        }),
      });

      if (!threadResponse.ok) {
        const errorData = await threadResponse.json();
        console.error('Thread Creation Error:', errorData);
        if (errorData.error) {
          throw new Error(errorData.error.message);
        }
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'Failed to create thread');
      }

      const threadData = await threadResponse.json();
      console.log('Thread created:', threadData);

      // Update config with the UUID for future API calls
      setConfig(prev => ({ ...prev, uuid: assistantUuid }));
      setIsConfigured(true);
    } catch (error) {
      console.error('Full error:', error);
      setError(error instanceof Error ? error.message : 'Failed to configure assistant');
    }
  };

  const handleSave = async () => {
    if (!auth.isAuthenticated || !config.uuid) {
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
          'Authorization': `Bearer ${auth.accessToken}`,
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

  if (!auth.isAuthenticated) {
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
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Playground</h1>
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

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start Testing
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
                    accessToken={auth.accessToken}
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