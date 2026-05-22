import React, { useMemo } from 'react';
import { useVicPicStore } from '../store/useVicPicStore';
import { ImageCard } from './ImageCard';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

export const ImageGallery: React.FC = () => {
  const loading      = useVicPicStore((s) => s.loading);
  const images       = useVicPicStore((s) => s.images);
  const search       = useVicPicStore((s) => s.search);
  const filter       = useVicPicStore((s) => s.filter);
  const domainFilter = useVicPicStore((s) => s.domainFilter);
  const getFiltered  = useVicPicStore((s) => s.getFilteredImages);

  const filtered = useMemo(
    () => getFiltered(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, search, filter, domainFilter]
  );

  if (loading)             return <LoadingSkeleton />;
  if (images.length === 0) return <EmptyState />;
  if (filtered.length === 0) return <EmptyState isFiltered />;

  return (
    <div className="vp-gallery">
      <div className="vp-gallery-count">
        <span>{filtered.length} IMAGE{filtered.length !== 1 ? 'S' : ''}</span>
        {filtered.length !== images.length && (
          <span className="vp-gallery-total">of {images.length} total</span>
        )}
      </div>

      <div className="vp-grid">
        {filtered.map((image, i) => (
          <ImageCard key={image.id} image={image} index={i} />
        ))}
      </div>
    </div>
  );
};