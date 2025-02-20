import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TypingIndicator } from './TypingIndicator';

describe('TypingIndicator', () => {
  const defaultProps = {
    isVisible: true,
  };

  it('renders with default text', () => {
    render(<TypingIndicator {...defaultProps} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Assistant is typing')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    const customText = 'User is typing';
    render(<TypingIndicator {...defaultProps} text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', customText);
  });

  it('renders three animated dots', () => {
    render(<TypingIndicator {...defaultProps} />);
    
    const dots = screen.getAllByRole('status')[0].querySelectorAll('.animate-bounce');
    expect(dots).toHaveLength(3);
  });

  it('applies animation delays to dots', () => {
    render(<TypingIndicator {...defaultProps} />);
    
    const dots = screen.getAllByRole('status')[0].querySelectorAll('.animate-bounce');
    expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
    expect(dots[1]).toHaveStyle({ animationDelay: '150ms' });
    expect(dots[2]).toHaveStyle({ animationDelay: '300ms' });
  });

  it('does not render when isVisible is false', () => {
    render(<TypingIndicator isVisible={false} />);
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<TypingIndicator {...defaultProps} className="custom-class" />);
    
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('applies fade-in animation class', () => {
    render(<TypingIndicator {...defaultProps} />);
    
    expect(screen.getByRole('status')).toHaveClass('animate-fade-in');
  });
}); 