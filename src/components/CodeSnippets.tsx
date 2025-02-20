import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeSnippet {
  title: string;
  description: string;
  code: string;
  language: string;
}

interface CodeSnippetsProps {
  snippets: CodeSnippet[];
}

export const CodeSnippets: React.FC<CodeSnippetsProps> = ({ snippets }) => {
  const [activeSnippet, setActiveSnippet] = useState<string>(snippets[0]?.title || '');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, title: string) => {
    navigator.clipboard.writeText(code);
    setCopied(title);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 p-4 overflow-x-auto">
          {snippets.map((snippet) => (
            <button
              key={snippet.title}
              onClick={() => setActiveSnippet(snippet.title)}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeSnippet === snippet.title
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {snippet.title}
            </button>
          ))}
        </nav>
      </div>

      {snippets.map((snippet) => (
        <div
          key={snippet.title}
          className={`${activeSnippet === snippet.title ? 'block' : 'hidden'}`}
        >
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {snippet.title}
            </h3>
            <p className="text-gray-600">{snippet.description}</p>
          </div>

          <div className="relative">
            <button
              onClick={() => handleCopy(snippet.code, snippet.title)}
              className="absolute right-4 top-4 px-3 py-1 text-sm font-medium bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              {copied === snippet.title ? 'Copied!' : 'Copy'}
            </button>
            <SyntaxHighlighter
              language={snippet.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                padding: '2rem',
              }}
              showLineNumbers
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>
      ))}
    </div>
  );
}; 