import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeModeContext = createContext({ mode: 'light', toggleMode: () => {} });

const buildTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#0B5CAB',
      dark: '#073D73',
      light: mode === 'dark' ? '#183B66' : '#E7F1FB'
    },
    secondary: {
      main: '#B68A2C'
    },
    success: {
      main: '#167A4A'
    },
    warning: {
      main: '#C77700'
    },
    background: {
      default: mode === 'dark' ? '#08111F' : '#F5F7FA',
      paper: mode === 'dark' ? '#101B2C' : '#FFFFFF'
    },
    text: {
      primary: mode === 'dark' ? '#EFF5FF' : '#172033',
      secondary: mode === 'dark' ? '#AAB7CA' : '#5B6472'
    }
  },
  shape: {
    borderRadius: 6
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { letterSpacing: 0 },
    h4: { letterSpacing: 0 },
    h5: { letterSpacing: 0 },
    h6: { letterSpacing: 0 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 800,
          borderRadius: 6
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: mode === 'dark' ? '1px solid rgba(170, 183, 202, 0.16)' : '1px solid rgba(23, 32, 51, 0.08)'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    }
  }
});

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  const value = useMemo(() => ({
    mode,
    toggleMode: () => setMode((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    })
  }), [mode]);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={{
          '@media print': {
            '.MuiDrawer-root, .MuiAppBar-root, .MuiBottomNavigation-root, .no-print': { display: 'none !important' },
            'main, .MuiBox-root': { boxShadow: 'none !important' },
            body: { background: '#ffffff !important' }
          }
        }} />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeModeContext);
