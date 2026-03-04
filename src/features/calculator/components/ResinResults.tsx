import React, { useState } from 'react';
import { translations, Language } from '../../../translations';
import { ClipboardCopy, Check, Beaker, Zap, Scale } from 'lucide-react';

interface ResinResultsProps {
  totalVolume: number; // en ml
  lang: Language;
  ratio: number;
}

export const ResinResults: React.FC<ResinResultsProps> = ({ totalVolume, lang, ratio }) => {
  const [copied, setCopied] = useState(false);
  const DENSITY = 1.0;
  const totalGrams = totalVolume * DENSITY;

  let resin, catalyst;
  if (ratio === 1) {
    resin = totalGrams / 2;
    catalyst = totalGrams / 2;
  } else {
    catalyst = totalGrams / 3;
    resin = (totalGrams / 3) * 2;
  }

  const t = translations[lang];

  const copyToClipboard = () => {
    const text = `
ResinCalc Recipe:
-----------------
Total: ${totalGrams.toFixed(1)}g
Resin (A): ${resin.toFixed(1)}g
Catalyst (B): ${catalyst.toFixed(1)}g
Ratio: ${ratio === 1 ? '1:1' : '2:1'}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-start sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-[8.5px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] whitespace-nowrap">
            {t.requiredMixture}
          </label>
          <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[8.5px] font-black text-primary">
            {ratio === 1 ? '1:1' : '2:1'}
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(120,120,128,0.08)] hover:bg-[rgba(120,120,128,0.12)] border border-[var(--border-color)] rounded-xl transition-all group"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <ClipboardCopy size={12} className="text-[var(--text-dim)] group-hover:text-primary" />}
          <span className="text-[9px] font-bold text-[var(--text-dim)] group-hover:text-[var(--text-main)]">
            {copied ? t.copied : t.copyRecipe}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Mass Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-color)] to-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] p-5 transition-all duration-500 hover:shadow-xl group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Scale size={48} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={10} className="text-yellow-500 fill-yellow-500/20" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{t.totalMass}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tighter">{totalGrams.toFixed(1)}</span>
            <span className="text-xs font-black text-[var(--text-dim)] opacity-40 italic">g</span>
          </div>
        </div>

        {/* Resin Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/20 rounded-[24px] p-5 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 group border-t-2 border-t-blue-500/30">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
            <Beaker size={48} />
          </div>
          <span className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> {t.resin}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tighter text-blue-700 dark:text-blue-300">
              {resin.toFixed(1)}
            </span>
            <span className="text-xs font-black text-blue-500/40 italic">g</span>
          </div>
        </div>

        {/* Catalyst Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/5 to-orange-600/10 border border-orange-500/20 rounded-[24px] p-5 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/10 group border-t-2 border-t-orange-500/30">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity text-orange-500">
            <Beaker size={48} />
          </div>
          <span className="flex items-center gap-1.5 text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> {t.catalyst}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tighter text-orange-700 dark:text-orange-300">
              {catalyst.toFixed(1)}
            </span>
            <span className="text-xs font-black text-orange-500/40 italic">g</span>
          </div>
        </div>
      </div>
    </div>
  );
};
