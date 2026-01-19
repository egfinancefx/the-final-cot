
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../translations';

interface Props {
  onOpenImport: () => void;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  symbols: string[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
  t: any;
}

const DashboardHeader: React.FC<Props> = ({ 
  onOpenImport, selectedSymbol, onSelectSymbol, symbols, 
  theme, onToggleTheme, lang, onSetLang, t 
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  
  const langRef = useRef<HTMLDivElement>(null);
  const symbolRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setLangOpen(false);
      if (symbolRef.current && !symbolRef.current.contains(event.target as Node)) setSymbolOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' }
  ];

  const currentLangLabel = languages.find(l => l.code === lang)?.label || 'English';

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: 'EG-Finance Fx COT',
      text: 'Institutional COT Data Analysis & Macro Intelligence Terminal',
      url: shareUrl,
    };

    // 1. Try Web Share API (Requires 'web-share' permission in frame)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return; 
      } catch (err) {
        console.warn('Web Share failed, attempting fallback...', err);
      }
    }

    // 2. Primary Fallback: Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
        return;
      } catch (err) {
        console.error('Clipboard API failed:', err);
      }
    }

    // 3. Last Resort: execCommand('copy')
    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (err) {
      console.error('All sharing fallbacks failed:', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 p-4 transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        
        {/* Logo Section */}
        <div 
          className="flex items-center gap-4 cursor-pointer group select-none"
          onClick={() => {
            onSelectSymbol('All Assets');
            setSymbolOpen(false);
          }}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-2xl transition-colors">
              <i className="fa-solid fa-chart-line text-blue-500 text-2xl"></i>
            </div>
          </div>
          <div className="min-w-fit">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white whitespace-nowrap">
              {t.title} <span className="text-blue-500">{t.subtitle}</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">{t.ledger}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 gap-4 max-w-3xl items-center md:justify-end">
          
          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="w-10 h-10 rounded-xl bg-transparent border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-blue-500/10 relative overflow-visible"
            title={t.share}
          >
            {showCopied ? (
              <i className="fa-solid fa-check text-emerald-500 animate-in zoom-in duration-300"></i>
            ) : (
              <i className="fa-solid fa-share-nodes"></i>
            )}
            {showCopied && (
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap animate-in slide-in-from-bottom-2 duration-300 uppercase tracking-widest shadow-xl ring-1 ring-white/10">
                {t.copied}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl bg-transparent border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-blue-500/10"
            title="Toggle Theme"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          {/* Custom Language Selector */}
          <div className="relative w-full md:w-40" ref={langRef}>
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-[10px] font-black text-slate-600 dark:text-slate-300 flex items-center justify-between transition-all hover:border-blue-500/50 group uppercase tracking-wider shadow-sm"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-globe text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity"></i>
                {currentLangLabel}
              </div>
              <i className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {langOpen && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 p-1.5 backdrop-blur-2xl">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onSetLang(l.code as Language);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-between group ${
                      lang === l.code 
                        ? 'bg-blue-500/5 text-blue-500 border border-blue-500/10' 
                        : 'text-slate-500 hover:bg-blue-500/10 hover:text-blue-500 border border-transparent'
                    }`}
                  >
                    {l.label}
                    {lang === l.code && <i className="fa-solid fa-check text-[8px]"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Asset Selector */}
          <div className="relative w-full md:w-64" ref={symbolRef}>
            <button 
              onClick={() => setSymbolOpen(!symbolOpen)}
              className={`w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-[11px] font-black text-slate-600 dark:text-slate-300 flex items-center justify-between transition-all hover:border-blue-500/50 group uppercase tracking-wider shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-filter text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity"></i>
                <span className="truncate max-w-[120px]">{selectedSymbol === 'All Assets' ? t.allAssets : selectedSymbol}</span>
              </div>
              <i className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-300 ${symbolOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {symbolOpen && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 p-1.5 backdrop-blur-2xl">
                <div className="max-h-[360px] overflow-y-auto no-scrollbar space-y-1">
                  <button
                    onClick={() => {
                      onSelectSymbol('All Assets');
                      setSymbolOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-between group ${
                      selectedSymbol === 'All Assets' 
                        ? 'bg-blue-500/5 text-blue-500 border border-blue-500/10' 
                        : 'text-slate-500 hover:bg-blue-500/10 hover:text-blue-500 border border-transparent'
                    }`}
                  >
                    {t.allAssets}
                    {selectedSymbol === 'All Assets' && <i className="fa-solid fa-check text-[8px]"></i>}
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-1"></div>
                  {symbols.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onSelectSymbol(s);
                        setSymbolOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-between group ${
                        selectedSymbol === s 
                          ? 'bg-blue-500/5 text-blue-500 border border-blue-500/10' 
                          : 'text-slate-500 hover:bg-blue-500/10 hover:text-blue-500 border border-transparent'
                      }`}
                    >
                      {s}
                      {selectedSymbol === s && <i className="fa-solid fa-check text-[8px]"></i>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={onOpenImport}
            className="whitespace-nowrap bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-500 hover:text-white px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 uppercase shadow-lg shadow-blue-500/5 group transform hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-cloud-arrow-up group-hover:animate-bounce"></i>
            {t.upload}
          </button>
        </div>

        <div className="hidden xl:flex items-center gap-6">
          <div className={`flex flex-col ${lang === 'ar' ? 'items-start' : 'items-end'}`}>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">{t.databaseStatus}</p>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t.connected}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
