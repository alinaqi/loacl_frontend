import React, { useState } from 'react';
import clsx from 'clsx';
import { SuggestionChip } from '../molecules/SuggestionChip';

export interface SuggestedQuestion {
  /**
   * Unique identifier for the question
   */
  id: string;
  /**
   * The question text
   */
  text: string;
  /**
   * Category or type of the question (for grouping)
   */
  category?: string;
  /**
   * Priority/order of the question (lower numbers appear first)
   */
  priority?: number;
}

export interface SuggestedQuestionsProps {
  /**
   * Array of suggested questions
   */
  questions: SuggestedQuestion[];
  /**
   * Called when a question is selected
   */
  onQuestionSelect: (question: SuggestedQuestion) => void;
  /**
   * Maximum number of questions to show initially
   */
  initialCount?: number;
  /**
   * Whether to show a "Show More" button
   */
  showMoreButton?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onQuestionSelect,
  initialCount = 3,
  showMoreButton = true,
  className,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sort questions by priority if specified
  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.priority === undefined) return 1;
    if (b.priority === undefined) return -1;
    return a.priority - b.priority;
  });

  // Get visible questions based on showAll state
  const visibleQuestions = showAll
    ? sortedQuestions
    : sortedQuestions.slice(0, initialCount);

  // Group questions by category if specified
  const groupedQuestions = visibleQuestions.reduce<Record<string, SuggestedQuestion[]>>(
    (acc, question) => {
      const category = question.category || 'default';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(question);
      return acc;
    },
    {}
  );

  const handleQuestionClick = (question: SuggestedQuestion) => {
    setSelectedId(question.id);
    onQuestionSelect(question);
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {Object.entries(groupedQuestions).map(([category, questions]) => (
        <div key={category} className="space-y-2">
          {category !== 'default' && (
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {category}
            </h3>
          )}
          <div className="flex flex-wrap gap-2">
            {questions.map((question) => (
              <SuggestionChip
                key={question.id}
                text={question.text}
                selected={question.id === selectedId}
                onClick={() => handleQuestionClick(question)}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            ))}
          </div>
        </div>
      ))}

      {showMoreButton && sortedQuestions.length > initialCount && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className={clsx(
            'text-sm text-blue-600 hover:text-blue-500',
            'font-medium',
            'focus:outline-none focus:underline'
          )}
        >
          {showAll ? 'Show Less' : `Show ${sortedQuestions.length - initialCount} More`}
        </button>
      )}
    </div>
  );
}; 