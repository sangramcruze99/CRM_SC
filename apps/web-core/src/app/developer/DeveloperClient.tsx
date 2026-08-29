"use client";

import { useState } from "react";
import { Key, Webhook, Plus, Trash2, Power, Code2, Copy, Check, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeveloperClient({ initialApiKeys, initialWebhooks }: { initialApiKeys: any[], initialWebhooks: any[] }) {
  const [activeTab, setActiveTab] = useState<'api' | 'webhooks'>('api');
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleGenerateKey = async () => {
    const name = prompt("Name this API Key (e.g. Zapier Integration):");
    if (!name) return;
    
    const res = await fetch(`/api/developer/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'default-tenant'
      },
      body: JSON.stringify({ name })
    });
    
    if (res.ok) {
      const newKey = await res.json();
      setNewKeyRaw(newKey.key);
      
      const maskedKey = { ...newKey, key: newKey.key.substring(0, 12) + '... (Masked for security)' };
      setApiKeys([maskedKey, ...apiKeys]);
      router.refresh();
    }
  };

  const handleRegisterWebhook = async () => {
    const url = prompt("Enter Webhook Endpoint URL:");
    if (!url) return;
    
    const eventsStr = prompt("Enter comma separated events (e.g. contact.created,deal.won):", "contact.created");
    if (!eventsStr) return;
    
    const events = eventsStr.split(',').map(e => e.trim());
    
    const res = await fetch(`/api/developer/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'default-tenant'
      },
      body: JSON.stringify({ url, events })
    });
    
    if (res.ok) {
      const newWebhook = await res.json();
      setWebhooks([newWebhook, ...webhooks]);
      router.refresh();
    }
  };

  const copyToClipboard = () => {
    if (newKeyRaw) {
      navigator.clipboard.writeText(newKeyRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.08]">
        <button
          onClick={() => setActiveTab('api')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${activeTab === 'api' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Key size={14} />
          <span>API Keys & Credentials</span>
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${activeTab === 'webhooks' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Webhook size={14} />
          <span>Webhooks & Subscriptions</span>
        </button>
      </div>

      {newKeyRaw && (
        <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl animate-in fade-in zoom-in-95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-amber-300 font-bold text-xs flex items-center space-x-2">
                <CheckCircle2 size={15} /> <span>API Key Generated Successfully</span>
              </h3>
              <p className="text-slate-300 text-xs mt-1 font-medium">
                Please copy this key and store it securely. You will not be able to view it again.
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <code className="px-3 py-1.5 bg-white/[0.08] rounded-xl font-mono text-white text-xs border border-white/10 shadow-2xs font-semibold">
                  {newKeyRaw}
                </code>
                <button 
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            </div>
            <button onClick={() => setNewKeyRaw(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'api' ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-medium">Manage authorization keys for external REST API and webhook integrations.</p>
              <button 
                onClick={handleGenerateKey}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
              >
                <Plus size={15} />
                <span>Create Secret Key</span>
              </button>
            </div>
            
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Key Identifier</th>
                    <th className="px-6 py-4 font-semibold">Token Secret</th>
                    <th className="px-6 py-4 font-semibold">Created Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {apiKeys.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs font-medium">
                        No API keys generated yet.
                      </td>
                    </tr>
                  )}
                  {apiKeys.map(key => (
                    <tr key={key.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-4 font-bold text-white text-xs flex items-center space-x-2">
                        <Key size={14} className="text-amber-400" />
                        <span>{key.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400 font-medium">{key.key}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-medium">{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer" title="Revoke Key">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-medium">Register webhook listeners to stream real-time workspace mutations.</p>
              <button 
                onClick={handleRegisterWebhook}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Endpoint</span>
              </button>
            </div>
            
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Endpoint URL</th>
                    <th className="px-6 py-4 font-semibold">Subscribed Events</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {webhooks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs font-medium">
                        No webhook endpoints registered.
                      </td>
                    </tr>
                  )}
                  {webhooks.map(wh => (
                    <tr key={wh.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-white text-xs flex items-center space-x-2">
                        <Webhook size={14} className="text-amber-400" />
                        <span>{wh.url}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {wh.events.map((e: string) => (
                            <span key={e} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.08] text-amber-300 border border-white/10">
                              {e}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {wh.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer" title="Delete Webhook">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
