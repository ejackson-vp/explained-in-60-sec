import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#5e35b1' : '#7c4dff',
      light: '#9162e4',
      dark: '#4527a0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#1e88e5' : '#42a5f5',
      light: '#4fc3f7',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? '#fafafa' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
      secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    mode === 'light' 
      ? '0px 2px 4px rgba(0, 0, 0, 0.05)'
      : '0px 2px 4px rgba(0, 0, 0, 0.3)',
    mode === 'light'
      ? '0px 4px 8px rgba(0, 0, 0, 0.08)'
      : '0px 4px 8px rgba(0, 0, 0, 0.4)',
    mode === 'light'
      ? '0px 8px 16px rgba(0, 0, 0, 0.1)'
      : '0px 8px 16px rgba(0, 0, 0, 0.5)',
    mode === 'light'
      ? '0px 12px 24px rgba(0, 0, 0, 0.12)'
      : '0px 12px 24px rgba(0, 0, 0, 0.6)',
    ...Array(20).fill(mode === 'light' 
      ? '0px 16px 32px rgba(0, 0, 0, 0.15)'
      : '0px 16px 32px rgba(0, 0, 0, 0.7)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '1rem',
          minHeight: 44,
          transition: 'all 0.2s ease-in-out',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'light' 
              ? '0px 8px 16px rgba(0, 0, 0, 0.15)'
              : '0px 8px 16px rgba(0, 0, 0, 0.6)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          minWidth: 44,
        },
      },
    },
  },
});

