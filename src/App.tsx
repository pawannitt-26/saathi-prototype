import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Mic2, 
  BarChart3, 
  HelpCircle, 
  LogOut, 
  Search, 
  Bell, 
  Settings, 
  Plus,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View } from './types';

import DashboardView from './components/Dashboard';
import PipelineView from './components/Pipeline';
import ActiveCallView from './components/ActiveCall';
import RMView from './components/RMView';
import LeadDetailView from './components/LeadDetail';
import AnalyticsView from './components/Analytics';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('pipeline');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Leads', icon: Users },
    { id: 'rm-view', label: 'RM View', icon: Mic2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNavigate = (view: View, leadId?: string) => {
    if (leadId) setSelectedLeadId(leadId);
    setCurrentView(view);
  };

  return (
    <div className="flex h-screen bg-brand-background overflow-hidden font-sans">
      <nav className="w-60 bg-brand-dark flex flex-col h-full border-r border-slate-800 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary-light rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            S
          </div>
          <span className="text-white font-bold tracking-tight text-lg">SAATHI</span>
        </div>

        <div className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id as View)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                currentView === item.id 
                ? 'bg-brand-primary text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 mt-auto border-t border-slate-800">
          <button 
            onClick={() => handleNavigate('active-call')}
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 hover:bg-indigo-400 transition-all shadow-sm mb-4"
          >
            <Mic size={14} />
            <span>Voice Monitor</span>
          </button>
          
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH8bsTbRbQfaH9idSbGw-NoWOUAFS9GuqDI8Y6AK_6wh6ZHdGt-gvoNV_gp_rXfD9VRuqQ7pOf_OLfv8H1bXUaLwtDJHlYAdUp0w_fJVsPDma5apIB3xAtbng-78EnKI6StKM1WGx2xDnuXmCWRnZsmVIXp0fZPLPGOFt1Akfa8LZABDPHaTqSgz8e3t6Kdt0zkQ-YGSYZUzmNET3WFGvrQ6xBHE1mVaR9VbkCcsyqt5kDs4wqFcsKZJB-TTw7WpAWWm1jksOsZB_Q" 
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-medium">Marcus Thorne</span>
              <span className="text-[10px] text-slate-500">Relationship Manager</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 w-full z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800">SAATHI Intelligence</h1>
            <span className="px-2 py-0.5 bg-brand-success/10 text-brand-success text-[10px] font-bold uppercase tracking-wider rounded border border-brand-success/20">
              Agent Online
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today&apos;s Pipeline</span>
              <span className="text-sm font-bold text-slate-900 tracking-tight">Rupeezy AP</span>
            </div>
            <button 
              type="button"
              onClick={() => handleNavigate('active-call')}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded shadow-sm hover:bg-slate-800 transition-colors uppercase tracking-widest"
            >
              Execute Call
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
              {currentView === 'pipeline' && <PipelineView onNavigate={handleNavigate} />}
              {currentView === 'active-call' && <ActiveCallView preferredLeadId={selectedLeadId} />}
              {currentView === 'rm-view' && <RMView />}
              {currentView === 'lead-detail' && <LeadDetailView leadId={selectedLeadId} />}
              {currentView === 'analytics' && <AnalyticsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
