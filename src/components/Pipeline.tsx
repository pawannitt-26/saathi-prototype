import React from 'react';
import { ChevronDown, Filter, MoreVertical, TrendingUp } from 'lucide-react';
import { View, Lead } from '../types';

interface PipelineProps {
  onNavigate: (view: View) => void;
}

const mockLeads: Lead[] = [
  { id: '1', name: 'Rahul Sharma', phone: '+91 98765 43210', location: 'Mumbai', profession: 'MFD', score: 95, status: 'HOT', lastInteraction: '2 mins ago' },
  { id: '2', name: 'Priya Patel', phone: '+91 91234 56789', location: 'Ahmedabad', profession: 'Agent', score: 65, status: 'WARM', lastInteraction: '1 hr ago' },
  { id: '3', name: 'Amit Kumar', phone: '+91 99887 76655', location: 'Delhi', profession: 'Influencer', score: 30, status: 'COLD', lastInteraction: 'Yesterday' },
  { id: '4', name: 'Sneha Gupta', phone: '+91 90000 11111', location: 'Bangalore', profession: 'Agent', score: 88, status: 'HOT', lastInteraction: '5 mins ago' },
];

export default function PipelineView({ onNavigate }: PipelineProps) {
  return (
    <div className="space-y-4 flex-1 flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Lead Pipeline</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Prospect Flow</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['Status: All', 'Score: > 80'].map((filter) => (
            <div key={filter} className="relative group">
              <select className="appearance-none bg-white border border-slate-200 rounded py-1 pl-2 pr-6 text-[10px] font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors uppercase tracking-wider">
                <option>{filter}</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
            </div>
          ))}
          <button className="bg-white border border-slate-200 rounded px-3 py-1 text-[10px] font-bold text-slate-600 flex items-center space-x-1.5 hover:bg-slate-50 transition-colors shadow-sm uppercase tracking-wider">
            <Filter size={12} />
            <span>Advanced Search</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-900 rounded-lg p-4 text-white relative overflow-hidden shadow-md flex flex-col justify-between h-[100px]">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[9px] font-black tracking-[0.2em] text-indigo-300 uppercase">Live Queue</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-bold tracking-tighter">12</div>
            <div className="text-[10px] font-medium text-indigo-200">Active AI Engagements</div>
          </div>
        </div>

        {[
          { label: 'Total Leads (24h)', value: '1,248', trend: '+14%', positive: true },
          { label: 'Conversion Rate', value: '8.4%', trend: '+2.1%', positive: true },
          { label: 'Avg Contact Latency', value: '42s', trend: 'Optimal', positive: null },
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

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prospect List</h4>
          <span className="text-[9px] font-bold text-slate-400">1,248 Total Records</span>
        </div>
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-2 px-6 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
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
              {mockLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={`hover:bg-indigo-50/30 transition-colors group cursor-pointer ${lead.status === 'HOT' ? 'bg-amber-50/10' : ''}`}
                  onClick={() => onNavigate('lead-detail')}
                >
                  <td className="py-3 px-6" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
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
                          style={{ width: `${lead.score}%` }}
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
                    <button className="text-slate-300 hover:text-slate-600 transition-colors p-1">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Page 1 of 125
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white border border-slate-200 rounded px-3 py-1 text-[10px] font-bold text-slate-300 cursor-not-allowed uppercase tracking-wider" disabled>
              Prev
            </button>
            <button className="bg-white border border-slate-200 rounded px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
