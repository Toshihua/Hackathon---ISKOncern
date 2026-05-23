import React, { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  Search, 
  Send, 
  ShieldAlert, 
  ArrowLeft,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Incident, ChatMessage } from "../types";

interface ChatDeskProps {
  initialAccessCode?: string;
  onLeaveChat: () => void;
}

export default function ChatDesk({ initialAccessCode = "", onLeaveChat }: ChatDeskProps) {
  const [accessCodeInput, setAccessCodeInput] = useState(initialAccessCode);
  const [activeTicket, setActiveTicket] = useState<Incident | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Auto search if initialAccessCode was already supplied
  useEffect(() => {
    if (initialAccessCode) {
      handleSearchTicket(initialAccessCode);
    }
  }, [initialAccessCode]);

  // Connect to WS once active ticket is set
  useEffect(() => {
    if (!activeTicket) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/chat-ws`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      // Send join event
      socket.send(JSON.stringify({
        type: "join",
        incidentId: activeTicket.id,
        role: "STAKEHOLDER",
        accessCode: activeTicket.chatAccessCode
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "joined") {
          setMessages(data.messages);
        } else if (data.type === "message") {
          if (data.message.incidentId === activeTicket.id) {
            setMessages((prev) => {
              if (prev.some(m => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          }
        } else if (data.type === "error") {
          setSearchError(data.message);
        }
      } catch (err) {
        console.error("Error parsing WS packet:", err);
      }
    };

    socket.onclose = () => {
      console.log("Stakeholder socket closed");
    };

    return () => {
      socket.close();
    };
  }, [activeTicket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearchTicket = async (codeToSearch: string) => {
    const targetCode = codeToSearch.trim();
    if (!targetCode) {
      setSearchError("Please insert a valid Chat Access Code or Reference ID.");
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const response = await fetch(`/api/incidents/${targetCode}`);
      if (!response.ok) {
        throw new Error("Target concern report not found");
      }

      const data: Incident = await response.json();
      setActiveTicket(data);
    } catch (err) {
      setSearchError("Unable to find a concern record linked to this code. Double-check your access token.");
    } finally {
      setSearching(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeTicket || !wsRef.current) return;

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "message",
        incidentId: activeTicket.id,
        sender: "STAKEHOLDER",
        text: newMessageText.trim(),
        accessCode: activeTicket.chatAccessCode
      }));
      setNewMessageText("");
    } else {
      // HTTP fallback
      postMessageFallback();
    }
  };

  const postMessageFallback = async () => {
    if (!activeTicket) return;
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: activeTicket.id,
          sender: "STAKEHOLDER",
          text: newMessageText.trim(),
          accessCode: activeTicket.chatAccessCode
        })
      });
      if (response.ok) {
        const addedMsg: ChatMessage = await response.json();
        setMessages(prev => [...prev, addedMsg]);
        setNewMessageText("");
      }
    } catch (err) {
      console.error("Fallback message dispatch failed:", err);
    }
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchTicket(accessCodeInput);
  };

  const handleSystemRefresh = async () => {
    if (!activeTicket) return;
    try {
      const response = await fetch(`/api/incidents/${activeTicket.id}`);
      if (response.ok) {
        const data: Incident = await response.json();
        setActiveTicket(data);
      }
    } catch (e) {
      console.error("Failed to query update:", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!activeTicket ? (
          /* Landing Input Form */
          <motion.div
            key="login-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-panel text-slate-200 rounded-2xl p-6 md:p-10 text-center max-w-xl mx-auto shadow-2xl"
          >
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white">
              Access Concern Desk
            </h2>
            <p className="text-slate-400 mt-2 text-xs md:text-sm leading-relaxed">
              If you have filed a concern ticket previously, enter either the <strong className="text-slate-200 font-bold">Ticket ID</strong> or the <strong className="text-slate-200 font-bold">Chat Access Code</strong> to enter your secure, completely anonymous chat lobby.
            </p>

            {searchError && (
              <div className="mt-5 p-4 bg-red-950/20 rounded-xl border border-red-900/30 text-rose-400 text-xs flex items-center gap-2.5 text-left">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <div>{searchError}</div>
              </div>
            )}

            <form onSubmit={handleManualSearchSubmit} className="mt-6 space-y-4 text-left">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ISK-102 or CHAT-FAC-774..."
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-100 placeholder-slate-550 text-sm font-semibold transition-all min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-brand-600/10 hover:shadow-brand-600/25 transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                {searching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Finding Concern...
                  </>
                ) : (
                  <>
                    Retrieve My Desk <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Active Chat Lobby */
          <motion.div
            key="chat-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel text-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[600px] shadow-2xl"
          >
            {/* Sidebar with ticket status briefing */}
            <div className="md:col-span-4 bg-slate-950/70 border-r border-slate-900 p-5 flex flex-col justify-between text-left">
              <div>
                <button
                  onClick={onLeaveChat}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all mb-5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Intake
                </button>

                <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-3 mb-4">
                  <span className="font-mono text-xs font-bold text-slate-450">
                    {activeTicket.id}
                  </span>
                  
                  <button 
                    onClick={handleSystemRefresh}
                    title="Refresh workflow status"
                    className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Title</h5>
                    <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-2">
                      {activeTicket.title}
                    </h4>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Workflow Stage</h5>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mt-1.5 ${
                      activeTicket.status === "RESOLVED" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : activeTicket.status === "INVESTIGATING"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {activeTicket.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Classification</h5>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      {activeTicket.category}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Date Logged</h5>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-550" />
                      {new Date(activeTicket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure notice info */}
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] text-slate-400 leading-relaxed bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
                <Sparkles className="w-3.5 h-3.5 text-brand-300 mb-1" />
                This communications environment is fully end-to-end masked. No account log is required. Disconnect dynamically.
              </div>
            </div>

            {/* Chat Board Area */}
            <div className="md:col-span-8 flex flex-col h-full bg-slate-900/10">
              {/* Header */}
              <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-900 flex items-center justify-between text-left">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Active Desk Session
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Live Anonymous Connection with Administrative Advisors
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Live WS</span>
                </div>
              </div>

              {/* Messages Lists */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 custom-scroll">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 max-w-sm mx-auto">
                    <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-350">Session Activated</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Say hello! You can leave suggestions, upload questions, or post critical milestones anonymously.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSelf = m.sender === "STAKEHOLDER";
                    return (
                      <div 
                        key={m.id} 
                        className={`flex flex-col max-w-[85%] text-left ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
                      >
                        <span className="text-[9px] font-bold text-slate-550 mb-0.5 px-1 uppercase tracking-wider">
                          {isSelf ? "My Reply (Anonymous)" : "Administrative Councilor"}
                        </span>
                        
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          isSelf 
                            ? "bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/10" 
                            : "bg-slate-850/80 text-slate-100 border border-slate-800 rounded-tl-none shadow-sm"
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        </div>
                        
                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Message Input form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/80 border-t border-slate-900 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Type an anonymous service inquiry..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-100 placeholder-slate-500 min-h-[44px] transition-all"
                />
                <button
                  type="submit"
                  className="p-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition-all cursor-pointer h-11 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
