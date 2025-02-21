import React from 'react';
import { Chatbot } from '../../types/chatbot';

interface ChatbotAnalyticsProps {
  chatbot: Chatbot;
}

export const ChatbotAnalytics: React.FC<ChatbotAnalyticsProps> = ({ chatbot }) => {
  const stats = [
    {
      name: 'Total Conversations',
      value: chatbot.analytics?.total_conversations.toLocaleString() || '0',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Total Messages',
      value: chatbot.analytics?.total_messages.toLocaleString() || '0',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'Avg. Response Time',
      value: `${chatbot.analytics?.average_response_time.toFixed(2) || '0'}s`,
      change: '-5%',
      changeType: 'decrease',
    },
    {
      name: 'User Satisfaction',
      value: `${(chatbot.analytics?.user_satisfaction_rate || 0) * 100}%`,
      change: '+2%',
      changeType: 'increase',
    },
  ];

  const maxUsageCount = chatbot.analytics?.peak_usage_times 
    ? Math.max(...chatbot.analytics.peak_usage_times.map(t => t.count))
    : 0;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-900">{chatbot.name} Analytics</h2>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                chatbot.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {chatbot.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-gray-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {stat.value}
              </dd>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center text-sm ${
                    stat.changeType === 'increase'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.changeType === 'increase' ? (
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                      />
                    </svg>
                  )}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Common Topics */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Common Topics</h3>
            <div className="space-y-4">
              {chatbot.analytics?.common_topics.map((topic) => (
                <div key={topic.topic} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        {topic.topic}
                      </span>
                      <span className="text-sm text-gray-500">
                        {topic.count} conversations
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${chatbot.analytics?.total_conversations 
                            ? (topic.count / chatbot.analytics.total_conversations) * 100 
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Usage Times */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Usage Times</h3>
            <div className="space-y-4">
              {chatbot.analytics?.peak_usage_times.map((time) => (
                <div key={time.hour} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        {`${time.hour}:00`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {time.count} users
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${maxUsageCount ? (time.count / maxUsageCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 