'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';

export function WhatsAppButton({ contactId, phone }: { contactId: string; phone?: string }) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSend = async () => {
    if (!phone) {
      alert("This contact does not have a phone number.");
      return;
    }
    
    setIsSending(true);
    setStatus('idle');
    
    try {
      const res = await fetch('/api/automation/actions/twilio/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          message: 'Hello from Business OS!',
          contactId,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button 
      onClick={handleSend}
      disabled={isSending}
      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-[0.98] cursor-pointer
        ${status === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 
          status === 'error' ? 'bg-rose-600 hover:bg-rose-500 text-white' : 
          'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 border border-emerald-500/30'}
      `}
    >
      {isSending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <MessageCircle size={14} />
      )}
      <span>
        {status === 'success' ? 'Message Dispatched!' : 
         status === 'error' ? 'Delivery Error' : 
         isSending ? 'Transmitting via Twilio...' : 'Auto-Follow Up (WhatsApp)'}
      </span>
    </button>
  );
}
