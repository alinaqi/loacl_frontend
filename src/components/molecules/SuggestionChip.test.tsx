import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuggestionChip } from './SuggestionChip';

describe('SuggestionChip', () => {
  const defaultProps = {
    text: 'Suggestion',
  };

  it('renders with default props', () => {
    render(<SuggestionChip {...defaultProps} />);
    
    const chip = screen.getByRole('option');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent('Suggestion');
    expect(chip).not.toBeDisabled();
    expect(chip).toHaveAttribute('aria-selected', 'false');
  });

  it('renders with icon', () => {
    const icon = <svg data-testid="test-icon" />;
    render(<SuggestionChip {...defaultProps} icon={icon} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<SuggestionChip {...defaultProps} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('option'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies selected styles when selected', () => {
    render(<SuggestionChip {...defaultProps} selected />);
    
    const chip = screen.getByRole('option');
    expect(chip).toHaveClass('bg-blue-500', 'text-white');
    expect(chip).toHaveAttribute('aria-selected', 'true');
  });

  it('applies disabled styles and prevents clicks when disabled', () => {
    const handleClick = jest.fn();
    render(<SuggestionChip {...defaultProps} disabled onClick={handleClick} />);
    
    const chip = screen.getByRole('option');
    expect(chip).toBeDisabled();
    expect(chip).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
    
    fireEvent.click(chip);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<SuggestionChip {...defaultProps} className="custom-class" />);
    
    expect(screen.getByRole('option')).toHaveClass('custom-class');
  });

  it('applies correct styles to icon based on selected state', () => {
    const { rerender } = render(
      <SuggestionChip
        {...defaultProps}
        icon={<svg data-testid="test-icon" />}
        selected
      />
    );
    
    const iconWrapper = screen.getByTestId('test-icon').parentElement;
    expect(iconWrapper).toHaveClass('text-white');

    rerender(
      <SuggestionChip
        {...defaultProps}
        icon={<svg data-testid="test-icon" />}
        selected={false}
      />
    );
    
    expect(iconWrapper).toHaveClass('text-blue-500');
  });

  it('applies correct styles to icon when disabled', () => {
    render(
      <SuggestionChip
        {...defaultProps}
        icon={<svg data-testid="test-icon" />}
        disabled
      />
    );
    
    const iconWrapper = screen.getByTestId('test-icon').parentElement;
    expect(iconWrapper).toHaveClass('text-gray-400');
  });
}); 