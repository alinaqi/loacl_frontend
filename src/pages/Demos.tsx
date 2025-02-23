import React, { useState } from 'react';
import { BasicDemo } from './BasicDemo';
import { EcommerceDemo } from './EcommerceDemo';
import { SupportDemo } from './SupportDemo';
import { AllFeaturesDemo } from './AllFeaturesDemo';
import { ChatbotPlayground } from './ChatbotPlayground';

type TabType = 'basic' | 'ecommerce' | 'support' | 'features' | 'playground';

export const Demos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const tabs = [
    { id: 'basic', name: 'Basic' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'support', name: 'Support' },
    { id: 'features', name: 'Features' },
    { id: 'playground', name: 'Playground' }
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicDemo />;
      case 'ecommerce':
        return <EcommerceDemo />;
      case 'support':
        return <SupportDemo />;
      case 'features':
        return <AllFeaturesDemo />;
      case 'playground':
        return <ChatbotPlayground />;
      default:
        return <BasicDemo />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {renderContent()}
      </div>
    </div>
  );
}; 