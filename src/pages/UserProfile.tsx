import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export const UserProfile = () => {
  const { accessToken } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Fetch existing API keys
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const headers = {
          'X-API-Key': import.meta.env.VITE_BACKEND_KEY,
        };
        console.log('Request Headers:', headers); // Debug log

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/api-keys`, {
          headers,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Response:', errorData); // Debug log
          throw new Error('Failed to fetch API keys');
        }

        const data = await response.json();
        setApiKeys(data);
      } catch (error) {
        setApiKeyError('Failed to load API keys');
        console.error('Error fetching API keys:', error);
      }
    };

    if (accessToken) {
      fetchApiKeys();
    }
  }, [accessToken]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_BACKEND_KEY,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update password');
      }

      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  const generateApiKey = async () => {
    setIsLoading(true);
    setApiKeyError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/api-keys`, {
        method: 'POST',
        headers: {
          'X-API-Key': import.meta.env.VITE_BACKEND_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const newKey = await response.json();
      setApiKeys(prev => [...prev, newKey]);
    } catch (error) {
      setApiKeyError('Failed to generate API key');
      console.error('Error generating API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': import.meta.env.VITE_BACKEND_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      setApiKeys(prev => prev.filter(key => key.id !== keyId));
    } catch (error) {
      setApiKeyError('Failed to revoke API key');
      console.error('Error revoking API key:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile</h1>

          {/* Password Update Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Password</h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              {passwordError && (
                <div className="text-red-600 text-sm">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="text-green-600 text-sm">{passwordSuccess}</div>
              )}
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* API Keys Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
              <button
                onClick={generateApiKey}
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate New Key'}
              </button>
            </div>
            
            {apiKeyError && (
              <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
                {apiKeyError}
              </div>
            )}

            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{key.name}</span>
                        {key.is_active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium focus:outline-none"
                      >
                        Revoke
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                        <code className="text-sm font-mono text-gray-800 flex-1 break-all">
                          {key.key}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(key.key);
                            // You could add a toast notification here
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy to clipboard"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      Created on {new Date(key.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {apiKeys.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by generating a new API key.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 