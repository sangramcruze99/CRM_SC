"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Hash, User as UserIcon, MessageSquare, Radio, CheckCircle2, AlertCircle } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description?: string;
  messages?: any[];
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: "general", name: "general", description: "Company-wide announcements & general discussion" },
  { id: "sales-war-room", name: "sales-war-room", description: "High-value deals & pipeline velocity" },
  { id: "engineering", name: "engineering", description: "Platform releases, microservices & code sync" },
  { id: "ai-copilot", name: "ai-copilot", description: "Automations, LLM agent alerts & system notices" },
];

export function ChatClient({ channels, initialMessages }: { channels: Channel[], initialMessages: any[] }) {
  const effectiveChannels = Array.isArray(channels) && channels.length > 0 ? channels : DEFAULT_CHANNELS;
  const [activeChannelId, setActiveChannelId] = useState<string>(effectiveChannels[0]?.id || "general");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>(Array.isArray(initialMessages) ? initialMessages : []);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = effectiveChannels.find((ch) => ch.id === activeChannelId) || effectiveChannels[0];
  const currentUser = { id: "user-1", firstName: "Admin", lastName: "User" };

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL || "http://localhost:3014";
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      if (activeChannel) {
        newSocket.emit("joinChannel", { channelId: activeChannel.id });
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", () => {
      setIsConnected(false);
    });

    newSocket.on("newMessage", (message: any) => {
      if (!message) return;
      setMessages((prev) => {
        // Prevent duplicate messages if added optimistically
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Join newly selected channel when active channel switches
  useEffect(() => {
    if (socket && isConnected && activeChannel) {
      socket.emit("joinChannel", { channelId: activeChannel.id });
    }
  }, [activeChannelId, socket, isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !activeChannel) return;

    const messagePayload = {
      id: `msg_${Date.now()}`,
      channelId: activeChannel.id,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      user: currentUser,
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, messagePayload]);
    setInput("");

    if (socket && isConnected) {
      socket.emit("sendMessage", {
        channelId: activeChannel.id,
        userId: currentUser.id,
        content,
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-white/[0.02] border-r border-white/[0.08] flex flex-col">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare size={18} className="text-emerald-400" />
            <h2 className="text-white font-bold text-sm tracking-tight">Channels & Chat</h2>
          </div>
          <div
            title={isConnected ? "Connected to Chat Gateway (:3014)" : "Connecting / Local Mode (:3014)"}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span className={isConnected ? "text-emerald-400 font-semibold" : "text-amber-400 font-medium"}>
              {isConnected ? "Live :3014" : "Local Mode"}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Workspaces</div>
          {effectiveChannels.map((ch) => {
            const isActive = activeChannel?.id === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-2xs font-bold"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Hash size={14} className={isActive ? "text-emerald-400" : "opacity-70"} />
                <span className="truncate">{ch.name}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time Status Footer */}
        <div className="p-3 border-t border-white/[0.06] bg-black/20 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Engine: Socket.IO WS</span>
          <span className="font-mono text-emerald-400 font-semibold">Port 3014</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Chat Header */}
        <div className="h-14 border-b border-white/[0.08] flex items-center justify-between px-6 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Hash size={16} className="text-emerald-400" />
            <span>{activeChannel?.name || "general"}</span>
            {activeChannel?.description && (
              <span className="hidden md:inline-block text-xs font-normal text-slate-400 ml-2 border-l border-white/[0.1] pl-2">
                {activeChannel.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            {isConnected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 size={13} />
                <span>Synchronized</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400/80 font-medium">
                <AlertCircle size={13} />
                <span>Backend Standby</span>
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-16 text-xs font-medium">
              <Radio size={28} className="mx-auto mb-2 text-slate-600 animate-pulse" />
              <p>No messages yet in #{activeChannel?.name || "general"}.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Send a message to start collaboration!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className="flex space-x-3.5">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shadow-2xs">
                    {msg.user?.firstName?.[0] || <UserIcon size={16} />}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">
                      {msg.user?.firstName ? `${msg.user.firstName} ${msg.user.lastName}` : "System Copilot"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Just now"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 mt-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-xs px-3.5 py-2 inline-block font-medium">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message #${activeChannel?.name || "general"}...`}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-4 pr-12 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 p-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 rounded-lg transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
