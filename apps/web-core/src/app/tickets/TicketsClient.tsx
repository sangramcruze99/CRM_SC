'use client';

import { useState } from 'react';
import {
  Ticket,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Sparkles,
  BookOpen,
  Search,
  ThumbsUp,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  customerName: string;
  customerEmail: string;
  company: string;
  channel: 'LIVE_CHAT' | 'EMAIL' | 'WHATSAPP' | 'PORTAL';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED';
  assignedAgent: string;
  firstResponseSlaMinutes: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'FRUSTRATED';
  mrr: number;
  khataBalance: number;
  messages: {
    id: string;
    sender: 'customer' | 'agent' | 'system';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

const initialTickets: SupportTicket[] = [
  {
    id: 'tkt_101',
    ticketNumber: 'HD-2026-881',
    title: 'SSO SAML 2.0 Identity Provider Handshake Error',
    customerName: 'Sarah Connor',
    customerEmail: 'sarah.connor@cyberdyne.io',
    company: 'Cyberdyne Systems Corp',
    channel: 'EMAIL',
    priority: 'URGENT',
    status: 'OPEN',
    assignedAgent: 'David Ross (Senior Support Engineer)',
    firstResponseSlaMinutes: 14,
    sentiment: 'FRUSTRATED',
    mrr: 12000,
    khataBalance: 0,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        senderName: 'Sarah Connor',
        text: 'Our engineering team is getting a 403 Invalid SAML Assertion during Google Workspace SSO login. Please advise ASAP as 40 users are blocked.',
        timestamp: '15 mins ago',
      },
    ],
  },
  {
    id: 'tkt_102',
    ticketNumber: 'HD-2026-882',
    title: 'Custom Webhook Retry Logic Failing on High-Volume Bursts',
    customerName: 'Michael Scott',
    customerEmail: 'michael.scott@dunder.com',
    company: 'Dunder Mifflin Paper & Logistics',
    channel: 'LIVE_CHAT',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedAgent: 'Elena Rostova (DevOps Specialist)',
    firstResponseSlaMinutes: 45,
    sentiment: 'NEUTRAL',
    mrr: 4800,
    khataBalance: 185.20,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        senderName: 'Michael Scott',
        text: 'Hey team, our inventory batch sync dropped 3 webhooks during the 2:00 PM warehouse surge. Could we get the signature verification logs?',
        timestamp: '1 hour ago',
      },
      {
        id: 'm2',
        sender: 'agent',
        senderName: 'Elena Rostova',
        text: 'Hi Michael! Inspecting your tenant webhook listener logs now. We will re-dispatch the failed payloads with exponential backoff.',
        timestamp: '42 mins ago',
      },
    ],
  },
  {
    id: 'tkt_103',
    ticketNumber: 'HD-2026-883',
    title: 'Inquiry regarding automated WhatsApp Khata payment reminders',
    customerName: 'Elena Vance',
    customerEmail: 'elena.vance@blackmesa.org',
    company: 'Black Mesa Research',
    channel: 'WHATSAPP',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    assignedAgent: 'Support AI Copilot',
    firstResponseSlaMinutes: 0,
    sentiment: 'POSITIVE',
    mrr: 9500,
    khataBalance: 0,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        senderName: 'Elena Vance',
        text: 'How do we enable automated WhatsApp payment links for our retail POS ledger?',
        timestamp: 'Yesterday',
      },
      {
        id: 'm2',
        sender: 'agent',
        senderName: 'Support AI Copilot',
        text: 'Hello Elena! You can toggle WhatsApp automated links under "Operations & Revenue > Instant Payment Links" or via your Retail POS Console.',
        timestamp: 'Yesterday',
      },
    ],
  },
];

const knowledgeBaseArticles = [
  { id: 'kb_1', title: 'Configuring Enterprise Google / Okta SAML 2.0 SSO', category: 'Authentication & Security' },
  { id: 'kb_2', title: 'Webhook Signature Verification & Idempotency Best Practices', category: 'Developer APIs' },
  { id: 'kb_3', title: 'Setting up WhatsApp Business Cloud API & Payment Triggers', category: 'Integrations & POS' },
];

export function TicketsClient() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket>(initialTickets[0]);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [alert, setAlert] = useState<string | null>(null);

  // New Ticket Form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPriority, setNewPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newChannel, setNewChannel] = useState<'LIVE_CHAT' | 'EMAIL' | 'WHATSAPP' | 'PORTAL'>('EMAIL');

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchPriority && matchStatus;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'agent' as const,
      senderName: 'Sangram Cruze (Support Lead)',
      text: replyText,
      timestamp: 'Just now',
    };

    const updated = {
      ...selectedTicket,
      status: 'IN_PROGRESS' as const,
      messages: [...selectedTicket.messages, newMsg],
    };

    setSelectedTicket(updated);
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
    setReplyText('');
    setAlert(`💬 Reply dispatched to ${selectedTicket.customerName} via ${selectedTicket.channel}!`);
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAutoSuggestReply = () => {
    if (selectedTicket.id === 'tkt_101') {
      setReplyText(
        'Hello Sarah,\n\nWe have verified your SAML Entity ID configuration. The 403 error is caused by a missing ACS URL endpoint certificate in your Google Admin Console. Please navigate to "Security > SAML SSO > Endpoint URL" and update the certificate fingerprint. We are standing by to verify once updated!'
      );
    } else {
      setReplyText(
        `Hello ${selectedTicket.customerName},\n\nThank you for reaching out. We have investigated the telemetry logs for ${selectedTicket.company} and verified resolution across our edge infrastructure. Please test again and let us know if you need any further assistance!`
      );
    }
  };

  const handleInsertKB = (articleTitle: string) => {
    setReplyText((prev) => `${prev}\n\n📚 Helpful Guide: ${articleTitle} (https://docs.business-os.io/kb)`);
  };

  const handleUpdateStatus = (status: SupportTicket['status']) => {
    const updated = { ...selectedTicket, status };
    setSelectedTicket(updated);
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
    setAlert(`Ticket ${selectedTicket.ticketNumber} marked as ${status}!`);
    setTimeout(() => setAlert(null), 3000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCustomer) return;

    const newTkt: SupportTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `HD-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      customerName: newCustomer,
      customerEmail: newEmail || 'customer@enterprise.io',
      company: 'Enterprise Account',
      channel: newChannel,
      priority: newPriority,
      status: 'OPEN',
      assignedAgent: 'Sangram Cruze (Support Lead)',
      firstResponseSlaMinutes: 30,
      sentiment: 'NEUTRAL',
      mrr: 5000,
      khataBalance: 0,
      messages: [
        {
          id: 'm1',
          sender: 'customer',
          senderName: newCustomer,
          text: newTitle,
          timestamp: 'Just now',
        },
      ],
    };

    setTickets([newTkt, ...tickets]);
    setSelectedTicket(newTkt);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewCustomer('');
    setNewEmail('');
    setAlert(`🎟️ Ticket ${newTkt.ticketNumber} created and assigned to triage queue!`);
    setTimeout(() => setAlert(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Ticket className="text-amber-400" size={24} />
            Customer Support & Service Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Omnichannel ticket triage, real-time SLA countdowns, AI response generation, and 360° relationship history.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>New Incident Ticket</span>
        </button>
      </div>

      {/* KPI Support Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open Ticket Queue</span>
            <AlertCircle size={18} className="text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {tickets.filter((t) => t.status !== 'RESOLVED').length} Active
          </div>
          <div className="text-xs text-rose-400 mt-2 font-bold">1 Urgent P1 SLA countdown active</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg First Response SLA</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">4.2 min</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">99.2% SLA adherence rate</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customer CSAT Score</span>
            <ThumbsUp size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">98.5%</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Across 180+ resolved incidents</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">AI Copilot Deflection</span>
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">42.8%</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Self-resolved via KB & Chatbot</div>
        </div>
      </div>

      {/* 3-Column Omnichannel Helpdesk Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ticket Queue & Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search ticket #, title, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-[11px] font-semibold text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">P1 - Urgent</option>
                <option value="HIGH">P2 - High</option>
                <option value="MEDIUM">P3 - Medium</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-[11px] font-semibold text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {/* Ticket Cards List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-amber-500/80 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-lg'
                      : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.priority === 'URGENT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-white/[0.08] text-slate-300 border border-white/10'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-white line-clamp-1">{t.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>{t.customerName} ({t.company})</span>
                    <span className="text-slate-500">{t.channel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Interactive Ticket Thread & AI Response Copilot (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col h-[660px]">
            {/* Ticket Thread Header */}
            <div className="flex items-start justify-between border-b border-white/[0.06] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-amber-400">{selectedTicket.ticketNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.08] text-slate-300">
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-white mt-1">{selectedTicket.title}</h3>
              </div>

              <div className="flex items-center gap-1">
                {selectedTicket.status !== 'RESOLVED' ? (
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 rounded-xl text-[11px] font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    ✓ Resolve
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    className="px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.12] text-slate-300 rounded-xl text-[11px] font-bold border border-white/10 transition-colors cursor-pointer"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      msg.sender === 'agent'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-tr-xs shadow-lg shadow-orange-500/20 font-medium'
                        : 'bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-80 border-b border-black/10 pb-1 mb-1">
                      <span className="font-bold">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Auto-Suggest Button Bar */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleAutoSuggestReply}
                className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span>AI Auto-Draft Solution</span>
              </button>

              <span className="text-[10px] text-slate-500 font-mono">Channel: {selectedTicket.channel}</span>
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="space-y-2">
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type response to customer or insert knowledge base solution..."
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] focus:border-amber-500 font-medium"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Customer 360 Context & KB Insert (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Customer 360 Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.06] pb-2">
              Customer 360° Profile
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Account</span>
                <span className="font-bold text-white">{selectedTicket.customerName}</span>
                <span className="text-[11px] text-slate-400 block">{selectedTicket.company}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">MRR Value</span>
                  <span className="font-mono font-extrabold text-amber-400">${selectedTicket.mrr}/mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Khata Balance</span>
                  <span className="font-mono font-extrabold text-emerald-400">${selectedTicket.khataBalance}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase mb-1">
                  NLP Sentiment Radar
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedTicket.sentiment === 'POSITIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : selectedTicket.sentiment === 'NEUTRAL'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  ● {selectedTicket.sentiment}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Knowledge Base Articles */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
              <BookOpen size={14} className="text-amber-400" />
              <span>Knowledge Base Solutions</span>
            </h3>

            <div className="space-y-2">
              {knowledgeBaseArticles.map((kb) => (
                <div
                  key={kb.id}
                  onClick={() => handleInsertKB(kb.title)}
                  className="p-2.5 bg-white/[0.03] hover:bg-amber-500/10 border border-white/[0.06] hover:border-amber-500/40 rounded-2xl transition-all cursor-pointer space-y-1 group"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {kb.title}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{kb.category}</span>
                    <span className="text-amber-400 font-bold">+ Insert</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Create New Support Incident</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ticket Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSO Login Handshake Timeout"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e: any) => setNewChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-medium"
                  >
                    <option value="EMAIL">Email Support</option>
                    <option value="LIVE_CHAT">Live Web Chat</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="PORTAL">Customer Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-medium"
                >
                  <option value="URGENT">P1 - Urgent (15m SLA)</option>
                  <option value="HIGH">P2 - High (1h SLA)</option>
                  <option value="MEDIUM">P3 - Medium (4h SLA)</option>
                  <option value="LOW">P4 - Low (24h SLA)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 cursor-pointer"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
