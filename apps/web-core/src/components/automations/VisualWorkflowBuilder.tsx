'use client';

import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Settings, Mail, FileText, Database } from 'lucide-react';

// Define custom node types
const nodeTypes = {
  triggerNode: ({ data }: { data: any }) => (
    <div className="bg-slate-900/95 border-2 border-amber-500 rounded-2xl shadow-xl p-3.5 w-48 flex items-center gap-3 text-white">
      <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
        <Play size={16} />
      </div>
      <div>
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Trigger</div>
        <div className="text-xs font-bold text-white">{data.label}</div>
      </div>
    </div>
  ),
  actionNode: ({ data }: { data: any }) => (
    <div className="bg-slate-900/95 border border-white/[0.15] rounded-2xl shadow-xl p-3.5 w-48 flex items-center gap-3 text-white">
      <div className="bg-white/[0.08] p-2 rounded-xl text-emerald-400">
        {data.icon || <Settings size={16} />}
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</div>
        <div className="text-xs font-bold text-white">{data.label}</div>
      </div>
    </div>
  ),
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'triggerNode',
    position: { x: 250, y: 100 },
    data: { label: 'On Record Created', type: 'ON_RECORD_CREATE' },
  },
];

const initialEdges: Edge[] = [];

export function VisualWorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const addActionNode = (type: string, label: string, icon: React.ReactNode) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'actionNode',
      position: { x: 250, y: nodes.length * 120 + 100 },
      data: { label, type, icon },
    };
    
    // Automatically connect from the last node
    const lastNode = nodes[nodes.length - 1];
    if (lastNode) {
      setEdges((eds) => addEdge({
        id: `e${lastNode.id}-${newNode.id}`,
        source: lastNode.id,
        target: newNode.id,
        markerEnd: { type: MarkerType.ArrowClosed }
      }, eds));
    }

    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto text-white space-y-6">
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 px-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div>
          <h1 className="text-xl font-bold text-white">Visual Workflow Builder</h1>
          <p className="text-xs text-slate-400">Design automation sequences</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer">
          Save Workflow
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Toolbox Sidebar */}
        <div className="w-64 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 flex flex-col gap-2.5 overflow-y-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Actions</h3>
          
          <button 
            onClick={() => addActionNode('SEND_EMAIL', 'Send Email', <Mail size={16} />)}
            className="flex items-center gap-3 w-full p-2.5 text-xs text-left bg-white/[0.02] border border-white/[0.08] rounded-2xl hover:border-emerald-500/40 hover:bg-white/[0.05] text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <Mail size={16} className="text-emerald-400" /> Send Email
          </button>
          
          <button 
            onClick={() => addActionNode('CREATE_RECORD', 'Create Record', <Database size={16} />)}
            className="flex items-center gap-3 w-full p-2.5 text-xs text-left bg-white/[0.02] border border-white/[0.08] rounded-2xl hover:border-emerald-500/40 hover:bg-white/[0.05] text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <Database size={16} className="text-emerald-400" /> Create Record
          </button>

          <button 
            onClick={() => addActionNode('GENERATE_PDF', 'Generate PDF', <FileText size={16} />)}
            className="flex items-center gap-3 w-full p-2.5 text-xs text-left bg-white/[0.02] border border-white/[0.08] rounded-2xl hover:border-emerald-500/40 hover:bg-white/[0.05] text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <FileText size={16} className="text-emerald-400" /> Generate PDF
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/[0.08] bg-slate-950/60">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
          >
            <Controls />
            <MiniMap />
            <Background gap={16} size={1} color="rgba(255, 255, 255, 0.1)" />
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 overflow-y-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <h2 className="text-base font-bold text-white mb-6">Properties</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Node Name</label>
                <input 
                  type="text" 
                  value={selectedNode.data.label as string}
                  onChange={(e) => {
                    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n));
                  }}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              {selectedNode.data.type === 'SEND_EMAIL' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient</label>
                    <input type="text" placeholder="{{record.email}}" className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                    <input type="text" placeholder="Welcome {{record.name}}" className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none" />
                  </div>
                </>
              )}

              {selectedNode.type === 'triggerNode' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Object</label>
                  <select className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none">
                    <option className="bg-slate-900 text-white">Select an object...</option>
                    <option className="bg-slate-900 text-white">Contact</option>
                    <option className="bg-slate-900 text-white">Deal</option>
                  </select>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => {
                setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                setSelectedNodeId(null);
              }}
              className="mt-8 w-full py-2 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl hover:bg-rose-500/25 transition-colors text-xs font-bold cursor-pointer"
            >
              Delete Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
