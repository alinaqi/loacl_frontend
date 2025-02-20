import React from 'react';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { Theme } from '../theme/types';

const ThemePreview: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div 
      className="rounded-lg p-6"
      style={{ backgroundColor: theme.colors.background }}
    >
      <h2 
        style={{ 
          color: theme.colors.text,
          fontFamily: theme.fonts.heading,
          marginBottom: theme.spacing.md,
        }}
        className="text-2xl font-bold"
      >
        Theme Preview
      </h2>
      <div className="space-y-4">
        <button
          style={{
            backgroundColor: theme.colors.primary,
            color: '#fff',
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius.md,
            fontFamily: theme.fonts.body,
          }}
        >
          Primary Button
        </button>
        <div
          style={{
            backgroundColor: theme.colors.secondary,
            color: '#fff',
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.lg,
            marginTop: theme.spacing.sm,
          }}
        >
          Secondary Container
        </div>
        <div
          style={{
            backgroundColor: theme.colors.accent,
            color: '#fff',
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.sm,
          }}
        >
          Accent Element
        </div>
      </div>
    </div>
  );
};

const ThemeCustomizer: React.FC = () => {
  const { theme, updateTheme } = useTheme();

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    const colorUpdate = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      background: theme.colors.background,
      text: theme.colors.text,
      accent: theme.colors.accent,
      [colorKey]: value
    };
    
    updateTheme({
      colors: colorUpdate
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(theme.colors).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="color"
                value={value}
                onChange={(e) => handleColorChange(key as keyof Theme['colors'], e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomThemeDemo: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Custom Theme Demo
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Theme Customizer</h2>
              <ThemeCustomizer />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ThemePreview />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default CustomThemeDemo; 