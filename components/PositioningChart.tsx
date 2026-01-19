
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { CotRecord } from '../types';

interface Props {
  data: CotRecord[];
}

const THEMES = [
  { name: 'Standard', bullish: '#10b981', bearish: '#ef4444' },
  { name: 'Modern Blue', bullish: '#3b82f6', bearish: '#f43f5e' },
  { name: 'Cyber Neon', bullish: '#06b6d4', bearish: '#db2777' },
  { name: 'Contrast', bullish: '#cbd5e1', bearish: '#475569' }
];

const PositioningChart: React.FC<Props> = ({ data }) => {
  const [bullishColor, setBullishColor] = useState('#3b82f6');
  const [bearishColor, setBearishColor] = useState('#f43f5e');
  const [showSettings, setShowSettings] = useState(false);

  const chartData = React.useMemo(() => {
    return data.map(d => ({
      name: d.commodity,
      net: d.numNetPos,
      raw: d.netPositions,
      fill: d.numNetPos >= 0 ? bullishColor : bearishColor
    })).sort((a, b) => b.net - a.net);
  }, [data, bullishColor, bearishColor]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl ring-1 ring-white/10">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 border-b border-slate-800 pb-2">{label}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Raw Net Position Column:</p>
          <p className={`text-xl font-black`} style={{ color: data.fill }}>
            {data.raw}
          </p>
        </div>
      );
    }
    return null;
  };

  const applyTheme = (theme: typeof THEMES[0]) => {
    setBullishColor(theme.bullish);
    setBearishColor(theme.bearish);
  };

  return (
    <div className="w-full h-full flex flex-col relative group/chart">
       <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source Column:</p>
          <p className="text-xs text-slate-400 font-medium">Net Positions (Col 4)</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-400 hover:text-blue-500 bg-white/50 dark:bg-slate-950/50 rounded-lg backdrop-blur-md border border-slate-200 dark:border-slate-800 transition-all opacity-0 group-hover/chart:opacity-100"
          >
            <i className={`fa-solid ${showSettings ? 'fa-check' : 'fa-palette'} text-xs`}></i>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-56 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 z-30 overflow-y-auto max-h-[400px]">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Predefined Themes</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {THEMES.map(t => (
                    <button 
                      key={t.name}
                      onClick={() => applyTheme(t)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${bullishColor === t.bullish && bearishColor === t.bearish ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-slate-100 dark:bg-slate-950 border-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                      {t.name}
                      <div className="flex gap-0.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.bullish }}></div>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.bearish }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custom Bullish</p>
                <div className="flex flex-wrap gap-2">
                  {['#10b981', '#3b82f6', '#06b6d4', '#22c55e', '#ffffff'].map(c => (
                    <button 
                      key={c} onClick={() => setBullishColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${bullishColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custom Bearish</p>
                <div className="flex flex-wrap gap-2">
                  {['#f43f5e', '#ef4444', '#db2777', '#f97316', '#475569'].map(c => (
                    <button 
                      key={c} onClick={() => setBearishColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${bearishColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#64748b" 
              fontSize={10} 
              width={140}
              axisLine={false}
              tickLine={false}
              className="font-bold"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine x={0} stroke="#334155" strokeWidth={2} />
            <Bar dataKey="net" radius={[0, 4, 4, 0]} animationDuration={1000}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PositioningChart;
