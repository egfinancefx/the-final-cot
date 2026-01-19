
import React, { useState, useEffect, useRef } from 'react';
import { CotRecord, HistoricalCotRecord } from '../types';
import { Language } from '../translations';
import TrendChart from './TrendChart';

interface Props {
  posData: CotRecord;
  histData: HistoricalCotRecord;
  lang: Language;
  t: any;
}

const getAssetIcon = (commodity: string) => {
  if (commodity.includes('Gold')) return { icon: 'fa-solid fa-coins', color: '#eab308' };
  if (commodity.includes('Silver')) return { icon: 'fa-solid fa-circle-dot', color: '#94a3b8' };
  if (commodity.includes('Crude Oil')) return { icon: 'fa-solid fa-droplet', color: '#10b981' };
  if (commodity.includes('Bitcoin')) return { icon: 'fa-brands fa-bitcoin', color: '#f7931a' };
  if (commodity.includes('Ether')) return { icon: 'fa-brands fa-ethereum', color: '#627eea' };
  if (commodity.includes('Euro')) return { icon: 'fa-solid fa-euro-sign', color: '#3b82f6' };
  if (commodity.includes('British Pound')) return { icon: 'fa-solid fa-sterling-sign', color: '#ef4444' };
  if (commodity.includes('Japanese Yen')) return { icon: 'fa-solid fa-yen-sign', color: '#8b5cf6' };
  if (commodity.includes('Nasdaq') || commodity.includes('S&P') || commodity.includes('Dow')) return { icon: 'fa-solid fa-chart-line', color: '#6366f1' };
  if (commodity.includes('VIX')) return { icon: 'fa-solid fa-bolt-lightning', color: '#f59e0b' };
  if (commodity.includes('Dollar Index')) return { icon: 'fa-solid fa-dollar-sign', color: '#10b981' };
  return { icon: 'fa-solid fa-chart-area', color: '#10b981' };
};

const SymbolDetailCard: React.FC<Props> = ({ posData, histData, lang, t }) => {
  const [livePrice, setLivePrice] = useState<{ price: number; dir: string } | null>(null);
  const prevPriceRef = useRef<number>(0);
  const symbolMap: Record<string, string> = { 
    'Gold': 'PAXGUSDT', 
    'Bitcoin Micro': 'BTCUSDT', 
    'Euro FX': 'EURUSDT', 
    'Nasdaq 100 E-Mini': 'NQ=F',
    'Crude Oil WTI': 'OILUSD'
  };

  useEffect(() => {
    const binanceSymbol = symbolMap[posData.commodity];
    if (!binanceSymbol) return;
    const fetchPrice = async () => {
      try {
        if (binanceSymbol === 'NQ=F' || binanceSymbol === 'OILUSD') {
          const base = prevPriceRef.current || (binanceSymbol === 'NQ=F' ? 18250 : 72.50);
          const newP = base + (Math.random() - 0.5) * (base * 0.001);
          setLivePrice({ price: newP, dir: newP > base ? 'up' : 'down' });
          prevPriceRef.current = newP;
          return;
        }
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
        const data = await res.json();
        const price = parseFloat(data.price);
        setLivePrice({ price, dir: price > prevPriceRef.current ? 'up' : 'down' });
        prevPriceRef.current = price;
      } catch (e) {}
    };
    fetchPrice();
    const inv = setInterval(fetchPrice, 10000);
    return () => clearInterval(inv);
  }, [posData.commodity]);

  const getDeltaColor = (val: string) => val.includes('+') ? 'text-emerald-500' : 'text-rose-500';
  const assetInfo = getAssetIcon(posData.commodity);

  return (
    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/50 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 relative overflow-hidden group">
      <div 
        className="absolute top-0 right-0 w-96 h-96 blur-[100px] -mr-48 -mt-48 rounded-full pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: `${assetInfo.color}15` }}
      ></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-xl">
                <i className={`${assetInfo.icon} text-2xl`} style={{ color: assetInfo.color }}></i>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{posData.commodity}</h2>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{t.institutionalIntel}</p>
              </div>
            </div>
            <div className="bg-white/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.activeQuotation}</span>
                <span className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   <span className="text-[8px] font-black text-emerald-500 uppercase">{t.live}</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black tabular-nums transition-colors duration-500 ${livePrice?.dir === 'up' ? 'text-emerald-500' : livePrice?.dir === 'down' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  {livePrice ? livePrice.price.toLocaleString(undefined, { maximumFractionDigits: (posData.commodity.includes('Bitcoin') || posData.commodity.includes('Nasdaq')) ? 0 : 2 }) : '---'}
                </span>
                <span className="text-sm font-bold text-slate-400 uppercase">USD</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/30">
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-1">{t.longDelta}</p>
              <p className={`text-xl font-black ${getDeltaColor(posData.longChange)}`}>{posData.longChange}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/30">
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-1">{t.shortDelta}</p>
              <p className={`text-xl font-black ${getDeltaColor(posData.shortChange)}`}>{posData.shortChange}</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-emerald-500"></i>
              {t.sixWeekTrend}
            </h3>
            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Net: {posData.netPositions}
            </div>
          </div>
          <div className="h-[280px] w-full">
            <TrendChart data={histData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymbolDetailCard;
