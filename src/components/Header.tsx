import React from "react";
import { 
  Building, 
  UserCircle2, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  FileText,
  MessageCircle
} from "lucide-react";
import { UserRole } from "../types";

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeStakeholderView?: "intake" | "chat";
  onChangeStakeholderView?: (view: "intake" | "chat") => void;
}

export default function Header({ 
  currentRole, 
  onChangeRole, 
  activeStakeholderView = "intake",
  onChangeStakeholderView 
}: HeaderProps) {
  
  return (
    <header className="bg-slate-950/80 border-b border-slate-900 sticky top-0 z-40 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-600 text-white rounded-lg flex items-center justify-center font-heading font-extrabold text-base shadow-sm">
              IK
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-white tracking-tight leading-none font-heading flex items-center gap-1.5">
                ISKOncern
              </h1>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
                Campus Concern Desk
              </span>
            </div>
          </div>

          {/* Sub Navigation for Stakeholders (dynamic) */}
          {currentRole === "STAKEHOLDER" && onChangeStakeholderView && (
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => onChangeStakeholderView("intake")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[36px] ${
                  activeStakeholderView === "intake"
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "text-slate-450 hover:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4 text-brand-300" /> File Report
              </button>
              
              <button
                onClick={() => onChangeStakeholderView("chat")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[36px] ${
                  activeStakeholderView === "chat"
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "text-slate-450 hover:text-slate-200"
                }`}
              >
                <MessageCircle className="w-4 h-4 text-brand-300" /> Anonymous Chat Desk
              </button>
            </div>
          )}

          {/* Role selector panel */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => onChangeRole("STAKEHOLDER")}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                  currentRole === "STAKEHOLDER"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-450 hover:text-slate-100"
                }`}
              >
                <UserCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="hidden xs:inline">Stakeholder</span>
              </button>

              <button
                onClick={() => onChangeRole("ADMIN")}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                  currentRole === "ADMIN"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-450 hover:text-slate-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-slate-350" />
                <span className="hidden xs:inline">Admin Access</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sub Navigation Slider */}
      {currentRole === "STAKEHOLDER" && onChangeStakeholderView && (
        <div className="flex sm:hidden items-center justify-around border-t border-slate-900 p-2 bg-slate-950/90">
          <button
            onClick={() => onChangeStakeholderView("intake")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeStakeholderView === "intake"
                ? "bg-slate-900 text-indigo-400 shadow-sm border border-slate-800 font-extrabold"
                : "text-slate-500 hover:text-slate-300 font-medium"
            }`}
          >
            <FileText className="w-4 h-4" /> File Report
          </button>
          
          <button
            onClick={() => onChangeStakeholderView("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeStakeholderView === "chat"
                ? "bg-slate-900 text-indigo-400 shadow-sm border border-slate-800 font-extrabold"
                : "text-slate-500 hover:text-slate-300 font-medium"
            }`}
          >
            <MessageCircle className="w-4 h-4" /> Chat Desk
          </button>
        </div>
      )}
    </header>
  );
}
