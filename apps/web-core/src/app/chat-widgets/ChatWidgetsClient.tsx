'use client';

import { useState } from 'react';
import { Plus, Copy, CheckCircle, Code, Globe, MessageCircle, MessageSquare } from 'lucide-react';

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

const initialDemoWidgets: ChatWidget[] = [
  {
    id: 'cw_01',
    name: 'Marketing Website Live Support',
    domain: 'https://businessos.io',
    themeColor: '#f59e0b',
    greetingText: 'Hi there! How can our enterprise team help you today?',
    botEnabled: true,
    status: 'ONLINE',
    embedCode: '<script src="https://cdn.businessos.io/widget.js" data-widget-id="cw_01"></script>',
  },
  {
    id: 'cw_02',
    name: 'In-App Customer Helpdesk Portal',
    domain: 'https://app.businessos.io',
    themeColor: '#10b981',
    greetingText: 'Need help with your workspace setup? Talk to an engineer.',
    botEnabled: true,
    status: 'ONLINE',
    embedCode: '<script src="https://cdn.businessos.io/widget.js" data-widget-id="cw_02"></script>',
  },
];

export function ChatWidgetsClient({ initialWidgets = [] }: { initialWidgets?: any[] }) {
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
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <CheckCircle size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MessageCircle className="text-amber-400" size={24} />
            Live Chat Widgets & Embeds
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deploy real-time AI copilot and agent live chat bubbles onto any external website with 1 line of JS.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Chat Widget</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.map((w) => (
          <div key={w.id} className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 hover:border-amber-500/40 transition-all">
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
                  <Code size={13} className="text-amber-400" /> Embed HTML Code
                </span>
                <button
                  onClick={() => handleCopy(w.embedCode)}
                  className="text-slate-950 font-bold flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-2 py-0.5 rounded-lg shadow-xs cursor-pointer"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Create New Chat Widget</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Widget Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Landing Page Assistant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Website Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://mycompany.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono font-bold text-amber-400">{themeColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Greeting Message</label>
                <input
                  type="text"
                  required
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
                >
                  Create & Generate JS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
