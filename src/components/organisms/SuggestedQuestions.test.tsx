import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuggestedQuestions, SuggestedQuestion } from './SuggestedQuestions';

describe('SuggestedQuestions', () => {
  const mockQuestions: SuggestedQuestion[] = [
    {
      id: '1',
      text: 'What is React?',
      category: 'Basics',
      priority: 1,
    },
    {
      id: '2',
      text: 'How do hooks work?',
      category: 'Basics',
      priority: 2,
    },
    {
      id: '3',
      text: 'What is TypeScript?',
      category: 'Advanced',
      priority: 1,
    },
    {
      id: '4',
      text: 'Explain state management',
      category: 'Advanced',
      priority: 2,
    },
    {
      id: '5',
      text: 'What are design patterns?',
      priority: 3,
    },
  ];

  it('renders initial questions correctly', () => {
    render(
      <SuggestedQuestions
        questions={mockQuestions}
        onQuestionSelect={jest.fn()}
        initialCount={3}
      />
    );
    
    // Check that only initial questions are shown
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.getByText('How do hooks work?')).toBeInTheDocument();
    expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
    expect(screen.queryByText('Explain state management')).not.toBeInTheDocument();
  });

  it('groups questions by category', () => {
    render(
      <SuggestedQuestions
        questions={mockQuestions}
        onQuestionSelect={jest.fn()}
      />
    );
    
    // Check category headings
    expect(screen.getByText('Basics')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('handles question selection', () => {
    const handleSelect = jest.fn();
    render(
      <SuggestedQuestions
        questions={mockQuestions}
        onQuestionSelect={handleSelect}
      />
    );
    
    fireEvent.click(screen.getByText('What is React?'));
    expect(handleSelect).toHaveBeenCalledWith(mockQuestions[0]);
  });

  it('shows more questions when clicking show more', () => {
    render(
      <SuggestedQuestions
        questions={mockQuestions}
        onQuestionSelect={jest.fn()}
        initialCount={3}
      />
    );
    
    // Initially hidden question
    expect(screen.queryByText('Explain state management')).not.toBeInTheDocument();
    
    // Click show more
    fireEvent.click(screen.getByText('Show 2 More'));
    
    // Now visible
    expect(screen.getByText('Explain state management')).toBeInTheDocument();
    expect(screen.getByText('What are design patterns?')).toBeInTheDocument();
  });

  it('sorts questions by priority', () => {
    const { container } = render(
      <SuggestedQuestions
        questions={mockQuestions}
        onQuestionSelect={jest.fn()}
        showMoreButton={false}
      />
    );
    
    const chips = container.querySelectorAll('[role="option"]');
    const texts = Array.from(chips).map(chip => chip.textContent);
    
    // Check that questions within each category are sorted by priority
    expect(texts).toEqual([
      'What is React?',
      'How do hooks work?',
      'What is TypeScript?',
      'Explain state management',
      'What are design patterns?',
    ]);
  });

  it('hides show more button when disabled', () => {
    render(
      <SuggestedQuestions
        questions={mockQuestions}
        onQuestionSelect={jest.fn()}
        showMoreButton={false}
      />
    );
    
    expect(screen.queryByText(/Show \d+ More/)).not.toBeInTheDocument();
  });

  it('toggles between show more and show less', () => {
    render(
      <SuggestedQuestions
        questions={mockQuestions}
        onQuestionSelect={jest.fn()}
        initialCount={3}
      />
    );
    
    const toggleButton = screen.getByText('Show 2 More');
    fireEvent.click(toggleButton);
    expect(screen.getByText('Show Less')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Show Less'));
    expect(screen.getByText('Show 2 More')).toBeInTheDocument();
  });

  it('applies selected state to clicked question', () => {
    render(
      <SuggestedQuestions
        questions={mockQuestions}
        onQuestionSelect={jest.fn()}
      />
    );
    
    const firstQuestion = screen.getByText('What is React?');
    fireEvent.click(firstQuestion);
    
    expect(firstQuestion.parentElement).toHaveAttribute('aria-selected', 'true');
  });
}); 