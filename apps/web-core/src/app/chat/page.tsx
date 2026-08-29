import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { ChatClient } from "./ChatClient";

export const dynamic = 'force-dynamic';

const demoChannels = [
  {
    id: 'chan_01',
    name: 'general-enterprise',
    topic: 'Company-wide updates & coordination',
    messages: [
      { id: 'm1', content: 'Welcome to Business OS enterprise chat!', sender: 'Super Admin', createdAt: new Date().toISOString() },
      { id: 'm2', content: 'Q3 Product deployment completed successfully across all microservices.', sender: 'Alexander Wright', createdAt: new Date().toISOString() },
    ]
  },
  {
    id: 'chan_02',
    name: 'sales-opportunities',
    topic: 'Deal closing, pipeline updates, and proposals',
    messages: [
      { id: 'm3', content: 'Acme Corp just approved the $120k proposal!', sender: 'Sophia Martinez', createdAt: new Date().toISOString() },
    ]
  },
  {
    id: 'chan_03',
    name: 'engineering-alerts',
    topic: 'CI/CD status, uptime health, and logs',
    messages: [
      { id: 'm4', content: 'Full search index rebuilt with sub-5ms query latency.', sender: 'Search Engine', createdAt: new Date().toISOString() },
    ]
  }
];

export default async function ChatPage() {
  const headers = await getTenantHeaders();
  const fetchedChannels = await safeFetch(
    "http://localhost:3014/chat/channels",
    { headers, cache: 'no-store' },
    []
  );

  const channels = fetchedChannels.length > 0 ? fetchedChannels : demoChannels;
  const initialMessages = channels.length > 0 ? (channels[0].messages || []).slice().reverse() : [];

  return (
    <div className="h-full">
      <ChatClient channels={channels} initialMessages={initialMessages} />
    </div>
  );
}
