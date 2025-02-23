import React, { useState, useEffect } from 'react';
import { CodeSnippets } from '../components/CodeSnippets';

// Extend Window interface to include our widget initialization function
declare global {
  interface Window {
    initLOACLWidget: (config: {
      position: 'floating' | 'inpage';
      containerId: string;
      apiKey: string;
      assistantId: string;
      apiUrl: string;
      styles?: {
        primary: string;
        textPrimary: string;
        background: string;
        borderRadius: string;
        width: string;
        height: string;
      };
    }) => void;
  }
}

interface WidgetConfig {
  customStyles?: {
    '--primary-color'?: string;
    '--secondary-color'?: string;
    '--text-color'?: string;
    '--bg-color'?: string;
    '--font-family'?: string;
    '--font-size'?: string;
    '--message-bubble-color'?: string;
    '--user-message-color'?: string;
  };
  features?: {
    showFileUpload?: boolean;
    showVoiceInput?: boolean;
    showEmoji?: boolean;
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
  const BACKEND_KEY = import.meta.env.VITE_BACKEND_KEY;
  const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;

  // Function to reinitialize widget with new styles
  const initializeWidget = (config?: WidgetConfig) => {
    // Remove existing widget if any
    const existingContainer = document.getElementById('loacl-widget-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Initialize the widget with our environment variables and optional config
    window.initLOACLWidget({
      position: 'floating',
      containerId: 'loacl-widget-container',
      apiKey: BACKEND_KEY,
      assistantId: ASSISTANT_ID,
      apiUrl: 'http://localhost:8000',
      styles: {
        primary: config?.customStyles?.['--primary-color'] || '#2563eb',
        textPrimary: '#FFFFFF',
        background: config?.customStyles?.['--bg-color'] || '#FFFFFF',
        borderRadius: '0.5rem',
        width: '384px',
        height: '600px'
      }
    });
  };

  // Initialize widget when component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/widgets/examples/embed.js';
    script.async = true;
    script.onload = () => {
      initializeWidget();
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
      // Remove widget container if it exists
      const container = document.getElementById('loacl-widget-container');
      if (container) {
        container.remove();
      }
    };
  }, []);

  // Effect to update widget styles when active section changes
  useEffect(() => {
    if (!window.initLOACLWidget) return;

    if (activeSection) {
      const selectedSection = demoSections.find(section => section.title === activeSection);
      if (selectedSection) {
        initializeWidget(selectedSection.config);
      }
    } else {
      initializeWidget();
    }
  }, [activeSection]);

  const demoSections = [
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
          '--bg-color': '#ffffff',
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
          '--bg-color': '#ffffff',
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
          '--bg-color': '#ffffff',
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
      description: 'Chat widget with custom styling.',
      config: {
        customStyles: {
          '--primary-color': '#8b5cf6',
          '--secondary-color': '#7c3aed',
          '--bg-color': '#ffffff',
        },
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="font-bold text-xl text-gray-900">LOACL Features</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Feature Showcase</h1>
            <p className="text-xl text-gray-600">
              Click on any feature card below to see how the chat widget transforms with different styles and configurations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoSections.map((section) => (
              <div
                key={section.title}
                onClick={() => setActiveSection(activeSection === section.title ? null : section.title)}
                className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer ${
                  activeSection === section.title ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <div
                  className={`text-sm font-medium ${
                    activeSection === section.title ? 'text-blue-600' : 'text-blue-500'
                  }`}
                >
                  {activeSection === section.title ? 'Currently Active' : 'Click to Preview'}
                </div>
              </div>
            ))}
          </div>

          {activeSection && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Implementation</h2>
              <CodeSnippets
                snippets={demoSnippets.filter((snippet) => snippet.title === activeSection)}
              />
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            {activeSection 
              ? `Currently previewing: ${activeSection}. Click the card again to reset to default style.`
              : 'Click any feature card above to preview different widget styles and configurations.'}
          </p>
        </div>
      </footer>
    </div>
  );
}; 