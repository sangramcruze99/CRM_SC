import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { DocumentsClient } from "./DocumentsClient";

export const dynamic = 'force-dynamic';

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ folderId?: string }>;
}) {
  const sp = await searchParams;
  const folderId = sp?.folderId || 'root';
  const headers = await getTenantHeaders();
  
  // Fetch folders in the current directory
  const initialFolders = await safeFetch(
    `http://localhost:3020/folders?parentId=${folderId}`,
    { cache: "no-store", headers },
    []
  );
  
  // Fetch documents in the current directory
  const initialDocuments = await safeFetch(
    `http://localhost:3020/documents?folderId=${folderId}`,
    { cache: "no-store", headers },
    []
  );
  
  // Fetch current folder metadata (if not root) for breadcrumbs
  let currentFolder = null;
  if (folderId !== 'root') {
    currentFolder = await safeFetch(
      `http://localhost:3020/folders/${folderId}`,
      { cache: "no-store", headers },
      null
    );
  }

  return (
    <DocumentsClient 
      initialFolders={initialFolders}
      initialDocuments={initialDocuments}
      currentFolder={currentFolder}
      currentFolderId={folderId}
    />
  );
}
