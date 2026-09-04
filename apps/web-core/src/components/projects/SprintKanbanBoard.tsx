'use client';

import React, { useState, useTransition } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  GripVertical,
  Sparkles,
  LayoutGrid,
  List,
  Trash2,
  Layers,
  Flame,
  Check,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { createSprintTask, updateSprintTaskStatus, deleteSprintTask, seedDemoSprintTasks } from '../../app/actions';
import { useRouter } from 'next/navigation';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | string;
  priority?: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt?: string | Date;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  tasks: TaskItem[];
}

interface SprintKanbanBoardProps {
  initialProjects: ProjectItem[];
}

const COLUMNS = [
  {
    id: 'TODO',
    title: 'To Do',
    subtitle: 'Backlog & Scoped',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    accentDot: 'bg-slate-400',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    subtitle: 'Active Engineering',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    accentDot: 'bg-teal-400',
  },
  {
    id: 'REVIEW',
    title: 'Review & QA',
    subtitle: 'Audit & Staging',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
    accentDot: 'bg-emerald-300',
  },
  {
    id: 'DONE',
    title: 'Done & Shipped',
    subtitle: 'Production Verified',
    badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50',
    accentDot: 'bg-emerald-400 animate-pulse',
  },
];

export function SprintKanbanBoard({ initialProjects }: SprintKanbanBoardProps) {
  const [projects] = useState<ProjectItem[]>(initialProjects);
  const [selectedProjectId] = useState<string>(initialProjects[0]?.id || 'proj_01');
  const [tasks, setTasks] = useState<TaskItem[]>(initialProjects[0]?.tasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || { id: 'proj_01', name: 'Main Workspace Sprint', tasks: [] };

  // Filter tasks based on search
  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(query) || (t.priority || '').toLowerCase().includes(query);
  });

  // Calculate sprint completion velocity
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'REVIEW').length;
  const velocityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handle Drag & Drop Drop Event
  const handleTaskDrop = async (taskId: string, newStatus: string) => {
    setDragOverColumn(null);
    setDraggedTaskId(null);

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const previousStatus = task.status;

    // 1. Instant Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    setAlert({
      message: `✨ Task "${task.title}" shifted to "${COLUMNS.find((c) => c.id === newStatus)?.title || newStatus}"`,
      type: 'success',
    });
    setTimeout(() => setAlert(null), 3000);

    // 2. Persist to Backend Microservice
    startTransition(async () => {
      try {
        await updateSprintTaskStatus(taskId, newStatus);
      } catch (err) {
        console.error('Failed to update task status:', err);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
        );
        setAlert({
          message: 'Failed to update sprint task status. Reverted.',
          type: 'info',
        });
      }
    });
  };

  // Create new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const tempTask: TaskItem = {
      id: `tsk_${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'TODO',
      priority: newTaskPriority,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [tempTask, ...prev]);
    const titleToSubmit = newTaskTitle.trim();
    const priorityToSubmit = newTaskPriority;
    setNewTaskTitle('');

    startTransition(async () => {
      try {
        await createSprintTask(currentProject.id, titleToSubmit, priorityToSubmit);
      } catch (err) {
        console.error('Failed to create sprint task:', err);
      }
    });
  };

  // Seed sample sprint tasks
  const handleSeedTasks = () => {
    startTransition(async () => {
      setAlert({
        message: '⚡ Seeding sprint engineering tasks into Projects microservice...',
        type: 'info',
      });
      await seedDemoSprintTasks(currentProject.id);
      router.refresh();
      setTimeout(() => {
        setAlert({
          message: '✅ Populated sprint pipeline with live engineering milestones!',
          type: 'success',
        });
        setTimeout(() => setAlert(null), 3000);
      }, 800);
    });
  };

  const handleDeleteTask = (id: string, title: string) => {
    if (!confirm(`Delete sprint task "${title}"?`)) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      await deleteSprintTask(id);
    });
  };

  return (
    <div className="w-full h-full flex flex-col space-y-3.5 text-slate-900 dark:text-white">
      {/* Toast Alert Banner */}
      {alert && (
        <div className="p-2.5 px-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. COMPACT EXECUTIVE SPRINT COMMAND STRIP (One Line)      */}
      {/* ========================================================= */}
      <div className="botanical-glass-card p-3 px-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3.5 shrink-0">
        {/* Title & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 border border-emerald-300/30">
            <ClipboardList size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{currentProject.name}</h1>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Sprint Cycle Q3
            </span>
          </div>
        </div>

        {/* Inline Compact Telemetry Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1 botanical-glass-inset rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Tasks</span>
            <span className="font-mono font-black text-slate-900 dark:text-white">{totalTasks}</span>
          </div>

          <div className="px-3 py-1 botanical-glass-inset rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-mono">In Progress</span>
            <span className="font-mono font-black text-teal-700 dark:text-teal-300">{inProgressTasks}</span>
          </div>

          <div className="px-3 py-1 botanical-glass-inset rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono">In Review</span>
            <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">{inReviewTasks}</span>
          </div>

          <div className="px-3 py-1 botanical-glass-inset rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Velocity</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{velocityRate}% Shipped</span>
          </div>
        </div>

        {/* Fast Task Creator, Search & Actions */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-end flex-wrap">
          {/* Quick Search */}
          <div className="relative w-36 sm:w-44">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-full pl-8 pr-3 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Quick Task Input Form */}
          <form onSubmit={handleCreateTask} className="flex items-center gap-1.5">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="+ Quick task title..."
              className="w-40 sm:w-48 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="text-[10px] font-bold bg-slate-50 dark:bg-[#0c1411] text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="MEDIUM">Med</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <button
              type="submit"
              disabled={!newTaskTitle.trim() || isPending}
              className="px-3 py-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </form>

          {tasks.length === 0 && (
            <button
              onClick={handleSeedTasks}
              disabled={isPending}
              className="px-3 py-1 botanical-pill hover:border-emerald-500/50 text-xs font-bold text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Seed 8 Sprint Tasks"
            >
              <Sparkles size={13} className="text-emerald-400" />
              <span>Seed</span>
            </button>
          )}

          {/* Kanban / List Toggle */}
          <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-full border border-white/10">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'botanical-pill-active text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'list' ? 'botanical-pill-active text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Table List View"
            >
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TUCKED SINGLE-VIEWPORT 4-COLUMN KANBAN BOARD           */}
      {/* ========================================================= */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full flex-1 min-h-0 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isTargetOver = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumn !== col.id) {
                    setDragOverColumn(col.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverColumn(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                  if (taskId) {
                    handleTaskDrop(taskId, col.id);
                  }
                }}
                className={`flex flex-col rounded-2xl transition-all duration-200 min-w-0 w-full ${
                  isTargetOver
                    ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.08] shadow-[0_0_24px_rgba(16,185,129,0.25)]'
                    : ''
                }`}
              >
                {/* Column Stage Header */}
                <div className="botanical-glass-card p-2.5 mb-2 border-b border-slate-200 dark:border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${col.accentDot}`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate" title={col.title}>
                        {col.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/[0.08] text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-white/10 shrink-0">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{col.subtitle}</span>
                    <span className="text-emerald-600 dark:text-emerald-400/80">Stage {COLUMNS.findIndex((c) => c.id === col.id) + 1}/4</span>
                  </div>
                </div>

                {/* Drop Container with Independent Smooth Scrollbar */}
                <div
                  className={`flex-1 flex flex-col gap-2.5 p-2 rounded-2xl h-[calc(100vh-215px)] min-h-[420px] max-h-[calc(100vh-215px)] overflow-y-auto transition-all duration-200 scrollbar-thin ${
                    isTargetOver
                      ? 'border-2 border-dashed border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'botanical-glass-inset border border-slate-200 dark:border-white/[0.06]'
                  }`}
                >
                  {colTasks.map((task) => {
                    const isBeingDragged = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedTaskId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDragOverColumn(null);
                        }}
                        className={`group relative botanical-glass-card p-3 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.08] ${
                          isBeingDragged
                            ? 'opacity-40 scale-95 border-emerald-400 ring-2 ring-emerald-400/50 rotate-1'
                            : 'border-slate-200 dark:border-white/10 shadow-sm dark:shadow-md dark:shadow-black/30'
                        }`}
                      >
                        {/* Priority Badge & Actions */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 pr-1">
                            <GripVertical size={12} className="opacity-50 group-hover:opacity-100 text-slate-400 shrink-0" />
                            <span
                              className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                                task.priority === 'URGENT'
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                                  : task.priority === 'HIGH'
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {task.priority || 'NORMAL'}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id, task.title);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-opacity cursor-pointer shrink-0"
                            title="Delete Task"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug mb-2">
                          {task.title}
                        </h4>

                        {/* Card Bottom: Date & Stage Selector */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.08] text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-slate-400" />
                            <span>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Today'}</span>
                          </div>

                          <select
                            value={task.status}
                            onChange={(e) => handleTaskDrop(task.id, e.target.value)}
                            className="text-[9px] font-bold bg-slate-50 dark:bg-[#0c1411] text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                → {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty State / Drop Target Hint */}
                  {colTasks.length === 0 && (
                    <div
                      className={`flex-1 border border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                        isTargetOver
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <Layers size={18} className="mb-1.5 opacity-40" />
                      <span className="text-[11px] font-semibold block">
                        {isTargetOver ? 'Drop task here' : 'No tasks'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TABLE / LIST ALTERNATIVE VIEW                          */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="botanical-glass-card overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Task Description</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Status / Lane</th>
                  <th className="py-2.5 px-4 text-right">Created</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{task.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {task.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskDrop(task.id, e.target.value)}
                        className="text-xs font-bold bg-slate-50 dark:bg-[#0c1411] text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
