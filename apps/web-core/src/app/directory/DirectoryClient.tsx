'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Network,
  DollarSign,
  Plus,
  CheckCircle2,
  Sparkles,
  Building,
  ShieldCheck,
  Zap,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useIndustry } from '@/components/industry/IndustryContext';
import { EmployeeNode, INITIAL_NICHE_EMPLOYEES } from '@/lib/hrData';
import { OrgHierarchyTree } from '@/components/hr/OrgHierarchyTree';
import { SalaryPayrollHub } from '@/components/hr/SalaryPayrollHub';
import { EmployeeRoster } from '@/components/hr/EmployeeRoster';
import { AddEmployeeModal } from '@/components/hr/AddEmployeeModal';
import { PayslipModal } from '@/components/hr/PayslipModal';

export function DirectoryClient() {
  const { currentNiche, nicheConfig } = useIndustry();
  const [activeTab, setActiveTab] = useState<'tree' | 'payroll' | 'roster'>('tree');
  const [employees, setEmployees] = useState<EmployeeNode[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeNode | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  // Sync employees whenever current niche changes
  useEffect(() => {
    try {
      const savedKey = `business_os_employees_${currentNiche}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEmployees(parsed);
          return;
        }
      }
      // Defaults to clean blank state
      setEmployees([]);
    } catch (e) {
      setEmployees([]);
    }
  }, [currentNiche]);

  const saveEmployees = (updatedList: EmployeeNode[]) => {
    setEmployees(updatedList);
    try {
      const savedKey = `business_os_employees_${currentNiche}`;
      localStorage.setItem(savedKey, JSON.stringify(updatedList));
    } catch (e) {
      // ignore
    }
  };

  const handleClearRoster = () => {
    if (confirm(`Are you sure you want to clear all team members for ${nicheConfig.name}?`)) {
      saveEmployees([]);
      setAlert(`✨ Cleared all team records for ${nicheConfig.name}. Workspace is clean!`);
      setTimeout(() => setAlert(null), 4000);
    }
  };

  const handleAddEmployee = (newEmp: EmployeeNode) => {
    const updated = [...employees, newEmp];
    saveEmployees(updated);
    setAlert(`🎉 Successfully added ${newEmp.firstName} ${newEmp.lastName} (${newEmp.jobTitle}) to ${nicheConfig.shortName} team!`);
    setTimeout(() => setAlert(null), 4000);
  };

  const handleReassignManager = (empId: string, newManagerId: string | null) => {
    const updated = employees.map((emp) =>
      emp.id === empId ? { ...emp, managerId: newManagerId } : emp
    );
    saveEmployees(updated);
    const emp = employees.find((e) => e.id === empId);
    const mgr = employees.find((e) => e.id === newManagerId);
    setAlert(
      `Updated reporting line: ${emp?.firstName} ${emp?.lastName} now reports to ${
        mgr ? `${mgr.firstName} ${mgr.lastName}` : 'Executive Board'
      }!`
    );
    setTimeout(() => setAlert(null), 4000);
  };

  const handleRunPayrollBatch = () => {
    if (employees.length === 0) {
      setAlert('No employees in roster to disburse payroll for. Please add team members first.');
      setTimeout(() => setAlert(null), 4000);
      return;
    }
    const updated = employees.map((emp) => ({
      ...emp,
      salary: { ...emp.salary, paymentStatus: 'PAID' as const, lastPayDate: new Date().toISOString().split('T')[0] },
    }));
    saveEmployees(updated);
    const totalNet = employees.reduce((acc, curr) => acc + curr.salary.netMonthly, 0);
    setAlert(
      `🎉 Monthly payroll batch of $${totalNet.toLocaleString()} processed! Disbursed to all ${employees.length} employees & recorded in Khata Ledger.`
    );
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenPayslip = (emp: EmployeeNode) => {
    setSelectedEmployee(emp);
    setIsPayslipOpen(true);
  };

  const handleRemoveEmployee = (empId: string) => {
    const targetEmp = employees.find((e) => e.id === empId);
    if (!targetEmp) return;

    // Safety: reassign any direct reports to the deleted employee's manager (or null)
    const fallbackManagerId = targetEmp.managerId;
    const updated = employees
      .filter((e) => e.id !== empId)
      .map((e) => (e.managerId === empId ? { ...e, managerId: fallbackManagerId } : e));

    saveEmployees(updated);
    if (selectedEmployee?.id === empId) {
      setSelectedEmployee(null);
      setIsPayslipOpen(false);
    }
    setAlert(`🗑️ Successfully removed ${targetEmp.firstName} ${targetEmp.lastName} (${targetEmp.jobTitle}) from roster.`);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="text-emerald-600 dark:text-emerald-400" size={24} />
            Employee Management, Salary & 4-Tier Org Tree
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Visual 4-Tier reporting hierarchy: [Tier A: Upper Mgmt] ➔ [Tier B: Middle Mgmt] ➔ [Tier C: Operations] & [Tier D: Support Staff].
          </p>
        </div>

        {/* Tab Switcher & Clean Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {employees.length > 0 && (
            <button
              type="button"
              onClick={handleClearRoster}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Clear all employee records"
            >
              <Trash2 size={13} />
              <span>Clear Roster</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('tree')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tree'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Network size={14} />
              <span>4-Tier Org Tree</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payroll')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'payroll'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <DollarSign size={14} />
              <span>Salary & Payroll</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>Staff Roster ({employees.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'tree' && (
        <OrgHierarchyTree
          employees={employees}
          onSelectEmployee={handleOpenPayslip}
          onReassignManager={handleReassignManager}
          onRemoveEmployee={handleRemoveEmployee}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}

      {activeTab === 'payroll' && (
        <SalaryPayrollHub
          employees={employees}
          onOpenPayslip={handleOpenPayslip}
          onRunPayrollBatch={handleRunPayrollBatch}
          onRemoveEmployee={handleRemoveEmployee}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}

      {activeTab === 'roster' && (
        <EmployeeRoster
          employees={employees}
          onSelectEmployee={handleOpenPayslip}
          onRemoveEmployee={handleRemoveEmployee}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={handleAddEmployee}
        existingEmployees={employees}
      />

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        employee={selectedEmployee}
        onRemoveEmployee={handleRemoveEmployee}
      />
    </div>
  );
}
