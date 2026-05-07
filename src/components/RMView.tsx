import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  MessageSquare, 
  Phone,
  Clock,
  Briefcase
} from 'lucide-react';
import { fetchRmHot, type HotLeadRmDto } from '../api/client';
import { View } from '../types';

interface RMViewProps {
  onNavigate: (view: View, leadId?: string) => void;
}

export default function RMView({ onNavigate }: RMViewProps) {
  const [hotLeads, setHotLeads] = useState<HotLeadRmDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRmHot().then(setHotLeads).catch((e) => setError(String(e)));
  }, []);

  const tasks = [
    { title: 'Follow up call', time: '10:30 AM', desc: 'Discuss proposal with queued lead', urgent: true },
    { title: 'Review AI Transcript', time: '4:30 PM', desc: 'Hot queue from Saathi', urgent: false },
  ];

  return (
    <div className="space-y-6 flex-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-800 mb-0.5 tracking-tight">Institutional Queue</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">High-Intent Assignments</p>
        </div>
        <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px] bg-white px-3 py-1.5 rounded border border-slate-200 uppercase font-bold tracking-wider w-full sm:w-auto justify-center sm:justify-start shrink-0">
          <Calendar size={14} />
          <span>RM Dashboard</span>
        </div>
      </div>

      {error && <p className="text-rose-600 text-xs font-bold">{error}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:min-h-[28rem]">
        <section className="xl:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Triage Queue</h3>
              <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                HOT LEADS
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar min-h-[240px] max-h-[55vh] xl:max-h-none xl:min-h-0">
            <table className="w-full text-left border-collapse min-w-[36rem]">
              <thead className="bg-slate-50/30 sticky top-0 z-10 border-b border-slate-100">
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-2.5">Lead Identity</th>
                  <th className="px-6 py-2.5">Source Node</th>
                  <th className="px-6 py-2.5">NAV Est.</th>
                  <th className="px-6 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[12px]">
                {hotLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-xs">
                      No hot leads — run a qualifying call in Voice Monitor.
                    </td>
                  </tr>
                ) : (
                  hotLeads.map((lead, i) => (
                    <tr key={i} onClick={() => onNavigate('lead-detail', lead.lead_id)} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td className="px-6 py-3">
                        <div className="font-bold text-slate-800">{lead.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest leading-none">{lead.time}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <Briefcase size={12} className="text-indigo-500" />
                          {lead.source}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-mono text-[11px] font-bold text-slate-700">{lead.value}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="View AI transcript & lead detail"
                            onClick={(e) => { e.stopPropagation(); onNavigate('lead-detail', lead.lead_id); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button
                            type="button"
                            title="Start follow-up call in Voice Monitor"
                            onClick={(e) => { e.stopPropagation(); onNavigate('active-call', lead.lead_id); }}
                            className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-bold shadow-sm hover:bg-slate-800 transition-all uppercase tracking-wider"
                          >
                            <Phone size={12} fill="currentColor" />
                            Connect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="xl:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[200px] xl:min-h-0">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calendar Events</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group cursor-pointer">
                <div className="mt-0.5">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" readOnly />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-[11px] text-slate-800 leading-tight">{task.title}</h4>
                    <span className={`font-mono text-[9px] font-bold flex items-center gap-1 ${task.urgent ? 'text-rose-600' : 'text-slate-400'}`}>
                      <Clock size={10} />
                      {task.time}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] font-medium truncate leading-tight">{task.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Assignment Logic</h3>
          <div className="flex gap-1.5">
            <button type="button" className="p-1 px-2 rounded border border-slate-200 text-slate-400 hover:text-slate-800 bg-white transition-all shadow-sm">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button type="button" className="p-1 px-2 rounded border border-slate-200 text-slate-400 hover:text-slate-800 bg-white transition-all shadow-sm">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
          {hotLeads.slice(0, 3).map((card, i) => (
            <div key={i} className="min-w-[280px] bg-white border border-slate-200 rounded-lg p-4 shadow-sm snap-start hover:shadow-md transition-all cursor-pointer border-t-4 border-t-indigo-500">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border shadow-sm bg-indigo-50 text-indigo-600 border-indigo-100">
                  HOT
                </span>
                <span className="text-slate-300 text-[10px] font-bold font-mono uppercase tracking-tighter">{card.time}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1 tracking-tight">{card.name}</h4>
              <p className="text-[11px] font-medium text-slate-400 mb-4 leading-tight line-clamp-2">{card.source} · {card.value}</p>
              <button
                type="button"
                onClick={() => onNavigate('lead-detail', card.lead_id)}
                className="w-full py-1.5 font-bold text-[9px] uppercase tracking-widest text-indigo-600 bg-slate-50 rounded border border-slate-200 hover:bg-indigo-600 hover:text-white transition-all"
              >
                Review Exposure
              </button>
            </div>
          ))}

          <div className="min-w-[280px] bg-slate-50/50 border border-slate-200 border-dashed rounded-lg p-4 snap-start flex flex-col items-center justify-center text-slate-400 group hover:bg-slate-50 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ChevronRight size={18} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Queue Breakdown</span>
          </div>
        </div>
      </section>
    </div>
  );
}
