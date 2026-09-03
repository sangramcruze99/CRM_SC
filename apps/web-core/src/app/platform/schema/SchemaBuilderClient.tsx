"use client";

import { useState } from "react";
import { Database, Plus, Key, Type, Hash, Calendar, CheckSquare, Link as LinkIcon, DatabaseZap } from "lucide-react";
import { useRouter } from "next/navigation";
import { SchemaBuilder, SchemaDefinition } from "@/components/low-code/SchemaBuilder";

export function SchemaBuilderClient({ initialObjects }: { initialObjects: any[] }) {
  const [objects, setObjects] = useState<SchemaDefinition[]>(initialObjects);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(initialObjects[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const selectedObject = objects.find(o => o.id === selectedObjectId);

  const handleSaveSchema = async (schema: SchemaDefinition) => {
    const res = await fetch('/api/custom-objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schema)
    });
    
    if (res.ok) {
      const saved = await res.json();
      setObjects([...objects, saved]);
      setSelectedObjectId(saved.id);
      setIsCreating(false);
      router.refresh();
    } else {
      throw new Error("Failed to save");
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <Type size={14} className="text-blue-400" />;
      case 'NUMBER': return <Hash size={14} className="text-emerald-400" />;
      case 'DATE': return <Calendar size={14} className="text-emerald-400" />;
      case 'BOOLEAN': return <CheckSquare size={14} className="text-purple-400" />;
      case 'RELATION': return <LinkIcon size={14} className="text-rose-400" />;
      default: return <Type size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex h-full border border-white/[0.08] rounded-3xl overflow-hidden bg-white/[0.04] backdrop-blur-2xl text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      {/* Sidebar: Objects List */}
      <div className="w-64 border-r border-white/[0.08] bg-white/[0.02] flex flex-col">
        <div className="p-4 border-b border-white/[0.08] flex justify-between items-center bg-transparent">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Database size={16} className="text-emerald-400" />
            <span>Objects</span>
          </h2>
          <button 
            onClick={() => {
              setIsCreating(true);
              setSelectedObjectId(null);
            }}
            className="p-1 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {objects.map(obj => (
            <button
              key={obj.id}
              onClick={() => {
                setSelectedObjectId(obj.id!);
                setIsCreating(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                selectedObjectId === obj.id 
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-2xs font-bold' 
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DatabaseZap size={14} className={selectedObjectId === obj.id ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{obj.name}</span>
              </div>
              <span className="text-xs bg-white/[0.08] border border-white/10 px-1.5 py-0.5 rounded text-slate-300">{obj.fields?.length || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Schema Editor */}
      <div className="flex-1 flex flex-col bg-transparent overflow-y-auto p-6">
        {isCreating ? (
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-white/[0.08] pb-4">
              <h1 className="text-2xl font-bold text-white">Create New Object</h1>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-sm text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <SchemaBuilder onSave={handleSaveSchema} availableObjects={objects} />
          </div>
        ) : selectedObject ? (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedObject.name}</h2>
                <p className="text-sm text-slate-400 mt-1">API Identifier: <code className="text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded text-xs border border-emerald-500/30">{selectedObject.apiName}</code></p>
                <p className="text-sm text-slate-300 mt-2">{selectedObject.description}</p>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex justify-between items-center">
                <h3 className="font-semibold text-white">Fields ({selectedObject.fields?.length || 0})</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Field Name</th>
                    <th className="px-4 py-3 font-medium">API Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  <tr className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200 flex items-center space-x-2">
                      <Key size={14} className="text-emerald-400" />
                      <span>ID</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">id</td>
                    <td className="px-4 py-3 text-slate-300">
                      <span className="flex items-center space-x-1">
                        <Hash size={14} className="text-slate-500" />
                        <span>UUID</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">System</td>
                  </tr>
                  
                  {selectedObject.fields?.map((field: any) => (
                    <tr key={field.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{field.name}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{field.apiName}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="flex items-center space-x-2 bg-white/[0.06] border border-white/10 px-2 py-1 rounded w-fit text-xs">
                          {getFieldIcon(field.fieldType)}
                          <span>{field.fieldType}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {field.isRequired ? (
                          <span className="text-xs bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">Yes</span>
                        ) : (
                          <span className="text-xs text-slate-500">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col space-y-4">
            <DatabaseZap size={48} className="text-slate-600" />
            <p>Select an object from the sidebar to view its schema.</p>
          </div>
        )}
      </div>
    </div>
  );
}
