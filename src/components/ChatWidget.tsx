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
  position?: 'inpage' | 'floating';
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
  position = 'floating',
  features = {
    showFileUpload: true,
    showVoiceInput: true,
    showEmoji: true,
  },
  previewMode = false,
  assistantId = import.meta.env.VITE_ASSISTANT_ID,
  apiKey = import.meta.env.VITE_BACKEND_KEY,
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
      // Create a thinking message
      const thinkingMessageId = uuidv4();
      const thinkingMessage: Message = {
        id: thinkingMessageId,
        text: 'Thinking...',
        type: 'bot',
        timestamp: new Date(),
        isUser: false,
        isTyping: true
      };
      setMessages(prev => [...prev, thinkingMessage]);

      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Accept': 'text/event-stream',
      };

      const messageData = {
        role: "user",
        content: currentMessage
      };
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/assistant-streaming/threads/stream?assistant_id=${assistantId}`, {
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
      await handleRunResponse(response, thinkingMessageId);
    } catch (err) {
      console.error('Error in chat:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing your message');
      // Clean up any thinking messages
      setMessages(prev => prev.filter(msg => !msg.isTyping));
    }
  };

  const handleRunResponse = async (response: Response, thinkingMessageId: string) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const messageMap = new Map<string, string>();
    let eventType = '';
    let currentMessageId: string | null = null;
    let hasAssistantMessage = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Remove thinking message when stream is complete
          setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
          break;
        }

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

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
                    hasAssistantMessage = true;
                    currentMessageId = eventData.id;
                    messageMap.set(eventData.id, '');
                    // Keep the thinking message until we get actual content
                  }
                  break;

                case 'thread.message.delta':
                  if (eventData.delta?.content && currentMessageId) {
                    const deltaContent = eventData.delta.content[0]?.text?.value;
                    if (deltaContent) {
                      const currentContent = messageMap.get(currentMessageId) || '';
                      const newContent = currentContent + deltaContent;
                      messageMap.set(currentMessageId, newContent);
                      
                      // Only remove thinking message and show content when we have actual content
                      if (newContent.trim()) {
                        setMessages((prev) => {
                          const existingMessage = prev.find(msg => msg.id === currentMessageId);
                          if (existingMessage) {
                            return prev.map(msg => 
                              msg.id === currentMessageId 
                                ? { ...msg, text: newContent }
                                : msg
                            );
                          } else if (currentMessageId) {
                            // First content received, replace thinking message
                            return [...prev.filter(msg => msg.id !== thinkingMessageId), {
                              id: currentMessageId,
                              text: newContent,
                              type: 'bot',
                              timestamp: new Date(),
                              isUser: false,
                              isTyping: false
                            }];
                          }
                          return prev;
                        });
                      }
                    }
                  }
                  break;

                case 'thread.message.completed':
                  // Only remove thinking message if we have actual content
                  if (currentMessageId && messageMap.get(currentMessageId)?.trim()) {
                    setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
                  }
                  break;

                case 'thread.run.completed':
                  // If we haven't received an assistant message yet, try to fetch it
                  if (!hasAssistantMessage && eventData.thread_id) {
                    try {
                      const messageResponse = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/v1/assistant-communication/threads/${eventData.thread_id}/messages?assistant_id=${assistantId}`,
                        { 
                          headers: {
                            'Content-Type': 'application/json',
                            'X-API-Key': apiKey,
                          }
                        }
                      );
                      
                      if (messageResponse.ok) {
                        const messages = await messageResponse.json();
                        const lastAssistantMessage = messages
                          .reverse()
                          .find((msg: { role: string; }) => msg.role === 'assistant');
                        
                        if (lastAssistantMessage?.content?.[0]?.text?.value) {
                          const messageContent = lastAssistantMessage.content[0].text.value;
                          const messageId = lastAssistantMessage.id;
                          
                          setMessages((prev) => {
                            if (prev.some(msg => msg.id === messageId)) return prev;
                            
                            const newMessage: Message = {
                              id: messageId,
                              text: messageContent,
                              type: 'bot',
                              timestamp: new Date(),
                              isUser: false,
                              isTyping: false
                            };
                            return [...prev.filter(msg => msg.id !== thinkingMessageId), newMessage];
                          });
                        }
                      }
                    } catch (error) {
                      console.error('Error fetching messages:', error);
                    }
                  }
                  break;

                case 'error':
                  console.error('Stream error:', eventData.error);
                  setError(eventData.error || 'An error occurred during streaming');
                  setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
                  break;
              }
            } catch (error) {
              console.error('Error parsing event data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in stream processing:', error);
      setError('Error processing response stream');
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
    } finally {
      reader.releaseLock();
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
    '--widget-width': position === 'inpage' ? '100%' : '400px',
    '--widget-height': '600px',
    '--border-radius': '12px',
    '--font-family': 'Inter, system-ui, sans-serif',
    '--font-size': '14px',
    '--message-bubble-color': '#f3f4f6',
    '--user-message-color': '#e0e7ff',
    ...customStyles,
  };

  const containerClasses = position === 'inpage'
    ? 'relative w-full h-full'
    : `fixed bottom-4 right-4 z-[9999]`;

  const chatWindowClasses = position === 'inpage'
    ? 'relative w-full h-full'
    : `fixed bottom-20 right-4 z-[9999]`;

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
                    className={`mb-4 flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`rounded-lg p-3 shadow max-w-[80%]`}
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
                        <p className={`text-gray-700 whitespace-pre-wrap break-words ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
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