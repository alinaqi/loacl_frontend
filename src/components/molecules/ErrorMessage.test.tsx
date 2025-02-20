import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  const defaultProps = {
    message: 'An error occurred',
  };

  it('renders error message', () => {
    render(<ErrorMessage {...defaultProps} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('renders details when provided', () => {
    const details = 'Detailed error information';
    render(<ErrorMessage {...defaultProps} details={details} />);
    
    expect(screen.getByText(details)).toBeInTheDocument();
  });

  it('renders retry button when showRetry and onRetry are provided', () => {
    const handleRetry = jest.fn();
    render(
      <ErrorMessage
        {...defaultProps}
        showRetry
        onRetry={handleRetry}
      />
    );
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when showRetry is false', () => {
    const handleRetry = jest.fn();
    render(
      <ErrorMessage
        {...defaultProps}
        showRetry={false}
        onRetry={handleRetry}
      />
    );
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies error severity styles by default', () => {
    render(<ErrorMessage {...defaultProps} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('applies warning severity styles', () => {
    render(<ErrorMessage {...defaultProps} severity="warning" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  it('applies info severity styles', () => {
    render(<ErrorMessage {...defaultProps} severity="info" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('renders correct icon for error severity', () => {
    render(<ErrorMessage {...defaultProps} severity="error" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toHaveClass('text-red-400');
  });

  it('renders correct icon for warning severity', () => {
    render(<ErrorMessage {...defaultProps} severity="warning" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toHaveClass('text-yellow-400');
  });

  it('renders correct icon for info severity', () => {
    render(<ErrorMessage {...defaultProps} severity="info" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toHaveClass('text-blue-400');
  });

  it('applies custom className', () => {
    render(<ErrorMessage {...defaultProps} className="custom-class" />);
    
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
}); 