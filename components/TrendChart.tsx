
import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar,
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Line,
  Cell
} from 'recharts';
import { HistoricalCotRecord } from '../types';

interface Props {
  data: HistoricalCotRecord;
}

const TV_SYMBOL_MAP: Record<string, string> = {
  "Crude Oil WTI": "OANDA:WTICOUSD",
  "Gold": "OANDA:XAUUSD",
  "Silver": "OANDA:XAGUSD",
  "U.S. Dollar Index": "TVC:DXY",
  "Bitcoin Micro": "BINANCE:BTCUSDT",
  "Ether Micro": "BINANCE:ETHUSDT",
  "British Pound": "FX:GBPUSD",
  "Canadian Dollar": "FX:USDCAD",
  "Japanese Yen": "FX:USDJPY",
  "Swiss Franc": "FX:USDCHF",
  "Euro FX": "FX:EURUSD",
  "Australian Dollar": "FX:AUDUSD",
  "New Zealand Dollar": "FX:NZDUSD",
  "S&P 500 E-Mini": "CME_MINI:ES1!",
  "Nasdaq 100 E-Mini": "CME_MINI:NQ1!",
  "Dow Futures Mini": "CME_MINI:YM1!",
  "S&P 500 VIX": "CBOE:VIX"
};

const TrendChart: React.FC<Props> = ({ data }) => {
  const [showSMA, setShowSMA] = useState(true);
  const [isTVMode, setIsTVMode] = useState(false);
  const tvContainerRef = useRef<HTMLDivElement>(null);

  const chartData = React.useMemo(() => {
    const raw = [...data.weeks].slice(0, 12).reverse();
    return raw.map((w, idx) => {
      const currentPos = w.numValue;
      const prevPos = idx > 0 ? raw[idx - 1].numValue : currentPos;
      let sma = null;
      if (idx >= 3) {
        const sum = raw.slice(idx - 3, idx + 1).reduce((acc, curr) => acc + curr.numValue, 0);
        sma = sum / 4;
      }
      return {
        name: w.date,
        pos: currentPos,
        velocity: currentPos - prevPos,
        sma: sma,
        original: w.value
      };
    });
  }, [data]);

  useEffect(() => {
    if (isTVMode && tvContainerRef.current) {
      tvContainerRef.current.innerHTML = '';
      const symbol = TV_SYMBOL_MAP[data.commodity] || "FX:EURUSD";
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": symbol,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      });
      tvContainerRef.current.appendChild(script);
    }
  }, [isTVMode, data.commodity]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pos = payload.find((p: any) => p.dataKey === 'pos')?.value || 0;
      const vel = payload.find((p: any) => p.dataKey === 'velocity')?.value || 0;
      return (
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl ring-1 ring-white/10 min-w-[180px]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Net Position</span>
              <span className={`text-sm font-black tabular-nums ${pos >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                {pos.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Wkly Velocity</span>
              <span className={`text-[11px] font-black tabular-nums ${vel >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {vel > 0 ? '+' : ''}{vel.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full relative group/chart">
      <div className="absolute top-0 right-0 z-20 flex items-center gap-2 opacity-0 group-hover/chart:opacity-100 transition-opacity">
        <button 
          onClick={() => setShowSMA(!showSMA)}
          className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
            showSMA ? 'bg-amber-600/20 border-amber-500/50 text-amber-500' : 'bg-slate-900/50 border-slate-800 text-slate-500'
          }`}
        >SMA</button>
        <button 
          onClick={() => setIsTVMode(!isTVMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
            isTVMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-500'
          }`}
        >
          <i className="fa-solid fa-chart-line text-xs"></i>
          {isTVMode ? 'Exit TV' : 'TV Chart'}
        </button>
      </div>

      <div className="w-full h-full">
        {isTVMode ? (
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950" ref={tvContainerRef}></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="51%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} dy={10} interval="preserveStartEnd" className="font-black uppercase tracking-tighter" />
              <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} orientation="right" className="font-bold tabular-nums" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
              <Area type="monotone" dataKey="pos" stroke="#3b82f6" strokeWidth={3} fill="url(#sentimentGradient)" animationDuration={1500} baseValue={0} />
              <Bar dataKey="velocity" barSize={12} animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.velocity >= 0 ? '#10b981' : '#f43f5e'} fillOpacity={0.4} />
                ))}
              </Bar>
              {showSMA && <Line type="monotone" dataKey="sma" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={2000} />}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TrendChart;
