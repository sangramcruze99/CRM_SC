'use client';

import React from 'react';
import { MarketingNavbar } from '../components/marketing/MarketingNavbar';
import { HeroSection } from '../components/marketing/HeroSection';
import { HorizontalFeatureShowcase } from '../components/marketing/HorizontalFeatureShowcase';
import { AIAgentWorkflowDiagram } from '../components/marketing/AIAgentWorkflowDiagram';
import { TCAAutomationDiagram } from '../components/marketing/TCAAutomationDiagram';
import { PricingSection } from '../components/marketing/PricingSection';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen w-full bg-[#07090e] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* 1. Global Navigation */}
      <MarketingNavbar />

      {/* 2. Hero Section with Scroll-driven UI Expansion */}
      <HeroSection />

      {/* 3. Horizontal Feature Showcase */}
      <HorizontalFeatureShowcase />

      {/* 4. Interactive AI Agent Execution Diagram */}
      <AIAgentWorkflowDiagram />

      {/* 5. Trigger -> Condition -> Action Engine Diagram */}
      <TCAAutomationDiagram />

      {/* 6. Pricing & SaaS Consolidation Matrix */}
      <PricingSection />

      {/* 7. Technical Minimalist Footer */}
      <MarketingFooter />
    </div>
  );
}
