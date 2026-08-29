'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CreditBalances {
  ocrScansRemaining: number;
  ocrScansTotal: number;
  b2bLeadsRemaining: number;
  b2bLeadsTotal: number;
  aiTokensRemaining: number;
  aiTokensTotal: number;
}

const INITIAL_CREDITS: CreditBalances = {
  ocrScansRemaining: 84,
  ocrScansTotal: 100,
  b2bLeadsRemaining: 1420,
  b2bLeadsTotal: 2500,
  aiTokensRemaining: 78500,
  aiTokensTotal: 100000,
};

interface CreditMeteringContextType {
  credits: CreditBalances;
  deductOcrScan: (count?: number) => boolean;
  deductB2BLeads: (count: number) => boolean;
  deductAiTokens: (count: number) => boolean;
  topUpCredits: (type: 'ocr' | 'leads' | 'tokens' | 'all') => void;
  isTopUpModalOpen: boolean;
  setIsTopUpModalOpen: (open: boolean) => void;
}

const CreditMeteringContext = createContext<CreditMeteringContextType>({
  credits: INITIAL_CREDITS,
  deductOcrScan: () => true,
  deductB2BLeads: () => true,
  deductAiTokens: () => true,
  topUpCredits: () => {},
  isTopUpModalOpen: false,
  setIsTopUpModalOpen: () => {},
});

export function CreditMeteringProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<CreditBalances>(INITIAL_CREDITS);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('business_os_credits');
      if (saved) {
        setCredits(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveCredits = (newCredits: CreditBalances) => {
    setCredits(newCredits);
    try {
      localStorage.setItem('business_os_credits', JSON.stringify(newCredits));
    } catch (e) {
      // ignore
    }
  };

  const deductOcrScan = (count = 1) => {
    if (credits.ocrScansRemaining < count) {
      setIsTopUpModalOpen(true);
      return false;
    }
    saveCredits({
      ...credits,
      ocrScansRemaining: Math.max(0, credits.ocrScansRemaining - count),
    });
    return true;
  };

  const deductB2BLeads = (count: number) => {
    if (credits.b2bLeadsRemaining < count) {
      setIsTopUpModalOpen(true);
      return false;
    }
    saveCredits({
      ...credits,
      b2bLeadsRemaining: Math.max(0, credits.b2bLeadsRemaining - count),
    });
    return true;
  };

  const deductAiTokens = (count: number) => {
    if (credits.aiTokensRemaining < count) {
      setIsTopUpModalOpen(true);
      return false;
    }
    saveCredits({
      ...credits,
      aiTokensRemaining: Math.max(0, credits.aiTokensRemaining - count),
    });
    return true;
  };

  const topUpCredits = (type: 'ocr' | 'leads' | 'tokens' | 'all') => {
    setCredits((prev) => {
      const next = { ...prev };
      if (type === 'ocr' || type === 'all') {
        next.ocrScansRemaining += 100;
        next.ocrScansTotal += 100;
      }
      if (type === 'leads' || type === 'all') {
        next.b2bLeadsRemaining += 1000;
        next.b2bLeadsTotal += 1000;
      }
      if (type === 'tokens' || type === 'all') {
        next.aiTokensRemaining += 50000;
        next.aiTokensTotal += 50000;
      }
      saveCredits(next);
      return next;
    });
    setIsTopUpModalOpen(false);
  };

  return (
    <CreditMeteringContext.Provider
      value={{
        credits,
        deductOcrScan,
        deductB2BLeads,
        deductAiTokens,
        topUpCredits,
        isTopUpModalOpen,
        setIsTopUpModalOpen,
      }}
    >
      {children}
    </CreditMeteringContext.Provider>
  );
}

export function useCreditMetering() {
  return useContext(CreditMeteringContext);
}
