import React from 'react';
import { 
  ChevronRight, 
  Edit3, 
  Phone, 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  ShieldQuestion,
  BarChart2,
  Building,
  Calendar,
  Check,
  Flag,
  Share2,
  MoreVertical,
  Bot,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LeadDetailView() {
  return (
    <div className="flex-1 flex flex-col gap-4 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <button className="hover:text-indigo-600 transition-colors">Client Directory</button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900">Sarah Jenkins</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-bold text-slate-300 tracking-widest">TRACE_ID: L-8842-X</span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Edit3 size={12} /> 
            <span>Annotate</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 h-full min-h-[700px]">
        {/* Left Column: Summary Info */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
          {/* Profile Identity Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-lg border border-slate-100 shadow-inner shrink-0">
                  SJ
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">Sarah Jenkins</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">VP of Enterprise Solutions</p>
                  <p className="text-[10px] text-indigo-600 font-bold flex items-center gap-2 mt-1 uppercase tracking-tight">
                    <Building size={12} /> TechFlow Institutional
                  </p>
                </div>
              </div>
              <span className="bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-widest shadow-sm">
                PRIORITY_A1
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-50">
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Signal Node</p>
                <p className="font-mono text-[10px] font-bold text-slate-900 tracking-tight">+1 (555) 019-8432</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Interaction</p>
                <p className="text-[10px] font-bold text-slate-900 tracking-tight uppercase">29m ago</p>
              </div>
            </div>
          </div>

          {/* AI Recommended Follow-up */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-5 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber-500 fill-current" />
              <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Deployment Prompt</h3>
            </div>
            <p className="text-[13px] font-bold text-white/90 leading-snug tracking-tight">
              "Review the expedited deployment schedule I've prepared. It addresses the 24-hour Cutover Node we discussed..."
            </p>
            <button className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded border border-white/10 transition-all">
              <Copy size={12} /> 
              <span>Buffer Opener</span>
            </button>
          </div>

          {/* AI Summary */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
              <FileText size={14} />
              Session Abstract
            </h3>
            <p className="text-[12px] font-bold text-slate-600 leading-normal border-l-2 border-slate-100 pl-3 py-0.5">
              Strong affinity for Tier-1 Enterprise. Critical bottleneck identified: Migration Onboarding Node. Agreed to technical triage on Tuesday.
            </p>
          </div>

          {/* Detected Objections */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle size={14} />
              Friction Nodes
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Budget/Equity', type: 'success', status: 'RESOLVED' },
                { label: 'Cutover Timeline', type: 'warning', status: 'MITIGATING' },
                { label: 'Legacy Integration', type: 'error', status: 'UNRESOLVED' },
              ].map((obj, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-sm border border-slate-50 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-700 uppercase">{obj.label}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm ${
                    obj.type === 'success' ? 'bg-emerald-500 text-white' : 
                    obj.type === 'warning' ? 'bg-amber-500 text-white' : 
                    'bg-rose-500 text-white'
                  }`}>
                    {obj.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transcript Pane */}
        <div className="col-span-1 lg:col-span-8 bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm overflow-hidden h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <MessageSquare size={16} className="text-indigo-600" />
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Interaction Log_v1.0</h2>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1.5"><Clock size={14} /> 04:12</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Oct 24 • 10:30</span>
            </div>
          </div>

          {/* Transcript Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white/50">
            {[
              { speaker: 'ASTRA AI', time: '00:00', text: 'Hi Sarah, Alex here from the Astra Institutional desk. I saw you were processing our Enterprise data pools. Do you have a window to discuss the Cutover Node?', type: 'ai' },
              { speaker: 'SARAH J.', time: '00:15', text: 'Alex, I have a tight window. We are looking at Tier-1 but can\'t risk the transition liability.', type: 'user' },
              { speaker: 'ASTRA AI', time: '00:32', text: 'Understood. Aside from the transition liability, what is the core bottleneck for the TechFlow team?', type: 'ai' },
              { speaker: 'SARAH J.', time: '00:45', text: 'Implementation latency. We can\'t have more than a 48-hour buffer on the sales floor systems. It\'s non-negotiable.', type: 'user' },
              { speaker: 'OBJECTION_TRIGGER: LATENCY', type: 'status' },
              { speaker: 'ASTRA AI', time: '01:10', text: 'We solve that with a Parallel Stack. We keep the legacy node live until the Astra node is fully synchronized over a weekend. Can we bring in a Triage lead on Tuesday to map this out?', type: 'ai' },
            ].map((msg, i) => msg.type === 'status' ? (
              <div key={i} className="flex justify-center">
                <div className="bg-amber-100/50 text-amber-700 font-bold text-[8px] px-3 py-1 rounded shadow-sm border border-amber-200 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Flag size={10} fill="currentColor" /> {msg.speaker}
                </div>
              </div>
            ) : (
              <div key={i} className={`flex gap-4 max-w-[95%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                  msg.type === 'ai' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white text-indigo-600 border-slate-100 font-bold text-xs'
                }`}>
                  {msg.type === 'ai' ? <Bot size={16} /> : 'SJ'}
                </div>
                <div className={`flex flex-col gap-1.5 ${msg.type === 'user' ? 'items-end' : ''}`}>
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${msg.type === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {msg.speaker} • {msg.time}
                  </span>
                  <div className={`p-4 rounded shadow-sm text-[12px] leading-snug ${
                    msg.type === 'ai' 
                    ? 'bg-slate-50 border border-slate-200 rounded-tl-sm text-slate-700' 
                    : 'bg-indigo-600 text-white border border-indigo-700 rounded-tr-sm shadow-indigo-600/10'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-white border border-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                <Check size={14} /> Resolve
              </button>
              <button className="px-4 py-2 rounded bg-white border border-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                <Calendar size={14} /> Queue
              </button>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2 rounded bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95">
                <Phone size={14} fill="currentColor" /> Initiate Reach
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
