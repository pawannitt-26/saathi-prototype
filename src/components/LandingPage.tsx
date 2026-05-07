import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, CheckCircle2, Mic2, ShieldCheck, Sparkles, Waves } from 'lucide-react';

type LandingPageProps = {
  email: string;
  password: string;
  authError: string | null;
  isSigningIn: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
};

const metrics = [
  { label: 'Avg. Response Latency', value: '< 300ms' },
  { label: 'Active Voice Workflows', value: 'Realtime' },
  { label: 'Conversation Intelligence', value: 'AI Scored' },
];

const features = [
  {
    title: 'Realtime Voice Orchestration',
    text: 'Run structured calls with continuous AI guidance, objection handling, and phase-aware progression.',
    icon: Mic2,
  },
  {
    title: 'Secure Internal Access',
    text: 'Role-gated RM workspace with controlled access to lead intelligence and call outcomes.',
    icon: ShieldCheck,
  },
  {
    title: 'Actionable Insights Pipeline',
    text: 'Convert every conversation into concise summaries, scores, handoff triggers, and RM-ready next steps.',
    icon: Sparkles,
  },
];

export default function LandingPage({
  email,
  password,
  authError,
  isSigningIn,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LandingPageProps) {
  const [activeMode, setActiveMode] = React.useState<'agent' | 'insights' | 'handoff'>('agent');
  const { scrollYProgress } = useScroll();
  const haloY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const modeCopy = {
    agent: {
      title: 'Live Agent Assist',
      metric: 'Phase: OPENER -> PITCH',
      detail: 'Realtime response coaching with call-state progression.',
    },
    insights: {
      title: 'Conversation Intelligence',
      metric: 'Signal confidence: 92%',
      detail: 'Instant scoring and intent extraction from every turn.',
    },
    handoff: {
      title: 'RM Handoff Ready',
      metric: 'Status: HOT lead queued',
      detail: 'Auto-generated summary and action plan in seconds.',
    },
  } as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <motion.div style={{ y: haloY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      </motion.div>

      <motion.div
        style={{ y: gridY }}
        className="absolute inset-0 pointer-events-none opacity-30 [background-image:linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] [background-size:38px_38px]"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-8 lg:py-12">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-indigo-300">
              S
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">SAATHI Intelligence</p>
              <p className="text-xs text-slate-300">Voice-led RM operations platform</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <Waves size={14} className="text-emerald-300" />
            Realtime system online
          </div>
        </motion.header>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="space-y-5"
            >
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-indigo-200 bg-indigo-400/10 border border-indigo-300/20 rounded-full px-3 py-1.5">
                <Sparkles size={12} />
                Next-gen RM productivity
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
                AI voice workflows,
                <span className="block bg-gradient-to-r from-indigo-300 via-cyan-300 to-violet-300 text-transparent bg-clip-text">
                  built for high-performance relationship teams.
                </span>
              </h1>
              <p className="text-slate-300 max-w-2xl text-base md:text-lg leading-relaxed">
                SAATHI unifies live voice execution, AI scoring, and RM actioning in one secure workspace.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="grid sm:grid-cols-3 gap-3">
              {metrics.map((m) => (
                <motion.div
                  key={m.label}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-xl font-semibold tracking-tight text-white">{m.value}</p>
                  <p className="text-xs text-slate-300 mt-1">{m.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-slate-900/40 p-5"
            >
              <div className="flex flex-wrap gap-2">
                {(['agent', 'insights', 'handoff'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setActiveMode(mode)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      activeMode === mode
                        ? 'bg-indigo-500/20 border-indigo-300/50 text-indigo-100'
                        : 'bg-white/0 border-white/15 text-slate-300 hover:border-white/35'
                    }`}
                  >
                    {mode === 'agent' ? 'Live Agent' : mode === 'insights' ? 'Insights' : 'Handoff'}
                  </button>
                ))}
              </div>
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-4 grid md:grid-cols-5 gap-4"
              >
                <div className="md:col-span-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-sm font-semibold">{modeCopy[activeMode].title}</p>
                  <p className="text-xs text-indigo-200 mt-1">{modeCopy[activeMode].metric}</p>
                  <p className="text-xs text-slate-300 mt-3">{modeCopy[activeMode].detail}</p>
                  <div className="mt-4 h-16 flex items-end gap-1">
                    {[12, 24, 18, 36, 22, 30, 16, 26, 14, 34].map((h, i) => (
                      <motion.div
                        key={`${activeMode}-${i}`}
                        className="w-1.5 rounded-full bg-indigo-400/90"
                        animate={{ height: [h, h * 0.6, h * 1.1, h] }}
                        transition={{ repeat: Infinity, duration: 1 + i * 0.07 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">System Status</p>
                  <div className="mt-3 space-y-2">
                    {['Voice stream active', 'AI scoring online', 'RM brief automation'].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="grid md:grid-cols-3 gap-4"
            >
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                  className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                >
                  <f.icon size={18} className="text-indigo-300" />
                  <p className="mt-3 text-sm font-semibold">{f.title}</p>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed line-clamp-2">{f.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="rounded-3xl border border-white/15 bg-white text-slate-900 shadow-2xl shadow-indigo-900/40 p-6 md:p-7">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.2em]">Internal Access</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Sign in to continue</h2>
              <p className="mt-2 text-sm text-slate-600">
                Access the secure RM workspace to monitor voice sessions, lead states, and conversion signals.
              </p>

              <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    placeholder="rm@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    placeholder="Enter your password"
                  />
                </div>
                {authError && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-2">
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-800 transition-all hover:translate-y-[-1px] disabled:opacity-50"
                >
                  {isSigningIn ? 'Signing in...' : 'Enter Workspace'}
                  {!isSigningIn && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Supabase-authenticated team access
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Protected APIs and secure websocket sessions
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
