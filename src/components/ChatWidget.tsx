import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { v4 as uuidv4 } from 'uuid';

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
  isUser: boolean;
  severity?: 'info' | 'warning' | 'error';
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
  assistantId?: string;
  apiKey?: string;
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
  assistantId = import.meta.env.VITE_ASSISTANT_ID,
  apiKey,
}) => {
  const [isOpen, setIsOpen] = useState(previewMode);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: '👋 Hello! How can I help you today?',
    type: 'bot',
    timestamp: new Date(),
    isUser: false,
    isTyping: false
  }]);
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

  const handleSend = async (message: string) => {
    if (!assistantId) {
      setError('Assistant ID is required');
      return;
    }

    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setError(null);
    const currentMessage = message;
    setMessage(''); // Clear the input immediately after sending

    // Add user message immediately
    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
      text: currentMessage,
      type: 'user',
      timestamp: new Date(),
      isUser: true,
      isTyping: false
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Create a typing indicator message
      const typingMessageId = uuidv4();
      const typingMessage: Message = {
        id: typingMessageId,
        text: '',
        type: 'bot',
        timestamp: new Date(),
        isUser: false,
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);

      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Accept': 'text/event-stream',
      };

      let response;
      let threadId = null;

      // Create new thread with initial message
      const messageData = {
        role: "user",
        content: currentMessage
      };
      
      response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/assistant-streaming/threads/stream?assistant_id=${assistantId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [messageData]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      await handleRunResponse(response, typingMessageId);
    } catch (err) {
      console.error('Error in chat:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing your message');
      // Clean up any typing indicators
      setMessages(prev => prev.filter(msg => !msg.isTyping));
    }
  };

  // Helper function to handle run response streaming
  const handleRunResponse = async (response: Response, typingMessageId: string) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const messageMap = new Map(); // Track messages by ID

    if (!reader) {
      setError('Failed to read response stream');
      setMessages((prev) => prev.filter(msg => msg.id !== typingMessageId));
      return;
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // When stream is complete, remove typing indicator if it still exists
          setMessages((prev) => prev.filter(msg => msg.id !== typingMessageId));
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
            continue;
          }

          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              console.log('Event type:', eventType, 'Event data:', eventData);

              switch (eventType) {
                case 'thread.message.created':
                  if (eventData.role === 'assistant' && !messageMap.has(eventData.id)) {
                    const messageContent = eventData.content?.[0]?.text?.value || '';
                    messageMap.set(eventData.id, messageContent);
                    
                    // Create new message only if it doesn't exist
                    setMessages((prev) => {
                      if (prev.some(msg => msg.id === eventData.id)) return prev;
                      
                      const newMessage: Message = {
                        id: eventData.id,
                        text: messageContent,
                        type: 'bot',
                        timestamp: new Date(),
                        isUser: false,
                        isTyping: false
                      };
                      return [...prev.filter(msg => msg.id !== typingMessageId), newMessage];
                    });
                  }
                  break;

                case 'thread.message.delta':
                  if (eventData.delta?.content && eventData.id) {
                    const deltaContent = eventData.delta.content[0]?.text?.value;
                    if (deltaContent) {
                      const currentContent = messageMap.get(eventData.id) || '';
                      const newContent = currentContent + deltaContent;
                      messageMap.set(eventData.id, newContent);
                      
                      // Update existing message with new content
                      setMessages((prev) => {
                        return prev.map(msg => 
                          msg.id === eventData.id 
                            ? { ...msg, text: newContent }
                            : msg
                        );
                      });
                    }
                  }
                  break;

                case 'thread.created':
                  // Store thread ID in memory instead of localStorage
                  threadId = eventData.id;
                  break;

                case 'thread.run.completed':
                  // Just log completion, no message manipulation needed
                  console.log('Run completed');
                  break;
              }
            } catch (e) {
              console.error('Error parsing event data:', e);
              continue;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error reading stream:', err);
      setError('Error reading response stream');
      setMessages((prev) => prev.filter(msg => msg.id !== typingMessageId));
    } finally {
      reader.cancel();
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
      handleSend(message);
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
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                    onClick={() => handleSend(message)}
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