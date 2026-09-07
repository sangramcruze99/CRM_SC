import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { DocumentsClient } from "./DocumentsClient";

export const dynamic = 'force-dynamic';

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    folderId?: string;
    service?: string;
    module?: string;
    category?: string;
    search?: string;
  }>;
}) {
  const sp = await searchParams;
  const folderId = sp?.folderId || 'root';
  const service = sp?.service || 'all';
  const moduleName = sp?.module || '';
  const category = sp?.category || 'all';
  const search = sp?.search || '';

  const headers = await getTenantHeaders();

  // Query folders and documents with service-aware filters
  const folderQueryParams = new URLSearchParams();
  if (folderId) folderQueryParams.set('parentId', folderId);
  if (service && service !== 'all') folderQueryParams.set('service', service);

  const docQueryParams = new URLSearchParams();
  if (folderId) docQueryParams.set('folderId', folderId);
  if (service && service !== 'all') docQueryParams.set('service', service);
  if (moduleName) docQueryParams.set('module', moduleName);
  if (category && category !== 'all') docQueryParams.set('category', category);
  if (search) docQueryParams.set('search', search);

  const [initialFolders, initialDocuments, availableServices, currentFolder] = await Promise.all([
    safeFetch(
      `http://localhost:3020/folders?${folderQueryParams.toString()}`,
      { cache: 'no-store', headers },
      [],
    ),
    safeFetch(
      `http://localhost:3020/documents?${docQueryParams.toString()}`,
      { cache: 'no-store', headers },
      [],
    ),
    safeFetch(
      `http://localhost:3020/documents/services`,
      { cache: 'no-store', headers },
      [],
    ),
    folderId !== 'root'
      ? safeFetch(`http://localhost:3020/folders/${folderId}`, { cache: 'no-store', headers }, null)
      : Promise.resolve(null),
  ]);

  return (
    <DocumentsClient
      key={`${folderId}_${service}_${category}_${search}`}
      initialFolders={initialFolders}
      initialDocuments={initialDocuments}
      availableServices={availableServices}
      currentFolder={currentFolder}
      currentFolderId={folderId}
      initialService={service}
      initialCategory={category}
    />
  );
}
