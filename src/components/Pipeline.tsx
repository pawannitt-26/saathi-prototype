import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Filter, MoreVertical, Search, TrendingUp, X } from 'lucide-react';
import { View, Lead } from '../types';
import { fetchLeads, type LeadDto } from '../api/client';

interface PipelineProps {
  onNavigate: (view: View, leadId?: string) => void;
}

function mapDto(l: LeadDto): Lead {
  return {
    id: l.id,
    name: l.name,
    phone: l.phone,
    location: l.location,
    profession: l.profession,
    score: l.score,
    status: l.status,
    lastInteraction: l.last_interaction || '—',
  };
}

export default function PipelineView({ onNavigate }: PipelineProps) {
  const [leadRows, setLeadRows] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scoreFilter, setScoreFilter] = useState<string>('ALL');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLeads()
      .then((rows) => setLeadRows(rows.map(mapDto)))
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return leadRows.filter((l) => {
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (scoreFilter === 'GT80' && l.score <= 80) return false;
      if (scoreFilter === '50-80' && (l.score < 50 || l.score > 80)) return false;
      if (scoreFilter === 'LT50' && l.score >= 50) return false;
      if (q) {
        const haystack = `${l.name} ${l.phone} ${l.location ?? ''} ${l.profession ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leadRows, statusFilter, scoreFilter, searchText]);

  const filtersActive = statusFilter !== 'ALL' || scoreFilter !== 'ALL' || searchText.trim() !== '';

  const clearFilters = () => {
    setStatusFilter('ALL');
    setScoreFilter('ALL');
    setSearchText('');
    setSearchOpen(false);
  };

  return (
    <div className="space-y-4 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Lead Pipeline</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Prospect Flow</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded py-1 pl-2 pr-6 text-[10px] font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors uppercase tracking-wider"
            >
              <option value="ALL">Status: All</option>
              <option value="HOT">Status: Hot</option>
              <option value="WARM">Status: Warm</option>
              <option value="COLD">Status: Cold</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
          </div>

          {/* Score filter */}
          <div className="relative">
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded py-1 pl-2 pr-6 text-[10px] font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors uppercase tracking-wider"
            >
              <option value="ALL">Score: All</option>
              <option value="GT80">Score: &gt; 80</option>
              <option value="50-80">Score: 50 – 80</option>
              <option value="LT50">Score: &lt; 50</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
          </div>

          {/* Advanced Search toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className={`bg-white border rounded px-3 py-1 text-[10px] font-bold flex items-center space-x-1.5 hover:bg-slate-50 transition-colors shadow-sm uppercase tracking-wider ${
              searchOpen || searchText ? 'border-indigo-300 text-indigo-600' : 'border-slate-200 text-slate-600'
            }`}
          >
            <Filter size={12} />
            <span>Advanced Search</span>
          </button>

          {/* Clear all filters */}
          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="relative animate-in fade-in slide-in-from-top-1 duration-150">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name, phone, location or profession…"
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-colors"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="text-rose-600 text-xs font-bold bg-rose-50 border border-rose-200 rounded p-2">
          API: {error} — run the Saathi API (saathi-prototype-backend) and set VITE_API_URL
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-900 rounded-lg p-4 text-white relative overflow-hidden shadow-md flex flex-col justify-between h-[100px]">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[9px] font-black tracking-[0.2em] text-indigo-300 uppercase">Live Queue</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-bold tracking-tighter">{leadRows.length}</div>
            <div className="text-[10px] font-medium text-indigo-200">Leads in CRM</div>
          </div>
        </div>

        {[
          { label: 'Total Leads', value: String(leadRows.length), trend: 'API', positive: null },
          { label: 'Hot count', value: String(leadRows.filter((l) => l.status === 'HOT').length), trend: 'Live', positive: true },
          { label: 'Warm count', value: String(leadRows.filter((l) => l.status === 'WARM').length), trend: 'Live', positive: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-center h-[100px]">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
            <div className={`text-[10px] mt-1 font-bold ${stat.positive === true ? 'text-emerald-600' : stat.positive === false ? 'text-rose-600' : 'text-slate-500'}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prospect List</h4>
          <span className="text-[9px] font-bold text-slate-400">
            {filteredRows.length !== leadRows.length
              ? `${filteredRows.length} of ${leadRows.length} Records`
              : `${leadRows.length} Total Records`}
          </span>
        </div>
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-2 px-6 w-10" aria-hidden="true" />
                <th className="py-2 px-6">Prospect / Contact</th>
                <th className="py-2 px-6">Location</th>
                <th className="py-2 px-6">Profession</th>
                <th className="py-2 px-6">AI Score</th>
                <th className="py-2 px-6">Intent</th>
                <th className="py-2 px-6 text-right">Last Interaction</th>
                <th className="py-2 px-6 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[12px]">
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    No leads match the current filters.
                  </td>
                </tr>
              )}
              {filteredRows.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={`hover:bg-indigo-50/30 transition-colors group cursor-pointer ${lead.status === 'HOT' ? 'bg-amber-50/10' : ''}`}
                  onClick={() => onNavigate('lead-detail', lead.id)}
                >
                  <td className="py-3 px-6" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" readOnly />
                  </td>
                  <td className="py-3 px-6">
                    <div className="font-bold text-slate-800">{lead.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">{lead.phone}</div>
                  </td>
                  <td className="py-3 px-6 text-slate-500 font-medium">{lead.location}</td>
                  <td className="py-3 px-6 text-slate-500 font-medium">{lead.profession}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${lead.score > 80 ? 'bg-amber-500' : lead.score > 50 ? 'bg-indigo-500' : 'bg-slate-300'}`} 
                          style={{ width: `${Math.min(100, lead.score)}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono font-bold text-[11px] ${lead.score > 80 ? 'text-amber-600' : lead.score > 50 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {lead.score}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest border shadow-sm ${
                      lead.status === 'HOT' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      lead.status === 'WARM' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                      'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right text-slate-400 font-mono text-[10px] font-bold">{lead.lastInteraction}</td>
                  <td className="py-3 px-6 text-center">
                    <button type="button" className="text-slate-300 hover:text-slate-600 transition-colors p-1">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="md:hidden divide-y divide-slate-100" aria-label="Prospect list">
          {filteredRows.length === 0 && (
            <li className="py-10 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4">
              No leads match the current filters.
            </li>
          )}
          {filteredRows.map((lead) => (
            <li key={lead.id}>
              <button
                type="button"
                onClick={() => onNavigate('lead-detail', lead.id)}
                className={`w-full text-left p-4 active:bg-slate-50 transition-colors ${lead.status === 'HOT' ? 'bg-amber-50/40' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-sm truncate">{lead.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">{lead.phone}</p>
                    <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2">
                      {lead.location ?? '—'}
                      {lead.profession ? ` · ${lead.profession}` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest border shadow-sm ${
                      lead.status === 'HOT'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : lead.status === 'WARM'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 gap-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden max-w-[140px]">
                      <div
                        className={`h-full rounded-full ${lead.score > 80 ? 'bg-amber-500' : lead.score > 50 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        style={{ width: `${Math.min(100, lead.score)}%` }}
                      />
                    </div>
                    <span
                      className={`font-mono font-bold text-[11px] shrink-0 ${lead.score > 80 ? 'text-amber-600' : lead.score > 50 ? 'text-indigo-600' : 'text-slate-400'}`}
                    >
                      {lead.score}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold truncate">{lead.lastInteraction}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
        
        <div className="bg-slate-50/50 border-t border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Live data from Saathi API
          </div>
        </div>
      </div>
    </div>
  );
}
