'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FeatureFlagState {
  khataLedger: boolean;
  neuralVisionOcr: boolean;
  socialStudio: boolean;
  emailMarketing: boolean;
  leadProspector: boolean;
  cpqQuotes: boolean;
  customObjects: boolean;
  eSignatures: boolean;
  complianceAuditing: boolean;
  multiLanguage: boolean;
}

const DEFAULT_FLAGS: FeatureFlagState = {
  khataLedger: true,
  neuralVisionOcr: true,
  socialStudio: true,
  emailMarketing: true,
  leadProspector: true,
  cpqQuotes: true,
  customObjects: true,
  eSignatures: true,
  complianceAuditing: true,
  multiLanguage: true,
};

interface FeatureFlagContextType {
  flags: FeatureFlagState;
  toggleFlag: (key: keyof FeatureFlagState) => void;
  setFlags: React.Dispatch<React.SetStateAction<FeatureFlagState>>;
  isModuleEnabled: (key: keyof FeatureFlagState) => boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  flags: DEFAULT_FLAGS,
  toggleFlag: () => {},
  setFlags: () => {},
  isModuleEnabled: () => true,
});

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlagState>(DEFAULT_FLAGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('business_os_feature_flags');
      if (saved) {
        setFlags(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleFlag = (key: keyof FeatureFlagState) => {
    setFlags((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('business_os_feature_flags', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const isModuleEnabled = (key: keyof FeatureFlagState) => {
    return flags[key] ?? true;
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, toggleFlag, setFlags, isModuleEnabled }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
