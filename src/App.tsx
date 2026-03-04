import { useMemo, useState } from 'react';
import { ResinResults } from './features/calculator/components/ResinResults';
import { useSvgAnalyzer } from './features/svg-analyzer/hooks/useSvgAnalyzer';
import './index.css';

function App() {
  const { analyzeSvg, svgData, error } = useSvgAnalyzer();
  const [realWidth, setRealWidth] = useState<number>(10);
  const [realHeight, setRealHeight] = useState<number>(10);
  const [thickness, setThickness] = useState<number>(0.12);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const areaInCm2 = useMemo(() => {
    if (!svgData || !svgData.objectViewBox.width || !svgData.objectViewBox.height) return 0;

    const w = realWidth || 0;
    const h = realHeight || 0;

    const scaleX = w / svgData.objectViewBox.width;
    const scaleY = h / svgData.objectViewBox.height;

    const area = svgData.totalAreaInSvgUnits * scaleX * scaleY;
    return area;
  }, [svgData, realWidth, realHeight]);

  const totalVolume = useMemo(() => {
    const t = thickness || 0;
    return areaInCm2 * t;
  }, [areaInCm2, thickness]);

  return (
    <div className="app-layout">
      <div className="config-section">
        <header>
          <div>
            <h1>ResinCalc</h1>
            <p className="subtitle">Precision Material Calculator</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </header>

        <div className="control-card">
          <div className="form-group">
            <label>Vector File (SVG)</label>
            <input
              type="file"
              accept=".svg"
              onChange={(e) => e.target.files?.[0] && analyzeSvg(e.target.files[0])}
            />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Real Width (cm)</label>
              <input
                type="number"
                value={realWidth || ''}
                onChange={(e) => setRealWidth(parseFloat(e.target.value))}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label>Real Height (cm)</label>
              <input
                type="number"
                value={realHeight || ''}
                onChange={(e) => setRealHeight(parseFloat(e.target.value))}
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Thickness (cm)</label>
            <input
              type="number"
              step="0.01"
              value={thickness || ''}
              onChange={(e) => setThickness(parseFloat(e.target.value))}
              placeholder="0.0"
            />
          </div>
        </div>

        {error && <div style={{ color: '#ff3b30', fontSize: '0.8rem', padding: '12px' }}>{error}</div>}
      </div>

      <div className="right-section">
        <div className="visualizer-box">
          {svgData ? (
            <svg
              className="svg-preview"
              viewBox={`${svgData.viewBox.x} ${svgData.viewBox.y} ${svgData.viewBox.width} ${svgData.viewBox.height}`}
              dangerouslySetInnerHTML={{ __html: svgData.originalContent }}
            />
          ) : (
            <div className="empty-state">
              <p>Upload a vector to begin analysis</p>
            </div>
          )}
        </div>

        <div className="results-container-side">
          {totalVolume > 0 && <ResinResults totalVolume={totalVolume} />}
          {svgData && (
            <div className="results-footer">
              Area: <strong>{areaInCm2.toFixed(2)} cm²</strong> | Volume: <strong>{totalVolume.toFixed(2)} ml</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
