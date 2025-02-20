import React, { useState } from 'react';
import { ChatWidget } from '../components/ChatWidget';

interface CustomizationOptions {
  theme: {
    primary: string;
    secondary: string;
    textColor: string;
    backgroundColor: string;
    fontFamily: string;
    fontSize: string;
    messageBubbleColor: string;
    userMessageColor: string;
  };
  layout: {
    width: string;
    height: string;
    position: 'left' | 'right';
    borderRadius: string;
  };
  features: {
    showFileUpload: boolean;
    showVoiceInput: boolean;
    showEmoji: boolean;
  };
}

export const PlaygroundDemo: React.FC = () => {
  const [options, setOptions] = useState<CustomizationOptions>({
    theme: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      textColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      messageBubbleColor: '#f3f4f6',
      userMessageColor: '#e0e7ff',
    },
    layout: {
      width: '100%',
      height: '500px',
      position: 'right',
      borderRadius: '12px',
    },
    features: {
      showFileUpload: true,
      showVoiceInput: true,
      showEmoji: true,
    },
  });

  const [selectedPreset, setSelectedPreset] = useState('default');
  const presets = {
    default: {
      name: 'Default',
      theme: { ...options.theme },
    },
    dark: {
      name: 'Dark Mode',
      theme: {
        ...options.theme,
        backgroundColor: '#1f2937',
        textColor: '#f3f4f6',
        messageBubbleColor: '#374151',
        userMessageColor: '#3730a3',
      },
    },
    modern: {
      name: 'Modern',
      theme: {
        ...options.theme,
        primary: '#7c3aed',
        secondary: '#6d28d9',
        borderRadius: '16px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
    },
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setOptions(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...presets[preset as keyof typeof presets].theme,
      },
    }));
  };

  const handleOptionChange = (
    category: keyof CustomizationOptions,
    field: string,
    value: string | boolean
  ) => {
    setOptions((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Chat Widget Playground
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customization Panel */}
          <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-lg shadow">
            {/* Presets */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Presets</h2>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {Object.entries(presets).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Theme</h2>
              {Object.entries(options.theme).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.split(/(?=[A-Z])/).join(' ')}
                  </label>
                  {key.toLowerCase().includes('color') ? (
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleOptionChange('theme', key, e.target.value)}
                      className="w-full h-10 rounded-md"
                    />
                  ) : key === 'fontFamily' ? (
                    <select
                      value={value}
                      onChange={(e) => handleOptionChange('theme', key, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Inter, system-ui, sans-serif">Inter</option>
                      <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleOptionChange('theme', key, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Layout */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Layout</h2>
              {Object.entries(options.layout).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  {key === 'position' ? (
                    <select
                      value={value}
                      onChange={(e) => handleOptionChange('layout', key, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleOptionChange('layout', key, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              {Object.entries(options.features).map(([key, value]) => (
                <div key={key} className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) => handleOptionChange('features', key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor={key} className="ml-2 text-sm font-medium text-gray-700">
                    {key.split(/(?=[A-Z])/).join(' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview</h2>
              <button
                onClick={() => {
                  const config = JSON.stringify(options, null, 2);
                  navigator.clipboard.writeText(config);
                  alert('Configuration copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700"
              >
                Copy Config
              </button>
            </div>
            <div className="relative w-full h-[500px] border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
              <ChatWidget
                customStyles={{
                  '--primary-color': options.theme.primary,
                  '--secondary-color': options.theme.secondary,
                  '--text-color': options.theme.textColor,
                  '--bg-color': options.theme.backgroundColor,
                  '--font-family': options.theme.fontFamily,
                  '--font-size': options.theme.fontSize,
                  '--message-bubble-color': options.theme.messageBubbleColor,
                  '--user-message-color': options.theme.userMessageColor,
                  '--widget-width': options.layout.width,
                  '--widget-height': options.layout.height,
                  '--border-radius': options.layout.borderRadius,
                }}
                position={options.layout.position}
                features={options.features}
                previewMode={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 