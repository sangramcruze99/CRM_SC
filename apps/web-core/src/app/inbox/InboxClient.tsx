'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Phone,
  Paperclip,
  CheckCheck,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Receipt,
  QrCode,
  Calendar,
  Zap,
  MoreVertical,
  User,
  Building,
  Mail,
  Share2,
} from 'lucide-react';

interface ChannelMessage {
  id: string;
  sender: 'contact' | 'agent';
  text: string;
  timestamp: string;
  attachment?: {
    type: 'invoice' | 'payment_link' | 'appointment' | 'khata';
    title: string;
    amount?: string;
  };
}

interface Conversation {
  id: string;
  name: string;
  company: string;
  avatar: string;
  channel: 'whatsapp' | 'sms' | 'instagram' | 'messenger' | 'webchat' | 'email';
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  phone: string;
  email: string;
  messages: ChannelMessage[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_01',
    name: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    channel: 'whatsapp',
    lastMessage: 'Can you please send over the updated invoice with Net 30 terms?',
    timestamp: '10:48 AM',
    unreadCount: 1,
    phone: '+1 (555) 019-2834',
    email: 'sarah.connor@cyberdyne.io',
    messages: [
      { id: 'm1', sender: 'agent', text: 'Hi Sarah, thank you for reaching out via WhatsApp Business!', timestamp: '10:30 AM' },
      { id: 'm2', sender: 'contact', text: 'Can you please send over the updated invoice with Net 30 terms?', timestamp: '10:48 AM' },
    ],
  },
  {
    id: 'conv_02',
    name: 'Dr. Evelyn Vance',
    company: 'Metropolitan Hospital',
    avatar: 'https://images.unsplash.com/photo-1594824813501-44754528448f?w=150&auto=format&fit=crop&q=80',
    channel: 'sms',
    lastMessage: 'Confirmed appointment for surgical equipment calibration at 2 PM.',
    timestamp: '09:15 AM',
    unreadCount: 0,
    phone: '+1 (555) 302-8877',
    email: 'e.vance@hospital.org',
    messages: [
      { id: 'm3', sender: 'agent', text: 'Dr. Vance, reminder for calibration review today.', timestamp: '09:00 AM' },
      { id: 'm4', sender: 'contact', text: 'Confirmed appointment for surgical equipment calibration at 2 PM.', timestamp: '09:15 AM' },
    ],
  },
  {
    id: 'conv_03',
    name: 'Victoria Sinclair',
    company: 'Luxury Realty Estate',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    channel: 'instagram',
    lastMessage: 'Loved the 3D virtual tour post on Instagram! Is the penthouse still in escrow?',
    timestamp: 'Yesterday',
    unreadCount: 0,
    phone: '+1 (555) 440-2918',
    email: 'v.sinclair@luxuryrealty.com',
    messages: [
      { id: 'm5', sender: 'contact', text: 'Loved the 3D virtual tour post on Instagram! Is the penthouse still in escrow?', timestamp: 'Yesterday' },
    ],
  },
  {
    id: 'conv_04',
    name: 'Chef Marco Pierre',
    company: 'Bistro Gastronomique',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    channel: 'whatsapp',
    lastMessage: 'Khata balance payment wire has been initiated for organic produce order.',
    timestamp: 'Yesterday',
    unreadCount: 0,
    phone: '+1 (555) 771-4091',
    email: 'marco@bistroluxury.com',
    messages: [
      { id: 'm6', sender: 'contact', text: 'Khata balance payment wire has been initiated for organic produce order.', timestamp: 'Yesterday' },
    ],
  },
];

export function InboxClient() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv_01');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSendMessage = (textToSend?: string, attachment?: ChannelMessage['attachment']) => {
    const content = textToSend || replyText;
    if (!content && !attachment) return;

    const newMsg: ChannelMessage = {
      id: `m_${Date.now()}`,
      sender: 'agent',
      text: content,
      timestamp: 'Just now',
      attachment,
    };

    const updated = conversations.map((c) => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          lastMessage: attachment ? `Sent ${attachment.title}` : content,
          timestamp: 'Just now',
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    });

    setConversations(updated);
    setReplyText('');
    setAlert(`⚡ Dispatched message to ${activeConv.name} via ${activeConv.channel.toUpperCase()}!`);
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSendInvoice = () => {
    handleSendMessage('Here is your itemized commercial invoice with Net 30 terms.', {
      type: 'invoice',
      title: 'Commercial Invoice #INV-2026-8891 (PDF)',
      amount: '$14,500.00',
    });
  };

  const handleSendPaymentQR = () => {
    handleSendMessage('Here is your instant 1-click Stripe payment link and QR code.', {
      type: 'payment_link',
      title: 'Instant Stripe Checkout Link & POS QR',
      amount: '$14,500.00',
    });
  };

  const handleSendKhataReminder = () => {
    handleSendMessage('Kindly review your current Dual Khata Ledger receivables summary statement.', {
      type: 'khata',
      title: 'Dual Khata Ledger Account Statement',
      amount: '$4,850.00 Outstanding',
    });
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = channelFilter === 'ALL' || c.channel === channelFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const getChannelBadge = (ch: Conversation['channel']) => {
    switch (ch) {
      case 'whatsapp':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">WhatsApp</span>;
      case 'sms':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">SMS</span>;
      case 'instagram':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">Instagram</span>;
      case 'messenger':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">Messenger</span>;
      case 'webchat':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Live Webchat</span>;
      case 'email':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">Email</span>;
    }
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
            <MessageSquare className="text-amber-400" size={24} />
            Omnichannel Unified Inbox (WhatsApp, SMS & Social DMs)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Unified 6-in-1 multi-channel communications stream with automated WhatsApp payment links, invoice dispatch, and Khata reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>6 Channels Connected</span>
          </span>
        </div>
      </div>

      {/* Main 3-Column Glass Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {/* Left Column: Conversation List & Channel Filters (4 cols) */}
        <div className="lg:col-span-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Channel Filters Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold">
              {['ALL', 'whatsapp', 'sms', 'instagram', 'webchat'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-2.5 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    channelFilter === ch
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Conversation Threads */}
            <div className="space-y-2 overflow-y-auto max-h-[540px] pr-1">
              {filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                  >
                    <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-white truncate">{conv.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{conv.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-slate-400 truncate">{conv.company}</span>
                        {getChannelBadge(conv.channel)}
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-1">{conv.lastMessage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Column: Active Chat Stream & WhatsApp Superpowers Toolbar (5 cols) */}
        <div className="lg:col-span-5 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {/* Active Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-3">
              <img src={activeConv.avatar} alt={activeConv.name} className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold text-sm text-white">{activeConv.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{activeConv.phone}</span>
                  {getChannelBadge(activeConv.channel)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/voice"
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-white/[0.08] transition-colors"
                title="Call via Softphone"
              >
                <Phone size={14} />
              </Link>
            </div>
          </div>

          {/* Message Thread Body */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
            {activeConv.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2 ${
                    msg.sender === 'agent'
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-white rounded-tr-xs'
                      : 'bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Rich Attachment Card */}
                  {msg.attachment && (
                    <div className="p-2.5 bg-slate-950/80 border border-amber-500/40 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-amber-400">
                          {msg.attachment.title}
                        </span>
                        {msg.attachment.amount && (
                          <span className="font-mono font-bold text-xs text-emerald-400">
                            {msg.attachment.amount}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ⚡ Direct link dispatched via encrypted webhook payload.
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'agent' && <CheckCheck size={11} className="text-sky-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Superpowers Quick Action Buttons (WhatsApp / Omnichannel Triggers) */}
          <div className="space-y-2 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
              <button
                type="button"
                onClick={handleSendInvoice}
                className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-lg whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <Receipt size={12} />
                <span>Send Invoice PDF</span>
              </button>

              <button
                type="button"
                onClick={handleSendPaymentQR}
                className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-lg whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <QrCode size={12} />
                <span>Send Payment Link</span>
              </button>

              <button
                type="button"
                onClick={handleSendKhataReminder}
                className="px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 rounded-lg whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <DollarSign size={12} />
                <span>Khata Balance Reminder</span>
              </button>
            </div>

            {/* Input & Send Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08]"
              />
              <button
                type="submit"
                className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 shadow-md cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Profile & Linked Records (3 cols) */}
        <div className="lg:col-span-3 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 overflow-y-auto">
          <div className="flex flex-col items-center text-center border-b border-white/[0.06] pb-4">
            <img src={activeConv.avatar} alt={activeConv.name} className="w-16 h-16 rounded-2xl object-cover mb-2 border border-white/10 shadow-lg" />
            <h3 className="font-bold text-sm text-white">{activeConv.name}</h3>
            <span className="text-xs text-amber-400 font-semibold">{activeConv.company}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Contact Info</span>
              <div className="text-slate-300">{activeConv.phone}</div>
              <div className="text-slate-400 truncate">{activeConv.email}</div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Deal</span>
              <div className="font-bold text-white">Enterprise Cluster Rollout</div>
              <div className="text-amber-400 font-mono font-bold">$48,000 ARR (Stage: Negotiation)</div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Dual Khata Balance</span>
              <div className="font-mono font-bold text-emerald-400">$0.00 Current Debt (Clean Record)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
