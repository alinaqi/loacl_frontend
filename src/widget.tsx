import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

// Create widget container
const widgetContainer = document.createElement('div');
widgetContainer.id = 'loacl-widget-container';
document.body.appendChild(widgetContainer);

// Initialize widget
const root = createRoot(widgetContainer);
root.render(
  <React.StrictMode>
    <ChatWidget
      assistantId={new URLSearchParams(window.location.search).get('assistantId') || ''}
      apiKey={new URLSearchParams(window.location.search).get('apiKey') || ''}
      position={new URLSearchParams(window.location.search).get('position') as 'left' | 'right' || 'right'}
      features={JSON.parse(new URLSearchParams(window.location.search).get('features') || '{}')}
      customStyles={JSON.parse(new URLSearchParams(window.location.search).get('styles') || '{}')}
    />
  </React.StrictMode>
); 