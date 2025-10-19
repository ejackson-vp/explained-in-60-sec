import { useState, useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getTheme } from './theme';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginDialog from './components/LoginDialog';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  const [themeMode, setThemeMode] = useState('light');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setThemeMode(savedMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const handleThemeToggle = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const handleLoginClick = () => {
    setLoginDialogOpen(true);
  };

  const handleLoginClose = () => {
    setLoginDialogOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Header
          themeMode={themeMode}
          onThemeToggle={handleThemeToggle}
          onLoginClick={handleLoginClick}
        />

        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home onLoginClick={handleLoginClick} />} />
            <Route path="/generate" element={<Generate onLoginClick={handleLoginClick} />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </Box>

        <Footer />

        <LoginDialog open={loginDialogOpen} onClose={handleLoginClose} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
