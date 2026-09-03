'use client';

import React, { useState } from 'react';
import {
  Bot,
  Brain,
  MessageSquare,
  Sparkles,
  Ticket,
  User,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Database,
  FileText,
  Clock,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI_AGENT' | 'HUMAN_SPECIALIST' | 'SYSTEM';
  text: string;
  timestamp: string;
  citationDoc?: string;
  confidence?: number;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'FRUSTRATED';
}

interface SupportTicketDraft {
  id: string;
  title: string;
  customerName: string;
  customerEmail: string;
  sentimentScore: number;
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM';
  assignedSpecialist: string;
  rootCauseSummary: string;
  recommendedAction: string;
  status: 'AUTONOMOUSLY_DRAFTED' | 'ASSIGNED' | 'RESOLVED';
}

const PRESET_CONVERSATIONS = {
  billing_dispute: {
    name: 'Marcus Vance (Enterprise Tier)',
    email: 'marcus.v@apexlogistics.io',
    issue: 'Disputed $4,200 Double Invoicing on Stripe',
    messages: [
      {
        id: 'm1',
        sender: 'USER' as const,
        text: 'Hi, our finance team noticed we were billed twice for the August enterprise tier on Stripe. This is unacceptable, we need an immediate refund and an explanation.',
        timestamp: '10:14 AM',
        sentiment: 'FRUSTRATED' as const,
      },
      {
        id: 'm2',
        sender: 'AI_AGENT' as const,
        text: 'I completely understand your frustration Marcus, and I apologize for the inconvenience. Let me inspect our Stripe billing webhook logs and your subscription ledger right away.',
        timestamp: '10:14 AM',
        citationDoc: 'SOP-FIN-08: Subscription Webhook & Dual Charge Resolution',
        confidence: 98.2,
        sentiment: 'NEUTRAL' as const,
      },
      {
        id: 'm3',
        sender: 'USER' as const,
        text: 'The bot cannot resolve this fast enough. I need a real finance manager to approve the credit memo today.',
        timestamp: '10:15 AM',
        sentiment: 'FRUSTRATED' as const,
      },
    ],
    escalationTrigger: 'Customer frustration > 85% & explicit manager refund request detected.',
    ticket: {
      id: 'TICK-ESC-9041',
      title: 'Double Charge Dispute: Marcus Vance / Apex Logistics ($4,200)',
      customerName: 'Marcus Vance',
      customerEmail: 'marcus.v@apexlogistics.io',
      sentimentScore: 88,
      priority: 'P1_CRITICAL' as const,
      assignedSpecialist: 'Sarah Jenkins (Billing Ops Lead)',
      rootCauseSummary: 'Stripe retry idempotency key collision generated duplicate charge #ch_89104 during scheduled renewal.',
      recommendedAction: 'Issue immediate $4,200 Stripe refund for duplicate charge and credit $200 goodwill SLA voucher.',
      status: 'AUTONOMOUSLY_DRAFTED' as const,
    },
  },
  api_rate_limit: {
    name: 'Elena Rostova (CTO)',
    email: 'elena@novadev.org',
    issue: 'Webhook 429 Rate Limit in Production',
    messages: [
      {
        id: 'm1',
        sender: 'USER' as const,
        text: 'We are receiving 429 Too Many Requests on our CRM webhook sync endpoint during peak batch import. What is our current rate limit tier?',
        timestamp: '11:02 AM',
        sentiment: 'NEUTRAL' as const,
      },
      {
        id: 'm2',
        sender: 'AI_AGENT' as const,
        text: 'According to our Developer API Guidelines, standard Enterprise tier allows 500 req/sec with a burst allowance of 2,000 requests. For bulk lead ingestion, we recommend using the `/api/v2/contacts/bulk` batch endpoint to process 5,000 records in a single payload.',
        timestamp: '11:03 AM',
        citationDoc: 'DOC-DEV-04: High-Throughput Webhook Ingestion & Burst Limits',
        confidence: 99.4,
        sentiment: 'POSITIVE' as const,
      },
    ],
    escalationTrigger: 'Resolved autonomously via Vector Knowledge Base. No human intervention needed.',
    ticket: {
      id: 'TICK-KB-8820',
      title: 'Webhook 429 Burst Optimization for NovaDev',
      customerName: 'Elena Rostova',
      customerEmail: 'elena@novadev.org',
      sentimentScore: 20,
      priority: 'P3_MEDIUM' as const,
      assignedSpecialist: 'Self-Resolved (AI Knowledge Agent)',
      rootCauseSummary: 'Customer was querying single-record endpoints in parallel instead of bulk batch endpoint.',
      recommendedAction: 'Customer acknowledged batch endpoint documentation; monitor burst throughput.',
      status: 'RESOLVED' as const,
    },
  },
};

export function AISupportClient() {
  const [activeScenario, setActiveScenario] = useState<'billing_dispute' | 'api_rate_limit'>('billing_dispute');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ticketDraft, setTicketDraft] = useState<SupportTicketDraft | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const handleSelectScenario = (key: 'billing_dispute' | 'api_rate_limit') => {
    setActiveScenario(key);
    setMessages(PRESET_CONVERSATIONS[key].messages);
    setTicketDraft(PRESET_CONVERSATIONS[key].ticket);
    setIsEscalated(key === 'billing_dispute');
    setAlert(`Loaded scenario: ${PRESET_CONVERSATIONS[key].issue}`);
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'USER',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sentiment: inputMessage.toLowerCase().includes('broken') || inputMessage.toLowerCase().includes('refund') || inputMessage.toLowerCase().includes('manager')
        ? 'FRUSTRATED'
        : 'NEUTRAL',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // AI Agent Response
    setTimeout(() => {
      const isFrustrated = userMsg.sentiment === 'FRUSTRATED';
      if (isFrustrated) {
        setIsEscalated(true);
        const aiMsg: ChatMessage = {
          id: `m_ai_${Date.now()}`,
          sender: 'AI_AGENT',
          text: 'I see that this requires senior specialist authorization. I have synthesized our conversation history and autonomously generated Priority Ticket #TICK-ESC-9042 and paged Sarah Jenkins in Billing Operations.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citationDoc: 'SOP-ESC-01: Autonomous Ticket Dispatch & Sentiment Routing',
          confidence: 99.1,
          sentiment: 'NEUTRAL',
        };
        setMessages((prev) => [...prev, aiMsg]);
        setAlert('⚡ Dissatisfaction threshold reached! Ticket autonomously generated and assigned to specialist.');
      } else {
        const aiMsg: ChatMessage = {
          id: `m_ai_${Date.now()}`,
          sender: 'AI_AGENT',
          text: `Based on our company knowledge base, here is the verified solution for your query: all parameters have been validated against our standard protocol.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citationDoc: 'SOP-CORE-02: Knowledge Retrieval Guide',
          confidence: 97.8,
          sentiment: 'POSITIVE',
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Autonomous Support Sentinel
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              LangChain & Flowise Knowledge Vector Agent
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <Bot className="text-emerald-400" size={24} />
            AI Customer Support & Autonomous Ticket Escalation Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Solves the cost of 24/7 human staffing without frustrating customers. Answers complex queries from internal company docs, detects customer dissatisfaction in real-time, and autonomously drafts & routes tickets to specialists.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectScenario('billing_dispute')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeScenario === 'billing_dispute'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white'
            }`}
          >
            🔥 Billing Dispute & Escalation
          </button>
          <button
            type="button"
            onClick={() => handleSelectScenario('api_rate_limit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeScenario === 'api_rate_limit'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white'
            }`}
          >
            📚 Auto-Resolved Knowledge Base
          </button>
        </div>
      </div>

      {/* Main Split: Left = Live Support Conversation Sandbox, Right = Autonomous Ticket & Specialist Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Chat Sandbox */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col h-[580px]">
            {/* Conversation Header with Sentiment Sentinel */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white leading-tight">
                    {PRESET_CONVERSATIONS[activeScenario].name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {PRESET_CONVERSATIONS[activeScenario].email}
                  </span>
                </div>
              </div>

              {/* Sentiment Gauge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Sentiment Sentinel:
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                    activeScenario === 'billing_dispute'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {activeScenario === 'billing_dispute' ? '🔥 FRUSTRATED (88%)' : '😊 SATISFIED (98%)'}
                </span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 min-h-[260px]">
              {messages.map((msg) => {
                const isUser = msg.sender === 'USER';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 font-mono">
                      <span>{isUser ? 'Customer' : 'AI Knowledge Sentinel'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-amber-100 rounded-tr-none'
                          : 'bg-white/[0.05] border border-white/[0.08] text-slate-200 rounded-tl-none space-y-2'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {msg.citationDoc && (
                        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-emerald-300">
                            <FileText size={11} />
                            <span className="truncate max-w-[220px]">{msg.citationDoc}</span>
                          </span>
                          <span className="text-emerald-400">{msg.confidence}% match</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center text-slate-500 text-xs font-medium space-y-2">
                  <Bot size={28} className="text-emerald-400/80" />
                  <p>Support channel ready. Type a customer query below or select a scenario to test live sentiment analysis & autonomous ticket drafting.</p>
                </div>
              )}
            </div>

            {/* Message Input Box */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask support query or express frustration to trigger escalation..."
                className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08]"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl hover:from-amber-400 hover:to-orange-400 cursor-pointer transition-transform active:scale-95"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Autonomous Ticket Drafting & Specialist Routing Cockpit */}
        <div className="lg:col-span-5 space-y-6">
          {ticketDraft ? (
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Ticket size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Autonomous Escalated Ticket
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    ticketDraft.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {ticketDraft.status}
                </span>
              </div>

              {/* Ticket Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Ticket ID & Title</span>
                  <h4 className="font-bold text-sm text-white mt-0.5">{ticketDraft.title}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-500 block font-semibold">Priority SLA Tier</span>
                    <span
                      className={`font-bold font-mono ${
                        ticketDraft.priority === 'P1_CRITICAL' ? 'text-rose-400' : 'text-emerald-300'
                      }`}
                    >
                      {ticketDraft.priority} (&lt; 15 min response)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-500 block font-semibold">Assigned Specialist</span>
                    <span className="font-bold text-emerald-300">{ticketDraft.assignedSpecialist}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Autonomous AI Root Cause Analysis
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed font-mono">
                    {ticketDraft.rootCauseSummary}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    Recommended Specialist Resolution
                  </span>
                  <p className="text-amber-200/90 text-[11px] leading-relaxed">
                    {ticketDraft.recommendedAction}
                  </p>
                </div>

                {/* Action Buttons for Human Support Lead */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAlert(`✅ Approved 1-Click Resolution for ${ticketDraft.id}! Refund credited on Stripe & confirmation SMS sent.`);
                      setTimeout(() => setAlert(null), 4000);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve 1-Click Recommended Action</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAlert(`👤 Live Human Agent joined conversation session for ${ticketDraft.customerName}!`);
                      setTimeout(() => setAlert(null), 3000);
                    }}
                    className="w-full py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold rounded-xl text-xs border border-white/[0.1] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck size={14} />
                    <span>Take Over Live Chat as Specialist</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-16 text-center space-y-2">
              <Ticket size={32} className="text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Escalated Ticket</h4>
              <p className="text-xs text-slate-400">When customer frustration exceeds thresholds or refunds/contracts are requested, autonomous ticket summaries appear here with 1-click resolution actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
