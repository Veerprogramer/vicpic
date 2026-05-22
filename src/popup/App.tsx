import React from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ImageGallery } from './components/ImageGallery';
import { ToastContainer } from './components/ToastContainer';
import { useImages } from './hooks/useImages';
import { useVicPicStore } from './store/useVicPicStore';

const App: React.FC = () => {
  useImages();
  const images = useVicPicStore((s) => s.images);

  return (
    <div className="vp-root">
      <div className="vp-grid-bg" />
      <div className="vp-orb vp-orb-blue" />
      <div className="vp-orb vp-orb-purple" />
      <div className="vp-content">
        <Header />
        {images.length > 0 && <SearchBar />}
        <div className="vp-gallery-wrap">
          <ImageGallery />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;