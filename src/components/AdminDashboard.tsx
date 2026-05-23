import React, { useState, useEffect, useRef } from "react";
import { 
  Filter, 
  Search, 
  CheckCircle, 
  Clock, 
  Eye, 
  User, 
  Mail, 
  TrendingUp, 
  AlertTriangle,
  Send,
  MessageCircle,
  FileText,
  Calendar,
  X,
  FileDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Incident, ChatMessage, IncidentCategory, IncidentStatus } from "../types";

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState("");
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

  // Selection
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [enlargedMedia, setEnlargedMedia] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    investigating: 0,
    resolved: 0,
    total: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch all incidents
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/incidents", window.location.origin);
      url.searchParams.append("status", selectedStatus);
      url.searchParams.append("category", selectedCategory);
      if (searchTerm) {
        url.searchParams.append("search", searchTerm);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const data: Incident[] = await res.json();
      
      // Sort client side as redundant safety
      const sorted = [...data].sort((a, b) => {
        const t1 = new Date(a.createdAt).getTime();
        const t2 = new Date(b.createdAt).getTime();
        return sortBy === "recent" ? t2 - t1 : t1 - t2;
      });

      setIncidents(sorted);

      // Derive stats
      const pendingCount = sorted.filter(i => i.status === "PENDING").length;
      const invCount = sorted.filter(i => i.status === "INVESTIGATING").length;
      const resCount = sorted.filter(i => i.status === "RESOLVED").length;
      setStats({
        pending: pendingCount,
        investigating: invCount,
        resolved: resCount,
        total: sorted.length
      });
    } catch (e) {
      setErrorHeader("Failed to retrieve system concern data. Refresh view.");
    } finally {
      setLoading(false);
    }
  };

  // Run on filters/sort changes
  useEffect(() => {
    fetchIncidents();
  }, [selectedCategory, selectedStatus, searchTerm, sortBy]);

  // Connect to WS for selected incident's chat room
  useEffect(() => {
    if (!selectedIncident) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setMessages([]);
      return;
    }

    // Connect WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/chat-ws`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      // Join Room
      socket.send(JSON.stringify({
        type: "join",
        incidentId: selectedIncident.id,
        role: "ADMIN",
        accessCode: "ADMIN_ROLE"
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "joined") {
          setMessages(data.messages);
          scrollToBottom();
        } else if (data.type === "message") {
          // Add message only if it belongs to selected incident
          if (data.message.incidentId === selectedIncident.id) {
            setMessages(prev => {
              // Avoid duplicate messages
              if (prev.some(m => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
            scrollToBottom();
          }
        } else if (data.type === "error") {
          console.error("WS room error:", data.message);
        }
      } catch (err) {
        console.error("Failed to parse websocket payload:", err);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket for Admin closed");
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [selectedIncident]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle status of selected incident
  const handleUpdateStatus = async (status: IncidentStatus) => {
    if (!selectedIncident) return;
    try {
      const response = await fetch(`/api/incidents/${selectedIncident.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error();
      const updated: Incident = await response.json();
      
      // Update local array
      setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
      setSelectedIncident(updated);
      
      // Update statistics live
      setStats(prev => {
        const updatedList = incidents.map(i => i.id === updated.id ? updated : i);
        return {
          pending: updatedList.filter(i => i.status === "PENDING").length,
          investigating: updatedList.filter(i => i.status === "INVESTIGATING").length,
          resolved: updatedList.filter(i => i.status === "RESOLVED").length,
          total: updatedList.length
        };
      });
    } catch (e) {
      setErrorHeader("Failed to modify ticket status. Try again.");
    }
  };

  // Send message via WebSocket
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedIncident || !wsRef.current) return;

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "message",
        incidentId: selectedIncident.id,
        sender: "ADMIN",
        text: newMessageText.trim(),
        accessCode: "ADMIN_ROLE"
      }));
      setNewMessageText("");
    } else {
      // WS down, do a HTTP fallback
      postMessageFallback();
    }
  };

  const postMessageFallback = async () => {
    if (!selectedIncident) return;
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          sender: "ADMIN",
          text: newMessageText.trim(),
          accessCode: "ADMIN_ROLE"
        })
      });
      if (response.ok) {
        const addedMsg: ChatMessage = await response.json();
        setMessages(prev => [...prev, addedMsg]);
        setNewMessageText("");
      }
    } catch (err) {
      console.error("HTTP messaging fallback failed:", err);
    }
  };

  const exportCSV = () => {
    let headers = "ID,Title,Category,Status,Reporter,Email,Date\n";
    let rows = incidents.map(i => 
      `"${i.id}","${i.title.replace(/"/g, '""')}","${i.category}","${i.status}","${(i.reporterName || "Anonymous").replace(/"/g, '""')}","${i.reporterEmail || ""}","${new Date(i.createdAt).toLocaleDateString()}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `ISKOncern_Report_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto items-start">
      
      {/* Dynamic Non-blocking alert panel */}
      {errorHeader && (
        <div className="lg:col-span-12 p-4 bg-red-950/30 rounded-xl border border-red-900/40 text-rose-455 text-xs flex items-center justify-between text-left animate-fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
            <span>{errorHeader}</span>
          </div>
          <button 
            type="button"
            onClick={() => setErrorHeader("")} 
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top statistics banners - Takes 12 columns */}
      <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-xl flex items-center gap-4 shadow-md text-left">
          <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Unresolved</span>
            <h3 className="text-2xl font-bold text-white font-sans mt-0.5">{stats.pending}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex items-center gap-4 shadow-md text-left">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Investigating</span>
            <h3 className="text-2xl font-bold text-white font-sans mt-0.5">{stats.investigating}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex items-center gap-4 shadow-md text-left">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <h3 className="text-2xl font-bold text-white font-sans mt-0.5">{stats.resolved}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex items-center gap-4 shadow-md text-left">
          <div className="p-3 bg-indigo-505/10 text-indigo-400 border border-indigo-500/20 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Filed</span>
            <h3 className="text-2xl font-bold text-white font-sans mt-0.5">{stats.total}</h3>
          </div>
        </div>

      </div>

      {/* Main Board left: search, list, filters. Right: detailed view */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Filters Container */}
        <div className="glass-panel p-4 rounded-xl space-y-3.5 shadow-md">
          {/* Header search */}
          <div className="relative text-left">
            <Search className="absolute left-3.5 top-3.5 text-slate-550 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reference, words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550 text-slate-100 placeholder-slate-500 min-h-[44px]"
            />
          </div>

          {/* Filtering selectors */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <label htmlFor="filter-category" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 min-h-[38px] focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Facilities">Facilities</option>
                <option value="Security">Security</option>
                <option value="Academic">Academic</option>
                <option value="IT Systems">IT Systems</option>
                <option value="Health & Safety">Health & Safety</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 min-h-[38px] focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-900 pt-3">
            <button
              onClick={() => setSortBy(prev => prev === "recent" ? "oldest" : "recent")}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              Order: {sortBy === "recent" ? "Newest First" : "Oldest First"}
            </button>
            <button
              onClick={exportCSV}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" /> Export Logs CSV
            </button>
          </div>
        </div>

        {/* Complaints/Incident list */}
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scroll pr-1">
          {loading ? (
            <div className="text-center py-12 glass-panel rounded-xl">
              <div className="w-6 h-6 border-2 border-indigo-550 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-medium">Fetching concerns feed...</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-xl text-slate-400 p-6">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No Concerns Found</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting dashboard filters or searching tags.</p>
            </div>
          ) : (
            incidents.map((incident) => {
              const bgStatus = 
                incident.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                incident.status === 'INVESTIGATING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20';

              const isSelected = selectedIncident?.id === incident.id;

              return (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected 
                      ? "border-brand-500/60 bg-indigo-950/20 shadow-lg shadow-indigo-950/30" 
                      : "border-slate-850 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-300 bg-slate-850 px-1.5 py-0.5 rounded border border-slate-700">
                      {incident.id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${bgStatus}`}>
                      {incident.status}
                    </span>
                  </div>

                  <h4 className="font-semibold text-white text-sm line-clamp-1">
                    {incident.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {incident.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-900/60 text-[10px] font-medium text-slate-500">
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                      {incident.category}
                    </span>
                    <span>
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: detail card and active chat session */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {selectedIncident ? (
            <motion.div
              key={selectedIncident.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="glass-panel rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Card Title Banner */}
              <div className="bg-slate-950/60 border-b border-slate-905 p-5 md:p-6 text-left relative">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-800 transition-all cursor-pointer block lg:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
                  <span>Incident Record</span>
                  <span>•</span>
                  <span className="text-indigo-400 font-semibold">{selectedIncident.id}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold font-heading text-white mt-1">
                  {selectedIncident.title}
                </h3>
              </div>

              {/* Status workflow settings */}
              <div className="p-5 border-b border-slate-900 text-left bg-slate-900/40">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-2">
                  Update Concern Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus("PENDING")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer min-h-[38px] ${
                      selectedIncident.status === "PENDING"
                        ? "bg-red-650 text-white border-red-500 shadow-md shadow-red-650/10"
                        : "bg-slate-950/60 text-red-400 border-red-950/40 hover:bg-red-950/10"
                    }`}
                  >
                    Set Pending
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("INVESTIGATING")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer min-h-[38px] ${
                      selectedIncident.status === "INVESTIGATING"
                        ? "bg-amber-650 text-white border-amber-500 shadow-md shadow-amber-650/10"
                        : "bg-slate-950/60 text-amber-400 border-amber-950/40 hover:bg-amber-950/10"
                    }`}
                  >
                    Investigating
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("RESOLVED")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer min-h-[38px] ${
                      selectedIncident.status === "RESOLVED"
                        ? "bg-emerald-650 text-white border-emerald-500 shadow-md shadow-emerald-650/10"
                        : "bg-slate-950/60 text-emerald-400 border-emerald-950/40 hover:bg-emerald-950/10"
                    }`}
                  >
                    Resolve Ticket
                  </button>
                </div>
              </div>

              {/* Core Details section */}
              <div className="p-5 md:p-6 text-left space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                    <User className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-slate-500 block font-semibold text-[9px] uppercase tracking-wider">Reporter Name</span>
                      <span className="text-slate-200 font-medium">{selectedIncident.reporterName || "Anonymous Stakeholder"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-slate-500 block font-semibold text-[9px] uppercase tracking-wider">Reporter Email</span>
                      <span className="text-slate-200 font-medium">{selectedIncident.reporterEmail || "Hidden / Anonymous"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-slate-500 block font-semibold text-[9px] uppercase tracking-wider">Date Created</span>
                      <span className="text-slate-200 font-medium">{new Date(selectedIncident.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                    <MessageCircle className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-slate-500 block font-semibold text-[9px] uppercase tracking-wider">Secure Access Key</span>
                      <span className="text-indigo-300 font-mono font-semibold select-all">{selectedIncident.chatAccessCode}</span>
                    </div>
                  </div>
                </div>

                {/* Report Content Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">Description</h4>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/70 p-4 rounded-xl border border-slate-855 whitespace-pre-wrap">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Attachments Section */}
                {selectedIncident.media && selectedIncident.media.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Attachments ({selectedIncident.media.length})</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedIncident.media.map((base64, index) => (
                        <div 
                          key={index} 
                          onClick={() => setEnlargedMedia(base64)}
                          className="w-16 h-16 rounded-lg border border-slate-800 overflow-hidden cursor-pointer shadow-sm hover:scale-105 transition-all bg-slate-950 shrink-0 relative group"
                        >
                          <img 
                            src={base64} 
                            alt="Incident media" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Module embedded inside details */}
              <div className="border-t border-slate-1000 bg-slate-950/40 flex flex-col h-[320px]">
                <div className="px-5 py-3 border-b border-slate-900 flex items-center justify-between bg-slate-950/60">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <MessageCircle className="w-4 h-4 text-indigo-400 animate-pulse" /> Anonymous Chat Desk-Feed
                  </span>
                  <span className="text-[10px] font-sans text-slate-500">
                    Stakeholder connected via token
                  </span>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 custom-scroll">
                  {messages.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <MessageCircle className="w-8 h-8 text-slate-700 mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-slate-400">No correspondence yet on this ticket.</p>
                      <p className="text-[10px] text-slate-500 mt-1">Send an initial response below to engage the stakeholder.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isAdmin = m.sender === "ADMIN";
                      return (
                        <div 
                          key={m.id} 
                          className={`flex flex-col max-w-[85%] text-left ${isAdmin ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          <span className="text-[9px] font-bold text-slate-500 mb-0.5 px-1 uppercase tracking-wider">
                            {isAdmin ? "Counselor Response" : "Anonymous Stakeholder"}
                          </span>
                          <div className={`p-3 rounded-2xl text-sm ${
                            isAdmin 
                              ? "bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/10" 
                              : "bg-slate-850/80 text-slate-100 border border-slate-800 rounded-tl-none shadow-sm"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1 px-1">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/80 border-t border-slate-900 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type an anonymous service response here..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-100 placeholder-slate-500 h-11"
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
          ) : (
            <motion.div
              key="empty-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel rounded-2xl p-12 text-center text-slate-405 h-[600px] flex flex-col items-center justify-center shadow-lg"
            >
              <FileText className="w-16 h-16 text-slate-700 mb-3" />
              <h3 className="text-lg font-bold text-white">No Ticket Selected</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1 mx-auto">
                Select an active concern ticket from the feed to view files, change progress, and chat anonymously with stakeholders.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media enlargement popup */}
        {enlargedMedia && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              onClick={() => setEnlargedMedia(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-white/10">
              <img 
                src={enlargedMedia} 
                alt="Enlarged media view" 
                className="max-w-full max-h-[80vh] object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
