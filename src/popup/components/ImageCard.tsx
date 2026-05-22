import React, { useState, memo } from 'react';
import { Star, Trash2, Download, ExternalLink, Copy, Globe } from 'lucide-react';
import type { SavedImage } from '../../shared/types';
import { formatTime } from '../../shared/storage';
import { useImageActions } from '../hooks/useImages';

interface ImageCardProps {
  image: SavedImage;
  index: number;
}

export const ImageCard: React.FC<ImageCardProps> = memo(({ image, index }) => {
  const [hovered,      setHovered]      = useState(false);
  const [imgError,     setImgError]     = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const { deleteImage, toggleFavorite, downloadImage, copyUrl } = useImageActions();
  const openPage = () => chrome.tabs.create({ url: image.pageUrl });

  return (
    <div
      className="vp-card"
      style={{
        animationDelay: `${Math.min(index * 0.04, 0.3)}s`,
        border: hovered ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: hovered
          ? '0 0 16px rgba(0,212,255,0.12), 0 4px 24px rgba(0,0,0,0.5)'
          : '0 2px 12px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="vp-card-img-wrap">
        {imgError ? (
          <div className="vp-card-no-img">
            <Globe size={20} color="rgba(255,255,255,0.15)" />
            <span>NO PREVIEW</span>
          </div>
        ) : (
          <img
            src={image.imageUrl}
            alt={image.pageTitle}
            loading="lazy"
            onError={() => setImgError(true)}
            className="vp-card-img"
            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          />
        )}

        {/* Action overlay — pure CSS opacity */}
        <div
          className="vp-card-overlay"
          style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? 'auto' : 'none' }}
        >
          <ActionBtn onClick={() => toggleFavorite(image.id)} active={image.favorite}>
            <Star size={12} fill={image.favorite ? 'currentColor' : 'none'} />
          </ActionBtn>
          <ActionBtn onClick={() => downloadImage(image.imageUrl, image.pageTitle)}>
            <Download size={12} />
          </ActionBtn>
          <ActionBtn onClick={() => copyUrl(image.imageUrl)}>
            <Copy size={12} />
          </ActionBtn>
          <ActionBtn onClick={openPage}>
            <ExternalLink size={12} />
          </ActionBtn>
          <ActionBtn onClick={() => deleteImage(image.id)} danger>
            <Trash2 size={12} />
          </ActionBtn>
        </div>

        {/* Favorite star */}
        {image.favorite && (
          <div className="vp-fav-badge">
            <Star size={9} style={{ color: '#ffc800', fill: '#ffc800' }} />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="vp-card-meta">
        <div className="vp-card-domain-row">
          {!faviconError
            ? <img src={image.faviconUrl} alt="" width={12} height={12} className="vp-favicon" onError={() => setFaviconError(true)} />
            : <Globe size={10} color="rgba(255,255,255,0.3)" />
          }
          <span className="vp-card-domain">{image.domain}</span>
        </div>
        <p className="vp-card-title">{image.pageTitle || image.domain}</p>
        <p className="vp-card-time">{formatTime(image.timestamp)}</p>
      </div>
    </div>
  );
});

ImageCard.displayName = 'ImageCard';

interface ActionBtnProps {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}

const ActionBtn: React.FC<ActionBtnProps> = ({ onClick, children, active, danger }) => (
  <button
    className={`vp-action-btn ${active ? 'vp-action-active' : ''} ${danger ? 'vp-action-danger' : ''}`}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
  >
    {children}
  </button>
);