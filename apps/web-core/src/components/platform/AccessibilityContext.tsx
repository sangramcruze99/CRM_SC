'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type RenderingMode = 'glass' | 'performance';

interface AccessibilityContextType {
  mode: RenderingMode;
  toggleMode: () => void;
  setMode: (mode: RenderingMode) => void;
  isPerformanceMode: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  mode: 'glass',
  toggleMode: () => {},
  setMode: () => {},
  isPerformanceMode: false,
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<RenderingMode>('glass');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('business_os_render_mode') as RenderingMode;
      if (saved === 'performance' || saved === 'glass') {
        setModeState(saved);
        if (saved === 'performance') {
          document.documentElement.classList.add('performance-mode');
        } else {
          document.documentElement.classList.remove('performance-mode');
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setMode = (newMode: RenderingMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('business_os_render_mode', newMode);
      if (newMode === 'performance') {
        document.documentElement.classList.add('performance-mode');
      } else {
        document.documentElement.classList.remove('performance-mode');
      }
    } catch (e) {
      // ignore
    }
  };

  const toggleMode = () => {
    setMode(mode === 'glass' ? 'performance' : 'glass');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        mode,
        toggleMode,
        setMode,
        isPerformanceMode: mode === 'performance',
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
