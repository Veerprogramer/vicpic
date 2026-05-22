import React from 'react';
import { ImageIcon, Zap } from 'lucide-react';
import { useVicPicStore } from '../store/useVicPicStore';
import { useImageActions } from '../hooks/useImages';

export const Header: React.FC = () => {
  const images = useVicPicStore((s) => s.images);
  const { clearAll } = useImageActions();

  return (
    <header className="vp-header">
      <div className="vp-header-orb-blue" />
      <div className="vp-header-orb-purple" />

      <div className="vp-logo">
        <div className="vp-logo-icon">
          <ImageIcon size={14} color="#00d4ff" />
        </div>
        <div>
          <div className="vp-logo-name">VICPIC</div>
          <div className="vp-logo-sub">
            <Zap size={8} color="#00d4ff" />
            <span>{images.length} CAPTURED</span>
          </div>
        </div>
      </div>

      <div className="vp-header-actions">
        {images.length > 0 && (
          <button className="vp-clear-btn" onClick={clearAll}>
            CLEAR
          </button>
        )}
        <div className="vp-status-dot" />
      </div>
    </header>
  );
};