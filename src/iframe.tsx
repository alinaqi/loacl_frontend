import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';
import './index.css';

const IframeApp = () => {
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const assistantId = params.get('assistantId');
  const position = params.get('position') as 'left' | 'right' || 'right';
  const features = JSON.parse(params.get('features') || '{}');
  const styles = JSON.parse(params.get('styles') || '{}');

  if (!assistantId) {
    return (
      <div className="text-red-500 p-4">
        Error: Assistant ID is required
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatWidget
        assistantId={assistantId}
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
      <IframeApp />
    </React.StrictMode>
  );
} 