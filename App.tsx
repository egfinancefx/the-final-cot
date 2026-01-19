
import React, { useState, useMemo, useEffect } from 'react';
import { RAW_POSITIONS_CSV_DATA, RAW_HISTORICAL_CSV_DATA, SYMBOLS_TO_FOCUS } from './constants';
import { parsePositionsCSV, parseHistoricalCSV } from './utils/csvParser';
import { CotRecord, HistoricalCotRecord } from './types';
import { Language, translations } from './translations';
import DashboardHeader from './components/DashboardHeader';
import CotTable from './components/CotTable';
import HistoricalTable from './components/HistoricalTable';
import DataImportModal from './components/DataImportModal';
import SymbolFocusCards from './components/SymbolFocusCards';
import SymbolDetailCard from './components/SymbolDetailCard';
import AiAnalysis from './components/AiAnalysis';
import LiveTicker from './components/LiveTicker';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );
  const [lang, setLang] = useState<Language>(() => 
    (localStorage.getItem('lang') as Language) || 'en'
  );

  const [posCsv, setPosCsv] = useState<string>(() => {
    return localStorage.getItem('eg_finance_pos_data') || RAW_POSITIONS_CSV_DATA;
  });
  const [histCsv, setHistCsv] = useState<string>(() => {
    return localStorage.getItem('eg_finance_hist_data') || RAW_HISTORICAL_CSV_DATA;
  });
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('All Assets');

  // Helper to normalize strings for comparison
  const normalize = (s: string) => s.toLowerCase().replace(/["\s_-]/g, '');

  const allPosData = useMemo(() => {
    const parsed = parsePositionsCSV(posCsv);
    return parsed.filter(record => 
      SYMBOLS_TO_FOCUS.some(s => {
        const nr = normalize(record.commodity);
        const nf = normalize(s);
        return nr.includes(nf) || nf.includes(nr);
      })
    );
  }, [posCsv]);

  const allHistData = useMemo(() => {
    const parsed = parseHistoricalCSV(histCsv);
    return parsed.filter(record => 
      SYMBOLS_TO_FOCUS.some(s => {
        const nr = normalize(record.commodity);
        const nf = normalize(s);
        return nr.includes(nf) || nf.includes(nr);
      })
    );
  }, [histCsv]);
  
  const availableCommodities = useMemo(() => {
    return allPosData.map(d => d.commodity).sort();
  }, [allPosData]);

  const displayPosData = useMemo(() => {
    if (selectedSymbol !== 'All Assets') {
      return allPosData.filter(d => d.commodity === selectedSymbol);
    }
    return allPosData;
  }, [allPosData, selectedSymbol]);

  const displayHistData = useMemo(() => {
    if (selectedSymbol !== 'All Assets') {
      return allHistData.filter(d => d.commodity === selectedSymbol);
    }
    return allHistData;
  }, [allHistData, selectedSymbol]);

  const handleUpdateData = (newPos: string, newHist: string) => {
    if (newPos) {
      setPosCsv(newPos);
      localStorage.setItem('eg_finance_pos_data', newPos);
    }
    if (newHist) {
      setHistCsv(newHist);
      localStorage.setItem('eg_finance_hist_data', newHist);
    }
    console.log("Database synchronized and persisted to memory.");
    setIsImportOpen(false);
    setSelectedSymbol('All Assets'); 
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = translations[lang];

  return (
    <div className={`flex flex-col min-h-screen bg-transparent transition-colors duration-500 selection:bg-blue-500/30 font-sans ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <DashboardHeader 
        onOpenImport={() => setIsImportOpen(true)}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
        symbols={availableCommodities}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        lang={lang}
        onSetLang={setLang}
        t={t}
      />
      
      <LiveTicker theme={theme} />
      
      <main className="flex-1 p-4 lg:p-8 space-y-12 max-w-[1600px] mx-auto w-full">
        <div className="flex justify-between items-center mb-[-2rem]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Database Permanent Source Active</span>
          </div>
        </div>

        {selectedSymbol === 'All Assets' ? (
          <SymbolFocusCards posData={allPosData} histData={allHistData} lang={lang} t={t} />
        ) : (
          allPosData.find(p => p.commodity === selectedSymbol) && 
          allHistData.find(h => h.commodity === selectedSymbol) && (
            <SymbolDetailCard 
              posData={allPosData.find(p => p.commodity === selectedSymbol)!} 
              histData={allHistData.find(h => h.commodity === selectedSymbol)!} 
              lang={lang}
              t={t}
            />
          )
        )}

        <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500">
          <div className="p-8 border-b border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                <i className="fa-solid fa-table text-blue-500"></i>
                {t.positions}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-bold italic opacity-70 uppercase tracking-widest">
                {t.posSubtitle}
              </p>
            </div>
          </div>
          <CotTable data={displayPosData} t={t} />
        </div>

        <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500">
          <div className="p-8 border-b border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
                {t.historical}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-bold italic opacity-70 uppercase tracking-widest">
                {t.histSubtitle}
              </p>
            </div>
          </div>
          <HistoricalTable data={displayHistData} t={t} />
        </div>

        {selectedSymbol === 'All Assets' && <AiAnalysis data={allPosData} lang={lang} t={t} />}
      </main>

      <footer className="p-10 text-center border-t border-slate-200 dark:border-slate-900/50 bg-white/50 dark:bg-slate-950/30 mt-auto backdrop-blur-lg transition-colors">
        <p className="font-black tracking-[0.4em] text-slate-400 dark:text-slate-600 text-[10px] mb-4 uppercase">{t.footerClaim}</p>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest opacity-60">© {new Date().getFullYear()} {t.footerNote}</p>
      </footer>

      {isImportOpen && (
        <DataImportModal 
          onClose={() => setIsImportOpen(false)} 
          onSave={handleUpdateData}
          initialPos={posCsv}
          initialHist={histCsv}
          t={t}
        />
      )}
    </div>
  );
}

export default App;
