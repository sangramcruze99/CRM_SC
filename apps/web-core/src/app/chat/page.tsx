import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { ChatClient } from "./ChatClient";

export const dynamic = 'force-dynamic';

const demoChannels: any[] = [];

export default async function ChatPage() {
  const headers = await getTenantHeaders();
  const fetchedChannels = await safeFetch(
    "http://localhost:3014/chat/channels",
    { headers, cache: 'no-store' },
    []
  );

  const channels: any[] = fetchedChannels || [];
  const initialMessages = channels.length > 0 && channels[0]?.messages ? channels[0].messages.slice().reverse() : [];

  return (
    <div className="h-full">
      <ChatClient channels={channels} initialMessages={initialMessages} />
    </div>
  );
}
