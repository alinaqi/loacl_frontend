import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

interface WidgetConfig {
  assistantId: string;
  apiKey: string;
  features?: {
    showFileUpload?: boolean;
    showVoiceInput?: boolean;
    showEmoji?: boolean;
  };
}

const WidgetApp = () => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    // Notify parent that widget is ready
    window.parent.postMessage({ type: 'ready' }, '*');

    // Listen for messages from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'init') {
        setConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-transparent">
      <ChatWidget
        assistantId={config.assistantId}
        apiKey={config.apiKey}
        features={config.features}
        previewMode={true}
      />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <WidgetApp />
    </React.StrictMode>
  );
} 