'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import '@fontsource-variable/inter';
import { getTheme } from '../lib/theme';
import ClientLayout from './ClientLayout';

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark';
    if (savedMode) {
      setThemeMode(savedMode);
    } else {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ClientLayout onThemeToggle={handleThemeToggle}>
        {children}
      </ClientLayout>
    </ThemeProvider>
  );
}

