import React from 'react';
import { ImageIcon, MousePointer2, Zap } from 'lucide-react';

interface EmptyStateProps {
  isFiltered?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isFiltered }) => {
  if (isFiltered) {
    return (
      <div className="vp-empty">
        <div className="vp-empty-icon-wrap">
          <ImageIcon size={20} color="rgba(255,255,255,0.2)" />
        </div>
        <p className="vp-empty-title">No results found</p>
        <p className="vp-empty-sub">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="vp-empty vp-empty-full">
      <div className="vp-empty-hero">
        <ImageIcon size={32} color="rgba(0,212,255,0.8)" />
        {['tl','tr','bl','br'].map((p) => (
          <div key={p} className={`vp-empty-corner vp-empty-corner-${p}`} />
        ))}
      </div>

      <div className="vp-empty-text">
        <h2 className="vp-empty-heading">READY TO COLLECT</h2>
        <p className="vp-empty-desc">
          Drag any image on any webpage<br />and it'll appear here instantly
        </p>
      </div>

      <div className="vp-steps">
        {[
          { icon: <MousePointer2 size={12} />, text: 'Find an image on any website' },
          { icon: <Zap           size={12} />, text: 'Drag it anywhere on the page' },
          { icon: <ImageIcon     size={12} />, text: 'VicPic saves it automatically' },
        ].map((step, i) => (
          <div key={i} className="vp-step" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <div className="vp-step-icon">{step.icon}</div>
            <span className="vp-step-text">{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};