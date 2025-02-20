import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsPanel } from './SettingsPanel';

describe('SettingsPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    theme: 'light',
    onThemeChange: jest.fn(),
    language: 'en',
    onLanguageChange: jest.fn(),
    voiceSettings: {
      enabled: true,
      speed: 1,
      pitch: 1,
      volume: 0.8,
    },
    onVoiceSettingsChange: jest.fn(),
    notificationSettings: {
      enabled: true,
      sound: true,
      desktop: false,
    },
    onNotificationSettingsChange: jest.fn(),
  };

  it('renders when isOpen is true', () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<SettingsPanel {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<SettingsPanel {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Close settings'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  describe('Theme Settings', () => {
    it('renders theme options', () => {
      render(<SettingsPanel {...defaultProps} />);
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('light')).toBeInTheDocument();
      expect(screen.getByText('dark')).toBeInTheDocument();
      expect(screen.getByText('system')).toBeInTheDocument();
    });

    it('calls onThemeChange when theme option is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);
      fireEvent.click(screen.getByText('dark'));
      expect(defaultProps.onThemeChange).toHaveBeenCalledWith('dark');
    });

    it('highlights the current theme', () => {
      render(<SettingsPanel {...defaultProps} theme="dark" />);
      const darkButton = screen.getByText('dark').closest('button');
      expect(darkButton).toHaveClass('bg-primary-500');
    });
  });

  describe('Language Settings', () => {
    it('renders language selector', () => {
      render(<SettingsPanel {...defaultProps} />);
      expect(screen.getByText('Language')).toBeInTheDocument();
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('en');
    });

    it('calls onLanguageChange when language is changed', () => {
      render(<SettingsPanel {...defaultProps} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'es' } });
      expect(defaultProps.onLanguageChange).toHaveBeenCalledWith('es');
    });
  });

  describe('Voice Settings', () => {
    it('renders voice settings controls', () => {
      render(<SettingsPanel {...defaultProps} />);
      expect(screen.getByText('Voice')).toBeInTheDocument();
      expect(screen.getByText('Enable voice input/output')).toBeInTheDocument();
      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('Pitch')).toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('calls onVoiceSettingsChange when settings are changed', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      // Toggle enabled
      fireEvent.click(screen.getByLabelText('Enable voice input/output'));
      expect(defaultProps.onVoiceSettingsChange).toHaveBeenCalledWith({
        ...defaultProps.voiceSettings,
        enabled: false,
      });

      // Change speed
      fireEvent.change(screen.getByLabelText(/Speed/), { target: { value: '1.5' } });
      expect(defaultProps.onVoiceSettingsChange).toHaveBeenCalledWith({
        ...defaultProps.voiceSettings,
        speed: 1.5,
      });
    });

    it('disables controls when voice is disabled', () => {
      render(
        <SettingsPanel
          {...defaultProps}
          voiceSettings={{ ...defaultProps.voiceSettings, enabled: false }}
        />
      );
      
      expect(screen.getByLabelText(/Speed/)).toBeDisabled();
      expect(screen.getByLabelText(/Pitch/)).toBeDisabled();
      expect(screen.getByLabelText(/Volume/)).toBeDisabled();
    });
  });

  describe('Notification Settings', () => {
    it('renders notification settings controls', () => {
      render(<SettingsPanel {...defaultProps} />);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
      expect(screen.getByText('Play sound')).toBeInTheDocument();
      expect(screen.getByText('Desktop notifications')).toBeInTheDocument();
    });

    it('calls onNotificationSettingsChange when settings are changed', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      // Toggle enabled
      fireEvent.click(screen.getByText('Enable notifications'));
      expect(defaultProps.onNotificationSettingsChange).toHaveBeenCalledWith({
        ...defaultProps.notificationSettings,
        enabled: false,
      });

      // Toggle sound
      fireEvent.click(screen.getByText('Play sound'));
      expect(defaultProps.onNotificationSettingsChange).toHaveBeenCalledWith({
        ...defaultProps.notificationSettings,
        sound: false,
      });
    });

    it('disables sub-options when notifications are disabled', () => {
      render(
        <SettingsPanel
          {...defaultProps}
          notificationSettings={{ ...defaultProps.notificationSettings, enabled: false }}
        />
      );
      
      expect(screen.getByLabelText(/Play sound/)).toBeDisabled();
      expect(screen.getByLabelText(/Desktop notifications/)).toBeDisabled();
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-settings';
    render(<SettingsPanel {...defaultProps} className={customClass} />);
    expect(screen.getByRole('dialog')).toHaveClass(customClass);
  });
}); 