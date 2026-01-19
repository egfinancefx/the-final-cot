
import React from 'react';
import { CotRecord } from '../types';

interface Props {
  data: CotRecord[];
}

const StatsOverview: React.FC<Props> = ({ data }) => {
  const stats = React.useMemo(() => {
    const netPosArray = data.map(d => d.numNetPos);
    const bullish = data.filter(d => d.numNetPos > 0).length;
    const bearish = data.filter(d => d.numNetPos < 0).length;
    
    // Find biggest weekly change
    const sortedByChange = [...data].sort((a, b) => Math.abs(b.numNetChange) - Math.abs(a.numNetChange));
    const mostActive = sortedByChange[0]?.commodity || 'N/A';
    const activeChange = sortedByChange[0]?.netChange || '0';

    return {
      totalCount: data.length,
      bullish,
      bearish,
      mostActive,
      activeChange
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors shadow-lg">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Assets Tracked</p>
        <div className="flex items-end justify-between">
          <h3 className="text-4xl font-black text-white">{stats.totalCount}</h3>
          <i className="fa-solid fa-globe text-blue-500 text-2xl mb-1 opacity-50"></i>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Active monitored futures contracts</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-emerald-500/50 transition-colors shadow-lg">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Net Long Sentiment</p>
        <div className="flex items-end justify-between">
          <h3 className="text-4xl font-black text-emerald-500">{stats.bullish}</h3>
          <i className="fa-solid fa-arrow-trend-up text-emerald-500 text-2xl mb-1 opacity-50"></i>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Assets with positive commercial net positioning</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-rose-500/50 transition-colors shadow-lg">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Net Short Sentiment</p>
        <div className="flex items-end justify-between">
          <h3 className="text-4xl font-black text-rose-500">{stats.bearish}</h3>
          <i className="fa-solid fa-arrow-trend-down text-rose-500 text-2xl mb-1 opacity-50"></i>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Assets with negative commercial net positioning</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-amber-500/50 transition-colors shadow-lg">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Weekly Momentum Leader</p>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl font-black text-white truncate max-w-[150px]">{stats.mostActive}</h3>
            <span className={`text-sm font-bold ${stats.activeChange.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stats.activeChange} change
            </span>
          </div>
          <i className="fa-solid fa-bolt-lightning text-amber-500 text-2xl mb-1 opacity-50"></i>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Largest net shift in positions this week</p>
      </div>
    </div>
  );
};

export default StatsOverview;
