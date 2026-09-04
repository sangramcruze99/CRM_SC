'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, MailIcon, PhoneIcon, StickyNoteIcon } from "lucide-react";

type Activity = {
  id: string;
  type: 'NOTE' | 'EMAIL' | 'CALL' | 'MEETING' | 'SYSTEM';
  title?: string;
  content: string;
  createdAt: string;
};

const initialDemoActivities: Activity[] = [
  { id: 'act_1', type: 'MEETING', content: 'Enterprise discovery workshop conducted with senior engineering leadership.', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'act_2', type: 'CALL', content: 'Discussed annual seat licensing tiers and security compliance questionnaire.', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'act_3', type: 'EMAIL', content: 'Sent formalized MSA contract and SOC2 type II audit attestation package.', createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
];

export function ActivityTimeline({ entityType, entityId }: { entityType: 'contact' | 'deal' | 'company', entityId: string }) {
  const [activities, setActivities] = useState<Activity[]>(initialDemoActivities);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [entityId]);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/crm/activities?${entityType}Id=${entityId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setActivities(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch activities', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const localNote: Activity = {
      id: `act_${Date.now()}`,
      type: 'NOTE',
      content: newNote,
      createdAt: new Date().toISOString()
    };
    setActivities([localNote, ...activities]);
    setNewNote('');

    try {
      await fetch(`/api/crm/activities`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'NOTE',
          content: newNote,
          [`${entityType}Id`]: entityId
        })
      });
    } catch (e) {
      console.error('Failed to add note', e);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'EMAIL': return <MailIcon className="w-3.5 h-3.5 text-sky-400" />;
      case 'CALL': return <PhoneIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'MEETING': return <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />;
      default: return <StickyNoteIcon className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-5 text-slate-900 dark:text-white">
      <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-4 shadow-sm">
        <div className="space-y-3">
          <textarea 
            placeholder="Log an interaction note or action item..." 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 min-h-[80px] font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <div className="flex justify-end space-x-2">
            <button type="button" className="px-3 py-1.5 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors shadow-2xs cursor-pointer">Log Call</button>
            <button type="button" className="px-3 py-1.5 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors shadow-2xs cursor-pointer">Log Email</button>
            <button type="button" onClick={handleAddNote} className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 cursor-pointer">Save Note</button>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {loading ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4 font-medium">Loading timeline events...</p>
        ) : activities.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6 font-medium">No activity yet. Add a note to get started!</p>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-xs hover:border-emerald-500/40 transition-colors">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/[0.08] flex flex-row items-center space-x-3 bg-slate-50/60 dark:bg-white/[0.02]">
                <div className="p-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{activity.type}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">{activity.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
