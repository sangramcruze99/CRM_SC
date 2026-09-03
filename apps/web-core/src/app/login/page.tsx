'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Sparkles, Lock, Mail, User } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const res = await fetch(`/api/auth${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        throw new Error('Authentication failed');
      }
      
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid email or password. Use admin@gmail.com / admin123');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e] p-4 text-white overflow-hidden">
      {/* Decorative ambient background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-slate-950 font-extrabold text-2xl mb-4 shadow-xl shadow-emerald-500/25 ring-2 ring-white/10">
            <Sparkles size={26} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Business OS</h1>
          <p className="text-slate-400 mt-1.5 text-sm font-medium">Enterprise Unified CRM & Autonomous Operating System</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center space-x-2.5 text-rose-300 text-xs font-semibold">
                <Shield size={16} className="text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input required name="name" type="text" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:bg-white/[0.08] transition-all font-medium" placeholder="Jane Doe" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required name="email" type="email" defaultValue="admin@gmail.com" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:bg-white/[0.08] transition-all font-medium" placeholder="admin@gmail.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                {isLogin && <span className="text-xs text-emerald-400 font-semibold">Default: admin123</span>}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required name="password" type="password" defaultValue="admin123" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:bg-white/[0.08] transition-all font-medium" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 text-sm font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center justify-center space-x-2 group cursor-pointer border border-emerald-400/40">
              <span>{isLogin ? 'Sign In to Workspace' : 'Create Organization Account'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {isLogin ? "Need a new tenant workspace? Switch to Register" : "Already registered? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
