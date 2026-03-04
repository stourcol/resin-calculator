import {
  ChevronDown,
  FileUp,
  Info,
  Layers,
  Maximize,
  Moon,
  MoveHorizontal,
  Percent,
  RotateCcw,
  Sun
} from 'lucide-react';
import { useLayoutEffect, useMemo, useState } from 'react';
import { ResinResults } from './features/calculator/components/ResinResults';
import { useSvgAnalyzer } from './features/svg-analyzer/hooks/useSvgAnalyzer';
import './index.css';
import { Language, translations } from './translations';

function App() {
  const { analyzeSvg, reset: resetSvg, svgData, error } = useSvgAnalyzer();
  const [realWidth, setRealWidth] = useState<number>(10);
  const [realHeight, setRealHeight] = useState<number>(10);
  const [thickness, setThickness] = useState<number>(0.12);
  const [lang, setLang] = useState<Language>('es');
  const [mixtureRatio, setMixtureRatio] = useState<number>(2); // 1 = 1:1, 2 = 2:1
  const [scaleMode, setScaleMode] = useState<'design' | 'canvas'>('design');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [wastage, setWastage] = useState<number>(0);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const t = translations[lang];

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleReset = () => {
    resetSvg();
    setRealWidth(10);
    setRealHeight(10);
    setThickness(0.12);
    setWastage(0);
    setMixtureRatio(2);
    setScaleMode('design');
    setShowDebug(false);
  };

  const areaInCm2 = useMemo(() => {
    if (!svgData) return 0;
    const w = realWidth || 0;
    const h = realHeight || 0;

    const baseBox = scaleMode === 'design' ? svgData.objectViewBox : svgData.viewBox;

    if (!baseBox.width || !baseBox.height) return 0;

    const scaleX = w / baseBox.width;
    const scaleY = h / baseBox.height;
    return svgData.totalAreaInSvgUnits * scaleX * scaleY;
  }, [svgData, realWidth, realHeight, scaleMode]);

  const totalVolume = useMemo(() => {
    const netVolume = areaInCm2 * (thickness || 0);
    return netVolume * (1 + (wastage || 0) / 100);
  }, [areaInCm2, thickness, wastage]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter">{t.title}</h1>
          <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] opacity-80">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-[rgba(120,120,128,0.08)] rounded-2xl">
            <div className="flex bg-[rgba(120,120,128,0.12)] p-1 rounded-xl">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-[var(--card-bg)] shadow-sm' : 'text-[var(--text-dim)]'}`}
              >EN</button>
              <button
                onClick={() => setLang('es')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${lang === 'es' ? 'bg-[var(--card-bg)] shadow-sm' : 'text-[var(--text-dim)]'}`}
              >ES</button>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-sm hover:scale-105 transition-transform"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </header>

      <div className="app-layout">
        {/* Left Panel: Configuration */}
        <aside className="flex flex-col gap-6 overflow-y-auto pr-2">
          <section className="premium-card flex flex-col gap-6">
            {/* File Input */}
            <div className="relative group">
              <span className="label-pro flex items-center gap-2">
                <FileUp size={12} /> {t.vectorFile}
              </span>
              <div className="relative">
                <input
                  type="file"
                  accept=".svg"
                  id="svg-upload"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && analyzeSvg(e.target.files[0])}
                />
                <label
                  htmlFor="svg-upload"
                  className={`flex flex-col items-center justify-center p-2 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${svgData
                    ? 'border-green-500 bg-green-50 dark:bg-green-500/5 hover:bg-green-100 dark:hover:bg-green-500/10'
                    : 'border-[var(--input-border)] hover:border-primary hover:bg-primary/5'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-inner ${svgData ? 'bg-green-100 dark:bg-green-500/20' : 'bg-[var(--bg-color)]'
                    }`}>
                    <FileUp className={svgData ? 'text-green-600 dark:text-green-400' : 'text-primary'} size={14} />
                  </div>
                  <span className={`text-[10px] font-bold ${svgData ? 'text-green-700 dark:text-green-300' : ''}`}>
                    {svgData ? 'Vector Cargado ✅' : t.uploadPrompt}
                  </span>
                </label>
              </div>
            </div>

            {/* Scale Mode Toggle */}
            <div className="space-y-2">
              <span className="label-pro flex items-center gap-2"><Maximize size={12} /> Modo de Escala</span>
              <div className="grid grid-cols-2 p-1 bg-[rgba(120,120,128,0.08)] rounded-xl">
                <button
                  onClick={() => setScaleMode('design')}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all ${scaleMode === 'design' ? 'bg-[var(--card-bg)] shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                >
                  <span className="text-[10px] font-bold">Ajustar al Diseño</span>
                  <span className="text-[8px] opacity-60">Usa los bordes del dibujo</span>
                </button>
                <button
                  onClick={() => setScaleMode('canvas')}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all ${scaleMode === 'canvas' ? 'bg-[var(--card-bg)] shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                >
                  <span className="text-[10px] font-bold">Ajustar al Lienzo</span>
                  <span className="text-[8px] opacity-60">Usa el tamaño del SVG</span>
                </button>
              </div>
            </div>

            {/* Dimensions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="label-pro flex items-center gap-2"><MoveHorizontal size={12} /> {t.realWidth}</span>
                <div className="relative">
                  <input
                    type="number"
                    className="input-pro"
                    value={realWidth || ''}
                    onChange={(e) => setRealWidth(parseFloat(e.target.value))}
                    placeholder="0.0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <span className="label-pro flex items-center gap-2"><Maximize size={12} /> {t.realHeight}</span>
                <div className="relative">
                  <input
                    type="number"
                    className="input-pro"
                    value={realHeight || ''}
                    onChange={(e) => setRealHeight(parseFloat(e.target.value))}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="label-pro flex items-center gap-2"><Layers size={12} /> {t.thickness}</span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    className="input-pro"
                    value={thickness || ''}
                    onChange={(e) => setThickness(parseFloat(e.target.value))}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="label-pro flex items-center gap-2"><Percent size={12} /> {t.wastage}</span>
                <div className="relative">
                  <input
                    type="number"
                    className="input-pro"
                    value={wastage || ''}
                    onChange={(e) => setWastage(parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <span className="label-pro flex items-center gap-2"><Info size={12} /> {t.mixtureRatio}</span>
                <div className="relative">
                  <select
                    className="input-pro appearance-none pr-10 font-medium"
                    value={mixtureRatio}
                    onChange={(e) => setMixtureRatio(parseInt(e.target.value))}
                  >
                    <option value={1}>{t.ratio11}</option>
                    <option value={2}>{t.ratio12}</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[var(--border-color)] pt-0">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-debug"
                  checked={showDebug}
                  onChange={(e) => setShowDebug(e.target.checked)}
                  className="rounded border-[var(--border-color)] bg-[var(--card-bg)] text-primary focus:ring-primary"
                />
                <label htmlFor="show-debug" className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider cursor-pointer select-none">
                  Resaltar área medida
                </label>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-[var(--text-dim)] hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all uppercase tracking-widest border border-transparent hover:border-red-500/20"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="w-5 h-5 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-500 font-bold">!</div>
              {error}
            </div>
          )}
        </aside>

        {/* Right Panel: Viewport & Results */}
        <main className="grid grid-rows-[1fr_auto] gap-6 overflow-hidden h-full">
          {/* SVG Viewport */}
          <section className="bg-card border border-[var(--border-color)] shadow-[var(--shadow-soft)] rounded-apple flex items-center justify-center relative overflow-hidden p-4">
            {svgData ? (
              <div className="w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-500 relative">
                <svg
                  className="svg-preview"
                  viewBox={`${svgData.viewBox.x} ${svgData.viewBox.y} ${svgData.viewBox.width} ${svgData.viewBox.height}`}
                  dangerouslySetInnerHTML={{ __html: svgData.originalContent }}
                />
                {showDebug && (
                  <svg
                    className="absolute inset-0 pointer-events-none w-full h-full"
                    viewBox={`${svgData.viewBox.x} ${svgData.viewBox.y} ${svgData.viewBox.width} ${svgData.viewBox.height}`}
                  >
                    <g fill="rgba(255, 0, 0, 0.2)" stroke="#ff4444" strokeWidth={Math.max(svgData.viewBox.width, svgData.viewBox.height) / 200}>
                      {svgData.paths.map((d, i) => (
                        <path key={i} d={d} />
                      ))}
                    </g>
                  </svg>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-[var(--text-dim)] animate-pulse">
                <div className="w-24 h-24 bg-[var(--bg-color)] rounded-[32px] flex items-center justify-center shadow-inner">
                  <Maximize size={40} className="opacity-20" />
                </div>
                <p className="text-sm font-medium uppercase tracking-[0.2em]">{t.uploadPrompt}</p>
              </div>
            )}
          </section>

          {/* Results Bar */}
          <section className="bg-card border border-[var(--border-color)] shadow-[var(--shadow-soft)] rounded-apple p-1 flex flex-col">
            <div className="p-5 flex flex-col gap-6">
              {totalVolume > 0 && (
                <ResinResults
                  totalVolume={totalVolume}
                  lang={lang}
                  ratio={mixtureRatio}
                />
              )}

              {svgData && (
                <footer className="flex justify-end gap-12 pt-6 border-t border-[var(--border-color)] px-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">{t.area}</span>
                    <div className="text-2xl font-bold flex items-baseline gap-1">
                      {areaInCm2.toFixed(2)} <span className="text-xs font-medium opacity-50">cm²</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">{t.volume}</span>
                    <div className="text-2xl font-bold flex items-baseline gap-1">
                      {totalVolume.toFixed(2)} <span className="text-xs font-medium opacity-50">ml</span>
                    </div>
                  </div>
                </footer>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
