import React, { useEffect, useState } from 'react';
import { CodeSnippets } from './CodeSnippets';

interface ChatbotEmbedCodesProps {
  assistantId: string;
  className?: string;
}

export const ChatbotEmbedCodes: React.FC<ChatbotEmbedCodesProps> = ({ 
  assistantId,
  className = ''
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const widgetBaseUrl = import.meta.env.VITE_API_URL || window.location.origin;

  useEffect(() => {
    const key = localStorage.getItem('openai_api_key');
    if (key) {
      setApiKey(key);
    }
  }, []);

  const embedSnippets = [
    {
      title: 'IFrame Embed',
      description: 'Add this code to embed the chat widget as an iframe in your website.',
      language: 'html',
      code: `<!-- LOACL Chat Widget -->
<iframe
  src="${widgetBaseUrl}/widget/${assistantId}?apiKey=${apiKey}"
  style="border: none; position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; z-index: 9999; background: transparent;"
  allow="microphone"
  title="LOACL Chat Widget"
></iframe>`
    },
    {
      title: 'Script Embed',
      description: 'Add this script tag to your website to load the chat widget.',
      language: 'html',
      code: `<!-- LOACL Chat Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['LOACL-Widget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id='LOACL-widget';js.src='${widgetBaseUrl}/widget.js';js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','loacl','${widgetBaseUrl}/widget.js'));
  loacl('init', { 
    assistantId: '${assistantId}',
    baseUrl: '${widgetBaseUrl}',
    apiKey: '${apiKey}'
  });
</script>`
    }
  ];

  if (!apiKey) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Please add your OpenAI API key in the profile settings before getting embed codes.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              Make sure to replace the base URL with your actual LOACL server URL in production.
              The API key is included in the embed code for demonstration. In production, you should use a more secure method to handle API keys.
            </p>
          </div>
        </div>
      </div>
      <CodeSnippets snippets={embedSnippets} />
    </div>
  );
}; 