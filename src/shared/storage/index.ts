import type { SavedImage, StorageData } from '../types';

const STORAGE_KEY = 'vicpic_images';

export async function getImages(): Promise<SavedImage[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const data = result[STORAGE_KEY] as StorageData | undefined;
      resolve(data?.images ?? []);
    });
  });
}

export async function saveImage(image: Omit<SavedImage, 'id' | 'favorite'>): Promise<{ saved: boolean; image?: SavedImage }> {
  const images = await getImages();

  const isDuplicate = images.some((img) => img.imageUrl === image.imageUrl);
  if (isDuplicate) return { saved: false };

  const newImage: SavedImage = {
    ...image,
    id: generateId(),
    favorite: false,
  };

  const updatedImages = [newImage, ...images].slice(0, 500);
  await setImages(updatedImages);
  return { saved: true, image: newImage };
}

export async function deleteImage(id: string): Promise<void> {
  const images = await getImages();
  const filtered = images.filter((img) => img.id !== id);
  await setImages(filtered);
}

export async function toggleFavorite(id: string): Promise<void> {
  const images = await getImages();
  const updated = images.map((img) =>
    img.id === id ? { ...img, favorite: !img.favorite } : img
  );
  await setImages(updated);
}

export async function clearAll(): Promise<void> {
  await setImages([]);
}

async function setImages(images: SavedImage[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: { images } }, resolve);
  });
}

function generateId(): string {
  return `vp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function getFaviconUrl(pageUrl: string): string {
  try {
    const { origin } = new URL(pageUrl);
    return `${origin}/favicon.ico`;
  } catch {
    return '';
  }
}

export function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
