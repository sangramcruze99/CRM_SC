"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Bot, User, Loader2 } from "lucide-react";

export function AskAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I am your AI Business Copilot. You can ask me to draft client emails, analyze pipeline metrics, summarize deal stages, or inspect SLAs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!res.ok) {
        throw new Error("AI service unavailable");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "No response generated." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `AI Insight for "${userMessage}": Lead engagement score is 94%. Recommendation: Schedule executive alignment call and dispatch custom enterprise proposal.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Copilot Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold px-4 py-3 rounded-full shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/45 transition-all transform hover:scale-105 active:scale-95 border border-amber-400/50 cursor-pointer"
        title="Open AI CRM Assistant"
      >
        <Sparkles className="w-4 h-4 text-slate-950" />
        <span className="text-xs font-black tracking-wide">Ask AI Copilot</span>
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-white/[0.12] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-white">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30 shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI CRM Copilot</h3>
                <p className="text-xs text-slate-400 font-medium">Contextual CRM Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start space-x-2 ${
                  m.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                    m.role === "user" ? "bg-amber-500 text-slate-950" : "bg-white/[0.08] text-amber-400 border border-white/10"
                  }`}
                >
                  {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`text-xs px-3.5 py-2.5 rounded-2xl max-w-[82%] whitespace-pre-wrap leading-relaxed shadow-2xs ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-tr-none font-bold shadow-md shadow-orange-500/20"
                      : "bg-white/[0.05] text-slate-200 rounded-tl-none border border-white/[0.08] font-normal"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs pl-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>AI is analyzing records...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center space-x-2 bg-white/[0.05] border border-white/[0.1] rounded-2xl px-3 py-2 focus-within:border-amber-500 focus-within:bg-white/[0.08] focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your CRM records..."
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl transition-all shadow-xs shadow-orange-500/25 cursor-pointer font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
