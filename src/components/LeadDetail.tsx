import React, { useEffect, useState } from 'react';
import { 
  ChevronRight, 
  Edit3, 
  Phone, 
  MessageSquare, 
  Copy, 
  AlertCircle, 
  Clock, 
  FileText,
  Calendar,
  Flag,
  Bot
} from 'lucide-react';
import { fetchLeadDetail, type LeadDetailDto } from '../api/client';

export default function LeadDetailView({ leadId }: { leadId: string | null }) {
  const [data, setData] = useState<LeadDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) {
      setData(null);
      setError(null);
      return;
    }
    setError(null);
    setData(null);
    let cancelled = false;
    fetchLeadDetail(leadId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  if (!leadId) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-medium">
        Select a lead from the pipeline to view detail.
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-rose-600 text-sm font-bold">{error}</div>;
  }

  if (!data) {
    return <div className="p-6 text-slate-400 text-sm">Loading…</div>;
  }

  const { lead, summary, recommended_opener, objections, transcript } = data;
  const initials = lead.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex-1 flex flex-col gap-4 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="hover:text-indigo-600 transition-colors">Client Directory</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900">{lead.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-bold text-slate-300 tracking-widest">ID: {lead.id.slice(0, 8)}</span>
          <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Edit3 size={12} /> 
            <span>Annotate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 h-full min-h-[700px]">
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-lg border border-slate-100 shadow-inner shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">{lead.name}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{lead.profession}</p>
                  <p className="text-[10px] text-indigo-600 font-bold flex items-center gap-2 mt-1 uppercase tracking-tight">
                    {lead.location}
                  </p>
                </div>
              </div>
              <span className="bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-widest shadow-sm">
                {lead.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-50">
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                <p className="font-mono text-[10px] font-bold text-slate-900 tracking-tight">{lead.phone}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Score</p>
                <p className="text-[10px] font-bold text-slate-900 tracking-tight">{lead.score}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-5 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">RM Opener</span>
            </div>
            <p className="text-[13px] font-bold text-white/90 leading-snug tracking-tight">
              {recommended_opener || 'Complete a Saathi call to generate a recommended opener.'}
            </p>
            <button 
              type="button"
              className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded border border-white/10 transition-all"
              onClick={() => recommended_opener && navigator.clipboard.writeText(recommended_opener)}
            >
              <Copy size={12} /> 
              <span>Copy opener</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
              <FileText size={14} />
              Session Abstract
            </h3>
            <p className="text-[12px] font-bold text-slate-600 leading-normal border-l-2 border-slate-100 pl-3 py-0.5">
              {summary || 'No completed session summary yet.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle size={14} />
              Objections
            </h3>
            <div className="flex flex-col gap-2">
              {objections.length === 0 ? (
                <span className="text-[10px] text-slate-400">—</span>
              ) : (
                objections.map((obj, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-sm border border-slate-50 bg-slate-50/50">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">
                      {(obj.label || obj.text || 'Concern') as string}
                    </span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm bg-slate-200 text-slate-800">
                      {(obj.status || 'NOTED') as string}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-8 bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm overflow-hidden h-full">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <MessageSquare size={16} className="text-indigo-600" />
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Interaction Log</h2>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1.5"><Clock size={14} /> Latest</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> CRM</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white/50">
            {transcript.length === 0 ? (
              <p className="text-xs text-slate-400">No transcript yet.</p>
            ) : (
              transcript.map((msg, i) =>
                msg.type === 'status' ? (
                  <div key={i} className="flex justify-center">
                    <div className="bg-amber-100/50 text-amber-700 font-bold text-[8px] px-3 py-1 rounded shadow-sm border border-amber-200 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Flag size={10} fill="currentColor" /> {msg.speaker}
                    </div>
                  </div>
                ) : (
                  <div key={i} className={`flex gap-4 max-w-[95%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                      msg.type === 'ai' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white text-indigo-600 border-slate-100 font-bold text-xs'
                    }`}>
                      {msg.type === 'ai' ? <Bot size={16} /> : initials[0]}
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
                )
              )
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white flex justify-end items-center">
            <button type="button" className="px-5 py-2 rounded bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95">
              <Phone size={14} fill="currentColor" /> Initiate Reach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
