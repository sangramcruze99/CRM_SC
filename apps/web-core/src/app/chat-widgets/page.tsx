import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { ChatWidgetsClient } from './ChatWidgetsClient';

export const dynamic = 'force-dynamic';

export default async function ChatWidgetsPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3016/chat-widgets',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <ChatWidgetsClient initialWidgets={items} />;
}
