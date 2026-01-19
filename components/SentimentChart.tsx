
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { CotRecord } from '../types';

interface Props {
  data: CotRecord[];
}

const THEMES = [
  { name: 'Standard', long: '#10b981', short: '#ef4444' },
  { name: 'Modern Blue', long: '#3b82f6', short: '#f43f5e' },
  { name: 'Cyber Neon', long: '#06b6d4', short: '#db2777' },
  { name: 'Gray/Contrast', long: '#94a3b8', short: '#1e293b' }
];

const SentimentChart: React.FC<Props> = ({ data }) => {
  const [longColor, setLongColor] = useState('#3b82f6');
  const [shortColor, setShortColor] = useState('#f43f5e');
  const [mode, setMode] = useState<'stacked' | 'grouped'>('stacked');
  const [showSettings, setShowSettings] = useState(false);

  const chartData = React.useMemo(() => {
    return data.map(d => ({
      name: d.commodity,
      long: d.numLong,
      short: mode === 'stacked' ? -d.numShort : d.numShort, // Inverted for visual split if stacked
      rawLong: d.longPositions,
      rawShort: d.shortPositions
    })).sort((a, b) => (Math.abs(a.long) + Math.abs(a.short)) - (Math.abs(b.long) + Math.abs(b.short)));
  }, [data, mode]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const longPart = payload.find((p: any) => p.dataKey === 'long');
      const shortPart = payload.find((p: any) => p.dataKey === 'short');
      
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl ring-1 ring-white/10">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-800 pb-2">{label}</p>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: longColor }}>From "Long Positions" Column</p>
              <p className="text-lg font-black text-white">{longPart?.payload.rawLong}</p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: shortColor }}>From "Short Positions" Column</p>
              <p className="text-lg font-black text-white">{shortPart?.payload.rawShort}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const applyTheme = (theme: typeof THEMES[0]) => {
    setLongColor(theme.long);
    setShortColor(theme.short);
  };

  return (
    <div className="w-full h-full flex flex-col relative group/chart">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source Columns:</p>
          <p className="text-xs text-slate-400 font-medium">Long Positions (Col 6) & Short Positions (Col 8)</p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-400 hover:text-blue-500 bg-white/50 dark:bg-slate-950/50 rounded-lg backdrop-blur-md border border-slate-200 dark:border-slate-800 transition-all opacity-0 group-hover/chart:opacity-100"
          >
            <i className={`fa-solid ${showSettings ? 'fa-check' : 'fa-chart-simple'} text-xs`}></i>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-56 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 z-30 overflow-y-auto max-h-[400px]">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preset Themes</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {THEMES.map(t => (
                    <button 
                      key={t.name}
                      onClick={() => applyTheme(t)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${longColor === t.long && shortColor === t.short ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-slate-100 dark:bg-slate-950 border-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                      {t.name}
                      <div className="flex gap-0.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.long }}></div>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.short }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Mode</p>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                  {(['stacked', 'grouped'] as const).map(m => (
                    <button 
                      key={m} onClick={() => setMode(m)}
                      className={`flex-1 text-[9px] font-black uppercase py-1.5 rounded-md transition-all ${mode === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custom Colors</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Long</p>
                    <div className="flex flex-wrap gap-2">
                      {['#10b981', '#3b82f6', '#06b6d4', '#22c55e', '#a855f7'].map(c => (
                        <button 
                          key={c} onClick={() => setLongColor(c)}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${longColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Short</p>
                    <div className="flex flex-wrap gap-2">
                      {['#f43f5e', '#ef4444', '#db2777', '#f97316', '#1e293b'].map(c => (
                        <button 
                          key={c} onClick={() => setShortColor(c)}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${shortColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            stackOffset={mode === 'stacked' ? 'sign' : 'none'}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} hide />
            <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.abs(v / 1000)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="square"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
            />
            <Bar dataKey="long" name="Long (Raw)" fill={longColor} radius={mode === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]} animationDuration={1000} />
            <Bar dataKey="short" name="Short (Raw)" fill={shortColor} radius={mode === 'stacked' ? [0, 0, 4, 4] : [4, 4, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentChart;
