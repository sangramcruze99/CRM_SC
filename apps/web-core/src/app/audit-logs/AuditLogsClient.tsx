"use client";

import { useState } from "react";
import { Search, Shield, Activity, User, Globe, Download, Database } from "lucide-react";

export function AuditLogsClient({ initialLogs }: { initialLogs: any[] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [filterAction, setFilterAction] = useState("");

  const filteredLogs = filterAction 
    ? logs.filter(log => log.action.toLowerCase().includes(filterAction.toLowerCase()))
    : logs;

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'text-rose-300 bg-rose-500/15 border-rose-500/30';
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30';
    if (action.includes('LOGIN') || action.includes('AUTH')) return 'text-amber-300 bg-amber-500/15 border-amber-500/30';
    return 'text-amber-300 bg-amber-500/15 border-amber-500/30';
  };

  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'auth': return <Shield size={14} className="text-amber-400" />;
      case 'user': return <User size={14} className="text-amber-400" />;
      case 'webhook': return <Globe size={14} className="text-amber-400" />;
      default: return <Database size={14} className="text-amber-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Activity size={24} className="text-amber-400" />
            <span>System Audit Trail & Security Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Immutable cryptographic log of all critical workspace mutations, logins, and API access events.
          </p>
        </div>
        <button className="flex items-center space-x-2 px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer">
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by action (e.g. LOGIN)..." 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] transition-all font-medium shadow-xs"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex-1 flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 text-xs uppercase tracking-wider font-semibold sticky top-0">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Event Action</th>
                <th className="px-6 py-4">Entity Type</th>
                <th className="px-6 py-4">Entity ID</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">IP / Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-300">
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs font-medium">
                    No audit logs found matching criteria.
                  </td>
                </tr>
              )}
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center space-x-2 text-white text-xs font-semibold">
                      {getEntityIcon(log.entityType)}
                      <span>{log.entityType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-400">
                    {log.entityId || '-'}
                  </td>
                  <td className="px-6 py-3.5">
                    {log.userId ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                          <User size={10} className="text-amber-400" />
                        </div>
                        <span className="font-mono text-xs text-slate-300 font-semibold">{log.userId}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-mono text-xs font-semibold">SYSTEM</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">
                    192.168.1.1
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
