'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Copy, CheckCircle, Code, Globe, MessageCircle, MessageSquare, X, Sparkles, MessageSquarePlus, Palette } from 'lucide-react';

interface ChatWidget {
  id: string;
  name: string;
  domain: string;
  themeColor: string;
  greetingText: string;
  botEnabled: boolean;
  status: 'ONLINE' | 'STANDBY';
  embedCode: string;
}

const initialDemoWidgets: ChatWidget[] = [];

export function ChatWidgetsClient({ initialWidgets = [] }: { initialWidgets?: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [widgets, setWidgets] = useState<ChatWidget[]>(
    initialWidgets.length > 0 ? initialWidgets : initialDemoWidgets
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [greeting, setGreeting] = useState('How can we assist your team today?');
  const [themeColor, setThemeColor] = useState('#f59e0b');
  const [alert, setAlert] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !domain) return;

    const id = `cw_${Math.floor(10 + Math.random() * 90)}`;
    const newWidget: ChatWidget = {
      id,
      name,
      domain,
      themeColor,
      greetingText: greeting,
      botEnabled: true,
      status: 'ONLINE',
      embedCode: `<script src="https://cdn.businessos.io/widget.js" data-widget-id="${id}"></script>`,
    };

    setWidgets([...widgets, newWidget]);
    setIsModalOpen(false);
    setName('');
    setDomain('');
    setAlert(`Widget "${newWidget.name}" initialized with embed snippet!`);
    setTimeout(() => setAlert(null), 3000);
  }

  function handleCopy(code: string) {
    navigator.clipboard?.writeText(code);
    setAlert('Widget embed snippet copied to clipboard!');
    setTimeout(() => setAlert(null), 2500);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MessageCircle className="text-emerald-400" size={24} />
            Live Chat Widgets & Embeds
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deploy real-time AI copilot and agent live chat bubbles onto any external website with 1 line of JS.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Chat Widget</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.map((w) => (
          <div key={w.id} className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-max shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> {w.status}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{w.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  <Globe size={13} className="text-slate-500" /> {w.domain}
                </p>
              </div>
              <div
                style={{ backgroundColor: w.themeColor }}
                className="w-9 h-9 rounded-xl shadow-md flex items-center justify-center text-slate-950 ring-2 ring-white/10"
              >
                <MessageSquare size={17} />
              </div>
            </div>

            <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1 font-mono font-semibold">
                  <Code size={13} className="text-emerald-400" /> Embed HTML Code
                </span>
                <button
                  onClick={() => handleCopy(w.embedCode)}
                  className="text-slate-950 font-bold flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 px-2 py-0.5 rounded-lg shadow-xs cursor-pointer"
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto bg-slate-950/60 p-2.5 rounded-xl border border-white/[0.08]">
                {w.embedCode}
              </pre>
            </div>

            <div className="text-xs text-slate-300 font-medium">
              <span className="text-slate-500 font-semibold">Welcome Greeting:</span> "{w.greetingText}"
            </div>
          </div>
        ))}
        {widgets.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs font-medium text-slate-500 border-2 border-dashed border-white/[0.08] rounded-3xl">
            No live chat widgets created yet. Click <span className="text-emerald-400 font-bold">"New Chat Widget"</span> to deploy customer chat to your website.
          </div>
        )}
      </div>

      {/* Remodeled Luxury Glass Portal Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    LIVE CHAT DEPLOYMENT
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Create New Chat Widget</h2>
                  <p className="text-xs text-slate-400 font-medium">Configure embedded customer support widget & script snippet</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Widget Name</label>
                <div className="relative">
                  <MessageSquare size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales Landing Page Assistant"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Target Website Domain</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://mycompany.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Brand Accent Color</label>
                <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/[0.12] rounded-xl">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono font-bold text-emerald-400">{themeColor}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">Widget Theme Color</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Initial Greeting Message</label>
                <div className="relative">
                  <MessageSquarePlus size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Create & Generate JS</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
