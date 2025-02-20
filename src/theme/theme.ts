import { extendTheme } from '@chakra-ui/react';

const colors = {
  primary: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    200: '#7CC4FA',
    300: '#47A3F3',
    400: '#2186EB',
    500: '#0967D2',
    600: '#0552B5',
    700: '#03449E',
    800: '#01337D',
    900: '#002159',
  },
  gray: {
    50: '#F7F9FC',
    100: '#EDF1F7',
    200: '#E4E9F2',
    300: '#C5CEE0',
    400: '#8F9BB3',
    500: '#2E3A59',
    600: '#222B45',
    700: '#192038',
    800: '#151A30',
    900: '#101426',
  },
};

const fonts = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
        },
      },
      outline: {
        border: '2px solid',
        borderColor: 'primary.500',
        color: 'primary.500',
        _hover: {
          bg: 'primary.50',
        },
      },
    },
  },
};

export const theme = extendTheme({
  colors,
  fonts,
  components,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
}); 