'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-[#07090e]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-base tracking-tight font-sans">Business OS</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wide -mt-0.5">Autonomous Enterprise Suite</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Platform
          </a>
          <a href="#agents" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-400" />
            <span>AI Agents</span>
          </a>
          <a href="#automations" className="hover:text-emerald-400 transition-colors">
            Automations
          </a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">
            Pricing
          </a>
          <Link href="/developer" className="hover:text-emerald-400 transition-colors font-mono text-[11px] text-slate-400 hover:text-slate-200">
            API & Docs
          </Link>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>

          <MagneticButton strength={0.3}>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center space-x-1.5 group"
            >
              <span>Launch Workspace</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
