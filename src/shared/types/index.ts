export interface SavedImage {
  id: string;
  imageUrl: string;
  pageUrl: string;
  pageTitle: string;
  timestamp: number;
  favorite: boolean;
  domain: string;
  faviconUrl: string;
}

export interface StorageData {
  images: SavedImage[];
}

export type MessageType =
  | { type: 'SAVE_IMAGE'; payload: Omit<SavedImage, 'id' | 'favorite'> }
  | { type: 'GET_IMAGES' }
  | { type: 'DELETE_IMAGE'; payload: { id: string } }
  | { type: 'TOGGLE_FAVORITE'; payload: { id: string } }
  | { type: 'CLEAR_ALL' }
  | { type: 'IMAGE_SAVED'; payload: SavedImage }
  | { type: 'IMAGES_LIST'; payload: SavedImage[] };

export type FilterType = 'all' | 'recent' | 'favorites';

export interface FilterState {
  search: string;
  filter: FilterType;
  domain: string;
}
