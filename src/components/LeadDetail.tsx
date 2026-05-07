import React, { useEffect, useRef, useState } from 'react';
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
  Bot,
  Volume2,
  ChevronDown,
} from 'lucide-react';
import { fetchLeadDetail, type LeadDetailDto, type TranscriptRowDto } from '../api/client';
import { View } from '../types';

/** Convert a stored base64 audio string to an object URL for reliable playback. */
function b64ToObjectUrl(b64: string, mime: string): string {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([arr], { type: mime }));
}

function StoredAudioPlayer({ msg }: { msg: TranscriptRowDto }) {
  const objUrlRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);

  if (!msg.audio_b64 || !msg.audio_mime) return null;

  const getSrc = () => {
    if (!objUrlRef.current) {
      objUrlRef.current = b64ToObjectUrl(msg.audio_b64!, msg.audio_mime!);
    }
    return objUrlRef.current;
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
      >
        <Volume2 size={14} className="text-blue-600 shrink-0" aria-hidden />
        <span>{open ? 'Hide voice reply' : 'Play voice reply'}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <audio
          src={getSrc()}
          controls
          autoPlay
          className="mt-3 w-full max-w-md h-9 rounded-lg accent-blue-600"
          playsInline
        />
      )}
    </div>
  );
}

interface LeadDetailProps {
  leadId: string | null;
  onNavigate: (view: View, leadId?: string) => void;
}

export default function LeadDetailView({ leadId, onNavigate }: LeadDetailProps) {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between gap-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest min-w-0">
          <span className="hover:text-indigo-600 transition-colors shrink-0">Client Directory</span>
          <ChevronRight size={14} className="text-slate-300 shrink-0" aria-hidden />
          <span className="text-slate-900 min-w-0 break-words">{lead.name}</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
          <span className="font-mono text-[10px] font-bold text-slate-300 tracking-widest truncate text-left sm:text-right order-2 sm:order-1">
            ID: {lead.id.slice(0, 8)}
          </span>
          <button type="button" className="flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm order-1 sm:order-2 w-full sm:w-auto">
            <Edit3 size={12} /> 
            <span>Annotate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 lg:min-h-[620px]">
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

        <div className="col-span-1 lg:col-span-8 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden min-h-[320px] lg:min-h-0 lg:h-full">
          <div className="px-5 py-3.5 border-b border-slate-200/90 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                <MessageSquare size={18} className="text-blue-600" aria-hidden />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Interaction log</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Transcript from the latest session</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" aria-hidden /> Chronological
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" aria-hidden /> CRM
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6 sm:py-8 space-y-6 custom-scrollbar bg-slate-50/60">
            {transcript.length === 0 ? (
              <p className="text-sm text-slate-500 font-medium text-center py-12">No transcript yet.</p>
            ) : (
              transcript.map((msg, i) =>
                msg.type === 'status' ? (
                  <div key={i} className="flex justify-center py-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold px-4 py-1.5 border border-amber-200/80 shadow-sm">
                      <Flag size={12} className="text-amber-600 shrink-0" fill="currentColor" aria-hidden />
                      <span className="tracking-tight">{msg.speaker}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className={`flex gap-3 sm:gap-4 w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex gap-2 sm:gap-4 w-full max-w-full sm:max-w-[min(100%,40rem)] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                          msg.type === 'ai'
                            ? 'bg-slate-900 border-slate-800 text-white'
                            : 'bg-white text-blue-700 border-slate-200 font-bold text-sm'
                        }`}
                      >
                        {msg.type === 'ai' ? <Bot size={18} aria-hidden /> : <span aria-hidden>{initials[0]}</span>}
                      </div>
                      <div className={`flex min-w-0 flex-col gap-2 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium ${
                            msg.type === 'user' ? 'justify-end text-right' : ''
                          }`}
                        >
                          <span className={msg.type === 'user' ? 'text-slate-700' : 'text-slate-600'}>{msg.speaker}</span>
                          <span className="text-slate-400 font-normal tabular-nums" aria-hidden>
                            ·
                          </span>
                          <time className="text-slate-400 font-normal tabular-nums">{msg.time}</time>
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-sm leading-relaxed shadow-sm border ${
                            msg.type === 'ai'
                              ? 'bg-white text-slate-800 border-slate-200/90 rounded-tl-md shadow-slate-200/40'
                              : 'bg-blue-700 text-white border-blue-800/80 rounded-tr-md shadow-blue-900/15'
                          }`}
                        >
                          <p className="whitespace-pre-wrap wrap-break-word font-normal tracking-tight">{msg.text}</p>
                          {msg.type === 'ai' && <StoredAudioPlayer msg={msg} />}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('active-call', lead.id)}
              className="px-5 py-2.5 rounded bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 w-full sm:w-auto"
            >
              <Phone size={14} fill="currentColor" /> Initiate Reach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
