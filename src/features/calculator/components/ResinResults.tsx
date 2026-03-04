import React from 'react';

interface ResinResultsProps {
  totalVolume: number; // en ml
}

export const ResinResults: React.FC<ResinResultsProps> = ({ totalVolume }) => {
  const DENSITY = 1.1;
  const totalGrams = totalVolume * DENSITY;

  const catalyst = totalGrams / 3;
  const resin = (totalGrams / 3) * 2;

  return (
    <div className="results-container">
      <label>Required Mixture</label>
      <div className="result-grid">
        <div className="result-item">
          <span className="label">Total Mass</span>
          <span className="value">{totalGrams.toFixed(1)} g</span>
        </div>
        <div className="result-item">
          <span className="label">Resin (Part A)</span>
          <span className="value" style={{ color: 'var(--primary)' }}>{resin.toFixed(1)} g</span>
        </div>
        <div className="result-item">
          <span className="label">Catalyst (Part B)</span>
          <span className="value" style={{ color: '#ff3b30' }}>{catalyst.toFixed(1)} g</span>
        </div>
      </div>
    </div>
  );
};
