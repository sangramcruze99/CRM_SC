"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Hash, User as UserIcon, MessageSquare } from "lucide-react";

export function ChatClient({ channels, initialMessages }: { channels: any[], initialMessages: any[] }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [input, setInput] = useState("");
  const activeChannel = channels[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = { id: "user-1", firstName: "Admin", lastName: "User" };

  useEffect(() => {
    const newSocket = io("/api/chat");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      if (activeChannel) {
        newSocket.emit("joinChannel", { channelId: activeChannel.id });
      }
    });

    newSocket.on("newMessage", (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !activeChannel) return;

    socket.emit("sendMessage", {
      channelId: activeChannel.id,
      userId: currentUser.id,
      content: input,
    });

    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-white/[0.02] border-r border-white/[0.08] flex flex-col">
        <div className="p-4 border-b border-white/[0.08] flex items-center space-x-2">
          <MessageSquare size={18} className="text-amber-400" />
          <h2 className="text-white font-bold text-sm tracking-tight">Channels & Chat</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Workspaces</div>
          {channels.map((ch) => (
            <button
              key={ch.id}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeChannel?.id === ch.id ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-2xs font-bold" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Hash size={14} className="opacity-70" />
              <span>{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Chat Header */}
        <div className="h-14 border-b border-white/[0.08] flex items-center px-6 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Hash size={16} className="text-amber-400" />
            <span>{activeChannel?.name || "General Team Sync"}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-12 text-xs font-medium">No messages yet in this channel. Send the first ping!</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="flex space-x-3.5">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shadow-2xs">
                    {msg.user?.firstName?.[0] || <UserIcon size={16} />}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">
                      {msg.user?.firstName ? `${msg.user.firstName} ${msg.user.lastName}` : 'System Copilot'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              className="absolute right-1.5 p-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 rounded-lg transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
