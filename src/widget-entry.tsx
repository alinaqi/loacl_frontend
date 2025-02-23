import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';
import './index.css';

// Parse URL parameters
const params = new URLSearchParams(window.location.search);
const assistantId = params.get('assistantId');
const apiKey = params.get('apiKey');
const position = params.get('position') as 'left' | 'right' || 'right';
const features = JSON.parse(params.get('features') || '{}');
const styles = JSON.parse(params.get('styles') || '{}');

const WidgetApp = () => {
  if (!assistantId || !apiKey) {
    return (
      <div className="text-red-500 p-4">
        Error: Assistant ID and API key are required
      </div>
    );
  }

  return (
    <div className="h-screen bg-transparent">
      <ChatWidget
        assistantId={assistantId}
        apiKey={apiKey}
        position={position}
        features={features}
        customStyles={styles}
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