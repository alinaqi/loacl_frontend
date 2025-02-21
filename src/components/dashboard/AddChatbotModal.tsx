import React, { useState } from 'react';
import { NewChatbotInput, ChatbotDesignSettings } from '../../types/chatbot';

interface AddChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultDesignSettings: ChatbotDesignSettings = {
  theme: {
    primary_color: '#4F46E5',
    secondary_color: '#6366F1',
    text_color: '#111827',
    background_color: '#FFFFFF',
  },
  layout: {
    width: '380px',
    height: '600px',
    position: 'right',
  },
  typography: {
    font_family: 'Inter, system-ui, sans-serif',
    font_size: '14px',
  },
};

const defaultFeatures = {
  showFileUpload: true,
  showVoiceInput: true,
  showEmoji: true,
  showGuidedQuestions: true,
  showFollowUpSuggestions: true,
};

export const AddChatbotModal: React.FC<AddChatbotModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<NewChatbotInput>({
    name: '',
    assistant_id: '',
    api_key: '',
    features: defaultFeatures,
    design_settings: defaultDesignSettings,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string, field: keyof typeof input.design_settings.theme) => {
    setInput((prev) => ({
      ...prev,
      design_settings: {
        ...prev.design_settings,
        theme: {
          ...prev.design_settings.theme,
          [field]: color,
        },
      },
    }));
  };

  const handleLayoutChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      design_settings: {
        ...prev.design_settings,
        layout: {
          ...prev.design_settings.layout,
          [name]: value,
        },
      },
    }));
  };

  const handleFeatureChange = (feature: keyof typeof defaultFeatures) => {
    setInput((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Implement actual API call
      console.log('Creating chatbot:', input);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 1 ? 'Create New Chatbot' : 'Customize Design'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Chatbot Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={input.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="assistant_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    OpenAI Assistant ID
                  </label>
                  <input
                    type="text"
                    id="assistant_id"
                    name="assistant_id"
                    value={input.assistant_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You can find this in your OpenAI dashboard
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="api_key"
                    className="block text-sm font-medium text-gray-700"
                  >
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    id="api_key"
                    name="api_key"
                    value={input.api_key}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Your API key will be encrypted and stored securely
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showFileUpload"
                        checked={input.features.showFileUpload}
                        onChange={() => handleFeatureChange('showFileUpload')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="showFileUpload" className="ml-3 text-sm text-gray-700">
                        File Upload
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showVoiceInput"
                        checked={input.features.showVoiceInput}
                        onChange={() => handleFeatureChange('showVoiceInput')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="showVoiceInput" className="ml-3 text-sm text-gray-700">
                        Voice Input
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showEmoji"
                        checked={input.features.showEmoji}
                        onChange={() => handleFeatureChange('showEmoji')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="showEmoji" className="ml-3 text-sm text-gray-700">
                        Emoji Picker
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showGuidedQuestions"
                        checked={input.features.showGuidedQuestions}
                        onChange={() => handleFeatureChange('showGuidedQuestions')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="showGuidedQuestions" className="ml-3 text-sm text-gray-700">
                        Guided Questions
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showFollowUpSuggestions"
                        checked={input.features.showFollowUpSuggestions}
                        onChange={() => handleFeatureChange('showFollowUpSuggestions')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="showFollowUpSuggestions" className="ml-3 text-sm text-gray-700">
                        Follow-up Suggestions
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={input.design_settings.theme.primary_color}
                        onChange={(e) => handleColorChange(e.target.value, 'primary_color')}
                        className="mt-1 block w-full h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Secondary Color
                      </label>
                      <input
                        type="color"
                        value={input.design_settings.theme.secondary_color}
                        onChange={(e) => handleColorChange(e.target.value, 'secondary_color')}
                        className="mt-1 block w-full h-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Layout</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Position
                      </label>
                      <select
                        name="position"
                        value={input.design_settings.layout.position}
                        onChange={handleLayoutChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Width
                      </label>
                      <input
                        type="text"
                        name="width"
                        value={input.design_settings.layout.width}
                        onChange={handleLayoutChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
              )}
              <button
                type={step === 2 ? 'submit' : 'button'}
                onClick={step === 1 ? () => setStep(2) : undefined}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-auto"
              >
                {isLoading
                  ? 'Creating...'
                  : step === 1
                  ? 'Next'
                  : 'Create Chatbot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 