import React, { useState, useRef } from 'react';

interface FilePreview {
  name: string;
  size: string;
  type: string;
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
  };
  position?: 'left' | 'right';
  features?: {
    showFileUpload?: boolean;
    showVoiceInput?: boolean;
    showEmoji?: boolean;
  };
  previewMode?: boolean;
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
}) => {
  const [isOpen, setIsOpen] = useState(previewMode);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = () => {
    // Here you would typically send both message and file to your backend
    console.log('Sending message:', message);
    if (selectedFile) {
      console.log('With file:', selectedFile);
    }
    setMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          }}
        >
          <div 
            className="p-4 flex justify-between items-center"
            style={{
              backgroundColor: 'var(--primary-color)',
            }}
          >
            <h3 className="text-white font-semibold">LOACL Chat</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div 
            className="bg-gray-50 p-4"
            style={{
              height: `calc(var(--widget-height) - 64px)`,
            }}
          >
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">
                <div className="bg-white rounded-lg p-3 shadow mb-2">
                  <p className="text-gray-600">
                    👋 Hello! How can I help you today?
                  </p>
                </div>
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
                  placeholder="Type your message..."
                  className="w-full p-2 border border-gray-200 rounded resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
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
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      title="Add emoji"
                    >
                      😊
                    </button>
                  )}
                  <button
                    onClick={handleSend}
                    disabled={!message && !selectedFile}
                    className="px-4 py-2 rounded"
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