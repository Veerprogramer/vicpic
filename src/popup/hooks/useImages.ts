import { useEffect, useCallback } from 'react';
import { useVicPicStore } from '../store/useVicPicStore';
import { getImages } from '../../shared/storage';
import type { MessageType, SavedImage } from '../../shared/types';

export function useImages() {
  const { setImages, addImage, setLoading, addToast } = useVicPicStore();

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const images = await getImages();
      setImages(images);
    } catch (err) {
      console.error('[VicPic] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [setImages, setLoading]);

  useEffect(() => {
    loadImages();

    const listener = (message: MessageType) => {
      if (message.type === 'IMAGE_SAVED') {
        addImage(message.payload as SavedImage);
        addToast('New image saved!');
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [loadImages, addImage, addToast]);

  return { loadImages };
}

export function useImageActions() {
  const { removeImage, toggleFavorite: toggleFav, addToast } = useVicPicStore();

  const deleteImage = useCallback(async (id: string) => {
    const msg: MessageType = { type: 'DELETE_IMAGE', payload: { id } };
    await chrome.runtime.sendMessage(msg);
    removeImage(id);
    addToast('Image removed');
  }, [removeImage, addToast]);

  const toggleFavorite = useCallback(async (id: string) => {
    const msg: MessageType = { type: 'TOGGLE_FAVORITE', payload: { id } };
    await chrome.runtime.sendMessage(msg);
    toggleFav(id);
  }, [toggleFav]);

  const downloadImage = useCallback(async (imageUrl: string, _pageTitle: string) => {
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `vicpic_${Date.now()}.jpg`;
      a.target = '_blank';
      a.click();
      addToast('Download started');
    } catch {
      addToast('Download failed', 'error');
    }
  }, [addToast]);

  const copyUrl = useCallback(async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      addToast('URL copied!');
    } catch {
      addToast('Copy failed', 'error');
    }
  }, [addToast]);

  const clearAll = useCallback(async () => {
    const msg: MessageType = { type: 'CLEAR_ALL' };
    await chrome.runtime.sendMessage(msg);
    useVicPicStore.getState().setImages([]);
    addToast('All images cleared');
  }, [addToast]);

  return { deleteImage, toggleFavorite, downloadImage, copyUrl, clearAll };
}
