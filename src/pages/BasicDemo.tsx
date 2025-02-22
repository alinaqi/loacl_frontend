import React, { useState, useRef, useEffect } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface FilePreview {
  name: string;
  size: string;
  type: string;
}

interface Message {
  id: string;
  text: string;
  type: 'user' | 'bot';
  timestamp: Date;
  file?: FilePreview;
  isTyping?: boolean;
}

export const BasicDemo = () => {
  const { accessToken, login } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! How can I help you today?',
      type: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string>('');
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  // Auto-login with demo credentials
  useEffect(() => {
    const autoLogin = async () => {
      if (!accessToken) {
        try {
          const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
          const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;
          await login({ email: demoEmail, password: demoPassword });
        } catch (err) {
          console.error('Auto-login error:', err);
          setError('Failed to auto-login with demo credentials');
        }
      }
    };

    autoLogin();
  }, [accessToken, login]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSend = async () => {
    if (!message && !selectedFile) return;

    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const assistantId = import.meta.env.VITE_ASSISTANT_ID;

    if (!openaiKey || !assistantId || !accessToken) {
      setError('OpenAI API key, Assistant ID, and access token are required');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      type: 'user',
      timestamp: new Date(),
      file: selectedFile || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input
    setMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Send message using our backend API
    setError(null);

    try {
      // Create a thread if we don't have one
      if (!threadId) {
        setIsCreatingThread(true);
        const threadResponse = await fetch(`http://localhost:8000/api/v1/assistant-streaming/threads/stream?assistant_id=${assistantId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({}) // Create empty thread first
        });

        if (!threadResponse.ok) {
          throw new Error(`Failed to create thread: ${threadResponse.status}`);
        }

        const reader = threadResponse.body?.getReader();
        const decoder = new TextDecoder();
        let newThreadId = '';

        if (reader) {
          try {
            let buffer = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.trim() === '') continue;
                
                if (line.startsWith('data: ')) {
                  try {
                    const eventData = JSON.parse(line.slice(6));
                    if (eventData.object === 'thread') {
                      newThreadId = eventData.id;
                      setThreadId(newThreadId);
                      break;
                    }
                  } catch (e) {
                    console.error('Error parsing event data:', e);
                  }
                }
              }
              if (newThreadId) break;
            }
          } finally {
            reader.releaseLock();
            setIsCreatingThread(false);
          }
        }

        if (!newThreadId) {
          throw new Error('Failed to get thread ID from response');
        }

        // Now send the message to the new thread
        const runResponse = await fetch(`http://localhost:8000/api/v1/assistant-streaming/threads/${newThreadId}/runs/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            assistant_id: assistantId,
            instructions: null,
            tools: [],
            messages: [{
              role: "user",
              content: userMessage.text
            }]
          }),
        });

        if (!runResponse.ok) {
          throw new Error(`Failed to create run: ${runResponse.status}`);
        }

        await handleRunResponse(runResponse);
      } else {
        // For existing thread, send message via run
        const runResponse = await fetch(`http://localhost:8000/api/v1/assistant-streaming/threads/${threadId}/runs/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            assistant_id: assistantId,
            instructions: null,
            tools: [],
            messages: [{
              role: "user",
              content: userMessage.text
            }]
          }),
        });

        if (!runResponse.ok) {
          throw new Error(`Failed to create run: ${runResponse.status}`);
        }

        await handleRunResponse(runResponse);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response from assistant');
    }
  };

  // Helper function to handle run response streaming
  const handleRunResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let currentMessage = '';
    let buffer = '';
    const messageId = Date.now().toString();

    // Add initial bot message with typing indicator
    setMessages((prev) => [...prev, {
      id: messageId,
      text: '',
      type: 'bot',
      timestamp: new Date(),
      isTyping: true
    }]);

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('event: ')) {
              const eventType = line.slice(7);
              console.log('Event type:', eventType);
              continue;
            }

            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                console.log('Event data:', eventData);

                if (eventData.delta?.content) {
                  const content = eventData.delta.content;
                  for (const part of content) {
                    if (part.type === 'text') {
                      currentMessage += part.text.value;
                      // Update the existing message and remove typing indicator
                      setMessages((prev) => prev.map(msg => 
                        msg.id === messageId
                          ? { ...msg, text: currentMessage, isTyping: false }
                          : msg
                      ));
                    }
                  }
                }
              } catch (e) {
                console.error('Error parsing event data:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        // Ensure typing indicator is removed when done
        setMessages((prev) => prev.map(msg => 
          msg.id === messageId
            ? { ...msg, isTyping: false }
            : msg
        ));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Basic Integration Demo</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to LOACL Chat</h2>
            <p className="text-gray-600 mb-4">This is a basic integration example showing how LOACL can be embedded in any webpage.</p>
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Integration Code</h3>
                <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
                  {`<div id="loacl-chat">
  <!-- LOACL Chat will be mounted here -->
</div>

<script>
  window.LOACL.init({
    containerId: 'loacl-chat',
    theme: 'light',
    position: 'inline'
  });
</script>`}
                </pre>
              </div>
              <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Fully customizable UI</li>
                  <li>• File upload support</li>
                  <li>• Real-time messaging</li>
                  <li>• Typing indicators</li>
                  <li>• Read receipts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Inline Chat Interface */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-indigo-600 p-4">
              <h3 className="text-white font-semibold">LOACL Chat</h3>
            </div>
            <div className="h-[400px] bg-gray-50 p-4">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 ${msg.type === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}
                    >
                      <div
                        className={`rounded-lg p-3 shadow ${
                          msg.type === 'user' 
                            ? 'bg-indigo-100' 
                            : 'bg-white'
                        }`}
                      >
                        {msg.isTyping ? (
                          <div className="flex items-center space-x-2 h-6">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        )}
                        {msg.file && (
                          <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">📎</span>
                              <div>
                                <p className="text-sm font-medium text-gray-700 truncate">
                                  {msg.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {msg.file.size}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {isCreatingThread && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600 text-sm bg-blue-50 p-3 rounded mb-4">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating conversation thread...</span>
                    </div>
                  )}
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="bg-white rounded-lg shadow p-2">
                  {selectedFile && (
                    <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">📎</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700 truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{selectedFile.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full p-2 border border-gray-200 rounded resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gray-500 hover:text-gray-700"
                      title="Attach file"
                    >
                      📎
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!message && !selectedFile}
                      className={`px-4 py-2 rounded ${
                        message || selectedFile
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating chat widget for comparison */}
      <ChatWidget 
        accessToken={accessToken} 
        openaiKey={import.meta.env.VITE_OPENAI_API_KEY}
        assistantId={import.meta.env.VITE_ASSISTANT_ID}
      />

      {/* Playground Link */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-gray-600">
          Visit our{' '}
          <Link
            to="/chatbot-playground"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Interactive Playground
          </Link>
          {' '}to customize the chat widget to your needs.
        </p>
      </div>
    </div>
  );
}; 