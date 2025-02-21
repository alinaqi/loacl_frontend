import React, { useState } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { CodeSnippets } from '../components/CodeSnippets';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface DemoSection {
  title: string;
  description: string;
  config: {
    customStyles?: {
      '--primary-color'?: string;
      '--secondary-color'?: string;
      '--text-color'?: string;
      '--bg-color'?: string;
      '--widget-width'?: string;
      '--widget-height'?: string;
      '--border-radius'?: string;
      '--font-family'?: string;
      '--font-size'?: string;
      '--message-bubble-color'?: string;
      '--user-message-color'?: string;
    };
    position?: 'left' | 'right';
    features?: {
      showFileUpload?: boolean;
      showVoiceInput?: boolean;
      showEmoji?: boolean;
    };
  };
}

const demoSnippets = [
  {
    title: 'Basic Integration',
    description: 'Simple integration of the chat widget with default settings.',
    language: 'typescript',
    code: `import { ChatWidget } from '@loacl/react';

export const BasicDemo = () => {
  return (
    <div className="your-container">
      <ChatWidget
        customStyles={{
          '--primary-color': '#2563eb',
          '--secondary-color': '#1d4ed8',
          '--text-color': '#111827',
          '--bg-color': '#ffffff',
          '--font-family': 'Inter, system-ui, sans-serif',
          '--font-size': '14px',
        }}
        features={{
          showFileUpload: true,
          showVoiceInput: true,
          showEmoji: true,
        }}
      />
    </div>
  );
};`,
  },
  {
    title: 'Dark Theme',
    description: 'Integration with dark theme customization.',
    language: 'typescript',
    code: `import { ChatWidget } from '@loacl/react';

export const DarkThemeDemo = () => {
  return (
    <div className="your-container">
      <ChatWidget
        customStyles={{
          '--primary-color': '#6d28d9',
          '--secondary-color': '#5b21b6',
          '--text-color': '#f3f4f6',
          '--bg-color': '#1f2937',
          '--font-family': 'Inter, system-ui, sans-serif',
          '--font-size': '14px',
          '--message-bubble-color': '#374151',
          '--user-message-color': '#4c1d95',
        }}
      />
    </div>
  );
};`,
  },
  {
    title: 'File Upload',
    description: 'Implementation focusing on file upload functionality.',
    language: 'typescript',
    code: `import { ChatWidget } from '@loacl/react';

export const FileUploadDemo = () => {
  return (
    <div className="your-container">
      <ChatWidget
        customStyles={{
          '--primary-color': '#059669',
          '--secondary-color': '#047857',
        }}
        features={{
          showFileUpload: true,
          showVoiceInput: false,
          showEmoji: false,
        }}
        onFileUpload={(file) => {
          console.log('File uploaded:', file);
          // Handle file upload logic
        }}
      />
    </div>
  );
};`,
  },
  {
    title: 'Voice Input',
    description: 'Implementation with voice input capabilities.',
    language: 'typescript',
    code: `import { ChatWidget } from '@loacl/react';

export const VoiceInputDemo = () => {
  return (
    <div className="your-container">
      <ChatWidget
        customStyles={{
          '--primary-color': '#dc2626',
          '--secondary-color': '#b91c1c',
        }}
        features={{
          showFileUpload: false,
          showVoiceInput: true,
          showEmoji: false,
        }}
        onVoiceInput={(transcript) => {
          console.log('Voice input:', transcript);
          // Handle voice input logic
        }}
      />
    </div>
  );
};`,
  },
  {
    title: 'Emoji Support',
    description: 'Implementation with emoji picker functionality.',
    language: 'typescript',
    code: `import { ChatWidget } from '@loacl/react';

export const EmojiDemo = () => {
  return (
    <div className="your-container">
      <ChatWidget
        customStyles={{
          '--primary-color': '#f59e0b',
          '--secondary-color': '#d97706',
        }}
        features={{
          showFileUpload: false,
          showVoiceInput: false,
          showEmoji: true,
        }}
        onEmojiSelect={(emoji) => {
          console.log('Emoji selected:', emoji);
          // Handle emoji selection logic
        }}
      />
    </div>
  );
};`,
  },
  {
    title: 'Custom Position',
    description: 'Implementation with custom positioning.',
    language: 'typescript',
    code: `import { ChatWidget } from '@loacl/react';

export const CustomPositionDemo = () => {
  return (
    <div className="your-container">
      <ChatWidget
        position="left"
        customStyles={{
          '--primary-color': '#8b5cf6',
          '--secondary-color': '#7c3aed',
        }}
      />
    </div>
  );
};`,
  },
];

export const AllFeaturesDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const demoSections: DemoSection[] = [
    {
      title: 'Basic Chat',
      description: 'Default chat widget with all standard features enabled.',
      config: {
        customStyles: {
          '--primary-color': '#2563eb',
          '--secondary-color': '#1d4ed8',
          '--text-color': '#111827',
          '--bg-color': '#ffffff',
          '--font-family': 'Inter, system-ui, sans-serif',
          '--font-size': '14px',
          '--message-bubble-color': '#f3f4f6',
          '--user-message-color': '#e0e7ff',
        },
        features: {
          showFileUpload: true,
          showVoiceInput: true,
          showEmoji: true,
        },
      },
    },
    {
      title: 'Dark Theme',
      description: 'Chat widget with dark theme and custom styling.',
      config: {
        customStyles: {
          '--primary-color': '#6d28d9',
          '--secondary-color': '#5b21b6',
          '--text-color': '#f3f4f6',
          '--bg-color': '#1f2937',
          '--font-family': 'Inter, system-ui, sans-serif',
          '--font-size': '14px',
          '--message-bubble-color': '#374151',
          '--user-message-color': '#4c1d95',
        },
      },
    },
    {
      title: 'File Upload Focus',
      description: 'Demonstrates file upload capabilities with preview.',
      config: {
        customStyles: {
          '--primary-color': '#059669',
          '--secondary-color': '#047857',
        },
        features: {
          showFileUpload: true,
          showVoiceInput: false,
          showEmoji: false,
        },
      },
    },
    {
      title: 'Voice Input Focus',
      description: 'Showcases voice input functionality.',
      config: {
        customStyles: {
          '--primary-color': '#dc2626',
          '--secondary-color': '#b91c1c',
        },
        features: {
          showFileUpload: false,
          showVoiceInput: true,
          showEmoji: false,
        },
      },
    },
    {
      title: 'Emoji Support',
      description: 'Highlights emoji picker and reactions.',
      config: {
        customStyles: {
          '--primary-color': '#f59e0b',
          '--secondary-color': '#d97706',
        },
        features: {
          showFileUpload: false,
          showVoiceInput: false,
          showEmoji: true,
        },
      },
    },
    {
      title: 'Custom Position',
      description: 'Chat widget positioned on the left side.',
      config: {
        position: 'left',
        customStyles: {
          '--primary-color': '#8b5cf6',
          '--secondary-color': '#7c3aed',
        },
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LOACL Chat Widget Features
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore all the features and capabilities of our chat widget through these interactive examples.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {demoSections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <button
                  onClick={() => setActiveSection(activeSection === section.title ? null : section.title)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {activeSection === section.title ? 'Hide Demo' : 'Show Demo'}
                </button>
              </div>
              {activeSection === section.title && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 relative" style={{ height: '400px' }}>
                  <ChatWidget
                    {...section.config}
                    previewMode={true}
                    accessToken={accessToken}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Implementation Examples
          </h2>
          <CodeSnippets snippets={demoSnippets} />
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Visit our{' '}
            <Link
              to="/chatbot-playground"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Interactive Playground
            </Link>
            to customize the chat widget to your needs.
          </p>
        </div>
      </div>
    </div>
  );
}; 