import React, { useEffect, useRef, useState } from 'react';
import { 
  PhoneOff, 
  TrendingUp, 
  User, 
  Bot, 
  Zap,
  BrainCircuit,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { fetchLeads, getAccessToken, wsBaseUrl, type LeadDto } from '../api/client';

const PHASES = ['OPENER', 'PITCH', 'OBJECTION', 'QUALIFICATION', 'CLOSE'] as const;

type Line = { id: string; speaker: 'ai' | 'user'; text: string };

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ActiveCallView({
  preferredLeadId,
}: {
  preferredLeadId?: string | null;
}) {
  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [leadId, setLeadId] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [phase, setPhase] = useState('OPENER');
  const [score, setScore] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'live' | 'ended'>('idle');
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const leadMeta = leads.find((l) => l.id === leadId);

  useEffect(() => {
    fetchLeads()
      .then((rows) => {
        setLeads(rows);
        if (preferredLeadId && rows.some((r) => r.id === preferredLeadId)) {
          setLeadId(preferredLeadId);
        } else if (rows[0]) {
          setLeadId(rows[0].id);
        }
      })
      .catch((e) => setError(String(e)));
  }, [preferredLeadId]);

  useEffect(() => {
    if (!startedAt || status !== 'live') return;
    const id = window.setInterval(() => {
      setDuration(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, status]);

  const appendLine = (speaker: 'ai' | 'user', text: string) => {
    setLines((prev) => [...prev, { id: uid(), speaker, text }]);
  };

  const connect = async () => {
    if (!leadId) return;
    setError(null);
    wsRef.current?.close();
    const token = await getAccessToken();
    if (!token) {
      setError('Please log in again to start a session.');
      return;
    }
    const ws = new WebSocket(
      `${wsBaseUrl()}/ws/call?access_token=${encodeURIComponent(token)}`
    );
    wsRef.current = ws;
    setLines([]);
    setPhase('OPENER');
    setScore(null);
    setDuration(0);
    setStatus('live');
    setStartedAt(Date.now());

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'start',
          lead_id: leadId,
          consent_recording: true,
        })
      );
    };

    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data as string) as Record<string, unknown>;
      const t = data.type as string;
      if (t === 'transcript') {
        const sp = data.speaker === 'ai' ? 'ai' : 'user';
        appendLine(sp, String(data.text ?? ''));
      }
      if (t === 'phase') setPhase(String(data.phase ?? 'OPENER'));
      if (t === 'score_partial') setScore(Number(data.total ?? 0));
      if (t === 'tts' && data.base64 && data.mime) {
        try {
          const audio = new Audio(
            `data:${String(data.mime)};base64,${String(data.base64)}`
          );
          void audio.play();
        } catch {
          /* ignore playback issues */
        }
      }
      if (t === 'call_end') {
        setStatus('ended');
        setScore(Number(data.score ?? 0));
        ws.close();
      }
      if (t === 'error') {
        appendLine('ai', `[Error] ${String(data.message ?? 'unknown')}`);
      }
    };

    ws.onerror = () => {
      setError('WebSocket failed — is the API running on ' + wsBaseUrl() + '?');
    };
  };

  const sendText = () => {
    const t = input.trim();
    if (!t || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'text', text: t }));
    setInput('');
  };

  const endCall = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_call' }));
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const phaseStatus = (p: string) => {
    const idx = PHASES.indexOf(p as (typeof PHASES)[number]);
    const cur = PHASES.indexOf(phase as (typeof PHASES)[number]);
    const safeIdx = idx < 0 ? 0 : idx;
    const safeCur = cur < 0 ? 0 : cur;
    if (safeIdx < safeCur) return 'completed';
    if (safeIdx === safeCur) return 'active';
    return 'upcoming';
  };

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-[600px] animate-in fade-in slide-in-from-right-2 duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-indigo-600">
            <User size={20} />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Lead</label>
            <select
              className="text-sm font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 bg-white"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              disabled={status === 'live'}
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.status})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void connect()}
            disabled={!leadId || status === 'live'}
            className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 text-white px-3 py-2 rounded disabled:opacity-40"
          >
            Start session
          </button>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Live Score</span>
            <div className="flex items-center gap-1 text-indigo-600">
              <TrendingUp size={14} className="text-amber-500" />
              <span className="text-xl font-bold tracking-tighter">{score ?? '—'}</span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-slate-100"></div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="font-mono text-base font-bold text-slate-900 tracking-tighter">{fmt(duration)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={endCall}
            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded text-[10px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-500/10 uppercase tracking-widest"
          >
            <PhoneOff size={14} fill="currentColor" />
            <span>End &amp; score</span>
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 font-bold px-1">{error}</p>}

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-3.5 left-0 w-full h-[1px] bg-slate-100 -z-0"></div>
          
          {PHASES.map((step, idx) => {
            const st = phaseStatus(step);
            return (
              <div key={step} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
                <div className={`w-7 h-7 rounded-[4px] border flex items-center justify-center transition-all ${
                  st === 'completed' 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                  : st === 'active' 
                  ? 'bg-white border-indigo-600 text-indigo-600 font-bold' 
                  : 'bg-white border-slate-100 text-slate-300'
                }`}>
                  {st === 'completed' ? <Check size={14} /> : <span className="text-[11px] font-bold font-mono">{idx + 1}</span>}
                  {st === 'active' && <div className="absolute inset-0 rounded-[4px] animate-ping bg-indigo-600/10"></div>}
                </div>
                <span className={`text-[9px] font-bold tracking-tight uppercase ${
                  st === 'completed' || st === 'active' ? 'text-indigo-600' : 'text-slate-400'
                }`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Transcript</h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              {status === 'live' ? 'WS live' : status}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/20 max-h-[420px]">
            {lines.map((line) =>
              line.speaker === 'ai' ? (
                <div key={line.id} className="flex gap-3 max-w-[90%]">
                  <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Bot size={14} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Saathi AI</span>
            <div className="bg-white border border-slate-200 p-3 rounded rounded-tl-none shadow-sm text-[12px] text-slate-700 leading-normal">
                      {line.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={line.id} className="flex gap-3 max-w-[90%] self-end flex-row-reverse">
                  <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                    <User size={14} />
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {leadMeta?.name ?? 'Lead'}
                    </span>
                    <div className="bg-slate-900 text-white p-3 rounded rounded-tr-none text-[12px] leading-normal shadow-lg shadow-slate-900/10">
                      {line.text}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="p-3 border-t border-slate-100 flex gap-2 bg-white">
            <input
              className="flex-1 border border-slate-200 rounded px-3 py-2 text-sm"
              placeholder="Type as the lead (Hindi / English / Hinglish)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendText()}
              disabled={status !== 'live'}
            />
            <button
              type="button"
              onClick={sendText}
              disabled={status !== 'live'}
              className="bg-slate-900 text-white px-3 rounded flex items-center gap-1 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900 text-white rounded-lg p-5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center gap-4 w-full text-center">
              <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">Processing Signal</span>
              <div className="flex items-end justify-center gap-1 h-10 w-full">
                {[10, 24, 38, 18, 30, 12, 22, 16, 32].map((h, i) => (
                  <motion.div 
                    key={i} 
                    className="w-1 bg-indigo-500 rounded-full"
                    animate={{ height: [h, h * 0.5, h * 1.1, h] }}
                    transition={{ repeat: Infinity, duration: 0.8 + i * 0.1 }}
                  />
                ))}
              </div>
              <div className="text-[12px] font-bold text-white px-3 py-1 rounded border border-white/10 bg-white/5 uppercase tracking-tight">
                Phase: {phase}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col p-5">
            <h3 className="text-[10px] font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Zap size={14} className="text-amber-500" />
              Entity signals
            </h3>
            
            <div className="space-y-4 flex-1">
              {[
                { label: 'Lead', value: leadMeta?.name ?? '—', kind: 'normal' as const },
                { label: 'Language (server)', value: leadMeta ? 'auto' : '—', kind: 'info' as const },
                { label: 'Session', value: status, kind: 'info' as const },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{item.label}</span>
                  <span className={`font-mono text-[10px] font-bold ${
                    item.kind === 'info' ? 'text-indigo-600' : 'text-slate-700'
                  }`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-slate-50 rounded p-4 border border-slate-100">
              <div className="text-[9px] font-bold text-indigo-600 mb-2 uppercase tracking-widest flex items-center gap-1">
                <BrainCircuit size={12} />
                Hint
              </div>
              <p className="text-[11px] text-slate-700 font-bold leading-tight">
                Try: &ldquo;Main pehle se ek aur broker ke saath hoon&rdquo; for the demo moment — mock AI responds in Hinglish when API keys are off.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
