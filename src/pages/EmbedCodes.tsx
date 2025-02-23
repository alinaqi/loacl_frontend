import React from 'react';
import { CodeSnippets } from '../components/CodeSnippets';

export const EmbedCodes: React.FC = () => {
  const baseUrl = window.location.origin;
  const assistantId = import.meta.env.VITE_ASSISTANT_ID;

  const embedSnippets = [
    {
      title: 'IFrame Embed',
      description: 'Add this code to embed the chat widget as an iframe in your website.',
      language: 'html',
      code: `<iframe
  src="${baseUrl}/iframe.html?assistantId=${assistantId}"
  style="border: none; position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; z-index: 9999;"
  allow="microphone"
></iframe>`
    },
    {
      title: 'Script Embed',
      description: 'Add this script tag to your website to load the chat widget.',
      language: 'html',
      code: `<script>
  (function(w,d,s,o,f,js,fjs){
    w['LOACL-Widget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id='LOACL-widget';js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','loacl','${baseUrl}/widget.js'));
  loacl('init', { assistantId: '${assistantId}' });
</script>`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Embed Codes</h1>
      <p className="text-gray-600 mb-8">
        Choose one of the following methods to embed the chat widget in your website.
      </p>
      <CodeSnippets snippets={embedSnippets} />
    </div>
  );
}; 