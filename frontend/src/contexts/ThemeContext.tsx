'use client';

import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

const ThemeContext = createContext<{ theme: Theme }>({ theme: 'light' });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): { theme: Theme } {
  return useContext(ThemeContext);
}
