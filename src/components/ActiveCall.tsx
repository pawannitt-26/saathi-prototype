import React from 'react';
import { 
  PhoneOff, 
  TrendingUp, 
  Check, 
  MessageSquare, 
  BrainCircuit, 
  Zap,
  MoreVertical,
  ChevronRight,
  User,
  Bot
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ActiveCallView() {
  const transcriptSteps = [
    { label: 'OPENER', status: 'completed' },
    { label: 'PITCH', status: 'completed' },
    { label: 'OBJECTION', status: 'active' },
    { label: 'QUALIFICATION', status: 'upcoming' },
    { label: 'CLOSE', status: 'upcoming' },
  ];

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-[600px] animate-in fade-in slide-in-from-right-2 duration-500">
      {/* Top Meta Strip */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-indigo-600">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Rohan Mehta</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] text-slate-500 tracking-tight uppercase">+91 98200 12345</span>
              <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold">WARM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Live Score</span>
            <div className="flex items-center gap-1 text-indigo-600">
              <TrendingUp size={14} className="text-amber-500" />
              <span className="text-xl font-bold tracking-tighter">78</span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-slate-100"></div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="font-mono text-base font-bold text-slate-900 tracking-tighter">03:42</span>
            </div>
          </div>

          <button className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded text-[10px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-500/10 uppercase tracking-widest">
            <PhoneOff size={14} fill="currentColor" />
            <span>Terminate</span>
          </button>
        </div>
      </div>

      {/* Call Stage Progress */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-3.5 left-0 w-full h-[1px] bg-slate-100 -z-0"></div>
          <div className="absolute top-3.5 left-0 w-1/2 h-[1px] bg-indigo-600 -z-0"></div>
          
          {transcriptSteps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
              <div className={`w-7 h-7 rounded-[4px] border flex items-center justify-center transition-all ${
                step.status === 'completed' 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                : step.status === 'active' 
                ? 'bg-white border-indigo-600 text-indigo-600 font-bold' 
                : 'bg-white border-slate-100 text-slate-300'
              }`}>
                {step.status === 'completed' ? <Check size={14} /> : <span className="text-[11px] font-bold font-mono">{idx + 1}</span>}
                {step.status === 'active' && <div className="absolute inset-0 rounded-[4px] animate-ping bg-indigo-600/10"></div>}
              </div>
              <span className={`text-[9px] font-bold tracking-tight uppercase ${
                step.status === 'completed' || step.status === 'active' ? 'text-indigo-600' : 'text-slate-400'
              }`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout: Transcript & AI Brain */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Pane: Live Transcript */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Transcript Log</h3>
            <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded border border-slate-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Sync Active</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/20">
            {/* AI Message */}
            <div className="flex gap-3 max-w-[90%]">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Bot size={14} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Astra AI • 03:15</span>
                <div className="bg-white border border-slate-200 p-3 rounded rounded-tl-none shadow-sm text-[12px] text-slate-700 leading-normal">
                  Got it, Rohan. I understand budget is a concern right now. Just to clarify, are you looking for a more flexible payment plan, or is the overall total cost the main hurdle?
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-3 max-w-[90%] self-end flex-row-reverse">
              <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                <User size={14} />
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Retail Core • 03:22</span>
                <div className="bg-slate-900 text-white p-3 rounded rounded-tr-none text-[12px] leading-normal shadow-lg shadow-slate-900/10">
                  Total cost to theek hai, but immediate payout thoda zyada lag raha hai. Agar monthly kuch ho sakta toh better rehta.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: AI Assistant Brain */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900 text-white rounded-lg p-5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center gap-4 w-full text-center">
              <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">Processing Signal</span>
              <div className="flex items-end justify-center gap-1 h-10 w-full">
                {[10, 24, 38, 18, 30, 12, 22, 16, 32].map((h, i) => (
                  <motion.div 
                    key={i} 
                    className="w-1 bg-indigo-500 rounded-full"
                    animate={{ height: [h, h*0.5, h*1.1, h] }}
                    transition={{ repeat: Infinity, duration: 0.8 + i*0.1 }}
                  />
                ))}
              </div>
              <div className="text-[12px] font-bold text-white px-3 py-1 rounded border border-white/10 bg-white/5 uppercase tracking-tight">
                Contextualizing Intent
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col p-5">
            <h3 className="text-[10px] font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Zap size={14} className="text-amber-500" />
              Live Entity Extraction
            </h3>
            
            <div className="space-y-4 flex-1">
              {[
                { label: 'Primary Node', value: 'Capital Constraint', type: 'error' },
                { label: 'Sentiment Index', value: 'Positive Drift', type: 'info' },
                { label: 'Trigger Event', value: 'EMI Request', type: 'normal' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{item.label}</span>
                  <span className={`font-mono text-[10px] font-bold ${
                    item.type === 'error' ? 'text-rose-600' : item.type === 'info' ? 'text-indigo-600' : 'text-slate-700'
                  }`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-slate-50 rounded p-4 border border-slate-100">
              <div className="text-[9px] font-bold text-indigo-600 mb-2 uppercase tracking-widest flex items-center gap-1">
                <BrainCircuit size={12} />
                Calculated Response
              </div>
              <p className="text-[11px] text-slate-700 font-bold leading-tight">
                Deploy <span className="text-indigo-600">Retail Flex EMI</span> (12mo Tenure). Targeted conversion path: <span className="underline decoration-indigo-200 underline-offset-2">Zero-Cost incentive.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
