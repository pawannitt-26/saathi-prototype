import React from 'react';
import { 
  TrendingUp, 
  PhoneCall, 
  Flame, 
  Timer,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Zap,
  PhoneMissed,
  CheckCircle2
} from 'lucide-react';
import { View } from '../types';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export default function DashboardView({ onNavigate }: DashboardProps) {
  const metrics = [
    { label: 'Conversion Rate', value: '40%', change: '+2.4%', trend: 'up', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'Active Calls', value: '12', subValue: 'live agents', icon: PhoneCall, color: 'text-white bg-slate-900 border-slate-900', active: true },
    { label: 'Hot Leads Today', value: '48', subValue: 'Action required', icon: Flame, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Risk Profile', value: 'Mod-High', subValue: 'Institutional', icon: Timer, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  ];

  const activities = [
    { icon: PhoneCall, title: 'Call completed with Rahul Sharma', desc: '4m 12s • AI Agent pricing handling.', time: 'Just now', color: 'bg-emerald-500' },
    { icon: Flame, title: 'Lead marked HOT by SAATHI', desc: 'High intent in transcript analysis.', time: '2m ago', color: 'bg-amber-500' },
    { icon: Mail, title: 'WhatsApp follow-up sent', desc: 'Sent brochure to Anjali Desai.', time: '15m ago', color: 'bg-indigo-500' },
    { icon: PhoneMissed, title: 'Missed call from +91 98765 43210', desc: 'Auto-callback in 10 mins.', time: '32m ago', color: 'bg-slate-300' },
  ];

  return (
    <div className="space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Institutional Overview</h2>
          <p className="text-xs text-slate-400 font-medium">Performance summary across all AI-driven engagement channels.</p>
        </div>
        <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest bg-white px-3 py-1.5 rounded border border-slate-200">
          <Timer size={14} />
          Session Active • 04:12:00
        </div>
      </div>

      {/* Top Metrics Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className={`bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex flex-col justify-between h-[110px]`}>
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
              <div className={`w-8 h-8 rounded flex items-center justify-center relative overflow-hidden border ${metric.color}`}>
                <metric.icon size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tighter">{metric.value}</span>
              {metric.change && <span className="text-[10px] font-bold text-emerald-600">{metric.change}</span>}
              {metric.subValue && <span className="text-[10px] text-slate-400 font-medium">{metric.subValue}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[420px]">
        {/* Funnel Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Asset Conversion Funnel</h3>
            <button 
              onClick={() => onNavigate('analytics')}
              className="text-[10px] font-bold text-indigo-600 hover:underline"
            >
              Export Analytics
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4 px-8 py-6">
            {[
              { label: 'Total Contacts', value: '1,240', width: '100%', opacity: 0.05 },
              { label: 'Engaged', value: '930', width: '75%', opacity: 0.1 },
              { label: 'Qualified (SAATHI)', value: '682', width: '55%', opacity: 0.2 },
              { label: 'RM Handoff', value: '496', width: '40%', opacity: 1, solid: true },
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase" style={{ width: step.width }}>
                  <span>{step.label}</span>
                  <span className="font-mono">{step.value}</span>
                </div>
                <div 
                  className={`h-8 rounded-sm overflow-hidden transition-all duration-500 flex items-center ${step.solid ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-slate-100 border border-slate-200/50'}`}
                  style={{ width: step.width }}
                >
                  {!step.solid && <div className="h-full bg-indigo-500" style={{ opacity: step.opacity }}></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Distribution */}
        <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Portfolio Sentiment</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6 px-6">
            {[
              { label: 'HOT', value: '25%', color: 'bg-amber-500' },
              { label: 'WARM', value: '45%', color: 'bg-indigo-500' },
              { label: 'COLD', value: '30%', color: 'bg-slate-300' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                  <span className="font-mono text-xs font-bold text-slate-800 italic">{item.value}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex items-center border border-slate-200/20">
                  <div 
                    className={`${item.color} h-full transition-all duration-700 ease-in-out`} 
                    style={{ width: item.value }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">System Events</h3>
          </div>
          <button className="text-[10px] font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest">
            Detailed Log
          </button>
        </div>
        <div className="divide-y divide-slate-50 h-[280px] overflow-y-auto custom-scrollbar">
          {activities.map((item, i) => (
            <div key={i} className="px-6 py-3 hover:bg-slate-50/50 transition-all flex items-center gap-4 group">
              <div className={`w-1 h-8 rounded-full ${item.color} flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">{item.title}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{item.desc}</p>
              </div>
              <span className="font-mono text-[10px] font-bold text-slate-300 flex-shrink-0 tracking-tighter">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
