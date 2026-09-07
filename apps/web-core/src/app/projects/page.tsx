import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { SprintKanbanBoard, ProjectItem } from "../../components/projects/SprintKanbanBoard";

export const dynamic = 'force-dynamic';

interface ProjectsPageProps {
  searchParams?: Promise<{ view?: string; agent?: string }> | { view?: string; agent?: string };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const initialView = resolvedParams?.view === 'list' ? 'list' : 'kanban';

  const headers = await getTenantHeaders();
  const fetchedProjects = await safeFetch<ProjectItem[]>(
    "http://localhost:3017/projects",
    { headers, cache: 'no-store' },
    []
  );

  const projects = Array.isArray(fetchedProjects) ? fetchedProjects : [];

  return <SprintKanbanBoard initialProjects={projects} initialView={initialView} />;
}
