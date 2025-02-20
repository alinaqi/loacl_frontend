export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    body: string;
    heading: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
  };
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6366F1',
    background: '#FFFFFF',
    text: '#1F2937',
    accent: '#10B981',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Poppins, Inter, system-ui, sans-serif',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
  },
}; 