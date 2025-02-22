import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

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

interface ChatWidgetProps {
  customStyles?: {
    '--primary-color'?: string;
    '--secondary-color'?: string;
    '--text-color'?: string;
    '--bg-color'?: string;
    '--widget-width'?: string;
    '--widget-height'?: string;
    '--border-radius'?: string;
    '--font-family'?: string;
    '--font-size'?: string;
    '--message-bubble-color'?: string;
    '--user-message-color'?: string;
  };
  position?: 'left' | 'right';
  features?: {
    showFileUpload?: boolean;
    showVoiceInput?: boolean;
    showEmoji?: boolean;
  };
  previewMode?: boolean;
  openaiKey?: string;
  assistantId?: string;
  accessToken?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  customStyles = {},
  position = 'right',
  features = {
    showFileUpload: true,
    showVoiceInput: true,
    showEmoji: true,
  },
  previewMode = false,
  openaiKey,
  assistantId,
  accessToken,
}) => {
  const [isOpen, setIsOpen] = useState(previewMode);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! How can I help you today?',
      type: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [threadId, setThreadId] = useState<string>('');
  const [isCreatingThread, setIsCreatingThread] = useState(false);

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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const widgetStyles = {
    '--primary-color': '#2563eb',
    '--secondary-color': '#1d4ed8',
    '--text-color': '#111827',
    '--bg-color': '#ffffff',
    '--widget-width': '400px',
    '--widget-height': '600px',
    '--border-radius': '12px',
    '--font-family': 'Inter, system-ui, sans-serif',
    '--font-size': '14px',
    '--message-bubble-color': '#f3f4f6',
    '--user-message-color': '#e0e7ff',
    ...customStyles,
  };

  const containerClasses = previewMode
    ? 'relative'
    : `fixed bottom-4 ${position === 'right' ? 'right-4' : 'left-4'} z-50`;

  const chatWindowClasses = previewMode
    ? 'relative'
    : 'absolute bottom-20 right-0';

  return (
    <div 
      className={containerClasses}
      style={widgetStyles as React.CSSProperties}
    >
      {(isOpen || previewMode) && (
        <div 
          className={`${chatWindowClasses} bg-white rounded-lg shadow-xl overflow-hidden`}
          style={{
            width: 'var(--widget-width)',
            height: 'var(--widget-height)',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size)',
          }}
        >
          <div 
            className="p-4 flex justify-between items-center"
            style={{
              backgroundColor: 'var(--primary-color)',
            }}
          >
            <h3 className="text-white font-semibold">LOACL Chat</h3>
            {!previewMode && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>
          <div 
            className="bg-gray-50 p-4"
            style={{
              height: `calc(var(--widget-height) - 64px)`,
            }}
          >
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 ${msg.type === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}
                  >
                    <div
                      className="rounded-lg p-3 shadow"
                      style={{
                        backgroundColor: msg.type === 'user' 
                          ? 'var(--user-message-color)' 
                          : 'var(--message-bubble-color)',
                      }}
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
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {selectedFile.name}
                        </p>
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
                <div className="flex items-center mt-2">
                  <div className="flex space-x-2">
                    {features.showFileUpload && (
                      <>
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
                      </>
                    )}
                    {features.showVoiceInput && (
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        title="Voice input"
                      >
                        🎤
                      </button>
                    )}
                    {features.showEmoji && (
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-gray-500 hover:text-gray-700"
                          title="Add emoji"
                        >
                          😊
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-full left-0 mb-2">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow"></div>
                  <button
                    onClick={handleSend}
                    disabled={!message && !selectedFile}
                    className="px-4 py-2 rounded transition-colors"
                    style={{
                      backgroundColor: !message && !selectedFile ? '#D1D5DB' : 'var(--primary-color)',
                      color: !message && !selectedFile ? '#6B7280' : '#ffffff',
                      cursor: !message && !selectedFile ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!previewMode && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-colors"
          style={{
            backgroundColor: 'var(--primary-color)',
            color: '#ffffff',
          }}
        >
          <span className="text-2xl">{isOpen ? '✕' : '💬'}</span>
        </button>
      )}
    </div>
  );
}; 