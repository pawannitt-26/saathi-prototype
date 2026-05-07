import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Mic2,
  BarChart3,
  LogOut,
  Mic,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { type Session } from '@supabase/supabase-js';
import { View } from './types';

import DashboardView from './components/Dashboard';
import PipelineView from './components/Pipeline';
import ActiveCallView from './components/ActiveCall';
import RMView from './components/RMView';
import LeadDetailView from './components/LeadDetail';
import AnalyticsView from './components/Analytics';
import LandingPage from './components/LandingPage';
import { requireSupabase, supabase } from './utils/supabase';
import { setAccessTokenProvider } from './api/client';

const viewTitles: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: 'Institutional overview', subtitle: 'Performance across voice qualification sessions' },
  pipeline: { title: 'Lead pipeline', subtitle: 'Prospects, scores, and intent in one place' },
  'active-call': { title: 'Voice monitor', subtitle: 'Live Saathi session — STT, AI reply, and scoring' },
  'rm-view': { title: 'RM queue', subtitle: 'High-intent leads ready for relationship outreach' },
  'lead-detail': { title: 'Lead profile', subtitle: 'Transcript, summary, and recommended opener' },
  analytics: { title: 'Analytics', subtitle: 'Funnel, objections, and language signals' },
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('pipeline');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentView]);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!supabase) {
      setAuthError(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
      );
      setAuthLoading(false);
      setAccessTokenProvider(null);
      return;
    }
    setAccessTokenProvider(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setAuthError(error.message);
      } else {
        setSession(data.session);
      }
      setAuthLoading(false);
    });
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setAuthError(null);
    });
    return () => {
      mounted = false;
      authSub.subscription.unsubscribe();
      setAccessTokenProvider(null);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Leads', icon: Users },
    { id: 'rm-view', label: 'RM view', icon: Mic2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNavigate = (view: View, leadId?: string) => {
    if (leadId) setSelectedLeadId(leadId);
    setCurrentView(view);
    setMobileNavOpen(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const client = requireSupabase();
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) setAuthError(error.message);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    try {
      const client = requireSupabase();
      const { error } = await client.auth.signOut();
      if (error) setAuthError(error.message);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign out failed');
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-600 gap-3">
        <div className="h-10 w-10 rounded-xl border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm font-medium tracking-tight">Loading secure workspace…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <LandingPage
        email={email}
        password={password}
        authError={authError}
        isSigningIn={isSigningIn}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSignIn}
      />
    );
  }

  const headerMeta = viewTitles[currentView];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        id="workspace-nav"
        className={[
          'fixed lg:static inset-y-0 left-0 z-50 w-[min(20rem,calc(100vw-2.5rem))] max-w-[85vw] shrink-0 flex flex-col h-full bg-white border-r border-slate-200/90 shadow-[4px_0_24px_-12px_rgba(15,23,42,0.08)] transition-transform duration-300 ease-out will-change-transform pt-[env(safe-area-inset-top)]',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="p-4 sm:p-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-900/25 ring-1 ring-white/20 shrink-0">
              S
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-[15px] tracking-tight leading-none">Saathi</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">Partner intelligence</p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 shrink-0"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Workspace
          </p>
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id as View)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-100/80'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon
                  size={18}
                  className={active ? 'text-blue-600' : 'text-slate-400'}
                  strokeWidth={active ? 2.25 : 2}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => handleNavigate('active-call')}
            className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 font-bold text-xs uppercase tracking-[0.12em] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 transition-all ring-1 ring-blue-500/20"
          >
            <Mic size={16} strokeWidth={2.25} />
            Voice monitor
          </button>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm">
              {!avatarFailed ? (
                <img
                  src="https://ui-avatars.com/api/?name=RM+User&background=e2e8f0&color=475569"
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                  RM
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {session.user.email ?? 'Relationship manager'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Signed in</p>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 max-w-[1600px] mx-auto w-full">
            <div className="flex items-start gap-3 min-w-0">
              <button
                type="button"
                className="lg:hidden mt-0.5 p-2 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm shrink-0"
                aria-expanded={mobileNavOpen}
                aria-controls="workspace-nav"
                aria-label="Open navigation menu"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu size={20} strokeWidth={2} />
              </button>
              <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight capitalize">
                  {headerMeta.title}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border border-emerald-200/80 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl leading-snug">
                {headerMeta.subtitle}
              </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                <Sparkles size={14} className="text-blue-600" />
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Program</p>
                  <p className="text-xs font-bold text-slate-800">Rupeezy AP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('active-call')}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold tracking-wide shadow-md shadow-slate-900/15 hover:bg-slate-800 transition-colors text-center"
              >
                Execute call
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 lg:p-8 min-h-full pb-[max(1rem,env(safe-area-inset-bottom))]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex-1 flex flex-col"
              >
                {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
                {currentView === 'pipeline' && <PipelineView onNavigate={handleNavigate} />}
                {currentView === 'active-call' && <ActiveCallView preferredLeadId={selectedLeadId} />}
                {currentView === 'rm-view' && <RMView onNavigate={handleNavigate} />}
                {currentView === 'lead-detail' && (
                  <LeadDetailView leadId={selectedLeadId} onNavigate={handleNavigate} />
                )}
                {currentView === 'analytics' && <AnalyticsView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
