import React from 'react';
import clsx from 'clsx';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';

export interface VoiceSettings {
  enabled: boolean;
  speed: number;
  pitch: number;
  volume: number;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
}

export interface SettingsPanelProps {
  /**
   * Whether the panel is visible
   */
  isOpen: boolean;
  /**
   * Called when the close button is clicked
   */
  onClose: () => void;
  /**
   * Current theme ('light' | 'dark' | 'system')
   */
  theme: string;
  /**
   * Called when theme is changed
   */
  onThemeChange: (theme: string) => void;
  /**
   * Current language code (e.g., 'en', 'es')
   */
  language: string;
  /**
   * Called when language is changed
   */
  onLanguageChange: (language: string) => void;
  /**
   * Voice settings configuration
   */
  voiceSettings: VoiceSettings;
  /**
   * Called when voice settings are changed
   */
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  /**
   * Notification settings configuration
   */
  notificationSettings: NotificationSettings;
  /**
   * Called when notification settings are changed
   */
  onNotificationSettingsChange: (settings: NotificationSettings) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  voiceSettings,
  onVoiceSettingsChange,
  notificationSettings,
  onNotificationSettingsChange,
  className,
}) => {
  if (!isOpen) return null;

  const handleVoiceSettingChange = (key: keyof VoiceSettings, value: number | boolean) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      [key]: value,
    });
  };

  const handleNotificationSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    onNotificationSettingsChange({
      ...notificationSettings,
      [key]: value,
    });
  };

  return (
    <div
      className={clsx(
        'fixed inset-y-0 right-0',
        'w-80 sm:w-96',
        'bg-white dark:bg-gray-800',
        'shadow-xl',
        'transform transition-transform duration-300 ease-in-out',
        'overflow-y-auto',
        className
      )}
      role="dialog"
      aria-label="Settings panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <Typography.Text className="font-semibold text-lg">
          Settings
        </Typography.Text>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close settings"
        >
          <svg
            className="w-5 h-5"
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
        </Button>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {/* Theme Settings */}
        <section>
          <Typography.Text className="font-medium mb-2">
            Theme
          </Typography.Text>
          <div className="grid grid-cols-3 gap-2">
            {['light', 'dark', 'system'].map((themeOption) => (
              <Button
                key={themeOption}
                variant={theme === themeOption ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onThemeChange(themeOption)}
                className="capitalize"
              >
                {themeOption}
              </Button>
            ))}
          </div>
        </section>

        {/* Language Settings */}
        <section>
          <Typography.Text className="font-medium mb-2">
            Language
          </Typography.Text>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
        </section>

        {/* Voice Settings */}
        <section>
          <Typography.Text className="font-medium mb-2">
            Voice
          </Typography.Text>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={voiceSettings.enabled}
                onChange={(e) => handleVoiceSettingChange('enabled', e.target.checked)}
                className="mr-2"
              />
              <span>Enable voice input/output</span>
            </label>
            
            <div className="space-y-2">
              <label className="block">
                <span className="text-sm">Speed</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.speed}
                  onChange={(e) => handleVoiceSettingChange('speed', parseFloat(e.target.value))}
                  disabled={!voiceSettings.enabled}
                  className="w-full"
                />
              </label>
              
              <label className="block">
                <span className="text-sm">Pitch</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => handleVoiceSettingChange('pitch', parseFloat(e.target.value))}
                  disabled={!voiceSettings.enabled}
                  className="w-full"
                />
              </label>
              
              <label className="block">
                <span className="text-sm">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => handleVoiceSettingChange('volume', parseFloat(e.target.value))}
                  disabled={!voiceSettings.enabled}
                  className="w-full"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section>
          <Typography.Text className="font-medium mb-2">
            Notifications
          </Typography.Text>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.enabled}
                onChange={(e) => handleNotificationSettingChange('enabled', e.target.checked)}
                className="mr-2"
              />
              <span>Enable notifications</span>
            </label>
            
            <label className="flex items-center ml-6">
              <input
                type="checkbox"
                checked={notificationSettings.sound}
                onChange={(e) => handleNotificationSettingChange('sound', e.target.checked)}
                disabled={!notificationSettings.enabled}
                className="mr-2"
              />
              <span>Play sound</span>
            </label>
            
            <label className="flex items-center ml-6">
              <input
                type="checkbox"
                checked={notificationSettings.desktop}
                onChange={(e) => handleNotificationSettingChange('desktop', e.target.checked)}
                disabled={!notificationSettings.enabled}
                className="mr-2"
              />
              <span>Desktop notifications</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}; 