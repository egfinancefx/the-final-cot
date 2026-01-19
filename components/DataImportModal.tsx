
import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSave: (pos: string, hist: string) => void;
  initialPos: string;
  initialHist: string;
  t: any;
}

const DataImportModal: React.FC<Props> = ({ onClose, onSave, initialPos, initialHist, t }) => {
  const [posVal, setPosVal] = useState(initialPos);
  const [histVal, setHistVal] = useState(initialHist);
  const [activeTab, setActiveTab] = useState<'pos' | 'hist'>('pos');
  const [syncing, setSyncing] = useState(false);

  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>, target: 'pos' | 'hist') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (target === 'pos') setPosVal(content);
      else setHistVal(content);
    };
    reader.readAsText(file);
  };

  const handleSync = () => {
    setSyncing(true);
    // Add small delay for UX feel
    setTimeout(() => {
      onSave(posVal, histVal);
      setSyncing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-4xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <i className="fa-solid fa-cloud-arrow-up text-blue-500"></i>
              Database Synchronization
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Replace default values with your custom intelligence feed</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex px-8 pt-6 gap-4">
          <button 
            onClick={() => setActiveTab('pos')}
            className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all text-left group ${activeTab === 'pos' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-transparent'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeTab === 'pos' ? 'text-blue-500' : 'text-slate-500'}`}>Part 01</span>
              <i className={`fa-solid fa-table ${activeTab === 'pos' ? 'text-blue-500' : 'text-slate-700'}`}></i>
            </div>
            <h4 className={`text-sm font-black ${activeTab === 'pos' ? 'text-white' : 'text-slate-400'}`}>Positions Breakdown</h4>
          </button>
          <button 
            onClick={() => setActiveTab('hist')}
            className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all text-left group ${activeTab === 'hist' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-transparent'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeTab === 'hist' ? 'text-blue-500' : 'text-slate-500'}`}>Part 02</span>
              <i className={`fa-solid fa-clock-rotate-left ${activeTab === 'hist' ? 'text-blue-500' : 'text-slate-700'}`}></i>
            </div>
            <h4 className={`text-sm font-black ${activeTab === 'hist' ? 'text-white' : 'text-slate-400'}`}>Historical Ledger</h4>
          </button>
        </div>
        
        <div className="p-8 flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verbatim CSV Input</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => handleFileRead(e, activeTab)} 
                className="hidden" 
                id="file-upload" 
              />
              <label 
                htmlFor="file-upload"
                className="text-[10px] font-black text-blue-500 cursor-pointer hover:underline uppercase tracking-widest flex items-center gap-2"
              >
                <i className="fa-solid fa-file-circle-plus"></i>
                Upload CSV File
              </label>
            </div>
          </div>

          <div className="flex-1 relative">
            <textarea 
              className="w-full h-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 font-mono text-xs focus:outline-none focus:border-blue-500/50 transition-all resize-none text-slate-300"
              value={activeTab === 'pos' ? posVal : histVal}
              onChange={(e) => activeTab === 'pos' ? setPosVal(e.target.value) : setHistVal(e.target.value)}
              placeholder={`Paste your ${activeTab === 'pos' ? 'Breakdown' : 'Historical'} CSV data here...`}
            />
          </div>
          
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/50 flex items-center gap-4">
            <i className="fa-solid fa-shield-halved text-blue-500 text-lg"></i>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              Upon synchronization, this data will be stored locally in your browser. It will persist across refreshes and sessions.
            </p>
          </div>
        </div>

        <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${posVal !== initialPos ? 'bg-blue-500 shadow-lg' : 'bg-slate-800'}`}></div>
             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${histVal !== initialHist ? 'bg-blue-500 shadow-lg' : 'bg-slate-800'}`}></div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              disabled={syncing}
              className="px-6 py-3 text-xs font-black text-slate-500 hover:text-white transition-colors tracking-widest disabled:opacity-50"
            >
              CANCEL
            </button>
            <button 
              onClick={handleSync}
              disabled={syncing}
              className={`bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-2xl text-xs font-black tracking-widest transition-all shadow-xl flex items-center gap-3 disabled:bg-slate-700 disabled:cursor-wait`}
            >
              {syncing ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  COMMITTING...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  SYNC PERMANENTLY
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportModal;
