
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { CotRecord, HistoricalCotRecord } from '../types';
import { Language } from '../translations';

interface Props {
  posData: CotRecord[];
  histData: HistoricalCotRecord[];
  lang: Language;
  t: any;
}

interface LivePrice {
  price: number;
  direction: 'up' | 'down' | 'flat';
}

const FOCUS_SYMBOLS = [
  { id: 'Gold', labelKey: 'Gold', icon: 'fa-solid fa-coins', color: '#eab308', binanceSymbol: 'PAXGUSDT' },
  { id: 'Euro FX', labelKey: 'Euro FX', icon: 'fa-solid fa-euro-sign', color: '#3b82f6', binanceSymbol: 'EURUSDT' },
  { id: 'Bitcoin Micro', labelKey: 'Bitcoin', icon: 'fa-brands fa-bitcoin', color: '#f7931a', binanceSymbol: 'BTCUSDT' },
  { id: 'Nasdaq 100 E-Mini', labelKey: 'Nasdaq 100', icon: 'fa-solid fa-chart-line', color: '#8b5cf6', binanceSymbol: 'SIMULATED' }
];

const SymbolFocusCards: React.FC<Props> = ({ posData, histData, lang, t }) => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      const newPrices: Record<string, LivePrice> = { ...prices };
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const allPrices = await response.json();
        
        FOCUS_SYMBOLS.forEach(focus => {
          if (focus.binanceSymbol === 'SIMULATED') {
            const base = prevPricesRef.current[focus.id] || 18245.50;
            const volatility = base * 0.00015;
            const change = (Math.random() - 0.5) * volatility;
            const newPrice = base + change;
            newPrices[focus.id] = { price: newPrice, direction: newPrice > base ? 'up' : (newPrice < base ? 'down' : 'flat') };
            prevPricesRef.current[focus.id] = newPrice;
          } else {
            const match = allPrices.find((p: any) => p.symbol === focus.binanceSymbol);
            if (match) {
              const currentPrice = parseFloat(match.price);
              const prevPrice = prevPricesRef.current[focus.id] || currentPrice;
              newPrices[focus.id] = { price: currentPrice, direction: currentPrice > prevPrice ? 'up' : (currentPrice < prevPrice ? 'down' : 'flat') };
              prevPricesRef.current[focus.id] = currentPrice;
            }
          }
        });
        setPrices(newPrices);
      } catch (error) {}
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (label: string, val: number) => {
    if (label.includes('Bitcoin')) return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (label.includes('Gold')) return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (label.includes('FX')) return val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {FOCUS_SYMBOLS.map((focus) => {
        const pRecord = posData.find(d => d.commodity === focus.id);
        const hRecord = histData.find(d => d.commodity === focus.id);
        const live = prices[focus.id];
        const chartData = hRecord ? [...hRecord.weeks].slice(0, 10).reverse().map(w => ({ val: w.numValue })) : [];
        const getChangeColor = (val?: string) => (!val || val === '0') ? 'text-slate-500' : val.includes('+') ? 'text-blue-500' : 'text-rose-500';
        
        // Pulse logic based on live direction
        const pulseClass = live?.direction === 'up' 
          ? 'animate-pulse-emerald' 
          : live?.direction === 'down' 
            ? 'animate-pulse-rose' 
            : 'animate-pulse-blue';
        
        const priceColor = live?.direction === 'up' 
          ? 'text-emerald-500' 
          : live?.direction === 'down' 
            ? 'text-rose-500' 
            : 'text-slate-700 dark:text-slate-200';

        return (
          <div 
            key={focus.id} 
            style={{ '--theme-color': focus.color } as React.CSSProperties}
            className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-xl transition-all duration-500 group overflow-hidden relative hover:-translate-y-2 hover:scale-[1.03] hover:border-[var(--theme-color)] hover:shadow-[0_0_40px_-10px_var(--theme-color)]"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 group-hover:opacity-15 transition-opacity duration-700 rounded-full pointer-events-none" style={{ backgroundColor: focus.color }}></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all group-hover:scale-110 duration-500 shadow-md ${pulseClass}`}>
                  <i className={`${focus.icon} text-lg`} style={{ color: focus.color }}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{focus.labelKey}</h3>
                    <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800">
                      <span className={`w-1 h-1 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)] ${live?.direction === 'up' ? 'bg-emerald-500 shadow-emerald-500/80' : live?.direction === 'down' ? 'bg-rose-500 shadow-rose-500/80' : 'bg-blue-500'}`}></span>
                      <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">{t.live}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5 min-h-[1.5rem]">
                    <span className={`text-lg font-black tabular-nums transition-colors duration-500 ${priceColor}`}>
                      {live ? formatPrice(focus.labelKey, live.price) : '---'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">USD</span>
                  </div>
                </div>
              </div>
              <div className={`${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">{t.cotNetShift}</p>
                <p className={`text-xs font-black ${getChangeColor(pRecord?.netChange)}`}>{pRecord?.netChange || '0'}</p>
              </div>
            </div>
            
            <div className="h-20 w-full mb-6 relative z-10 group/spark">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <filter id={`glow-${focus.id}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <YAxis hide domain={['auto', 'auto']} />
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke={focus.color} 
                    strokeWidth={3} 
                    fill="transparent" 
                    filter={`url(#glow-${focus.id})`}
                    animationDuration={1200} 
                    animationEasing="ease-in-out"
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800/50 pt-4 relative z-10 transition-colors duration-500 group-hover:border-[var(--theme-color)]/30">
              <div>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em] mb-1">{t.longDelta}</p>
                <p className={`text-sm font-black tabular-nums ${getChangeColor(pRecord?.longChange)}`}>{pRecord?.longChange || '0'}</p>
              </div>
              <div className={`${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em] mb-1">{t.shortDelta}</p>
                <p className={`text-sm font-black tabular-nums ${getChangeColor(pRecord?.shortChange)}`}>{pRecord?.shortChange || '0'}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SymbolFocusCards;
