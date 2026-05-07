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

/** Tapered width from API, but never so narrow that labels stack letter-by-letter */
function funnelDisplayWidth(width: unknown, isFirstStep: boolean): string {
  if (isFirstStep) return '100%';
  if (typeof width !== 'string' || !width.endsWith('%')) return '100%';
  const n = Number.parseInt(width.replace('%', '').trim(), 10);
  if (Number.isNaN(n)) return '100%';
  return `${Math.max(22, Math.min(100, n))}%`;
}

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
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-0.5 tracking-tight">Institutional Analytics</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion funnel from live CRM.</p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-stretch">
          <button type="button" className="w-full sm:w-auto justify-center px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95">
            <Calendar size={14} />
            MTD Performance
          </button>
          <button type="button" className="w-full sm:w-auto justify-center px-4 py-2 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-2 active:scale-95">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-2 mb-6 sm:mb-10 px-0 sm:px-2 flex-wrap">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Efficiency Funnel</h2>
            <span className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded border border-slate-200 uppercase">Live</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-x-auto">
            {funnelSteps.map((step, idx) => {
              const isFirst = idx === 0;
              const barWidth = funnelDisplayWidth(step.width, isFirst);
              return (
              <React.Fragment key={String(step.id ?? idx)}>
                <div
                  className={`relative mx-auto min-h-12 rounded-lg transition-all duration-500 grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-3 items-center px-4 sm:px-6 py-3 group cursor-help border ${
                  step.solid ? 'bg-slate-900 text-white border-slate-800 shadow-lg' : 'bg-indigo-50/30 border-indigo-100/70 hover:bg-indigo-50/50'
                }`}
                  style={{
                    width: barWidth,
                    maxWidth: '100%',
                    minWidth: 'min(100%, 15.5rem)',
                  }}
                >
                  <span className={`font-mono text-[11px] font-bold tabular-nums ${step.solid ? 'text-sky-400' : 'text-indigo-600'}`}>
                    {String(step.id)}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-tight leading-normal min-w-0 ${step.solid ? 'text-white' : 'text-slate-800'}`}
                  >
                    {String(step.label)}
                  </span>
                  <span className={`font-mono text-sm font-bold tracking-tight tabular-nums text-right ${step.solid ? 'text-white' : 'text-slate-900'}`}>
                    {String(step.value)}
                  </span>
                  <span className={`text-[10px] font-bold tabular-nums uppercase tracking-wide text-right ${step.solid ? 'text-slate-300' : 'text-slate-500'}`}>
                    {String(step.percentage ?? '')}
                  </span>
                </div>

                {step.dropoff && (
                  <div className="flex justify-end w-full max-w-full px-2 -my-1">
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 text-rose-700 text-[9px] font-bold px-2.5 py-1 border border-rose-100 shadow-sm uppercase tracking-wide">
                      <TrendingDown size={12} className="shrink-0" aria-hidden />
                      {String(step.dropoff)} attrition
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
            })}
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
              <div key={i} className="group flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-[10px] font-bold text-slate-600 uppercase sm:w-28 shrink-0">{obj.label}</span>
                <div className="flex-1 bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100 min-w-0 w-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: obj.width }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="bg-indigo-600 h-full rounded-full"
                  />
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-400 sm:w-10 text-left sm:text-right shrink-0">{obj.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Regional / Language (demo)</h2>
            <Globe size={14} className="text-slate-300" />
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row items-stretch justify-center gap-6 sm:gap-8 min-w-0">
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
