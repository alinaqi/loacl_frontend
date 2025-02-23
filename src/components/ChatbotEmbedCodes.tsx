import React, { useEffect, useState } from 'react';
import { CodeSnippets } from './CodeSnippets';
import { chatbotApi } from '../services/chatbotApi';
import { Chatbot } from '../types/chatbot';

interface ChatbotEmbedCodesProps {
  assistantId: string;
  className?: string;
}

export const ChatbotEmbedCodes: React.FC<ChatbotEmbedCodesProps> = ({ 
  assistantId,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assistant, setAssistant] = useState<Chatbot | null>(null);
  const widgetBaseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const projectApiKey = import.meta.env.VITE_BACKEND_KEY;

  useEffect(() => {
    const fetchAssistantDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const assistantData = await chatbotApi.getChatbotSettings(assistantId);
        setAssistant(assistantData);
      } catch (err) {
        console.error('Error fetching assistant details:', err);
        if (err instanceof Error) {
          setError(`Failed to fetch assistant details: ${err.message}`);
        } else {
          setError('Failed to fetch assistant details. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistantDetails();
  }, [assistantId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !assistant) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error || 'Assistant not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const embedSnippets = [
    {
      title: 'IFrame Embed',
      description: 'Add this code to embed the chat widget as an iframe in your website.',
      language: 'html',
      code: `<!-- LOACL Chat Widget -->
<iframe
  src="${widgetBaseUrl}/widget/${assistantId}?apiKey=${projectApiKey}"
  style="border: none; position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; z-index: 9999; background: transparent;"
  allow="microphone"
  title="LOACL Chat Widget"
></iframe>`
    },
    {
      title: 'JavaScript Embed (Recommended)',
      description: 'Add this script tag to your website to load the chat widget. This is the recommended approach as it provides more flexibility and features.',
      language: 'html',
      code: `<!-- LOACL Chat Widget -->
<script src="${widgetBaseUrl}/widget.js"></script>
<script>
  window.loaclWidget.init({
    baseUrl: '${widgetBaseUrl}',
    assistantId: '${assistantId}',
    apiKey: '${projectApiKey}',
    apiUrl: '${backendUrl}',
    position: 'floating',
    features: {
      showFileUpload: true,
      showVoiceInput: true,
      showEmoji: true
    },
    styles: {
      '--primary-color': '${assistant.design_settings.theme.primary_color}',
      '--secondary-color': '${assistant.design_settings.theme.secondary_color}',
      '--text-color': '${assistant.design_settings.theme.text_color}',
      '--bg-color': '${assistant.design_settings.theme.background_color}'
    }
  });
</script>`
    }
  ];

  return (
    <div className={className}>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Make sure to replace the base URLs with your actual LOACL server URLs in production.
              The JavaScript embed is recommended as it provides more features and better integration options.
            </p>
          </div>
        </div>
      </div>
      <CodeSnippets snippets={embedSnippets} />
    </div>
  );
}; 