import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { SprintKanbanBoard, ProjectItem } from "../../components/projects/SprintKanbanBoard";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const headers = await getTenantHeaders();
  const fetchedProjects = await safeFetch<ProjectItem[]>(
    "http://localhost:3017/projects",
    { headers, cache: 'no-store' },
    []
  );

  const projects = Array.isArray(fetchedProjects) ? fetchedProjects : [];

  return <SprintKanbanBoard initialProjects={projects} />;
}
