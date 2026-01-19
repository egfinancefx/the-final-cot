
import React, { useState } from 'react';
import { HistoricalCotRecord } from '../types';

interface Props {
  data: HistoricalCotRecord[];
  t: any;
}

const HistoricalTable: React.FC<Props> = ({ data, t }) => {
  const [weeksVisible, setWeeksVisible] = useState(6);
  const [showConfig, setShowConfig] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    assetName: true
  });

  if (data.length === 0) return null;

  const weekHeaders = data[0].weeks.slice(0, weeksVisible).map(w => w.date);

  const getPosStyle = (val: string) => {
    if (val.includes('-')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="relative">
      <div className="absolute top-[-54px] right-8 z-30">
        <button 
          onClick={() => setShowConfig(!showConfig)} 
          className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg transition-all duration-300 ${showConfig ? 'bg-blue-600 border-blue-500 text-white scale-110' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400'}`}
        >
          <i className={`fa-solid ${showConfig ? 'fa-check' : 'fa-sliders'}`}></i>
        </button>
        {showConfig && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowConfig(false)}></div>
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.toggleColumns}</h4>
                <i className="fa-solid fa-clock-rotate-left text-slate-300"></i>
              </div>
              
              <div className="space-y-6">
                {/* Column Visibility */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={visibleCols.assetName} 
                        onChange={() => setVisibleCols(prev => ({ ...prev, assetName: !prev.assetName }))} 
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-700 checked:bg-blue-500 checked:border-blue-500 transition-all"
                      />
                      <i className="fa-solid fa-check absolute text-[10px] text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></i>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                      {t.assetName}
                    </span>
                  </label>
                </div>

                {/* Depth Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.historicalDepth}</span>
                    <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[10px] font-black">{weeksVisible} {t.weeks}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    value={weeksVisible} 
                    onChange={(e) => setWeeksVisible(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[8px] font-bold text-slate-400">1W</span>
                    <span className="text-[8px] font-bold text-slate-400">12W</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
              {visibleCols.assetName && (
                <th className="py-4 px-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.15em] border-b border-slate-200 dark:border-slate-800">{t.assetName}</th>
              )}
              {weekHeaders.map((date) => (
                <th key={date} className="py-4 px-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.15em] border-b border-slate-200 dark:border-slate-800 text-center">
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
            {data.map((record, idx) => (
              <tr 
                key={record.commodity} 
                className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors group animate-row-entry"
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {visibleCols.assetName && (
                  <td className="py-4 px-5 font-black text-slate-900 dark:text-slate-100 text-[13px] group-hover:text-blue-500 transition-colors whitespace-nowrap">
                    {record.commodity}
                  </td>
                )}
                {record.weeks.slice(0, weeksVisible).map((week, wIdx) => (
                  <td key={wIdx} className="py-4 px-5 text-center">
                    <span className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-black tabular-nums shadow-sm transition-all duration-300 group-hover:scale-105 inline-block ${getPosStyle(week.value)}`}>
                      {week.value}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricalTable;
