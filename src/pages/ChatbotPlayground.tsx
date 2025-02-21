import React, { useState, useEffect } from 'react';
import { ChatWidget } from '../components/ChatWidget';

interface PlaygroundConfig {
  openaiKey: string;
  assistantId: string;
  name: string;
  description: string;
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
      // First validate the assistant exists
      const validateResponse = await fetch(`http://localhost:8000/api/v1/assistant-communication/validate-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({
          assistant_id: config.assistantId,
          api_key: config.openaiKey
        }),
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        console.error('API Error:', errorData);
        
        // Handle array of validation errors
        if (Array.isArray(errorData.detail)) {
          interface ValidationError {
            msg: string;
            loc: string[];
            type: string;
          }
          
          const errorMessages = errorData.detail
            .map((err: ValidationError) => `${err.msg} at ${err.loc.join('.')}`)
            .join(', ');
          throw new Error(errorMessages);
        }
        
        // Handle string error
        if (typeof errorData.detail === 'string') {
          throw new Error(errorData.detail);
        }
        
        throw new Error('Failed to validate assistant');
      }

      // If validation succeeds, create a thread
      const response = await fetch(`http://localhost:8000/api/v1/assistant-communication/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({
          api_key: config.openaiKey,
          assistant_id: config.assistantId,
          messages: [{
            role: "user",
            content: "Hello!",
            file_ids: []
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'Failed to create thread');
      }

      setIsConfigured(true);
    } catch (error) {
      console.error('Full error:', error);
      setError(error instanceof Error ? error.message : 'Failed to validate configuration');
    }
  };

  const handleSave = async () => {
    if (!auth.isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          instructions: "You are a helpful assistant",
          model: "gpt-4-turbo-preview",
          api_key: config.openaiKey,
          assistant_id: config.assistantId,
          tools_enabled: ["code_interpreter"]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assistant');
      }

      alert('Assistant saved successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save assistant');
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">{config.name}</h2>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Assistant'}
                </button>
              </div>
              <div className="h-[600px]">
                <ChatWidget
                  customStyles={{
                    '--widget-width': '100%',
                    '--widget-height': '100%',
                    '--border-radius': '0.5rem',
                  }}
                  openaiKey={config.openaiKey}
                  assistantId={config.assistantId}
                  accessToken={auth.accessToken}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 