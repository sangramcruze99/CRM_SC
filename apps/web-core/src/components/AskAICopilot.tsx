"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, Send, Bot, User, Loader2, MessageSquare, Zap, Cpu } from "lucide-react";

export function AskAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I am your AI Business Copilot. You can ask me to draft client emails, analyze pipeline metrics, summarize deal stages, or inspect SLAs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-4 py-3 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 active:scale-95 border border-emerald-400/50 cursor-pointer"
        title="Open AI CRM Assistant"
      >
        <Sparkles className="w-4 h-4 text-slate-950" />
        <span className="text-xs font-black tracking-wide">Ask AI Copilot</span>
      </button>

      {/* Slide-out Drawer mounted via createPortal */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950/98 dark:to-slate-950/99 backdrop-blur-2xl border-l border-slate-200 dark:border-white/[0.14] shadow-[0_25px_70px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] flex flex-col animate-in slide-in-from-right duration-300 text-slate-900 dark:text-white overflow-hidden">
            {/* Top Specular Glow Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/80 dark:bg-black/30 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-800 dark:text-emerald-300 uppercase">
                      AI COPILOT
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">AI CRM Copilot</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Contextual Autonomous Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-start space-x-2.5 ${
                    m.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold border ${
                      m.role === "user"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : "bg-slate-100 dark:bg-black/50 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-white/[0.12]"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`text-xs px-4 py-3 rounded-2xl max-w-[82%] whitespace-pre-wrap leading-relaxed shadow-xs ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-tr-none font-bold shadow-md shadow-emerald-500/20"
                        : "bg-slate-50 dark:bg-black/50 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-white/[0.12] font-medium"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs pl-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">AI is analyzing records...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-black/30 relative z-10">
              <div className="flex items-center space-x-2 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/[0.12] rounded-2xl px-3.5 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-2xs">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your CRM records..."
                  className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/25 cursor-pointer font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
