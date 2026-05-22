import { create } from 'zustand';
import type { SavedImage, FilterType } from '../../shared/types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface VicPicStore {
  images: SavedImage[];
  loading: boolean;
  search: string;
  filter: FilterType;
  domainFilter: string;
  toasts: Toast[];

  setImages: (images: SavedImage[]) => void;
  addImage: (image: SavedImage) => void;
  removeImage: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSearch: (search: string) => void;
  setFilter: (filter: FilterType) => void;
  setDomainFilter: (domain: string) => void;
  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: string) => void;
  getFilteredImages: () => SavedImage[];
  getDomains: () => string[];
}

export const useVicPicStore = create<VicPicStore>((set, get) => ({
  images: [],
  loading: true,
  search: '',
  filter: 'all',
  domainFilter: '',
  toasts: [],

  setImages: (images) => set({ images }),
  addImage: (image) =>
    set((state) => ({
      images: [image, ...state.images.filter((i) => i.id !== image.id)],
    })),
  removeImage: (id) =>
    set((state) => ({ images: state.images.filter((i) => i.id !== id) })),
  toggleFavorite: (id) =>
    set((state) => ({
      images: state.images.map((i) =>
        i.id === id ? { ...i, favorite: !i.favorite } : i
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setSearch: (search) => set({ search }),
  setFilter: (filter) => set({ filter }),
  setDomainFilter: (domainFilter) => set({ domainFilter }),

  addToast: (message, type = 'success') => {
    const id = `toast_${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  getFilteredImages: () => {
    const { images, search, filter, domainFilter } = get();
    let result = [...images];

    if (filter === 'favorites') result = result.filter((i) => i.favorite);
    if (filter === 'recent') {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      result = result.filter((i) => i.timestamp >= cutoff);
    }

    if (domainFilter) result = result.filter((i) => i.domain === domainFilter);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.pageTitle.toLowerCase().includes(q) ||
          i.domain.toLowerCase().includes(q) ||
          i.imageUrl.toLowerCase().includes(q)
      );
    }

    return result;
  },

  getDomains: () => {
    const { images } = get();
    const counts = new Map<string, number>();
    images.forEach((i) => counts.set(i.domain, (counts.get(i.domain) ?? 0) + 1));
    return Array.from(counts.keys()).sort((a, b) => counts.get(b)! - counts.get(a)!);
  },
}));
