import React from 'react';
import { Shield, Plus, Lock, Users } from 'lucide-react';

export default function RolesAndPermissionsPage() {
  const roles = [
    { id: '1', name: 'Super Admin', description: 'Full access to all modules and settings.', isSystem: true, users: 2 },
    { id: '2', name: 'Sales Manager', description: 'Can view all deals and reports, manage reps.', isSystem: false, users: 5 },
    { id: '3', name: 'Sales Rep', description: 'Can only view and edit their own deals.', isSystem: false, users: 15 },
  ];

  const objects = ['Deals', 'Contacts', 'Companies', 'CustomObject_Vehicles'];
  const actions = ['Create', 'Read', 'Update', 'Delete'];

  return (
    <div className="p-6 h-full flex flex-col max-w-7xl mx-auto text-white space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Shield className="text-amber-400" size={24} />
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage access control and define granular permissions.</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer">
          <Plus size={16} /> New Role
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Roles Sidebar */}
        <div className="col-span-12 lg:col-span-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Defined Roles</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05]">
            {roles.map((role, idx) => (
              <div 
                key={role.id} 
                className={`p-4 cursor-pointer transition-colors ${idx === 1 ? 'bg-amber-500/15 border-l-4 border-l-amber-500' : 'hover:bg-white/[0.04] border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold text-sm ${idx === 1 ? 'text-amber-300' : 'text-white'}`}>
                    {role.name}
                  </h3>
                  {role.isSystem && (
                    <Lock size={12} className="text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 mb-2">{role.description}</p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Users size={12} /> {role.users} Users
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="col-span-12 lg:col-span-8 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Sales Manager</h2>
                <p className="text-xs text-slate-400 mt-1">Configure object-level and field-level permissions for this role.</p>
              </div>
              <button className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-white/[0.1] transition-colors cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] sticky top-0 z-10 border-b border-white/[0.08] text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Module / Object</th>
                  {actions.map(action => (
                    <th key={action} className="px-6 py-4 text-center">{action}</th>
                  ))}
                  <th className="px-6 py-4">ABAC Conditions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {objects.map((obj) => (
                  <tr key={obj} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-4 font-bold text-white text-xs">{obj}</td>
                    {actions.map(action => (
                      <td key={`${obj}-${action}`} className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-400 cursor-pointer"
                          defaultChecked={obj !== 'CustomObject_Vehicles' || action === 'Read'}
                        />
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <select className="w-full px-3 py-1.5 border border-white/[0.1] rounded-xl text-xs bg-white/[0.05] text-white focus:outline-none">
                        <option value="all" className="bg-slate-900 text-white">All Records</option>
                        <option value="owned" className="bg-slate-900 text-white">{`Owned Only (where ownerId = {{ userId }})`}</option>
                        <option value="team" className="bg-slate-900 text-white">Team Only</option>
                        <option value="custom" className="bg-slate-900 text-white">Custom Condition...</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
