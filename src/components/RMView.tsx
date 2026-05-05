import React from 'react';
import { 
  Calendar, 
  Search, 
  Bell, 
  Settings, 
  Plus, 
  ChevronRight, 
  MessageSquare, 
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';

export default function RMView() {
  const hotLeads = [
    { name: 'Michael Sterling', time: 'Assigned 10m ago', source: 'SAATHI Inbound', value: '$150,000+' },
    { name: 'Sarah Jenkins', time: 'Assigned 45m ago', source: 'SAATHI Outbound', value: '$85,000' },
    { name: 'TechCorp Solutions', time: 'Assigned 1h ago', source: 'Marketing Web', value: '$250,000+' },
    { name: 'David Chen', time: 'Assigned 2h ago', source: 'SAATHI Inbound', value: '$120,000' },
  ];

  const tasks = [
    { title: 'Follow up call', time: '10:30 AM', desc: 'Discuss proposal with Emma Watson', urgent: true },
    { title: 'Send Contract', time: '2:00 PM', desc: 'Finalize terms for Acme Corp upgrade', urgent: false },
    { title: 'Review AI Transcript', time: '4:30 PM', desc: 'Analyze objections from Robert King', urgent: false },
  ];

  return (
    <div className="space-y-6 flex-1">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-0.5 tracking-tight">Institutional Queue</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">High-Intent Wealth Management Assignments</p>
        </div>
        <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px] bg-white px-3 py-1.5 rounded border border-slate-200 uppercase font-bold tracking-wider">
          <Calendar size={14} />
          <span>Oct 24 • Market Open</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-[500px]">
        {/* Action Required Table */}
        <section className="xl:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Triage Queue</h3>
              <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                HOT LEADS
              </span>
            </div>
            <button className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:underline">Full Directory</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/30 sticky top-0 z-10 border-b border-slate-100">
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-2.5">Lead Identity</th>
                  <th className="px-6 py-2.5">Source Node</th>
                  <th className="px-6 py-2.5">NAV Est.</th>
                  <th className="px-6 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[12px]">
                {hotLeads.map((lead, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
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
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all">
                          <MessageSquare size={14} />
                        </button>
                        <button className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-bold shadow-sm hover:bg-slate-800 transition-all uppercase tracking-wider">
                          <Phone size={12} fill="currentColor" />
                          Connect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Due Today Tasks */}
        <section className="xl:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calendar Events</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group cursor-pointer">
                <div className="mt-0.5">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
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

      {/* Recently Assigned Queue */}
      <section className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Assignment Logic</h3>
          <div className="flex gap-1.5">
            <button className="p-1 px-2 rounded border border-slate-200 text-slate-400 hover:text-slate-800 bg-white transition-all shadow-sm">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button className="p-1 px-2 rounded border border-slate-200 text-slate-400 hover:text-slate-800 bg-white transition-all shadow-sm">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
          {[
            { name: 'Jessica Alba', type: 'WARM POOL', time: '10m ago', desc: 'Premium tier interest via SAATHI intro. Callback required.', color: 'border-t-indigo-500' },
            { name: 'Global Logistics', type: 'COLD POOL', time: '45m ago', desc: 'Web inquiry. SAATHI attempted contact, left voicemail.', color: 'border-t-slate-300' },
            { name: 'Thomas Wright', type: 'WARM POOL', time: '2h ago', desc: 'Returning customer explorations. Campaign engagement.', color: 'border-t-indigo-500' },
          ].map((card, i) => (
            <div key={i} className={`min-w-[280px] bg-white border border-slate-200 rounded-lg p-4 shadow-sm snap-start hover:shadow-md transition-all cursor-pointer border-t-4 ${card.color}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border shadow-sm ${
                  card.type === 'WARM POOL' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {card.type}
                </span>
                <span className="text-slate-300 text-[10px] font-bold font-mono uppercase tracking-tighter">{card.time}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1 tracking-tight">{card.name}</h4>
              <p className="text-[11px] font-medium text-slate-400 mb-4 leading-tight line-clamp-2">{card.desc}</p>
              <button className="w-full py-1.5 font-bold text-[9px] uppercase tracking-widest text-indigo-600 bg-slate-50 rounded border border-slate-200 hover:bg-indigo-600 hover:text-white transition-all">
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
