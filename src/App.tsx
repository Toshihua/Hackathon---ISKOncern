import React, { useState } from "react";
import { 
  ShieldAlert, 
  UserCircle2, 
  Info, 
  HelpCircle, 
  Sparkles, 
  FileText,
  Lock,
  RefreshCw,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import IntakeForm from "./components/IntakeForm";
import AdminDashboard from "./components/AdminDashboard";
import ChatDesk from "./components/ChatDesk";
import { UserRole, Incident } from "./types";

export default function App() {
  const [role, setRole] = useState<UserRole>("STAKEHOLDER");
  const [stakeholderView, setStakeholderView] = useState<"intake" | "chat">("intake");
  const [initialChatCode, setInitialChatCode] = useState("");

  const handleIncidentSuccess = (incident: Incident) => {
    // We can store it or perform side operations
    console.log("Incident successfully logged", incident.id);
  };

  const handleNavigateToChat = (code: string) => {
    setInitialChatCode(code);
    setStakeholderView("chat");
  };

  const handleLeaveChatDesk = () => {
    setInitialChatCode("");
    setStakeholderView("intake");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* Prime Header Block */}
      <Header 
        currentRole={role} 
        onChangeRole={(newRole) => {
          setRole(newRole);
          // If switching to admin, automatically reset stakeholder sub-view 
          if (newRole === "ADMIN") {
            setInitialChatCode("");
          }
        }}
        activeStakeholderView={stakeholderView}
        onChangeStakeholderView={setStakeholderView}
      />

      {/* Primary Application Container */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Banner Informational - Mock Details & State Indicator */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-amber-950/15 border border-amber-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-left">
              <div className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg shrink-0 mt-0.5 sm:mt-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500 block font-heading">
                  Platform Verification Indicator
                </span>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Active environment runs an integrated <strong className="font-bold text-slate-350">React + Express TypeScript stack</strong>. Includes secure local in-memory DB & high performance WebSockets for live chat synchronization on Port 3000.
                </p>
              </div>
            </div>

            {/* Quick Action Badge showing current Context */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl self-stretch sm:self-auto justify-center shadow-sm">
              <div className={`w-2 h-2 rounded-full ${role === 'ADMIN' ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="font-mono text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                Role: {role}
              </span>
            </div>
          </div>
        </div>

        {/* Modular Content Orchestrator */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {role === "STAKEHOLDER" ? (
              <motion.div
                key="stakeholder-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {stakeholderView === "intake" ? (
                  <IntakeForm 
                    onSuccess={handleIncidentSuccess} 
                    onNavigateToChat={handleNavigateToChat}
                  />
                ) : (
                  <ChatDesk 
                    initialAccessCode={initialChatCode}
                    onLeaveChat={handleLeaveChatDesk}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="admin-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Clean Administrative Disclaimer Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-6 mt-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-600" />
            <span>
              ISKOncern Helpdesk Platform • Mock Security Standard (Role-Based Bypass Active)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>In-Memory Volatile DB</span>
            <span>•</span>
            <span>WebSocket Live Relay</span>
            <span>•</span>
            <span>Anonymity Assured</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
