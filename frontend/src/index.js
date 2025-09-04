import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C5CE7', // indigo
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00C4B8', // teal/cyan
    },
    background: {
      default: '#f7f8fc',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h6: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundImage: 'linear-gradient(90deg, #6C5CE7 0%, #8A7CFF 100%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 2 },
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiTextField: {
      defaultProps: { size: 'medium', variant: 'outlined' },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          // subtle page background
          backgroundImage: 'linear-gradient(180deg, rgba(108,92,231,0.04) 0%, rgba(0,196,184,0.04) 100%)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
