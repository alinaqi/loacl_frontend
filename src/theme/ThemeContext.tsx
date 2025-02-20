import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Theme, defaultTheme } from './types';

interface ThemeContextType {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      ...newTheme,
      colors: {
        ...prevTheme.colors,
        ...(newTheme.colors || {}),
      },
      fonts: {
        ...prevTheme.fonts,
        ...(newTheme.fonts || {}),
      },
      borderRadius: {
        ...prevTheme.borderRadius,
        ...(newTheme.borderRadius || {}),
      },
      spacing: {
        ...prevTheme.spacing,
        ...(newTheme.spacing || {}),
      },
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 