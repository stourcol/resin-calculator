import React from 'react';
import { translations, Language } from '../../../translations';

interface ResinResultsProps {
  totalVolume: number; // en ml
  lang: Language;
  ratio: number;
}

export const ResinResults: React.FC<ResinResultsProps> = ({ totalVolume, lang, ratio }) => {
  const DENSITY = 1.1;
  const totalGrams = totalVolume * DENSITY;

  // Cálculo según el ratio
  let resin, catalyst;
  if (ratio === 1) {
    // 1:1 mixture
    resin = totalGrams / 2;
    catalyst = totalGrams / 2;
  } else {
    // 2:1 mixture
    catalyst = totalGrams / 3;
    resin = (totalGrams / 3) * 2;
  }

  const t = translations[lang];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest">
          {t.requiredMixture}
        </label>
        <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[10px] font-extrabold text-primary">
          {ratio === 1 ? '1:1' : '2:1'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Mass Card */}
        <div className="relative overflow-hidden bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-4 transition-all duration-300 hover:shadow-md group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8" />
          <span className="block text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-tighter mb-1">
            {t.totalMass}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight">{totalGrams.toFixed(1)}</span>
            <span className="text-xs font-bold opacity-40 italic">g</span>
          </div>
        </div>

        {/* Resin Card */}
        <div className="relative overflow-hidden bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 group border-l-4 border-l-blue-500">
          <span className="block text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter mb-1">
            {t.resin}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-blue-700 dark:text-blue-300">
              {resin.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-blue-500/50 italic">g</span>
          </div>
        </div>

        {/* Catalyst Card */}
        <div className="relative overflow-hidden bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 group border-l-4 border-l-orange-500">
          <span className="block text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-tighter mb-1">
            {t.catalyst}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-orange-700 dark:text-orange-300">
              {catalyst.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-orange-500/50 italic">g</span>
          </div>
        </div>
      </div>
    </div>
  );
};
