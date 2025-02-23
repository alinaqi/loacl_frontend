import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatWidget } from '../components/ChatWidget';

export const Widget: React.FC = () => {
  const { assistantId } = useParams<{ assistantId: string }>();
  const params = new URLSearchParams(window.location.search);
  const position = params.get('position') as 'inpage' | 'floating' || 'floating';
  const features = JSON.parse(params.get('features') || '{}');
  const styles = JSON.parse(params.get('styles') || '{}');
  const apiKey = params.get('apiKey');

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

  const containerClass = position === 'inpage' ? 'h-full' : 'h-screen';

  return (
    <div className={containerClass}>
      <ChatWidget
        assistantId={assistantId}
        position={position}
        apiKey={apiKey}
        features={{
          showFileUpload: true,
          showVoiceInput: true,
          showEmoji: true,
          ...features,
        }}
        customStyles={styles}
        previewMode={position === 'inpage'}
      />
    </div>
  );
}; 