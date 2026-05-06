import React, { useEffect, useState } from 'react';
import { 
  Download, 
  Calendar, 
  TrendingDown, 
  Info,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { fetchAnalytics, type AnalyticsDto } from '../api/client';

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return <div className="p-6 text-rose-600 text-sm font-bold">{error}</div>;
  }

  const funnelSteps = data?.funnel_steps ?? [];
  const attrition = data?.attrition ?? [];
  const objections = data?.objections ?? [];
  const languageSplit = data?.language_split ?? [];

  return (
    <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-0.5 tracking-tight">Institutional Analytics</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion funnel from live CRM.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95">
            <Calendar size={14} />
            MTD Performance
          </button>
          <button type="button" className="px-4 py-2 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-2 active:scale-95">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-10 px-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Efficiency Funnel</h2>
            <span className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded border border-slate-200 uppercase">Live</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-between py-2 space-y-3">
            {funnelSteps.map((step, idx) => (
              <React.Fragment key={String(step.id ?? idx)}>
                <div className={`relative mx-auto h-12 rounded-sm transition-all duration-500 flex items-center px-6 justify-between group cursor-help border ${
                  step.solid ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-indigo-50/20 border-indigo-100/50 hover:bg-indigo-50/40'
                }`} style={{ width: typeof step.width === 'string' ? step.width : '100%' }}>
                  <div className="flex items-center gap-4 w-1/3">
                    <span className={`font-mono text-[11px] font-bold ${step.solid ? 'text-indigo-400' : 'text-indigo-600'}`}>{step.id}</span>
                    <span className="text-[11px] font-bold uppercase tracking-tight truncate">{String(step.label)}</span>
                  </div>
                  <div className="w-1/3 text-center">
                    <span className="font-mono text-sm font-bold tracking-tighter">{String(step.value)}</span>
                  </div>
                  <div className="w-1/3 text-right">
                    <span className="text-[10px] font-bold opacity-60 uppercase">{String(step.percentage ?? '')}</span>
                  </div>
                </div>

                {step.dropoff && (
                  <div className="flex justify-end relative z-10 -my-2.5" style={{ width: typeof step.width === 'string' ? step.width : '100%' }}>
                    <div className="bg-rose-50 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-rose-100 flex items-center gap-1 transform translate-x-8 uppercase tracking-tighter">
                      <TrendingDown size={12} />
                      {String(step.dropoff)} Attrition
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <Info size={14} className="text-indigo-500" />
              Distribution
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Lead outcomes</p>
          </div>
          
          <div className="flex-1 space-y-4">
            {attrition.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 group transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-800 uppercase">{String(item.label)}</span>
                  <span className="font-mono text-[11px] font-bold text-rose-600">{String(item.loss)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: item.loss }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-indigo-500 h-full rounded-full"
                  />
                </div>
                <p className="text-[9px] font-medium text-slate-400 mt-2 leading-tight uppercase tracking-tighter">{String(item.desc)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Objection Matrix</h2>
            <span className="text-[9px] font-bold text-slate-300">Sample mix</span>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {objections.map((obj, i) => (
              <div key={i} className="group flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-600 uppercase w-24 shrink-0">{obj.label}</span>
                <div className="flex-1 bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: obj.width }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="bg-indigo-600 h-full rounded-full"
                  />
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-400 w-10 text-right">{obj.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Regional / Language (demo)</h2>
            <Globe size={14} className="text-slate-300" />
          </div>
          
          <div className="flex-1 flex items-center justify-center gap-8">
            <div className="grid grid-cols-2 gap-4 flex-1">
              {languageSplit.map((item, i) => (
                <div key={i} className="flex flex-col p-3 bg-slate-50 rounded-sm border border-slate-100">
                   <div className="flex items-center gap-2 mb-1">
                     <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
                     <span className="text-[10px] font-bold text-slate-800 uppercase">{item.label}</span>
                   </div>
                   <span className="font-mono text-xl font-bold text-slate-900 tracking-tighter">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
