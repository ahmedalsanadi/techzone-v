'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  enableSystem = true,
  attribute = 'class',
}: { 
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: 'class' | 'data-theme';
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Get system preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (!enableSystem) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [enableSystem]);

  // Apply theme to DOM
  const applyTheme = useCallback((newTheme: Theme) => {
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme as 'light' | 'dark';
    
    if (attribute === 'class') {
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.setAttribute(attribute, resolved);
    }
    
    setResolvedTheme(resolved);
  }, [attribute, getSystemTheme]);

  // Set theme function
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initialTheme = stored && ['light', 'dark', 'system'].includes(stored) 
      ? stored 
      : defaultTheme;
    
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, [defaultTheme, applyTheme]);

  // Listen to system preference changes
  useEffect(() => {
    if (!enableSystem) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem, applyTheme]);

  // Prevent hydration mismatch - render nothing until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};