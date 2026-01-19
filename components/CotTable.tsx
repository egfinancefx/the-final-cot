
import React, { useState, useEffect, useRef } from 'react';
import { CotRecord } from '../types';

interface Props {
  data: CotRecord[];
  t: any;
}

const NetChangeCell: React.FC<{ value: string; className: string }> = ({ value, className }) => {
  const [isHighlighting, setIsHighlighting] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsHighlighting(true);
      const timer = setTimeout(() => setIsHighlighting(false), 1000);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  // Determine flash background color based on direction
  const flashBg = value.includes('+') 
    ? 'rgba(59, 130, 246, 0.25)' 
    : value.includes('-') 
      ? 'rgba(244, 63, 94, 0.25)' 
      : 'rgba(148, 163, 184, 0.15)';

  return (
    <td 
      className={`py-4 px-5 tabular-nums text-[12px] transition-colors relative overflow-hidden ${className}`}
      style={{ '--flash-bg': flashBg } as React.CSSProperties}
    >
      {isHighlighting && <div className="absolute inset-0 animate-flash-highlight pointer-events-none"></div>}
      <span className={`relative z-10 inline-block transition-transform duration-300 ${isHighlighting ? 'animate-text-pulse' : ''}`}>
        {value}
      </span>
    </td>
  );
};

const CotTable: React.FC<Props> = ({ data, t }) => {
  const [sortKey, setSortKey] = useState<keyof CotRecord>('commodity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [visibleCols, setVisibleCols] = useState({
    assetName: true,
    netPos: true,
    netChg: true,
    longPos: true,
    longChg: true,
    shortPos: true,
    shortChg: true
  });
  const [showConfig, setShowConfig] = useState(false);

  const handleSort = (key: keyof CotRecord) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const getNum = (rec: CotRecord, key: string) => {
      const numKey = `num${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      return (rec as any)[numKey] ?? 0;
    };
    const aCompare = typeof a[sortKey] === 'number' ? (a[sortKey] as number) : getNum(a, sortKey.startsWith('num') ? sortKey.slice(3) : sortKey);
    const bCompare = typeof b[sortKey] === 'number' ? (b[sortKey] as number) : getNum(b, sortKey.startsWith('num') ? sortKey.slice(3) : sortKey);
    return sortDir === 'asc' ? (aCompare > bCompare ? 1 : -1) : (aCompare < bCompare ? 1 : -1);
  });

  const getChangeStyle = (val: string) => val.includes('+') ? 'text-blue-500 font-bold' : val.includes('-') ? 'text-rose-500 font-bold' : 'text-slate-400';
  const getNetPosStyle = (val: string) => val.includes('-') ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/30';

  const columnLabels: Record<string, string> = {
    assetName: t.assetName,
    netPos: t.netPosition,
    netChg: t.netChange,
    longPos: t.longPos,
    longChg: t.longChg,
    shortPos: t.shortPos,
    shortChg: t.shortChg
  };

  return (
    <div className="relative">
      <div className="absolute top-[-54px] right-8 z-30">
        <button 
          onClick={() => setShowConfig(!showConfig)} 
          className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg transition-all duration-300 ${showConfig ? 'bg-blue-600 border-blue-500 text-white scale-110' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400'}`}
        >
          <i className={`fa-solid ${showConfig ? 'fa-check' : 'fa-columns'}`}></i>
        </button>
        {showConfig && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowConfig(false)}></div>
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.toggleColumns}</h4>
                <i className="fa-solid fa-layer-group text-slate-300"></i>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(visibleCols).map((key) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={(visibleCols as any)[key]} 
                        onChange={() => setVisibleCols(prev => ({ ...prev, [key]: !(prev as any)[key] }))} 
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-700 checked:bg-blue-500 checked:border-blue-500 transition-all"
                      />
                      <i className="fa-solid fa-check absolute text-[10px] text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></i>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                      {columnLabels[key]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
              {visibleCols.assetName && <Th label={t.assetName} sortKey="commodity" activeSort={sortKey} dir={sortDir} onClick={() => handleSort('commodity')} />}
              {visibleCols.netPos && <Th label={t.netPosition} sortKey="numNetPos" activeSort={sortKey} dir={sortDir} onClick={() => handleSort('numNetPos')} />}
              {visibleCols.netChg && <Th label={t.netChange} sortKey="numNetChange" activeSort={sortKey} dir={sortDir} onClick={() => handleSort('numNetChange')} />}
              {visibleCols.longPos && <Th label={t.longPos} sortKey="numLong" activeSort={sortKey} dir={sortDir} onClick={() => handleSort('numLong')} />}
              {visibleCols.longChg && <Th label={t.longChg} sortKey="longChange" activeSort={sortKey} dir={sortDir} onClick={() => handleSort('longChange')} />}
              {visibleCols.shortPos && <Th label={t.shortPos} sortKey="numShort" activeSort={sortKey} dir={sortDir} onClick={() => handleSort('numShort')} />}
              {visibleCols.shortChg && <Th label={t.shortChg} sortKey="shortChange" activeSort={sortKey} dir={sortDir} onClick={() => handleSort('shortChange')} />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
            {sortedData.map((record, idx) => (
              <tr key={record.commodity} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors group animate-row-entry" style={{ animationDelay: `${idx * 20}ms` }}>
                {visibleCols.assetName && <td className="py-4 px-5 font-black text-slate-900 dark:text-slate-100 text-[13px] group-hover:text-blue-500 whitespace-nowrap transition-colors">{record.commodity}</td>}
                {visibleCols.netPos && <td className="py-4 px-5"><span className={`px-2.5 py-1.5 rounded-lg border text-[12px] font-black tabular-nums shadow-sm ${getNetPosStyle(record.netPositions)}`}>{record.netPositions}</span></td>}
                {visibleCols.netChg && <NetChangeCell value={record.netChange} className={getChangeStyle(record.netChange)} />}
                {visibleCols.longPos && <td className="py-4 px-5 font-bold text-slate-600 dark:text-slate-300 text-[12px] tabular-nums">{record.longPositions}</td>}
                {visibleCols.longChg && <td className={`py-4 px-5 tabular-nums text-[12px] ${getChangeStyle(record.longChange)}`}>{record.longChange}</td>}
                {visibleCols.shortPos && <td className="py-4 px-5 font-bold text-slate-600 dark:text-slate-300 text-[12px] tabular-nums">{record.shortPositions}</td>}
                {visibleCols.shortChg && <td className={`py-4 px-5 tabular-nums text-[12px] ${getChangeStyle(record.shortChange)}`}>{record.shortChange}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Th = ({ label, sortKey, activeSort, dir, onClick }: any) => {
  const isActive = activeSort === sortKey;
  return (
    <th className="py-4 px-5 text-slate-500 font-black text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group border-b border-slate-200 dark:border-slate-800" onClick={onClick}>
      <div className="flex items-center gap-2">
        {label}
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
           {isActive ? (
             <i className={`fa-solid fa-sort-${dir === 'asc' ? 'up' : 'down'} text-blue-500 text-[11px]`}></i>
           ) : (
             <i className="fa-solid fa-sort text-slate-300 dark:text-slate-700"></i>
           )}
        </div>
      </div>
    </th>
  );
};

export default CotTable;
