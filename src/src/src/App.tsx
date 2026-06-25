import React, { useState, useEffect } from "react";
import { 
  Building, CheckCircle2, Clock, AlertTriangle, Sparkles, 
  Trash2, MessageSquare, PlusCircle, Activity, Lightbulb, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ChatInterface from "./components/ChatInterface";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintCard from "./components/ComplaintCard";
import ComplaintHistory from "./components/ComplaintHistory";
import { Complaint, ComplaintDraft } from "./types";

// Initial seeded complaints to showcase the dashboard in high-fidelity
const SEED_COMPLAINTS: Complaint[] = [
  {
    id: "PEC-EST-2026-X91E",
    text: "Loose hanging high-voltage electric wires behind Shivalik Hostel",
    location: "PEC Campus, Behind Shivalik Hostel (Hostel 1), Sector 12, Chandigarh",
    status: "LODGED",
    createdAt: "2026-06-25 08:02 AM",
    timelineProgress: 10,
    draft: {
      category: "Electricity & Lighting",
      priority: "CRITICAL",
      hazardLevel: "Red",
      priorityJustification: "Loose high-voltage wiring is an active electrocution risk, especially with rains starting in Chandigarh. This represents an immediate hazard to resident students.",
      location: "PEC Campus, Behind Shivalik Hostel (Hostel 1), Sector 12, Chandigarh",
      authorityName: "PEC Estate Office",
      authorityEmail: "estateofficer@pec.edu.in",
      formalEmailSubject: "CRITICAL: Exposed High-Voltage Wires Behind Shivalik Hostel (Hostel 1)",
      formalEmailBody: "Dear Estate Officer,\n\nI am lodging this critical safety complaint regarding exposed, loose-hanging electrical cables from the sub-transformer located directly behind Shivalik Hostel (Hostel 1) on the PEC campus.\n\nStudents cross this pathway daily, and given the current weather conditions, this poses an immediate threat of electrocution or short-circuit fire.\n\nPlease arrange an emergency electrical maintenance team to secure these lines as soon as possible.\n\nRespectfully,\nPEC Student Community",
      estimatedTimeline: "24-48 Hours",
      trackingId: "PEC-EST-2026-X91E"
    },
    updates: [
      { timestamp: "08:02 AM", message: "Complaint logged and analyzed by CampusCivic AI.", status: "LODGED" }
    ]
  },
  {
    id: "CHD-MCC-2026-F84A",
    text: "Sewer blockages and water stagnation in Sector 15-D lane",
    location: "Sector 15-D, Residential Lane 3, Chandigarh",
    status: "DISPATCHED",
    createdAt: "2026-06-23 11:24 AM",
    timelineProgress: 70,
    draft: {
      category: "Waste & Sanitation",
      priority: "HIGH",
      hazardLevel: "Amber",
      priorityJustification: "Severe blockages are causing raw water stagnation on main pathways, creating bad odors and high risk of mosquito-borne disease transmission (dengue) in Sector 15.",
      location: "Sector 15-D, Residential Lane 3, Chandigarh",
      authorityName: "Chandigarh Municipal Corporation (MCC) Sanitation Department",
      authorityEmail: "comm-mcc-chd@nic.in",
      formalEmailSubject: "Urgent Sanitation Complaint: Sewage Blockage & Stagnant Water in Sector 15-D",
      formalEmailBody: "Dear Commissioner / Executive Engineer,\n\nI am writing to formally report a serious public sanitation issue regarding blocked sewage lines in Sector 15-D, Residential Lane 3, Chandigarh.\n\nThis blockage has caused filthy water to overflow onto the street, blocking pedestrian paths and flooding house entryways. This stagnant pool is a breeding ground for mosquitoes and presents a direct health hazard to residents.\n\nWe request the immediate dispatch of suction tankers and sanitary sweeps to clear this blockage.\n\nSincerely,\nSector 15 Residents Association",
      estimatedTimeline: "3-5 Business Days",
      trackingId: "CHD-MCC-2026-F84A"
    },
    updates: [
      { timestamp: "11:24 AM", message: "Complaint logged in system.", status: "LODGED" },
      { timestamp: "02:15 PM", message: "Authority identified: Chandigarh MC Sanitation Division.", status: "UNDER_REVIEW" },
      { timestamp: "04:30 PM", message: "Formal email dispatched to comm-mcc-chd@nic.in.", status: "DISPATCHED" }
    ]
  }
];

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem("campus_civic_complaints");
    return saved ? JSON.parse(saved) : SEED_COMPLAINTS;
  });

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(() => {
    return complaints.length > 0 ? complaints[0].id : null;
  });

  const [activeTab, setActiveTab] = useState<"chat" | "direct">("chat");

  // Save to local storage on update
  useEffect(() => {
    localStorage.setItem("campus_civic_complaints", JSON.stringify(complaints));
  }, [complaints]);

  // Handle newly drafted complaint from Chat or Form
  const handleComplaintDrafted = (draft: ComplaintDraft, rawText: string) => {
    // Check if duplicate ID exists, update or generate new
    const exists = complaints.some(c => c.id === draft.trackingId);
    const trackingId = exists ? `${draft.trackingId}-${Date.now().toString().slice(-4)}` : draft.trackingId;
    const cleanDraft = { ...draft, trackingId };

    const newComplaint: Complaint = {
      id: trackingId,
      text: rawText || `Issue involving ${draft.category} at ${draft.location}`,
      location: draft.location,
      status: "LODGED",
      createdAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timelineProgress: 10,
      draft: cleanDraft,
      updates: [
        { 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          message: "Complaint registered and categorized by AI.", 
          status: "LODGED" 
        }
      ]
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setSelectedComplaintId(trackingId);
  };

  // Dispatch current complaint
  const handleDispatch = (draft: ComplaintDraft) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === draft.trackingId && c.status === "LODGED") {
        return {
          ...c,
          status: "DISPATCHED",
          timelineProgress: 70,
          updates: [
            ...c.updates,
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: `Formal dispatch email sent to ${draft.authorityEmail}.`,
              status: "DISPATCHED"
            }
          ]
        };
      }
      return c;
    }));
  };

  // Simulate progress of resolution
  const handleSimulateProgress = (id: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        let nextStatus: "LODGED" | "UNDER_REVIEW" | "DISPATCHED" | "RESOLVED" = "LODGED";
        let progress = 10;
        let updateMsg = "";

        if (c.status === "LODGED") {
          nextStatus = "UNDER_REVIEW";
          progress = 40;
          updateMsg = `Authority (${c.draft.authorityName}) received the docket and is verifying location details.`;
        } else if (c.status === "UNDER_REVIEW") {
          nextStatus = "DISPATCHED";
          progress = 70;
          updateMsg = `Dispatched field personnel to inspect the reported civic fault.`;
        } else if (c.status === "DISPATCHED") {
          nextStatus = "RESOLVED";
          progress = 100;
          updateMsg = `Resolution completed. Technical repair team closed the ticket on site.`;
        } else {
          return c; // already resolved
        }

        return {
          ...c,
          status: nextStatus,
          timelineProgress: progress,
          updates: [
            ...c.updates,
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: updateMsg,
              status: nextStatus
            }
          ]
        };
      }
      return c;
    }));
  };

  // Delete complaint from board
  const handleDelete = (id: string) => {
    const updated = complaints.filter(c => c.id !== id);
    setComplaints(updated);
    if (selectedComplaintId === id) {
      setSelectedComplaintId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // System reset to standard seeded state
  const resetSystem = () => {
    if (window.confirm("Restore dashboard to standard demo complaints? All custom items will be cleared.")) {
      setComplaints(SEED_COMPLAINTS);
      setSelectedComplaintId(SEED_COMPLAINTS[0].id);
      localStorage.removeItem("campus_civic_complaints");
    }
  };

  // Computed metrics for counters
  const totalCount = complaints.length;
  const criticalCount = complaints.filter(c => c.draft.priority === "CRITICAL").length;
  const dispatchedCount = complaints.filter(c => c.status === "DISPATCHED").length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED").length;

  const activeSelected = complaints.find(c => c.id === selectedComplaintId);

  return (
    <div className="bg-slate-bg min-h-screen text-slate-dark font-sans selection:bg-slate-dark selection:text-white border-8 border-slate-dark p-4 md:p-8">
      {/* Chandigarh Modern Slate Header */}
      <header className="border-b-2 border-slate-dark pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase mb-2 text-hazard-red">
            PEC & Chandigarh Regional Coordination
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black leading-none tracking-tighter uppercase text-slate-dark">
            CampusCivic
            <span className="block text-xl sm:text-2xl md:text-3xl font-mono tracking-[0.3em] mt-2 border-t border-slate-dark pt-2 text-slate-medium">
              Autonomous Agent 01
            </span>
          </h1>
        </div>
        <div className="text-left md:text-right max-w-xs">
          <p className="text-[10px] font-sans leading-tight uppercase font-bold tracking-widest text-slate-light mb-4">
            Serving Punjab Engineering College and the Chandigarh Municipal Corporation
          </p>
          <div className="flex md:justify-end gap-2 items-center">
            <span className="text-[10px] font-mono font-bold uppercase mr-1 text-slate-medium">System State:</span>
            <div className="w-3 h-3 bg-hazard-red rounded-full animate-pulse" title="System Active"></div>
            <div className="w-3 h-3 bg-slate-dark rounded-full"></div>
            <div className="w-3 h-3 bg-slate-dark rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Stats Counter Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-b-2 border-slate-dark pb-8">
        <div className="bg-white border-2 border-slate-dark p-4 shadow-[4px_4px_0px_#0F172A] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-light">Total Dockets</span>
          <div className="text-3xl font-display font-bold mt-2 text-slate-dark">{totalCount}</div>
        </div>
        <div className="bg-white border-2 border-slate-dark p-4 shadow-[4px_4px_0px_#0F172A] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-hazard-red">Critical Level</span>
          <div className="text-3xl font-display font-bold mt-2 text-hazard-red">{criticalCount}</div>
        </div>
        <div className="bg-white border-2 border-slate-dark p-4 shadow-[4px_4px_0px_#0F172A] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-light">Dispatched Logs</span>
          <div className="text-3xl font-display font-bold mt-2 text-slate-dark">{dispatchedCount}</div>
        </div>
        <div className="bg-white border-2 border-slate-dark p-4 shadow-[4px_4px_0px_#0F172A] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-light">Simulated Resolved</span>
          <div className="text-3xl font-display font-bold mt-2 text-emerald-600">{resolvedCount}</div>
        </div>
      </section>

      {/* Main Grid Workspace */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Modes (Chat and Form) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Input Selection Tabs */}
          <div className="bg-white border-2 border-slate-dark p-1 rounded-none flex items-center shadow-[4px_4px_0px_#0F172A] mb-6">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2.5 text-xs font-bold font-display transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                activeTab === "chat" 
                  ? "bg-slate-dark text-white" 
                  : "text-slate-dark hover:bg-slate-50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Coordinator (Chat)</span>
            </button>

            <button
              onClick={() => setActiveTab("direct")}
              className={`flex-1 py-2.5 text-xs font-bold font-display transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                activeTab === "direct" 
                  ? "bg-slate-dark text-white" 
                  : "text-slate-dark hover:bg-slate-50"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Quick-Lodge (Form)</span>
            </button>
          </div>

          {/* Render selected active tab */}
          <AnimatePresence mode="wait">
            {activeTab === "chat" ? (
              <motion.div
                key="chat-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <ChatInterface 
                  onComplaintDrafted={(draft) => handleComplaintDrafted(draft, `Civic issue regarding ${draft.category}`)}
                  isLoadingExternal={false}
                />
              </motion.div>
            ) : (
              <motion.div
                key="direct-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <ComplaintForm 
                  onComplaintAnalyzed={(draft) => handleComplaintDrafted(draft, `Civic issue regarding ${draft.category}`)}
                  isLoadingExternal={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Informational Box */}
          <div className="bg-white p-6 border-2 border-slate-dark shadow-[6px_6px_0px_#0F172A] space-y-3">
            <div className="flex items-center space-x-2 text-hazard-red">
              <Lightbulb className="w-5 h-5 shrink-0" />
              <h4 className="font-display font-bold text-xs uppercase tracking-widest">Operator Instructions</h4>
            </div>
            <ul className="text-xs text-slate-medium space-y-2 list-disc list-inside font-sans leading-relaxed">
              <li>Submit civic reports or location coordinates in the interactive terminal panel on the left.</li>
              <li>Watch the AI coordinator categorize, evaluate severity risks, and automatically build official dispatch drafts on the right.</li>
              <li>Use <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 border border-slate-dark text-[10px]">Step Up</span> to simulate progression and track live resolution milestones in the local feed.</li>
            </ul>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-light">CC Protocol v4.1</span>
              <button 
                onClick={resetSystem} 
                className="text-[10px] font-display font-bold text-hazard-red uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset System State
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Visualization & History */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Selected Complaint Card / Visual Dispatch Area */}
          {activeSelected ? (
            <motion.div
              key={activeSelected.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-bold text-slate-dark uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-slate-dark" /> Active Docket Details
                </span>
                <span className="text-[11px] text-slate-light font-mono">
                  Showing {activeSelected.id}
                </span>
              </div>
              
              <ComplaintCard 
                draft={activeSelected.draft}
                status={activeSelected.status}
                timelineProgress={activeSelected.timelineProgress}
                onDispatch={handleDispatch}
                isAlreadyDispatched={activeSelected.status !== "LODGED"}
              />

              {/* Sub-Panel: Chronological Simulation Updates */}
              <div className="bg-white border-2 border-slate-dark p-6 shadow-[6px_6px_0px_#0F172A] space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-dark pb-2">
                  <Clock className="w-3.5 h-3.5" /> Simulation Activity Logs
                </h4>
                <div className="space-y-3">
                  {activeSelected.updates.map((up, idx) => (
                    <div key={idx} className="flex items-start gap-4 text-xs leading-relaxed font-sans">
                      <span className="font-mono text-[10px] text-slate-light shrink-0 mt-0.5">{up.timestamp}</span>
                      <div className="flex-1 text-slate-dark font-mono text-[11px]">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-none border border-slate-dark font-bold uppercase tracking-wide mr-2 ${
                          up.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" :
                          up.status === "DISPATCHED" ? "bg-blue-100 text-blue-900 font-bold" :
                          up.status === "UNDER_REVIEW" ? "bg-amber-100 text-amber-800" :
                          "bg-white text-slate-dark"
                        }`}>
                          {up.status}
                        </span>
                        {up.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="bg-white border-2 border-slate-dark p-12 text-center shadow-[6px_6px_0px_#0F172A] flex flex-col items-center justify-center min-h-[300px]">
              <Sparkles className="w-12 h-12 text-slate-dark animate-pulse mb-3" />
              <h3 className="font-display font-bold text-2xl text-slate-dark">No Active Docket Selected</h3>
              <p className="text-xs text-slate-light max-w-[280px] mt-2 leading-relaxed font-sans">
                Lodge an issue using the AI coordinator or select a ticket from the list below to analyze dispatch options.
              </p>
            </div>
          )}

          {/* 2. Full History List Panel */}
          <ComplaintHistory 
            complaints={complaints}
            selectedId={selectedComplaintId}
            onSelect={(id) => setSelectedComplaintId(id)}
            onDelete={handleDelete}
            onSimulateProgress={handleSimulateProgress}
          />

        </div>

      </main>

      {/* Chandigarh Modern Footer */}
      <footer className="bg-slate-dark text-white p-8 mt-16 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-center sm:text-left">
          Punjab Engineering College · Sector 12, Chandigarh
        </div>
        <div className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-300">
          © 2026 CampusCivic Agentic Framework
        </div>
      </footer>
    </div>
  );
}
