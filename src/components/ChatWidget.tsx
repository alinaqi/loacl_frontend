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
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setIsTyping(true);
    setError(null);

    try {
      // Create a thread if we don't have one
      const storedThreadId = localStorage.getItem(`thread_${assistantId}`);
      let threadId = storedThreadId || '';
      
      if (!threadId) {
        const threadResponse = await fetch(`http://localhost:8000/api/v1/assistant-streaming/threads/stream?assistant_id=${assistantId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: message
            }]
          }),
        });

        if (!threadResponse.ok) {
          const errorData = await threadResponse.json();
          console.error('Thread creation error:', errorData);
          throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 
            (Array.isArray(errorData.detail) ? errorData.detail[0].msg : 'Failed to create thread'));
        }

        // Handle streaming response for thread creation
        const reader = threadResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('event: ')) {
                  const eventType = line.slice(7);
                  console.log('Event type:', eventType);
                  continue;
                }

                if (line.startsWith('data: ')) {
                  try {
                    const eventData = JSON.parse(line.slice(6));
                    console.log('Event data:', eventData);

                    if (eventData.id && eventData.object === 'thread') {
                      threadId = eventData.id;
                      localStorage.setItem(`thread_${assistantId}`, threadId);
                    } else if (eventData.error) {
                      throw new Error(eventData.error);
                    }
                  } catch (e) {
                    console.error('Error parsing event data:', e);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      }

      // Now send the message and get streaming response
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
            content: message
          }]
        }),
      });

      if (!runResponse.ok) {
        const errorData = await runResponse.json();
        console.error('Run creation error:', errorData);
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 
          (Array.isArray(errorData.detail) ? errorData.detail[0].msg : 'Failed to start assistant run'));
      }

      // Handle streaming response
      const reader = runResponse.body?.getReader();
      const decoder = new TextDecoder();
      let currentMessage = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
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
                        const botMessage: Message = {
                          id: Date.now().toString(),
                          text: currentMessage,
                          type: 'bot',
                          timestamp: new Date(),
                        };
                        setMessages((prev) => {
                          const filtered = prev.filter(m => m.type !== 'bot' || m.text !== currentMessage);
                          return [...filtered, botMessage];
                        });
                      }
                    }
                  } else if (eventData.error) {
                    throw new Error(eventData.error);
                  }
                } catch (e) {
                  console.error('Error parsing event data:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response from assistant');
    } finally {
      setIsTyping(false);
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
                      <p className="text-gray-700 whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
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
                {isTyping && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
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