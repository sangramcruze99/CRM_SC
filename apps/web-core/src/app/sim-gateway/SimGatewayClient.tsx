'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Phone,
  MessageSquare,
  Signal,
  Wifi,
  QrCode,
  CheckCircle2,
  Sparkles,
  Send,
  RefreshCw,
  Zap,
  ShieldCheck,
  DollarSign,
  Radio,
  Sliders,
  Play,
  RotateCcw,
  Hash,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SimSlot {
  id: string;
  slotNumber: 1 | 2;
  carrierName: string;
  phoneNumber: string;
  networkType: '5G' | '4G LTE' | '3G';
  signalStrengthDbm: number;
  status: 'ONLINE' | 'ACTIVE_CALL' | 'ROAMING' | 'OFFLINE';
  balanceAirtime: string;
  smsQuotaLeft: number;
  imei: string;
}

const INITIAL_SIM_SLOTS: SimSlot[] = [
  {
    id: 'sim_01',
    slotNumber: 1,
    carrierName: 'Vodafone Enterprise / AT&T',
    phoneNumber: '+1 (555) 883-4920',
    networkType: '5G',
    signalStrengthDbm: -72,
    status: 'ONLINE',
    balanceAirtime: '$48.50 Credit',
    smsQuotaLeft: 1420,
    imei: '864201048821903',
  },
  {
    id: 'sim_02',
    slotNumber: 2,
    carrierName: 'Airtel / T-Mobile Corporate',
    phoneNumber: '+1 (555) 771-0029',
    networkType: '4G LTE',
    signalStrengthDbm: -84,
    status: 'ONLINE',
    balanceAirtime: '$24.00 Credit',
    smsQuotaLeft: 850,
    imei: '864201049912401',
  },
];

interface SimSmsLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  messageText: string;
  simSlot: number;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  timestamp: string;
}

const INITIAL_SMS_LOGS: SimSmsLog[] = [
  {
    id: 'sms_01',
    recipientPhone: '+1 (555) 019-2834',
    recipientName: 'Sarah Connor (Cyberdyne)',
    messageText: 'Your invoice #INV-8891 ($14,500) has been generated. Pay online via Stripe or wire.',
    simSlot: 1,
    status: 'DELIVERED',
    timestamp: '10:45 AM',
  },
  {
    id: 'sms_02',
    recipientPhone: '+1 (555) 342-8911',
    recipientName: 'Alex Vance (Black Mesa)',
    messageText: 'Appointment confirmed for clinical telemetry scan today at 2:00 PM.',
    simSlot: 2,
    status: 'DELIVERED',
    timestamp: '09:12 AM',
  },
  {
    id: 'sms_03',
    recipientPhone: '+1 (555) 782-9021',
    recipientName: 'David Ross (HyperScale)',
    messageText: 'Dual Khata Ledger balance reminder: $4,850.00 outstanding.',
    simSlot: 1,
    status: 'DELIVERED',
    timestamp: 'Yesterday',
  },
];

export function SimGatewayClient() {
  const [simSlots, setSimSlots] = useState<SimSlot[]>(INITIAL_SIM_SLOTS);
  const [smsLogs, setSmsLogs] = useState<SimSmsLog[]>(INITIAL_SMS_LOGS);
  const [selectedSim, setSelectedSim] = useState<number>(1);
  const [recipientNumber, setRecipientNumber] = useState('+1 (555) 019-2834');
  const [recipientName, setRecipientName] = useState('Sarah Connor');
  const [smsContent, setSmsContent] = useState('Hello Sarah, this is a direct cellular SMS from Business OS SIM Gateway.');
  const [ussdCode, setUssdCode] = useState('*121#');
  const [ussdResponse, setUssdResponse] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const handleSendSimSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsContent || !recipientNumber) return;

    setIsSending(true);
    setTimeout(() => {
      const newLog: SimSmsLog = {
        id: `sms_${Date.now()}`,
        recipientPhone: recipientNumber,
        recipientName: recipientName || 'Client',
        messageText: smsContent,
        simSlot: selectedSim,
        status: 'DELIVERED',
        timestamp: 'Just now',
      };
      setSmsLogs([newLog, ...smsLogs]);
      setIsSending(false);
      setSmsContent('');
      setAlert(`📲 Direct Cellular SMS dispatched via SIM Slot ${selectedSim} (${simSlots[selectedSim - 1].carrierName}) to ${recipientNumber}!`);
      setTimeout(() => setAlert(null), 4000);
    }, 800);
  };

  const handleRunUssd = () => {
    setUssdResponse(`Carrier Query (${ussdCode}): Balance is $48.50. Active Plan: Unlimited 5G Voice + 2,000 SMS. Valid until 30-Sep-2026.`);
    setAlert(`⚡ Executed USSD Code ${ussdCode} over GSM baseband modem.`);
    setTimeout(() => setAlert(null), 3000);
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
            <Smartphone className="text-amber-400" size={24} />
            Cellular SIM Call & SMS Gateway Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Physical Dual-SIM hardware modem, Android/iOS phone companion bridge, GSM calls, and local carrier SMS campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span>Dual-SIM Modem Active</span>
          </span>
        </div>
      </div>

      {/* Dual SIM Card Hardware Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {simSlots.map((sim) => {
          const isSelected = selectedSim === sim.slotNumber;
          return (
            <div
              key={sim.id}
              onClick={() => setSelectedSim(sim.slotNumber)}
              className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-tr from-amber-500/20 via-white/[0.04] to-orange-500/15 border-amber-500/80 ring-2 ring-amber-500/30'
                  : 'bg-white/[0.04] border-white/[0.08] hover:border-white/[0.18]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                    SIM {sim.slotNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{sim.carrierName}</h3>
                    <span className="text-xs font-mono font-bold text-amber-400">{sim.phoneNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {sim.networkType}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-300 font-mono">
                    <Signal size={12} className="text-emerald-400" /> {sim.signalStrengthDbm} dBm
                  </span>
                </div>
              </div>

              {/* SIM Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/[0.06]">
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Airtime Balance</span>
                  <span className="font-mono font-bold text-white text-sm">{sim.balanceAirtime}</span>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SMS Quota Remaining</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{sim.smsQuotaLeft} SMS</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>IMEI: {sim.imei}</span>
                <span className="text-amber-400 font-bold">{isSelected ? '✓ Default for Outbound' : 'Click to select'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main SIM Controls & Dispatcher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Direct Cellular SMS Composer (6 cols) */}
        <div className="lg:col-span-6 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-400" />
              <h3 className="font-bold text-sm text-white">Direct Cellular SMS Dispatcher</h3>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">
              Using SIM {selectedSim} ({simSlots[selectedSim - 1].carrierName})
            </span>
          </div>

          <form onSubmit={handleSendSimSms} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Mobile Number (GSM)
                </label>
                <input
                  type="text"
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-mono font-bold text-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">
                  SMS Message Body
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {smsContent.length} / 160 chars (1 SMS segment)
                </span>
              </div>
              <textarea
                rows={3}
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={15} />
              <span>{isSending ? 'Transmitting via SIM baseband...' : `Dispatch SMS via SIM ${selectedSim}`}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Phone Companion Mobile Bridge & USSD Runner (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Smartphone QR Pairing Bridge */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white">Mobile SIM Bridge (Android / iOS)</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                Companion Ready
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="w-20 h-20 bg-white p-1.5 rounded-2xl flex-shrink-0 flex items-center justify-center">
                <QrCode size={68} className="text-slate-950" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-white block">Turn your phone into a SIM Calling Gateway</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Scan this QR with the Business OS Companion app on Android/iOS to bridge your physical device SIM cards directly into this browser dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* USSD Baseband Code Runner */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Carrier USSD Balance & Airtime Query
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ussdCode}
                onChange={(e) => setUssdCode(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-mono font-bold text-amber-400"
              />
              <button
                type="button"
                onClick={handleRunUssd}
                className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs rounded-xl border border-white/[0.1] cursor-pointer"
              >
                Dial USSD
              </button>
            </div>

            {ussdResponse && (
              <div className="p-3 bg-slate-950/80 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300">
                {ussdResponse}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SIM SMS Transmission Logs Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">SIM Baseband SMS Transmission Logs</h3>
          <span className="text-xs text-slate-400">Direct Carrier DLR Verification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4">Recipient & Phone</th>
                <th className="px-6 py-4">SIM Slot</th>
                <th className="px-6 py-4">Message Content</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Carrier DLR Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {smsLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-white block">{log.recipientName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{log.recipientPhone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      SIM #{log.simSlot}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{log.messageText}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">{log.timestamp}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {log.status} ✓
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
