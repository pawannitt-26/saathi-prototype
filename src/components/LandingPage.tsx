import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Mic2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Headphones,
} from 'lucide-react';

type LandingPageProps = {
  email: string;
  password: string;
  authError: string | null;
  isSigningIn: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
};

const trustStats = [
  { label: 'Voice-ready workflows', value: 'Real-time', hint: 'Structured qualification' },
  { label: 'AI scoring', value: 'Per session', hint: 'HOT / WARM / COLD' },
  { label: 'RM handoff', value: 'Automated', hint: 'Briefs & openers' },
];

const features = [
  {
    title: 'Voice orchestration',
    text: 'Phase-aware calls with objection handling and natural Hindi / English / Hinglish.',
    icon: Mic2,
  },
  {
    title: 'Secure workspace',
    text: 'Team access via Supabase Auth with protected APIs and WebSocket sessions.',
    icon: ShieldCheck,
  },
  {
    title: 'Actionable pipeline',
    text: 'Every conversation becomes scores, summaries, and next steps for RMs.',
    icon: TrendingUp,
  },
];

/** Layered soft blobs + light wash — similar vibe to Rupeezy hero (organic curves, blue/white). */
function LandingWaveBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden
    >
      {/* Base: cool white → faint sky (clean fintech canvas) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(165deg, #f5f9ff 0%, #fafcff 38%, #f4f7fb 72%, #eef4fc 100%)',
        }}
      />

      {/* Top-left: soft blue pocket */}
      <div
        className="landing-blob-animate absolute w-[min(95vw,720px)] h-[min(70vh,560px)] rounded-[48%_52%_45%_55%] opacity-[0.42]"
        style={{
          top: '-18%',
          left: '-22%',
          background:
            'radial-gradient(ellipse 65% 55% at 40% 45%, rgb(147 197 253 / 0.55), rgb(186 230 253 / 0.22) 55%, transparent 72%)',
          filter: 'blur(48px)',
        }}
      />

      {/* Bottom-left: wave rising (light azure sweep) */}
      <div
        className="landing-blob-animate-delayed absolute w-[min(110vw,900px)] h-[min(85vh,640px)] rounded-[55%_45%_52%_48%] opacity-[0.38]"
        style={{
          bottom: '-28%',
          left: '-35%',
          background:
            'radial-gradient(ellipse 58% 50% at 55% 40%, rgb(125 211 252 / 0.45), rgb(224 242 254 / 0.28) 50%, transparent 70%)',
          filter: 'blur(56px)',
        }}
      />

      {/* Center / right: bright white “break” behind content (the sweeping highlight in the reference) */}
      <div
        className="landing-blob-animate-slow absolute w-[min(120vw,980px)] h-[min(95vh,820px)] rounded-[42%_58%_48%_52%] opacity-[0.72]"
        style={{
          top: '-8%',
          right: '-25%',
          background:
            'radial-gradient(ellipse 52% 48% at 50% 42%, rgb(255 255 255 / 0.94), rgb(255 255 255 / 0.35) 58%, transparent 76%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Mid: subtle periwinkle depth */}
      <div
        className="landing-blob-animate absolute w-[min(80vw,560px)] h-[min(55vh,420px)] rounded-[50%] opacity-[0.22]"
        style={{
          top: '28%',
          left: '18%',
          background:
            'radial-gradient(circle at 50% 50%, rgb(99 102 241 / 0.16), transparent 68%)',
          filter: 'blur(64px)',
        }}
      />

      {/* Bottom edge: gentle wave line (SVG) */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[min(22vh,200px)] text-white/50"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 120C180 40 360 160 540 100C720 40 900 140 1080 90C1260 40 1350 100 1440 70V200H0V120Z"
          fill="url(#landing-wave-grad)"
          className="opacity-90"
        />
        <defs>
          <linearGradient id="landing-wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(241 245 249)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
      </svg>

      {/* Fine vignette — keeps focus on center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 0%, rgb(248 250 252 / 0.4) 100%)',
        }}
      />
    </div>
  );
}

export default function LandingPage({
  email,
  password,
  authError,
  isSigningIn,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LandingPageProps) {
  return (
    <div className="min-h-screen text-slate-900 relative overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <LandingWaveBackground />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-900/20">
                S
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 tracking-tight leading-tight">Saathi</p>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">Partner program intelligence</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-7 space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="space-y-5"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                  <Headphones size={14} className="text-blue-600" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
                    Voice-led RM platform
                  </span>
                </div>
                <h1 className="text-[clamp(1.75rem,6vw,2.75rem)] sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-slate-900 leading-[1.08]">
                  Relationships{' '}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700">
                    simplified
                  </span>
                </h1>
                <p className="text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
                  Qualify partner leads with AI voice sessions, live scoring, and handoff-ready briefs — built for
                  high-trust distribution teams.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 }}
                className="grid sm:grid-cols-3 gap-3"
              >
                {trustStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgb(15,23,42,0.06)]"
                  >
                    <p className="text-xl font-bold text-slate-900 tracking-tight">{s.value}</p>
                    <p className="text-[11px] font-bold text-slate-800 mt-1 uppercase tracking-wide">{s.label}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{s.hint}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="grid sm:grid-cols-3 gap-4"
              >
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 hover:shadow-md hover:border-slate-300/80 transition-all duration-300"
                  >
                    <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <f.icon size={18} className="text-blue-600" strokeWidth={2} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-900">{f.title}</p>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{f.text}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="lg:col-span-5 lg:sticky lg:top-24"
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.15)]">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Sparkles size={16} strokeWidth={2} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Secure sign-in</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Access your workspace</h2>
                <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                  Sign in with your team credentials to manage leads, voice sessions, and RM queues.
                </p>

                <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="saathi-email">
                      Work email
                    </label>
                    <input
                      id="saathi-email"
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-shadow"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700" htmlFor="saathi-password">
                      Password
                    </label>
                    <input
                      id="saathi-password"
                      type="password"
                      value={password}
                      onChange={(e) => onPasswordChange(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-shadow"
                      placeholder="Enter password"
                    />
                  </div>
                  {authError && (
                    <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                      {authError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-3.5 text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-lg shadow-slate-900/20"
                  >
                    {isSigningIn ? 'Signing in…' : 'Continue'}
                    {!isSigningIn && <ArrowRight size={18} strokeWidth={2.25} />}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5">
                  {['Supabase-authenticated access', 'Encrypted API & WebSocket sessions'].map((t) => (
                    <div key={t} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
