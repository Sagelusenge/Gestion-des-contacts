import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0B5CAB',
      dark: '#073D73',
      light: '#E7F1FB'
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
      default: '#F5F7FA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#172033',
      secondary: '#5B6472'
    }
  },
  shape: {
    borderRadius: 8
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
          fontWeight: 700
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(23, 32, 51, 0.08)'
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
