
import React from 'react';

const TICKER_ITEMS = [
  { symbol: 'XAU/USD', price: '2,642.50', change: '+0.45%', up: true },
  { symbol: 'XAG/USD', price: '31.12', change: '+1.20%', up: true },
  { symbol: 'EUR/USD', price: '1.0542', change: '-0.12%', up: false },
  { symbol: 'GBP/USD', price: '1.2655', change: '+0.08%', up: true },
  { symbol: 'USD/JPY', price: '149.32', change: '+0.54%', up: true },
  { symbol: 'BTC/USD', price: '96,420.00', change: '+2.41%', up: true },
  { symbol: 'ETH/USD', price: '3,452.10', change: '-1.15%', up: false },
  { symbol: 'DXY', price: '106.42', change: '+0.11%', up: true },
  { symbol: 'WTI CRUDE', price: '71.24', change: '-0.85%', up: false },
  { symbol: 'SPX 500', price: '5,962.40', change: '+0.23%', up: true },
];

const LiveTicker: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  // We double the array to create a seamless loop
  const displayItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-900 overflow-hidden h-11 relative z-20 flex items-center backdrop-blur-md transition-colors duration-500">
      {/* Edge blending gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-[#020617] to-transparent z-30 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-[#020617] to-transparent z-30 pointer-events-none"></div>
      
      <div className="flex animate-marquee whitespace-nowrap">
        {displayItems.map((item, idx) => (
          <div key={`${item.symbol}-${idx}`} className="flex items-center gap-6 px-8 group cursor-default">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">
              {item.symbol}
            </span>
            <span className="text-[12px] font-black tabular-nums text-slate-900 dark:text-slate-100">
              {item.price}
            </span>
            <span className={`text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded ${
              item.up 
                ? 'text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' 
                : 'text-rose-500 bg-rose-500/5 dark:bg-rose-500/10'
            }`}>
              {item.up ? <i className="fa-solid fa-caret-up mr-1"></i> : <i className="fa-solid fa-caret-down mr-1"></i>}
              {item.change}
            </span>
            {/* Visual separator */}
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 ml-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
