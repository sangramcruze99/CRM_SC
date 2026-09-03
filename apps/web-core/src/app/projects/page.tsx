import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { Plus, Clock, ClipboardList } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteActionButton } from "../../components/DeleteActionButton";
import { deleteTask } from "../actions";

export const dynamic = 'force-dynamic';

const demoProjects = [
  {
    id: 'proj_01',
    name: 'Main Workspace Sprint',
    tasks: []
  }
];

export default async function ProjectsPage() {
  const headers = await getTenantHeaders();
  const fetchedProjects = await safeFetch(
    "http://localhost:3017/projects",
    { headers, cache: 'no-store' },
    []
  );

  const projects = fetchedProjects.length > 0 ? fetchedProjects : demoProjects;
  const currentProject = projects[0] || demoProjects[0];

  async function createTask(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const projectId = formData.get("projectId") as string;
    if (!title || !projectId) return;

    const tenantHeaders = await getTenantHeaders();
    await safeFetch(`http://localhost:3017/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...tenantHeaders
      },
      body: JSON.stringify({ title, status: "TODO" })
    });
    
    revalidatePath("/projects");
  }

  async function updateTaskStatus(id: string, status: string) {
    "use server";
    const tenantHeaders = await getTenantHeaders();
    await safeFetch(`http://localhost:3017/projects/tasks/${id}/status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        ...tenantHeaders
      },
      body: JSON.stringify({ status })
    });
    revalidatePath("/projects");
  }

  const columns = [
    { id: "TODO", title: "To Do", bg: "bg-white/[0.06] text-slate-300 border-white/10" },
    { id: "IN_PROGRESS", title: "In Progress", bg: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
    { id: "REVIEW", title: "Review", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    { id: "DONE", title: "Done", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" }
  ];

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <ClipboardList size={24} className="text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">{currentProject.name}</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Manage project tasks, sprint cycles, and delivery milestones.</p>
        </div>
        <div className="flex items-center space-x-3">
          <form action={createTask} className="flex items-center space-x-2 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-1.5 pl-3.5 shadow-sm">
            <input type="hidden" name="projectId" value={currentProject.id} />
            <input 
              type="text" 
              name="title" 
              placeholder="Add new sprint task..." 
              required
              className="w-52 bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-medium"
            />
            <button type="submit" className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/25 flex items-center cursor-pointer">
              <Plus size={14} className="mr-1" /> Add Task
            </button>
          </form>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex space-x-6 overflow-x-auto pb-4">
        {columns.map(column => {
          const tasks = (currentProject.tasks || []).filter((t: any) => t.status === column.id);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${column.bg}`}>
                  {column.title}
                </span>
                <span className="bg-white/[0.08] text-slate-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-2xs">
                  {tasks.length}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col space-y-3 overflow-y-auto">
                {tasks.map((task: any) => (
                  <div key={task.id} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 hover:border-emerald-500/40 hover:bg-white/[0.07] transition-all shadow-xs group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === 'HIGH' || task.priority === 'URGENT' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                        task.priority === 'MEDIUM' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      }`}>
                        {task.priority || 'NORMAL'}
                      </span>
                      <DeleteActionButton
                        onDeleteAction={async () => {
                          'use server';
                          await deleteTask(task.id);
                        }}
                        size={12}
                        confirmTitle={`Delete sprint task "${task.title}"?`}
                      />
                    </div>
                    
                    <h4 className="text-xs font-bold text-white mb-3 leading-relaxed">{task.title}</h4>
                    
                    <div className="flex items-center justify-between text-slate-400 text-xs pt-2.5 border-t border-white/[0.06]">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} className="text-slate-500" />
                        <span className="text-[11px] font-medium text-slate-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        {columns.map(c => c.id !== column.id && (
                          <form key={c.id} action={async () => {
                            "use server";
                            await updateTaskStatus(task.id, c.id);
                          }}>
                            <button type="submit" className="text-[10px] font-bold bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 text-slate-300 px-2 py-1 rounded-lg border border-white/[0.1] transition-colors cursor-pointer">
                              → {c.title}
                            </button>
                          </form>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="border border-dashed border-white/10 rounded-2xl p-4 text-center text-xs font-medium text-slate-500 flex items-center justify-center min-h-[100px]">
                    No tasks in this lane
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
