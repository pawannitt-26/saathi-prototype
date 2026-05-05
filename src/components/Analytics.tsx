import React from 'react';
import { 
  Download, 
  Calendar, 
  TrendingDown, 
  MoreVertical, 
  Info,
  TrendingUp,
  Globe,
  Flag
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AnalyticsView() {
  const funnelSteps = [
    { id: '01', label: 'Total Leads Contacted', value: '12,450', percentage: '100%', dropoff: '-18%', width: '100%', opacity: 0.1 },
    { id: '02', label: 'AI Engagement', value: '10,209', percentage: '82%', dropoff: '-45%', width: '82%', opacity: 0.15 },
    { id: '03', label: 'Qualified (Hot/Warm)', value: '4,594', percentage: '37%', dropoff: '-12%', width: '45%', opacity: 0.3 },
    { id: '04', label: 'RM Hand-off', value: '3,102', percentage: '25%', width: '33%', opacity: 0.6 },
    { id: '05', label: 'Converted', value: '1,405', width: '15%', opacity: 1, solid: true },
  ];

  return (
    <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-0.5 tracking-tight">Institutional Analytics</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time breakdown of conversion rates and drop-off analysis.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95">
            <Calendar size={14} />
            MTD Performance
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-2 active:scale-95">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Funnel Chart */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-10 px-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Efficiency Funnel</h2>
            <span className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded border border-slate-200 uppercase">Aggregated Sources</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-between py-2 space-y-3">
            {funnelSteps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className={`relative mx-auto h-12 rounded-sm transition-all duration-500 flex items-center px-6 justify-between group cursor-help border ${
                  step.solid ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-indigo-50/20 border-indigo-100/50 hover:bg-indigo-50/40'
                }`} style={{ width: step.width }}>
                  <div className="flex items-center gap-4 w-1/3">
                    <span className={`font-mono text-[11px] font-bold ${step.solid ? 'text-indigo-400' : 'text-indigo-600'}`}>{step.id}</span>
                    <span className="text-[11px] font-bold uppercase tracking-tight truncate">{step.label}</span>
                  </div>
                  <div className="w-1/3 text-center">
                    <span className="font-mono text-sm font-bold tracking-tighter">{step.value}</span>
                  </div>
                  <div className="w-1/3 text-right">
                    <span className="text-[10px] font-bold opacity-60 uppercase">{step.percentage || '100%'}</span>
                  </div>
                </div>

                {step.dropoff && (
                  <div className="flex justify-end relative z-10 -my-2.5" style={{ width: step.width }}>
                    <div className="bg-rose-50 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-rose-100 flex items-center gap-1 transform translate-x-8 uppercase tracking-tighter">
                      <TrendingDown size={12} />
                      {step.dropoff} Attrition
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <Info size={14} className="text-indigo-500" />
              Attrition Points
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Exit Node Distribution</p>
          </div>
          
          <div className="flex-1 space-y-4">
            {[
              { label: 'Screening to Qualified', loss: '45%', color: 'bg-rose-500', desc: 'Leads failing MFD criteria during AI screening.' },
              { label: 'Outreach to Screening', loss: '18%', color: 'bg-amber-500', desc: 'No-response nodes / immediate hangups.' },
              { label: 'Hand-off to Closure', loss: '12%', color: 'bg-slate-400', desc: 'RM interaction phase drop-offs.' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 group transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-800 uppercase">{item.label}</span>
                  <span className="font-mono text-[11px] font-bold text-rose-600">{item.loss}</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: item.loss }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`${item.color} h-full rounded-full`}
                  />
                </div>
                <p className="text-[9px] font-medium text-slate-400 mt-2 leading-tight uppercase tracking-tighter">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Objection Frequency */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Objection Matrix</h2>
            <span className="text-[9px] font-bold text-slate-300">N=5,465</span>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {[
              { label: 'Asset Custody', value: '42%', width: '42%', color: 'bg-indigo-600' },
              { label: 'Risk Aversion', value: '28%', width: '28%', color: 'bg-indigo-500' },
              { label: 'Scheduling', value: '15%', width: '15%', color: 'bg-indigo-400' },
              { label: 'Pricing Model', value: '10%', width: '10%', color: 'bg-indigo-300' },
            ].map((obj, i) => (
              <div key={i} className="group flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-600 uppercase w-24 shrink-0">{obj.label}</span>
                <div className="flex-1 bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: obj.width }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`${obj.color} h-full rounded-full`}
                  />
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-400 w-10 text-right">{obj.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Regional Distribution</h2>
            <Globe size={14} className="text-slate-300" />
          </div>
          
          <div className="flex-1 flex items-center justify-center gap-8">
            <div className="grid grid-cols-2 gap-4 flex-1">
              {[
                { label: 'Domestic (EN)', value: '55%', color: 'bg-slate-900' },
                { label: 'Regional (HI)', value: '25%', color: 'bg-indigo-600' },
                { label: 'Regional (MH)', value: '15%', color: 'bg-indigo-400' },
                { label: 'Global (CH)', value: '5%', color: 'bg-indigo-200' },
              ].map((item, i) => (
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
