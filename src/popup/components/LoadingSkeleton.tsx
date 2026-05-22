import React from 'react';

export const LoadingSkeleton: React.FC = () => (
  <div className="vp-skeleton-grid">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="vp-skeleton-card" style={{ animationDelay: `${i * 0.06}s` }}>
        <div className="vp-skeleton-img" />
        <div className="vp-skeleton-meta">
          <div className="vp-skeleton-line" style={{ width: '50%' }} />
          <div className="vp-skeleton-line" style={{ width: '75%', height: '10px' }} />
          <div className="vp-skeleton-line" style={{ width: '35%', height: '7px' }} />
        </div>
      </div>
    ))}
  </div>
);