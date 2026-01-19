
import { GoogleGenAI, Type } from "@google/genai";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ComposedChart,
  Area
} from "recharts";
import { CotRecord } from "../types";
import { Language } from "../translations";

interface Props {
  data: CotRecord[];
  lang: Language;
  t: any;
}

interface AssetIntelligence {
  name: string;
  sentimentScore: number;
  convictionLevel: number;
  signal: string;
  keyInsight: string;
}

interface AnalysisResult {
  marketScore: number;
  riskScore: number;
  liquidityScore: number;
  volatilityForecast: number;
  dominantTheme: string;
  matrix: {
    accumulation: number;
    distribution: number;
    riskAversion: number;
    yieldSeeking: number;
    speculativeIntensity: number;
  };
  assetAnalyses: AssetIntelligence[];
  strategicDeepDive: {
    title: string;
    sections: { heading: string; body: string }[];
  };
  macroRiskFactors: { factor: string; impact: number }[];
}

const AiAnalysis: React.FC<Props> = ({ data, lang, t }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const prevLangRef = useRef<Language>(lang);

  const generateAnalysis = async (forceLang?: Language) => {
    if (loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentLang = forceLang || lang;
      const targetLangName = 
        currentLang === "ar" ? "Arabic" : 
        currentLang === "fr" ? "French" : "English";

      // Optimized prompt for speed: High density, no filler.
      const prompt = `
        Perform a rapid, institutional macro-assessment of this COT dataset:
        ${data
          .map(
            (d) =>
              `${d.commodity}: Net ${d.netPositions}, Change ${d.netChange}, Longs ${d.longPositions}, Shorts ${d.shortPositions}`,
          )
          .join("\n")}
        
        Language: ${targetLangName}. 
        Focus: Inter-market correlation and commercial positioning shifts.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: `You are an elite Macro Intelligence Engine. Output strictly in JSON.
          PRIORITIZE SPEED AND DENSITY. 
          Your report must be high-impact and direct. Avoid fluff.
          
          - marketScore: 0-100 overall sentiment.
          - assetAnalyses: Deep analytical breakdown for 8 primary assets.
          - keyInsight (Asset Level): 2-3 high-density technical sentences on positioning logic.
          - strategicDeepDive: 5 core sections (Macro context, Capital Flows, Hedging, Volatility, Strategy).
          - body (Strategic Deep Dive): Provide substantial, high-value paragraphs (approx 100 words each) but do not exceed what is necessary for clarity.
          - All text content MUST be in ${targetLangName}.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              marketScore: { type: Type.NUMBER },
              riskScore: { type: Type.NUMBER },
              liquidityScore: { type: Type.NUMBER },
              volatilityForecast: { type: Type.NUMBER },
              dominantTheme: { type: Type.STRING },
              matrix: {
                type: Type.OBJECT,
                properties: {
                  accumulation: { type: Type.NUMBER },
                  distribution: { type: Type.NUMBER },
                  riskAversion: { type: Type.NUMBER },
                  yieldSeeking: { type: Type.NUMBER },
                  speculativeIntensity: { type: Type.NUMBER },
                },
              },
              assetAnalyses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sentimentScore: { type: Type.NUMBER },
                    convictionLevel: { type: Type.NUMBER },
                    signal: { type: Type.STRING },
                    keyInsight: { type: Type.STRING },
                  },
                },
              },
              strategicDeepDive: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  sections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        heading: { type: Type.STRING },
                        body: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
              macroRiskFactors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    factor: { type: Type.STRING },
                    impact: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
          temperature: 0.1, // Lower temperature for faster, more deterministic output
          thinkingConfig: { thinkingBudget: 0 } // Disable explicit thinking to maximize response speed
        },
      });

      setAnalysis(JSON.parse(response.text));
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysis && prevLangRef.current !== lang) {
      generateAnalysis(lang);
    }
    prevLangRef.current = lang;
  }, [lang, analysis]);

  const radarData = useMemo(() => {
    if (!analysis) return [];
    return [
      { subject: "Accumulation", A: analysis.matrix.accumulation },
      { subject: "Distribution", A: analysis.matrix.distribution },
      { subject: "Risk Aversion", A: analysis.matrix.riskAversion },
      { subject: "Yield Seeking", A: analysis.matrix.yieldSeeking },
      { subject: "Spec Intensity", A: analysis.matrix.speculativeIntensity },
    ];
  }, [analysis]);

  const getSignalColor = (signal: string) => {
    const s = signal.toLowerCase();
    if (s.includes("bull") || s.includes("صعود") || s.includes("hausse")) return "text-blue-500";
    if (s.includes("bear") || s.includes("هبوط") || s.includes("baisse")) return "text-rose-500";
    return "text-slate-400";
  };

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 p-3 rounded-xl shadow-2xl ring-1 ring-white/10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-blue-400">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative group/ai">
      <div className="bg-gradient-to-br from-[#f8fafc] via-white to-blue-50 dark:from-[#020617] dark:via-[#0f172a] dark:to-[#1e1b4b] backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[4rem] p-6 lg:p-14 shadow-2xl relative overflow-hidden transition-all duration-1000 ring-1 ring-inset ring-white/5">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 opacity-40"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px] animate-pulse"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="flex items-center gap-7">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-2xl ring-1 ring-white/10 group-hover/ai:scale-105 transition-transform duration-700">
                <i className="fa-solid fa-bolt text-blue-500 text-4xl group-hover/ai:rotate-12 transition-transform"></i>
              </div>
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
                  {t.aiTitle}
                  <span className="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20 font-black tracking-widest uppercase">
                    Rapid Intelligence Engine
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.5em] mt-3 opacity-60">
                  Optimized Macro Insight Protocol
                </p>
              </div>
            </div>

            <button
              onClick={() => generateAnalysis()}
              disabled={loading}
              className={`group px-12 py-6 rounded-[2rem] text-[13px] font-black tracking-[0.2em] uppercase transition-all flex items-center gap-5 shadow-2xl ${
                loading
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 text-white transform hover:-translate-y-1 active:scale-95 shadow-blue-500/20"
              }`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>{" "}
                  {t.processing}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt text-blue-200"></i>{" "}
                  {t.generateAnalysis}
                </>
              )}
            </button>
          </div>

          {analysis ? (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Market Sentiment", val: analysis.marketScore, icon: "fa-gauge-high", color: "text-blue-500" },
                  { label: "Systemic Risk", val: analysis.riskScore, icon: "fa-shield-virus", color: "text-rose-500" },
                  { label: "Liquidity Index", val: analysis.liquidityScore, icon: "fa-water", color: "text-sky-400" },
                  { label: "Volatility Forecast", val: analysis.volatilityForecast, icon: "fa-bolt", color: "text-amber-400" },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="bg-white/40 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 p-8 rounded-[2.5rem] group/metric backdrop-blur-md shadow-xl transition-all hover:border-blue-500/20"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                      <i className={`fa-solid ${m.icon} ${m.color} opacity-30 group-hover/metric:opacity-100 transition-opacity`}></i>
                    </div>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{m.val}%</span>
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mb-2">
                        <div className={`h-full bg-current ${m.color} transition-all duration-1000 delay-300`} style={{ width: `${m.val}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 bg-white/50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 p-10 rounded-[3.5rem] shadow-inner backdrop-blur-xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 border-l-4 border-blue-500 pl-5">
                    Behavioral Positioning
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }} />
                        <Radar name="Strategy" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white/50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 p-10 rounded-[3.5rem] shadow-inner backdrop-blur-xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 border-l-4 border-rose-500 pl-5">
                    Risk Vectors & Impact
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.macroRiskFactors} layout="vertical" margin={{ left: 10, right: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="factor" 
                          type="category" 
                          stroke="#64748b" 
                          fontSize={9} 
                          width={140} 
                          tick={{fontWeight: 800, textTransform: 'uppercase'}}
                        />
                        <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
                          {analysis.macroRiskFactors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.impact > 70 ? '#f43f5e' : entry.impact > 40 ? '#f59e0b' : '#3b82f6'} fillOpacity={0.7} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Asset Momentum */}
              <div className="bg-white/50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 p-12 rounded-[4rem] shadow-inner">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12 border-l-4 border-emerald-500 pl-5">
                  Conviction & Momentum Matrix
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analysis.assetAnalyses} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                      <CartesianGrid stroke="#334155" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={9} 
                        tick={{fontWeight: 800}} 
                        interval={0} 
                        angle={-15} 
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748b" fontSize={9} />
                      <Tooltip 
                        content={({active, payload, label}) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl shadow-2xl ring-1 ring-white/10 w-80">
                                <div className="flex justify-between items-center mb-3">
                                  <p className="text-sm font-black text-white uppercase tracking-tight">{label}</p>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getSignalColor(data.signal)}`}>{data.signal}</span>
                                </div>
                                <div className="space-y-2 text-[10px] mb-4">
                                  <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Sentiment</span><span className="text-blue-400 font-black">{data.sentimentScore}%</span></div>
                                  <div className="flex justify-between"><span className="text-slate-500 font-bold uppercase">Conviction</span><span className="text-emerald-400 font-black">{data.convictionLevel}%</span></div>
                                </div>
                                <div className="pt-3 border-t border-white/5">
                                  <p className="text-slate-400 text-[11px] leading-relaxed font-medium italic">
                                    {data.keyInsight}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="sentimentScore" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                      <Bar dataKey="convictionLevel" barSize={30}>
                        {analysis.assetAnalyses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.sentimentScore >= 50 ? '#10b981' : '#f43f5e'} fillOpacity={0.4} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strategic Deep Dive */}
              <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[4rem] overflow-hidden shadow-2xl">
                <div className="bg-slate-50 dark:bg-slate-900/60 px-12 py-10 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                       <i className="fa-solid fa-bolt-lightning text-blue-500 text-xl"></i>
                    </div>
                    {analysis.strategicDeepDive.title}
                  </h3>
                  <div className="px-4 py-2 bg-blue-600/10 rounded-xl border border-blue-500/20">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Rapid Macro synthesis</span>
                  </div>
                </div>
                <div className="p-12 lg:p-20 space-y-16">
                  {analysis.strategicDeepDive.sections.map((sec, i) => (
                    <div key={i} className={`relative group/sec ${lang === "ar" ? "text-right" : "text-left"}`}>
                      <h4 className="text-2xl font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-5">
                        <span className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></span>
                        {sec.heading}
                      </h4>
                      <div className="space-y-6">
                        {sec.body.split('\n\n').map((paragraph, pIdx) => (
                          <p key={pIdx} className="text-[17px] leading-[2] text-slate-600 dark:text-slate-300 font-medium tracking-wide">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50/50 dark:bg-white/5 p-12 text-center border-t border-slate-200 dark:border-white/10">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] opacity-40">
                    EG-FINANCE PROPRIETARY INTEL • RAPID PROTOCOL ACTIVE
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => generateAnalysis()}
              className="group/brain flex flex-col items-center justify-center py-52 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[5rem] bg-white/5 dark:bg-slate-950/10 cursor-pointer transition-all duration-1000 hover:border-blue-500/40 hover:bg-blue-500/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-0 group-hover/brain:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative mb-14">
                <div className="absolute inset-0 bg-blue-600/20 blur-[80px] rounded-full group-hover/brain:scale-150 transition-transform duration-1000"></div>
                <i className="fa-solid fa-bolt text-[110px] text-slate-200 dark:text-slate-800/40 transition-all duration-700 group-hover/brain:scale-110 group-hover/brain:text-blue-500 relative z-10"></i>
              </div>
              <p className="text-[22px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.8em] animate-pulse">
                Initiate Rapid Intelligence Briefing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAnalysis;
