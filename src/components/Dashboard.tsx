import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  TrendingUp, 
  PhoneCall, 
  Flame, 
  Timer,
  Mail,
  PhoneMissed,
  RefreshCw,
} from 'lucide-react';
import { View } from '../types';
import { fetchActivities, fetchDashboardMetrics, type ActivityDto, type DashboardMetricsDto } from '../api/client';

interface DashboardProps {
  onNavigate: (view: View, leadId?: string) => void;
}

const iconFor = (e: ActivityDto) => {
  if (e.event_type === 'whatsapp_sent') return Mail;
  if (e.event_type === 'rm_handoff') return Flame;
  if (e.title.toLowerCase().includes('missed')) return PhoneMissed;
  return PhoneCall;
};

const colorFor = (e: ActivityDto) => {
  if (e.event_type === 'whatsapp_sent') return 'bg-indigo-500';
  if (e.event_type === 'rm_handoff') return 'bg-amber-500';
  if (e.event_type === 'call_completed') return 'bg-emerald-500';
  return 'bg-slate-400';
};

const REFRESH_INTERVAL_MS = 30_000;

export default function DashboardView({ onNavigate }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetricsDto | null>(null);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [m, a] = await Promise.all([fetchDashboardMetrics(), fetchActivities()]);
      setMetrics(m);
      setActivities(a);
      setLastUpdated(new Date());
      setSecondsAgo(0);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 30 s
  useEffect(() => {
    void load();
    intervalRef.current = setInterval(() => void load(), REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  // Tick "X seconds ago" counter
  useEffect(() => {
    if (!lastUpdated) return;
    const id = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 5000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  const funnel = metrics?.funnel ?? [];
  const sentiment = metrics?.sentiment ?? { HOT: '0%', WARM: '0%', COLD: '0%' };

  return (
    <div className="space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Institutional Overview</h2>
          <p className="text-xs text-slate-400 font-medium">Performance summary across SAATHI voice sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] font-medium text-slate-400">
              {secondsAgo < 10 ? 'just now' : `${secondsAgo}s ago`}
            </span>
          )}
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            title="Refresh metrics"
            className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest bg-white px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-bold">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Conversion Rate (proxy)', value: metrics?.conversion_rate ?? '—', change: '', trend: 'up', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { label: 'Active Calls', value: String(metrics?.active_calls ?? 0), subValue: lastUpdated ? (secondsAgo < 10 ? 'live · just now' : `live · ${secondsAgo}s ago`) : 'live sessions', icon: PhoneCall, color: 'text-white bg-slate-900 border-slate-900', active: true },
          { label: 'Hot Leads', value: String(metrics?.hot_leads_today ?? 0), subValue: 'current snapshot', icon: Flame, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Sentiment HOT', value: sentiment.HOT ?? '0%', subValue: 'of base', icon: Timer, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        ].map((metric, i) => (
          <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex flex-col justify-between h-[110px]">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                {'active' in metric && metric.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                )}
                {metric.label}
              </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[420px]">
        <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Asset Conversion Funnel</h3>
            <button 
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-[10px] font-bold text-indigo-600 hover:underline"
            >
              Export Analytics
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4 px-8 py-6">
            {funnel.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase" style={{ width: step.width }}>
                  <span>{step.label}</span>
                  <span className="font-mono">{step.value}</span>
                </div>
                <div className="h-8 rounded-sm overflow-hidden transition-all duration-500 flex items-center bg-slate-100 border border-slate-200/50" style={{ width: step.width }}>
                  <div className="h-full bg-indigo-500 opacity-90 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Portfolio Sentiment</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6 px-6">
            {[
              { label: 'HOT', value: sentiment.HOT || '0%', color: 'bg-amber-500' },
              { label: 'WARM', value: sentiment.WARM || '0%', color: 'bg-indigo-500' },
              { label: 'COLD', value: sentiment.COLD || '0%', color: 'bg-slate-300' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                  <span className="font-mono text-xs font-bold text-slate-800 italic">{item.value}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex items-center border border-slate-200/20">
                  <div className={`${item.color} h-full transition-all duration-700 ease-in-out`} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">System Events</h3>
          </div>
        </div>
        <div className="divide-y divide-slate-50 h-[280px] overflow-y-auto custom-scrollbar">
          {activities.length === 0 ? (
            <div className="p-6 text-xs text-slate-400 font-medium">No events yet — complete a voice session.</div>
          ) : (
            activities.map((item, i) => {
              const Icon = iconFor(item);
              return (
                <div key={i} className="px-6 py-3 hover:bg-slate-50/50 transition-all flex items-center gap-4 group">
                  <div className={`w-1 h-8 rounded-full ${colorFor(item)} flex-shrink-0 opacity-80`}></div>
                  <Icon size={16} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">{item.title}</p>
                    <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{item.description}</p>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-300 flex-shrink-0 tracking-tighter">{item.time}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
