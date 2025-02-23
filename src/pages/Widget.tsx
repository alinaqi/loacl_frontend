import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChatWidget } from '../components/ChatWidget';

export const Widget: React.FC = () => {
  const { assistantId } = useParams<{ assistantId: string }>();
  const params = new URLSearchParams(window.location.search);
  const position = params.get('position') as 'left' | 'right' || 'right';
  const features = JSON.parse(params.get('features') || '{}');
  const styles = JSON.parse(params.get('styles') || '{}');
  const apiKey = params.get('apiKey');

  useEffect(() => {
    // Set the API key in localStorage for the ChatWidget to use
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, [apiKey]);

  if (!assistantId) {
    return (
      <div className="text-red-500 p-4">
        Error: Assistant ID is required
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="text-red-500 p-4">
        Error: API key is required
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatWidget
        assistantId={assistantId}
        position={position}
        features={{
          showFileUpload: true,
          showVoiceInput: true,
          showEmoji: true,
          ...features,
        }}
        customStyles={styles}
      />
    </div>
  );
}; 