import React, { useEffect, useRef, useState } from 'react';
import {
  PhoneOff,
  TrendingUp,
  User,
  Bot,
  Zap,
  BrainCircuit,
  Send,
  Mic,
  Square,
  Check,
  Keyboard,
  ChevronRight,
  Volume2,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { fetchLeads, getAccessToken, wsBaseUrl, type LeadDto } from '../api/client';

const PHASES = ['OPENER', 'PITCH', 'OBJECTION', 'QUALIFICATION', 'CLOSE'] as const;

const VOICE_FALLBACK_MS = 14_000;

type Line = {
  id: string;
  speaker: 'ai' | 'user';
  text: string;
  audioSrc?: string;
  /** True until TTS attaches or fallback timeout (expecting Sarvam). */
  voicePending?: boolean;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

let sharedPlaybackAudioContext: AudioContext | null = null;

/**
 * Browsers tie autoplay permission to recent user gestures. Our TTS arrives over WS *after*
 * awaits, which often breaks naive `autoPlay`. Run this synchronously on the Start-session tap
 * (before any async gap) plus prime `AudioContext` so later `<audio>.play()` is more reliable.
 */
function primeBrowserAudioForLaterPlayback(): void {
  if (typeof window === 'undefined') return;
  const w = window as Window &
    typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    };

  try {
    const AudioCtx = w.AudioContext || w.webkitAudioContext;
    if (AudioCtx) {
      if (!sharedPlaybackAudioContext || sharedPlaybackAudioContext.state === 'closed') {
        sharedPlaybackAudioContext = new AudioCtx();
      }
      const ctx = sharedPlaybackAudioContext;
      void ctx.resume().then(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.00001, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.03);
        } catch {
          /* noop */
        }
      });
    }
  } catch {
    /* older iOS quirks — ignore */
  }

  try {
    const ping = new Audio(
      // Minimal WAV (near-silent tick) — some engines only honour HTMLAudio autoplay-chain this way.
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRAAAACAgICAgICAgAAA',
    );
    ping.volume = 0.02;
    void ping.play().catch(() => {});
  } catch {
    /* noop */
  }
}

/** Large TTS `data:` URLs often play as a file on disk but stay silent in `<audio>`; blob URLs decode reliably. */
function dataUrlToObjectUrl(dataUrl: string): string | null {
  const match = /^data:([^;,]+);base64,([\s\S]*)$/i.exec(dataUrl.trim());
  if (!match) return null;
  const mime = match[1].trim() || 'application/octet-stream';
  const b64 = match[2].replace(/\s/g, '');
  try {
    const binary = atob(b64);
    const len = binary.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], { type: mime }));
  } catch {
    return null;
  }
}

function waitMediaCanPlay(el: HTMLMediaElement, timeoutMs: number): Promise<void> {
  if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    let timerId = 0;

    function cleanup(): void {
      if (timerId !== 0) {
        window.clearTimeout(timerId);
        timerId = 0;
      }
      el.removeEventListener('canplay', done);
      el.removeEventListener('loadeddata', done);
      el.removeEventListener('error', onErr);
    }

    const done = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const onErr = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('media-error'));
    };

    timerId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('timeout'));
    }, timeoutMs) as unknown as number;

    el.addEventListener('canplay', done, { once: true });
    el.addEventListener('loadeddata', done, { once: true });
    el.addEventListener('error', onErr, { once: true });
  });
}

/** Mounted when TTS data URL arrives; blob URL + canplay → play + unblock UI if the browser denies autoplay */
function TtsVoicePlayer({
  playbackKey,
  src,
}: {
  playbackKey: string;
  src: string;
}) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = React.useRef<string | null>(null);
  const [autoplayDenied, setAutoplayDenied] = React.useState(false);

  React.useEffect(() => {
    setAutoplayDenied(false);
    const el = audioRef.current;
    if (!el) return undefined;

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    let cancelled = false;

    const onPlaying = () => setAutoplayDenied(false);
    el.addEventListener('playing', onPlaying);

    let blobFromData: string | null = null;
    if (src.trim().startsWith('data:')) {
      blobFromData = dataUrlToObjectUrl(src);
      if (blobFromData) blobUrlRef.current = blobFromData;
    }
    const playUrl = blobFromData ?? src;

    const run = async () => {
      try {
        el.pause();
      } catch {
        /* noop */
      }
      el.defaultMuted = false;
      el.muted = false;
      el.volume = 1;
      el.src = playUrl;
      try {
        el.load();
      } catch {
        /* noop */
      }

      try {
        await waitMediaCanPlay(el, 30_000);
      } catch {
        if (!cancelled) setAutoplayDenied(true);
        return;
      }
      if (cancelled) return;

      el.muted = false;
      el.volume = 1;

      try {
        await el.play();
        if (!cancelled) setAutoplayDenied(false);
      } catch {
        if (!cancelled) setAutoplayDenied(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
      el.removeEventListener('playing', onPlaying);
      try {
        el.pause();
      } catch {
        /* noop */
      }
      el.removeAttribute('src');
      try {
        el.load();
      } catch {
        /* noop */
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [playbackKey, src]);

  const manualPlay = () => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1;
    void el
      .play()
      .then(() => setAutoplayDenied(false))
      .catch(() => setAutoplayDenied(true));
  };

  return (
    <div className="flex flex-col gap-2">
      {autoplayDenied && (
        <button
          type="button"
          onClick={manualPlay}
          className="w-full shrink-0 flex items-center justify-center gap-2 rounded-md bg-amber-500 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-2 hover:bg-amber-600 transition-colors shadow-sm border border-amber-600/40"
        >
          <Volume2 size={14} aria-hidden />
          Tap to hear — autoplay blocked
        </button>
      )}
      <audio
        ref={audioRef}
        className="w-full max-w-md h-9 rounded accent-indigo-600"
        controls
        preload="auto"
        playsInline
      >
        Your browser cannot play this audio clip.
      </audio>
    </div>
  );
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
  const [micRecording, setMicRecording] = useState(false);
  const [keyboardFallbackOpen, setKeyboardFallbackOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const micSessionRef = useRef(0);
  /** Cancel per-line timeouts when TTS wins or session resets. */
  const voiceFallbackTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const leadMeta = leads.find((l) => l.id === leadId);

  const micSupported =
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function';

  const forceMicHardwareOff = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setMicRecording(false);
  };

  /** Tear down mic: stop MediaRecorder first so `onstop` runs; avoids orphan blobs. */
  const stopMicTracks = () => {
    const r = recorderRef.current;
    if (r && r.state !== 'inactive') {
      try {
        r.stop();
      } catch {
        forceMicHardwareOff();
      }
    } else {
      forceMicHardwareOff();
    }
  };

  const stopMicRecorder = () => {
    stopMicTracks();
  };

  useEffect(() => () => stopMicTracks(), []);

  /** Clear timeouts that would flip voice-pending rows to plain text after session end/unmount. */
  const cancelVoiceFallbackTimers = React.useCallback(() => {
    voiceFallbackTimersRef.current.forEach((t) => window.clearTimeout(t));
    voiceFallbackTimersRef.current.clear();
  }, []);

  useEffect(
    () => () => {
      cancelVoiceFallbackTimers();
    },
    [cancelVoiceFallbackTimers],
  );

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

  const appendLine = (speaker: 'ai' | 'user', text: string, opts?: { voicePending?: boolean }) => {
    setLines((prev) => [...prev, { id: uid(), speaker, text, voicePending: opts?.voicePending }]);
  };

  /** AI narration rows: hide full text until TTS (or MOCK/no-key fallback timeout). */
  const appendAiTranscript = React.useCallback(
    (text: string) => {
      const t = text.trimStart();
      const expectVoice =
        t.length > 0 && !t.startsWith('[STT]') && !t.startsWith('[Error]');
      const id = uid();
      setLines((prev) => [...prev, { id, speaker: 'ai', text, voicePending: expectVoice }]);
      if (!expectVoice) return;
      const handle = window.setTimeout(() => {
        voiceFallbackTimersRef.current.delete(id);
        setLines((prev) =>
          prev.map((row) =>
            row.id === id && !row.audioSrc ? { ...row, voicePending: false } : row,
          ),
        );
      }, VOICE_FALLBACK_MS);
      voiceFallbackTimersRef.current.set(id, handle);
    },
    [],
  );

  /** Link streamed TTS to the latest AI transcript row (voice-first UI). */
  const attachAudioToLatestAiTurn = (_mime: string, b64: string) => {
    const audioSrc = `data:${_mime};base64,${b64}`;
    setLines((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].speaker === 'ai') {
          const row = next[i];
          const handle = voiceFallbackTimersRef.current.get(row.id);
          if (handle !== undefined) {
            window.clearTimeout(handle);
            voiceFallbackTimersRef.current.delete(row.id);
          }
          next[i] = { ...row, audioSrc, voicePending: false };
          break;
        }
      }
      return next;
    });
  };

  const connect = async () => {
    if (!leadId) return;
    primeBrowserAudioForLaterPlayback();
    micSessionRef.current += 1;
    cancelVoiceFallbackTimers();
    stopMicTracks();
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
    setKeyboardFallbackOpen(false);

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
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(String(ev.data)) as Record<string, unknown>;
      } catch {
        return;
      }
      const t = data.type as string;
      if (t === 'transcript') {
        const sp = data.speaker === 'ai' ? 'ai' : 'user';
        const txt = String(data.text ?? '');
        if (sp === 'ai') appendAiTranscript(txt);
        else appendLine('user', txt);
      }
      if (t === 'user_text_final') {
        appendLine('user', String(data.text ?? ''));
      }
      if (t === 'stt_empty') {
        appendLine('ai', `[STT] ${String(data.message ?? 'No speech recognised — try again')}`);
      }
      if (t === 'phase') setPhase(String(data.phase ?? 'OPENER'));
      if (t === 'score_partial') setScore(Number(data.total ?? 0));
      if (t === 'tts' && data.base64 && data.mime) {
        attachAudioToLatestAiTurn(String(data.mime), String(data.base64));
      }
      if (t === 'call_end') {
        cancelVoiceFallbackTimers();
        micSessionRef.current += 1;
        stopMicTracks();
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
    primeBrowserAudioForLaterPlayback();
    appendLine('user', t);
    wsRef.current.send(JSON.stringify({ type: 'text', text: t }));
    setInput('');
  };

  const toggleVoiceRecording = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || status !== 'live') return;
    if (micRecording) {
      stopMicRecorder();
      return;
    }
    if (!micSupported) {
      setError('Microphone is not supported in this browser.');
      return;
    }
    setError(null);
    try {
      primeBrowserAudioForLaterPlayback();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: BlobPart[] = [];
      const sid = micSessionRef.current;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        if (recorderRef.current === recorder) {
          streamRef.current = null;
          recorderRef.current = null;
          setMicRecording(false);
        }
        if (sid !== micSessionRef.current) return;
        const blobType = recorder.mimeType || mime;
        const blob = new Blob(chunks, { type: blobType });
        const fr = new FileReader();
        fr.onloadend = () => {
          const dataUrl = String(fr.result || '');
          const b64 = dataUrl.includes(',') ? dataUrl.split(',', 2)[1] : '';
          if (
            b64 &&
            wsRef.current?.readyState === WebSocket.OPEN &&
            sid === micSessionRef.current
          ) {
            wsRef.current.send(JSON.stringify({ type: 'audio', base64: b64, mime: blobType }));
          }
        };
        fr.readAsDataURL(blob);
      };
      recorderRef.current = recorder;
      streamRef.current = stream;
      setMicRecording(true);
      recorder.start(250);
    } catch {
      setError('Microphone permission denied or unavailable.');
      stopMicTracks();
    }
  };

  const endCall = () => {
    micSessionRef.current += 1;
    stopMicTracks();
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
            disabled={status !== 'live'}
            title={status !== 'live' ? 'Start a session first' : 'End call and save score'}
            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded text-[10px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-500/10 uppercase tracking-widest disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none disabled:hover:bg-rose-600"
          >
            <PhoneOff size={14} fill="currentColor" />
            <span>End &amp; score</span>
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 font-bold px-1">{error}</p>}

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-3.5 left-0 w-full h-px bg-slate-100 z-0"></div>
          
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
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center gap-2">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live session</h3>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                Speak as the lead (audio → STT). Saathi answers with voice — open transcript below each reply when needed.
              </p>
            </div>
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
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      Saathi AI
                    </span>
                    {line.audioSrc ? (
                      <>
                        <div className="bg-white border border-indigo-200/80 rounded-lg rounded-tl-none shadow-sm p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-indigo-700">
                            <Volume2 size={16} className="shrink-0" aria-hidden />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Voice reply
                            </span>
                          </div>
                          <TtsVoicePlayer playbackKey={line.id} src={line.audioSrc} />
                          <details className="group rounded-md border border-slate-100 bg-slate-50/90 text-left">
                            <summary className="cursor-pointer select-none list-none px-3 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100/80 rounded-md [&::-webkit-details-marker]:hidden">
                              <ChevronRight
                                size={14}
                                className="text-slate-400 shrink-0 transition-transform group-open:rotate-90"
                                aria-hidden
                              />
                              Show transcript
                            </summary>
                            <div className="px-3 pb-3 pt-0 border-t border-slate-100/80 mt-1 text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {line.text}
                            </div>
                          </details>
                        </div>
                      </>
                    ) : line.voicePending ? (
                      <motion.div
                        aria-busy="true"
                        aria-live="polite"
                        className="bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-200/70 rounded-lg rounded-tl-none shadow-sm px-4 py-3 flex items-start gap-3 min-h-[76px]"
                        animate={{ opacity: [0.88, 1, 0.88] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <span className="sr-only">{line.text}</span>
                        <Loader2
                          size={22}
                          className="shrink-0 text-indigo-600 animate-spin"
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">
                            Preparing voice reply
                          </p>
                          <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                            Synthesizing speech — audio will appear here when ready.
                          </p>
                          <div className="mt-3 flex gap-1" aria-hidden>
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                className="h-1.5 flex-1 max-w-[32px] rounded-full bg-indigo-300"
                                animate={{ opacity: [0.25, 1, 0.25], scaleY: [0.6, 1, 0.6] }}
                                transition={{
                                  duration: 0.9,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: 'easeInOut',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="bg-white border border-slate-200 p-3 rounded rounded-tl-none shadow-sm text-[12px] text-slate-700 leading-normal">
                        {line.text}
                      </div>
                    )}
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

          <div className="p-4 border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white space-y-4">
            {status !== 'live' && (
              <p className="text-[11px] text-slate-500 text-center font-medium py-1">
                Start a session above — then you will speak with the microphone (audio → transcription).
              </p>
            )}
            {status === 'live' && micSupported && (
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center max-w-sm">
                  Your turn — speak (Hindi / English / Hinglish)
                </p>
                <button
                  type="button"
                  onClick={() => void toggleVoiceRecording()}
                  disabled={status !== 'live'}
                  title={micRecording ? 'Stop recording and send' : 'Start speaking'}
                  className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-full text-white shadow-lg transition-all disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${
                    micRecording
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 scale-105'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                  }`}
                >
                  {micRecording && (
                    <span className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping" aria-hidden />
                  )}
                  {micRecording ? (
                    <Square size={28} fill="currentColor" className="relative z-10" />
                  ) : (
                    <Mic size={36} strokeWidth={2} className="relative z-10" />
                  )}
                </button>
                <p className="text-[11px] text-slate-600 font-semibold text-center max-w-xs">
                  {micRecording
                    ? 'Tap the button again when you have finished speaking.'
                    : 'Tap the mic to speak, tap again when done — we transcribe audio on the server.'}
                </p>
              </div>
            )}

            {status === 'live' && !micSupported && (
              <p className="text-xs text-amber-800 font-bold text-center bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                This browser does not expose a microphone API. Use typing below.
              </p>
            )}

            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setKeyboardFallbackOpen((o) => !o)}
                className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors ${
                  keyboardFallbackOpen
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Keyboard size={14} />
                {keyboardFallbackOpen ? 'Hide keyboard input' : 'Type with keyboard instead'}
              </button>
            </div>

            {(keyboardFallbackOpen || (status === 'live' && !micSupported)) && (
              <div className="flex gap-2 flex-wrap items-stretch animate-in fade-in duration-150">
                <input
                  className="flex-1 min-w-[200px] border border-slate-200 rounded px-3 py-2 text-sm bg-white"
                  placeholder="Fallback: type as the lead..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendText()}
                  disabled={status !== 'live'}
                />
                <button
                  type="button"
                  onClick={sendText}
                  disabled={status !== 'live'}
                  className="bg-slate-900 text-white px-4 rounded flex items-center gap-2 disabled:opacity-40 shrink-0 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Send size={16} />
                  Send text
                </button>
              </div>
            )}
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
                Use the large mic: your speech is sent as audio and transcribed (Sarvam / Deepgram). Saathi replies with playable audio first; tap &ldquo;Show transcript&rdquo; under a reply to read the text. Use &ldquo;Type with keyboard&rdquo; only if you need a fallback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
