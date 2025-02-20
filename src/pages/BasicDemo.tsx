import React, { useState, useRef } from 'react';
import { ChatWidget } from '../components/ChatWidget';

interface FilePreview {
  name: string;
  size: string;
  type: string;
}

export const BasicDemo = () => {
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
      <ChatWidget />
    </div>
  );
}; 