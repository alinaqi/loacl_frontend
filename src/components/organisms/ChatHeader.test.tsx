import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatHeader } from './ChatHeader';

describe('ChatHeader', () => {
  const defaultProps = {
    title: 'AI Assistant',
  };

  it('renders with required props', () => {
    render(<ChatHeader {...defaultProps} />);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('renders avatar with provided image', () => {
    const avatarUrl = 'https://example.com/avatar.jpg';
    render(<ChatHeader {...defaultProps} avatarUrl={avatarUrl} />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', avatarUrl);
  });

  it('displays subtitle when provided', () => {
    const subtitle = 'Online and ready to help';
    render(<ChatHeader {...defaultProps} subtitle={subtitle} />);
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it('shows settings button by default', () => {
    render(<ChatHeader {...defaultProps} />);
    expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
  });

  it('hides settings button when showSettings is false', () => {
    render(<ChatHeader {...defaultProps} showSettings={false} />);
    expect(screen.queryByLabelText('Open settings')).not.toBeInTheDocument();
  });

  it('calls onSettingsClick when settings button is clicked', () => {
    const handleSettingsClick = jest.fn();
    render(
      <ChatHeader {...defaultProps} onSettingsClick={handleSettingsClick} />
    );
    
    fireEvent.click(screen.getByLabelText('Open settings'));
    expect(handleSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different status indicators', () => {
    const { rerender } = render(
      <ChatHeader {...defaultProps} status="online" />
    );
    expect(screen.getByRole('img')).toHaveAttribute('data-status', 'online');

    rerender(<ChatHeader {...defaultProps} status="away" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-status', 'away');

    rerender(<ChatHeader {...defaultProps} status="busy" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-status', 'busy');

    rerender(<ChatHeader {...defaultProps} status="offline" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-status', 'offline');
  });

  it('applies custom className', () => {
    const customClass = 'custom-header';
    render(<ChatHeader {...defaultProps} className={customClass} />);
    expect(screen.getByRole('banner')).toHaveClass(customClass);
  });
}); 