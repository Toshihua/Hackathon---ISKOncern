import React, { useState, useRef } from "react";
import { 
  FileLock2, 
  Send, 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  CheckCircle, 
  Copy, 
  Check, 
  MessageCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Incident, IncidentCategory } from "../types";

interface IntakeFormProps {
  onSuccess: (incident: Incident) => void;
  onNavigateToChat: (code: string) => void;
}

export default function IntakeForm({ onSuccess, onNavigateToChat }: IntakeFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IncidentCategory>("Facilities");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [media, setMedia] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<Incident | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (files: FileList) => {
    setErrorMsg("");
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    Array.from(files).forEach((file) => {
      if (!validImageTypes.includes(file.type)) {
        setErrorMsg("Only image files (JPEG, PNG, GIF, WEBP) are supported for report attachments.");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image size should be less than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setMedia((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      setErrorMsg("Please fill in the Title, Category, and Description fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          reporterName: isAnonymous ? "Anonymous Reporter" : reporterName,
          reporterEmail: isAnonymous ? "" : reporterEmail,
          media,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit index concern report.");
      }

      const data: Incident = await response.json();
      setSubmitResult(data);
      onSuccess(data);

      // Reset state for new form load
      setTitle("");
      setDescription("");
      setReporterName("");
      setReporterEmail("");
      setIsAnonymous(true);
      setMedia([]);
    } catch (err) {
      setErrorMsg("Unable to connect to the intake service. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="intake-form-container" className="glass-panel text-slate-200 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto shadow-2xl">
      <AnimatePresence mode="wait">
        {!submitResult ? (
          <motion.div
            key="intake-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileLock2 className="w-3.5 h-3.5 text-brand-300" /> Secure Concern submission
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2">
                Submit an Incident Report
              </h2>
              <p className="text-slate-450 mt-1.5 text-sm md:text-base">
                Report campus, academic, or administrative incidents safely. Select anonymous reporting to protect your identity.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-4 bg-amber-950/20 rounded-xl border border-amber-900/30 text-amber-400 flex items-start gap-2.5 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {/* Report Title */}
              <div>
                <label htmlFor="report-title" className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Concern Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="report-title"
                  type="text"
                  required
                  placeholder="e.g. WiFi outage in Library, Leaking pipe in science lab..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-100 placeholder-slate-500 bg-slate-900/80 transition-all text-sm min-h-[44px]"
                />
              </div>

              {/* Grid: Category and Anonymity Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="report-category" className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="report-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-100 bg-slate-900/80 transition-all text-sm min-h-[44px]"
                  >
                    <option value="Facilities" className="bg-slate-955 text-slate-200">Facilities & Campus Utilities</option>
                    <option value="Security" className="bg-slate-955 text-slate-200">Security & Safety Concerns</option>
                    <option value="Academic" className="bg-slate-955 text-slate-200">Academic Affairs & Staff</option>
                    <option value="IT Systems" className="bg-slate-955 text-slate-200">IT Systems & Digital Tools</option>
                    <option value="Health & Safety" className="bg-slate-955 text-slate-200">Health & Environmental Safety</option>
                    <option value="Other" className="bg-slate-955 text-slate-200">Other / Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Identity Visibility
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-1050 rounded-xl border border-slate-800 bg-slate-900/90">
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(true)}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all min-h-[38px] cursor-pointer ${
                        isAnonymous
                          ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Anonymous Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(false)}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all min-h-[38px] cursor-pointer ${
                        !isAnonymous
                          ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Reveal Contact
                    </button>
                  </div>
                </div>
              </div>

              {/* Submitter Details Form (Revealed only if not anonymous) */}
              <AnimatePresence>
                {!isAnonymous && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label htmlFor="reporter-name" className="block text-xs font-semibold text-slate-400 mb-1">
                          Full Name
                        </label>
                        <input
                          id="reporter-name"
                          type="text"
                          placeholder="e.g. Juan Dela Cruz"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-105 placeholder-slate-500 bg-slate-900/80 text-xs min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label htmlFor="reporter-email" className="block text-xs font-semibold text-slate-400 mb-1">
                          Email Address
                        </label>
                        <input
                          id="reporter-email"
                          type="email"
                          placeholder="j.delacruz@uni.edu"
                          value={reporterEmail}
                          onChange={(e) => setReporterEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-105 placeholder-slate-500 bg-slate-900/80 text-xs min-h-[44px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description */}
              <div>
                <label htmlFor="report-description" className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="report-description"
                  required
                  rows={4}
                  placeholder="Provide precise details including exact floor or room numbers, specific device descriptors, any physical hazards, and background chronology..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-100 placeholder-slate-500 bg-slate-900/80 transition-all text-sm"
                />
              </div>

              {/* Media Upload Area */}
              <div>
                <span className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Attach Media Files
                </span>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? "border-brand-500 bg-slate-900/80" 
                      : "border-slate-800 bg-slate-905/40 hover:border-indigo-500/50 hover:bg-slate-900/55"
                  }`}
                  onClick={triggerPicker}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-medium text-sm">
                    Drag and drop your images here, or <span className="text-brand-300 font-semibold underline">browse hardware</span>
                  </p>
                  <p className="text-slate-550 text-xs mt-1">
                    Supports high-resolution JPG, PNG, GIF files up to 5MB
                  </p>
                </div>

                {/* File Previews Grid */}
                {media.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    {media.map((base64, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-sm">
                        <img 
                          src={base64} 
                          alt="Incident attachment" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMedia(index);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/90 text-white opacity-90 hover:opacity-100 hover:scale-105 transition-all shadow-md cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-md shadow-brand-600/10 hover:shadow-brand-600/25 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Filing Safe Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Report As {isAnonymous ? "Anonymous" : "Verifier"}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Submission Success State */
          <motion.div
            key="intake-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-900/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-white">
              Concern Successfully Submitted
            </h3>
            <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm">
              Your incident has been cataloged. Administrators are monitoring the report and will process updates below.
            </p>

            {/* Verification Slate */}
            <div className="mt-6 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl text-left max-w-md mx-auto space-y-4 shadow-xl">
              <div>
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                  Incident Reference ID
                </span>
                <span className="text-xl font-mono font-bold text-white">
                  {submitResult.id}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                  Chat Access Code
                </span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-sm font-bold text-indigo-300 block select-all">
                    {submitResult.chatAccessCode}
                  </span>
                  
                  <button
                    onClick={() => handleCopyCode(submitResult.chatAccessCode)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-slate-800 hover:border-indigo-500 rounded-lg bg-slate-900 h-9 transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <span className="text-slate-500 text-[11px] block mt-1 leading-relaxed">
                  ⚠️ Save this code! This is your unique credentials key to open the anonymous chat and track status updates.
                </span>
              </div>
            </div>

            {/* Redirects */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigateToChat(submitResult.chatAccessCode)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all cursor-pointer min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" /> Go to Anonymous Chat
              </button>
              
              <button
                onClick={() => setSubmitResult(null)}
                className="w-full sm:w-auto px-6 py-3 border border-slate-800 hover:bg-slate-900/50 text-slate-400 font-medium rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                File Another Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
