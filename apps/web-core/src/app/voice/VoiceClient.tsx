'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Zap,
  Activity,
  Bot,
  MessageSquare,
  Play,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface CallRecord {
  id: string;
  contactName: string;
  company: string;
  phone: string;
  duration: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'AT_RISK';
  summary: string;
  timestamp: string;
}

const INITIAL_CALL_LOGS: CallRecord[] = [
  {
    id: 'call_01',
    contactName: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    phone: '+1 (555) 019-2834',
    duration: '04:12',
    sentiment: 'POSITIVE',
    summary: 'Agreed on Enterprise Kubernetes cluster rollout. Requested CPQ quote with 10% annual discount.',
    timestamp: 'Today, 10:45 AM',
  },
  {
    id: 'call_02',
    contactName: 'Alex Vance',
    company: 'Black Mesa Labs',
    phone: '+1 (555) 342-8911',
    duration: '02:45',
    sentiment: 'NEUTRAL',
    summary: 'Discussed OCR Neural Vision scanner throughput. Forwarded SOC2 Type II compliance audit report.',
    timestamp: 'Today, 09:15 AM',
  },
  {
    id: 'call_03',
    contactName: 'David Ross',
    company: 'HyperScale AI',
    phone: '+1 (555) 782-9021',
    duration: '06:30',
    sentiment: 'POSITIVE',
    summary: 'Reviewed Dual Khata ledger integration. Customer approved $18.5k annual license invoice.',
    timestamp: 'Yesterday, 04:20 PM',
  },
];

export function VoiceClient() {
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 019-2834');
  const [contactName, setContactName] = useState('Sarah Connor (Cyberdyne Systems)');
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callRoute, setCallRoute] = useState<'voip' | 'sim1' | 'sim2'>('voip');
  const [callDuration, setCallDuration] = useState(0);
  const [callLogs, setCallLogs] = useState<CallRecord[]>(INITIAL_CALL_LOGS);
  const [alert, setAlert] = useState<string | null>(null);

  // Live real-time transcript lines
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; time: string }>>([
    { speaker: 'Agent', text: 'Hello Sarah, thank you for taking my call! How are operations going at Cyberdyne today?', time: '00:05' },
    { speaker: 'Sarah', text: 'Hi! We are looking to scale our dedicated infrastructure clusters, but we need high reliability.', time: '00:12' },
  ]);

  // Live AI Copilot Battlecard Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'Customer is scaling infrastructure: Mention our 99.99% SLA guarantee & multi-region automated failover.',
    'Competitor Alert: If they mention AWS EKS pricing, highlight that our dedicated clusters include free zero-egress data transfer.',
  ]);

  // Call timer interval
  useEffect(() => {
    let timer: any;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  // Simulate live speech streaming during active call
  useEffect(() => {
    if (isCalling) {
      const step1 = setTimeout(() => {
        setTranscript((prev) => [
          ...prev,
          { speaker: 'Sarah', text: 'What are your payment terms and can you bundle Dual Khata ledger accounting?', time: '00:25' },
        ]);
        setAiSuggestions((prev) => [
          '⚡ AI Recommended Action: Offer Net 30 terms with automated Khata ledger reconciliation and 10% annual prepay discount.',
          ...prev,
        ]);
      }, 3000);

      const step2 = setTimeout(() => {
        setTranscript((prev) => [
          ...prev,
          { speaker: 'Agent', text: 'Absolutely Sarah! We offer full automated Dual Khata ledger sync with Net 30 payment terms.', time: '00:34' },
        ]);
      }, 6000);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
      };
    }
  }, [isCalling]);

  const handleStartCall = () => {
    setIsCalling(true);
    setAlert('📞 Call connected via WebRTC softphone! Live speech-to-text and AI Copilot active.');
    setTimeout(() => setAlert(null), 4000);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    const newLog: CallRecord = {
      id: `call_${Date.now()}`,
      contactName: contactName.split('(')[0].trim(),
      company: contactName.includes('(') ? contactName.split('(')[1].replace(')', '') : 'Enterprise Client',
      phone: phoneNumber,
      duration: `0${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`,
      sentiment: 'POSITIVE',
      summary: 'Customer confirmed interest in dedicated clusters and automated Dual Khata accounting.',
      timestamp: 'Just now',
    };
    setCallLogs([newLog, ...callLogs]);
    setAlert(`🎉 Call ended (${newLog.duration}). AI call summary & action items logged to Contact Timeline!`);
    setTimeout(() => setAlert(null), 5000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
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
            <Phone className="text-amber-400" size={24} />
            AI Voice Telephony & Live Call Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            In-browser WebRTC softphone, real-time speech-to-text transcription, and live AI Copilot objection suggestions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/sim-gateway"
            className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-amber-300 rounded-xl text-xs font-bold border border-white/[0.1] flex items-center gap-1.5 cursor-pointer"
          >
            <span>📱 Manage SIM Cards (Dual-SIM)</span>
          </Link>
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>VoIP & SIM Ready</span>
          </span>
        </div>
      </div>

      {/* Softphone Dialer & Live Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Softphone Dialpad & Call Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Outbound Carrier & Trunk
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {isCalling ? `Connected · ${formatTime(callDuration)}` : 'Ready to Dial'}
              </span>
            </div>

            {/* Carrier Route Selector: VoIP vs SIM 1 vs SIM 2 */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Outbound Route Channel
              </label>
              <select
                value={callRoute}
                onChange={(e) => setCallRoute(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-bold text-white focus:outline-none"
              >
                <option value="voip">🌐 WebRTC VoIP Cloud Trunk</option>
                <option value="sim1">📲 SIM Slot 1 (Vodafone 5G · $48.50)</option>
                <option value="sim2">📲 SIM Slot 2 (Airtel 4G LTE · $24.00)</option>
              </select>
            </div>

            {/* Target Contact & Phone Field */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Recipient Contact
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-bold text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-mono font-bold text-amber-400 focus:outline-none focus:bg-white/[0.08]"
                />
              </div>
            </div>

            {/* Audio Waveform Visualizer (Active during call) */}
            {isCalling ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-center">
                <div className="flex items-center justify-center gap-1 h-8">
                  {[40, 75, 100, 60, 90, 45, 80, 100, 65, 85, 50, 70, 95].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-amber-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-300 block">
                  Live HD Voice Stream (48 kHz)
                </span>
              </div>
            ) : null}

            {/* Dialpad Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => setPhoneNumber((prev) => prev + digit)}
                  className="p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/40 rounded-2xl font-mono font-bold text-sm text-white transition-all cursor-pointer"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Call / End Controls */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
              {isCalling ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                      isMuted
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-white/[0.06] text-slate-300 border-white/[0.1]'
                    }`}
                  >
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneOff size={16} />
                    <span>Hang Up & Log Call</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall size={16} />
                  <span>Start Outbound Call</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Transcription & AI Copilot Suggestions (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Transcript Stream */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Live Real-Time Speech-to-Text Transcription</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-md">
                NLP Auto-Transcribe
              </span>
            </div>

            <div className="space-y-3 min-h-[160px] max-h-[220px] overflow-y-auto pr-2">
              {transcript.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs space-y-1 ${
                    line.speaker === 'Agent'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-slate-200'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className={line.speaker === 'Agent' ? 'text-amber-400' : 'text-sky-400'}>
                      {line.speaker === 'Agent' ? 'You (Sales Rep)' : contactName.split('(')[0]}
                    </span>
                    <span className="text-slate-500 font-mono">{line.time}</span>
                  </div>
                  <p className="leading-relaxed">{line.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time AI Copilot Battlecard Suggestions */}
          <div className="bg-gradient-to-r from-amber-500/10 via-white/[0.04] to-orange-500/10 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Real-Time AI Call Copilot Battlecards</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                Listening...
              </span>
            </div>

            <div className="space-y-2">
              {aiSuggestions.map((sug, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950/70 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5 shadow-sm"
                >
                  <Sparkles size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{sug}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Call Intelligence History */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-sm font-bold text-white">Recent Call Logs & Summaries</h3>
              <span className="text-xs text-slate-400">Total 48 Calls This Month</span>
            </div>

            <div className="space-y-3">
              {callLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.contactName}</span>
                      <span className="text-slate-400">({log.company})</span>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                        {log.sentiment}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">{log.summary}</p>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    <span className="font-mono font-bold text-amber-400 block">{log.duration}</span>
                    <span className="text-[10px] text-slate-500 block">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
