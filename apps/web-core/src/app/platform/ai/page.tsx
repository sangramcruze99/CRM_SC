import { getTenantHeaders, safeFetch } from "../../../lib/auth";
import { Brain, Bot, FileText, Database } from "lucide-react";
import { CreatePromptModal } from "../../../components/platform/ai/CreatePromptModal";
import { CreateKnowledgeModal } from "../../../components/platform/ai/CreateKnowledgeModal";

export const dynamic = 'force-dynamic';

const demoPrompts = [
  { id: 'p_01', name: 'Executive Meeting Summary Generator', prompt: 'Summarize the client discussion, identify key action items, and estimate deal closure timeline.', model: 'gpt-4o' },
  { id: 'p_02', name: 'Cold Lead Outbound Email Drafter', prompt: 'Draft a personalized enterprise B2B sales email referencing recent company milestones.', model: 'claude-3-5-sonnet' },
  { id: 'p_03', name: 'SLA Escalation Root Cause Analyzer', prompt: 'Analyze support ticket thread and suggest immediate remediation steps.', model: 'gpt-4o' },
];

const demoKnowledge = [
  { id: 'kb_01', title: 'Business OS Enterprise Architecture & Multi-Tenant Whitepaper.pdf', status: 'EMBEDDED' },
  { id: 'kb_02', title: 'Sales Playbook & Enterprise Negotiation Guidelines 2026.docx', status: 'EMBEDDED' },
  { id: 'kb_03', title: 'SOC 2 Type II Security Policies & Encryption Controls.pdf', status: 'EMBEDDED' },
];

export default async function AIEnginePage() {
  const headers = await getTenantHeaders();
  const [promptsFetched, knowledgeFetched] = await Promise.all([
    safeFetch('http://localhost:3010/prompts', { headers, cache: 'no-store' }, []),
    safeFetch('http://localhost:3010/knowledge', { headers, cache: 'no-store' }, [])
  ]);

  const prompts = promptsFetched.length > 0 ? promptsFetched : demoPrompts;
  const knowledge = knowledgeFetched.length > 0 ? knowledgeFetched : demoKnowledge;

  return (
    <div className="h-full flex flex-col space-y-8 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Brain className="text-emerald-400" size={24} />
          AI Engine & Vector Knowledge Base
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure LLM prompt templates and vector retrieval embeddings for autonomous CRM workflows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* Prompts Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="text-emerald-400" size={18} />
              Prompt Templates
            </h2>
            <CreatePromptModal />
          </div>
          
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-white/[0.02] border-b border-white/[0.08] font-semibold">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Template Name</th>
                    <th className="px-6 py-4 font-semibold">Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {prompts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        <div className="text-xs text-slate-400 mt-1 line-clamp-1 font-mono">{p.prompt}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/30 shadow-2xs">
                          {p.model}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="text-emerald-400" size={18} />
              Vector Knowledge Base
            </h2>
            <CreateKnowledgeModal />
          </div>
          
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-white/[0.02] border-b border-white/[0.08] font-semibold">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Document Title</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {knowledge.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
                          <FileText size={15} className="text-emerald-400 flex-shrink-0" />
                          <span className="truncate max-w-xs">{doc.title}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full shadow-2xs">
                          Vector Indexed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
