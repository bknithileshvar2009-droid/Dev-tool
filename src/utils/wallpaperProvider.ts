/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import wallpaperCatalogData from './wallpaperCatalog.json';

export type WallpaperCategoryKey =
  | 'all'
  | 'japanese'
  | 'korean'
  | 'chinese'
  | 'anime'
  | 'cyberpunk'
  | 'gaming'
  | 'minimal'
  | 'study'
  | 'nature'
  | 'space'
  | 'architecture'
  | 'abstract'
  | 'seasonal'
  | 'local'
  | 'favorites'
  | 'recent'
  | 'uploads';

export interface WallpaperItem {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  tags: string[];
  thumbUrl: string;
  fullUrl: string;
  isLocal: boolean;
  source: string;
  attribution?: string;
  license?: string;
  resolution?: string;
  aspectRatio?: string;
  format?: 'jpg' | 'svg' | 'webp' | 'png';
  dateAdded?: number;
}

export const WALLPAPER_CATEGORIES: { id: WallpaperCategoryKey; label: string; icon: string; description: string }[] = [
  { id: 'all', label: 'All Wallpapers', icon: '🌌', description: 'Complete verified architectural & aesthetic collection' },
  { id: 'japanese', label: 'Japanese Aesthetics', icon: '⛩️', description: 'Tokyo skylines, Kyoto shrines, Mount Fuji & Ukiyo-e' },
  { id: 'korean', label: 'Korean Aesthetics', icon: '🏮', description: 'Seoul night cityscapes, Hanok villages, palaces & cafes' },
  { id: 'chinese', label: 'Chinese Aesthetics', icon: '🏯', description: 'Karst mist mountains, classical gardens, ancient towns & Song art' },
  { id: 'anime', label: 'Anime Scenery', icon: '🌸', description: 'Pastel clouds, celestial skies, vector art & fantasy landscapes' },
  { id: 'cyberpunk', label: 'Cyberpunk & Neon', icon: '🌃', description: 'Rain-soaked neon streets, futuristic towers & synthwave grids' },
  { id: 'gaming', label: 'Gaming & Tech', icon: '⚡', description: 'LED battlestations, datacenters, supercomputers & sci-fi' },
  { id: 'minimal', label: 'Minimal & Dark OLED', icon: '🖤', description: 'Brutalist concrete, dark slate, deep shadows & monochrome' },
  { id: 'study', label: 'Cozy Study Rooms', icon: '📚', description: 'Historic libraries, warm reading desks & quiet bookstores' },
  { id: 'nature', label: 'Nature & Horizons', icon: '🌲', description: 'Misty alpine pines, glacial lakes, ocean sunsets & waterfalls' },
  { id: 'space', label: 'Space & Night Skies', icon: '✨', description: 'Milky Way observatories, Hubble nebulas & deep field galaxies' },
  { id: 'architecture', label: 'Architecture & Urban', icon: '🏛️', description: 'Glass facades, brutalist monolithic structures & spiral stairs' },
  { id: 'abstract', label: 'Abstract & Gradients', icon: '🎨', description: 'Color field compositions, Bauhaus geometry & fluid gradients' },
  { id: 'seasonal', label: 'Seasonal & Sakura', icon: '🍁', description: 'Cherry blossom bloom, autumn maples & winter snowscapes' },
  { id: 'local', label: '⚡ Offline Local', icon: '💾', description: '100% locally bundled assets available offline without network' },
  { id: 'favorites', label: '★ Favorites', icon: '⭐', description: 'Your personal starred wallpapers' },
  { id: 'recent', label: '🕒 Recently Used', icon: '🕒', description: 'Wallpapers applied to your study dashboard' },
  { id: 'uploads', label: '📤 Custom Uploads', icon: '📁', description: 'Your custom uploaded images from your device' },
];

const FAVORITES_STORAGE_KEY = 'flocus_favorite_wallpapers_v3';
const RECENT_STORAGE_KEY = 'flocus_recent_wallpapers_v3';
const UPLOADS_STORAGE_KEY = 'flocus_user_wallpaper_uploads_v3';

class WallpaperProvider {
  private baseCatalog: WallpaperItem[] = [];
  private userUploads: WallpaperItem[] = [];
  private favoriteIds: Set<string> = new Set();
  private recentIds: string[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    // Load base catalog from json
    try {
      this.baseCatalog = (wallpaperCatalogData as any[]) || [];
    } catch {
      this.baseCatalog = [];
    }

    // Load favorites from localStorage
    if (typeof window !== 'undefined') {
      try {
        const favRaw = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (favRaw) {
          const parsed = JSON.parse(favRaw);
          this.favoriteIds = new Set(Array.isArray(parsed) ? parsed : []);
        }
      } catch {}

      try {
        const recRaw = localStorage.getItem(RECENT_STORAGE_KEY);
        if (recRaw) {
          const parsed = JSON.parse(recRaw);
          this.recentIds = Array.isArray(parsed) ? parsed : [];
        }
      } catch {}

      try {
        const upRaw = localStorage.getItem(UPLOADS_STORAGE_KEY);
        if (upRaw) {
          const parsed = JSON.parse(upRaw);
          this.userUploads = Array.isArray(parsed) ? parsed : [];
        }
      } catch {}
    }

    this.isInitialized = true;
  }

  // Get total count of all verified wallpapers in library
  public getTotalCount(): number {
    return this.baseCatalog.length + this.userUploads.length;
  }

  // Get all wallpapers (user uploads first, then base catalog)
  public getAllWallpapers(): WallpaperItem[] {
    return [...this.userUploads, ...this.baseCatalog];
  }

  // Get category breakdown count
  public getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {
      all: this.getTotalCount(),
      favorites: this.favoriteIds.size,
      recent: this.recentIds.length,
      uploads: this.userUploads.length,
      local: 0,
    };

    WALLPAPER_CATEGORIES.forEach(c => {
      if (!counts[c.id]) counts[c.id] = 0;
    });

    const all = this.getAllWallpapers();
    for (const item of all) {
      if (item.isLocal) {
        counts.local = (counts.local || 0) + 1;
      }
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    }

    return counts;
  }

  // Filter & paginate query
  public queryWallpapers(options: {
    category?: WallpaperCategoryKey;
    searchQuery?: string;
    subCategory?: string;
    sortBy?: 'default' | 'title' | 'resolution' | 'recent';
    page?: number;
    pageSize?: number;
  }): {
    items: WallpaperItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const {
      category = 'all',
      searchQuery = '',
      subCategory = '',
      sortBy = 'default',
      page = 1,
      pageSize = 24,
    } = options;

    let pool = this.getAllWallpapers();

    // 1. Category Filter
    if (category === 'favorites') {
      pool = pool.filter(w => this.favoriteIds.has(w.id));
    } else if (category === 'recent') {
      const recentMap = new Map(this.recentIds.map((id, idx) => [id, idx]));
      pool = pool
        .filter(w => recentMap.has(w.id))
        .sort((a, b) => (recentMap.get(a.id) ?? 999) - (recentMap.get(b.id) ?? 999));
    } else if (category === 'uploads') {
      pool = [...this.userUploads];
    } else if (category === 'local') {
      pool = pool.filter(w => w.isLocal);
    } else if (category !== 'all') {
      pool = pool.filter(w => w.category === category);
    }

    // 2. SubCategory filter
    if (subCategory && subCategory !== 'all') {
      pool = pool.filter(w => w.subCategory === subCategory);
    }

    // 3. Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(w => {
        const titleMatch = w.title.toLowerCase().includes(q);
        const catMatch = w.category.toLowerCase().includes(q);
        const subMatch = w.subCategory ? w.subCategory.toLowerCase().includes(q) : false;
        const tagMatch = w.tags && w.tags.some(t => t.toLowerCase().includes(q));
        const authorMatch = w.attribution ? w.attribution.toLowerCase().includes(q) : false;
        return titleMatch || catMatch || subMatch || tagMatch || authorMatch;
      });
    }

    // 4. Sort
    if (sortBy === 'title') {
      pool.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'resolution') {
      pool.sort((a, b) => {
        const getRes = (res?: string) => {
          if (!res) return 0;
          const [w, h] = res.split('x').map(Number);
          return (w || 0) * (h || 0);
        };
        return getRes(b.resolution) - getRes(a.resolution);
      });
    }

    const totalCount = pool.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const items = pool.slice(startIdx, startIdx + pageSize);

    return {
      items,
      totalCount,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  // Get distinct subcategories for a given category
  public getSubCategories(category: WallpaperCategoryKey): string[] {
    const pool = category === 'all'
      ? this.getAllWallpapers()
      : this.getAllWallpapers().filter(w => w.category === category);
    const set = new Set<string>();
    pool.forEach(w => {
      if (w.subCategory) set.add(w.subCategory);
    });
    return Array.from(set).sort();
  }

  // Find a specific wallpaper by ID or URL
  public findWallpaper(idOrUrl: string): WallpaperItem | undefined {
    return this.getAllWallpapers().find(w => w.id === idOrUrl || w.fullUrl === idOrUrl);
  }

  // Random wallpaper selection
  public getRandomWallpaper(category?: WallpaperCategoryKey): WallpaperItem | undefined {
    let pool = this.getAllWallpapers();
    if (category && category !== 'all') {
      if (category === 'favorites') {
        pool = pool.filter(w => this.favoriteIds.has(w.id));
      } else if (category === 'local') {
        pool = pool.filter(w => w.isLocal);
      } else {
        pool = pool.filter(w => w.category === category);
      }
    }
    if (pool.length === 0) pool = this.getAllWallpapers();
    if (pool.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  // Favorites
  public isFavorite(id: string): boolean {
    return this.favoriteIds.has(id);
  }

  public toggleFavorite(id: string): boolean {
    if (this.favoriteIds.has(id)) {
      this.favoriteIds.delete(id);
    } else {
      this.favoriteIds.add(id);
    }
    this.saveFavorites();
    return this.favoriteIds.has(id);
  }

  public getFavoriteIds(): string[] {
    return Array.from(this.favoriteIds);
  }

  public setFavoriteIds(ids: string[]): void {
    if (Array.isArray(ids)) {
      this.favoriteIds = new Set(ids);
      this.saveFavorites();
    }
  }

  private saveFavorites() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(this.favoriteIds)));
      } catch {}
    }
  }

  // Recently applied
  public recordRecentlyUsed(id: string) {
    this.recentIds = [id, ...this.recentIds.filter(x => x !== id)].slice(0, 30);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(this.recentIds));
      } catch {}
    }
  }

  public getRecentIds(): string[] {
    return this.recentIds;
  }

  public setRecentIds(ids: string[]): void {
    if (Array.isArray(ids)) {
      this.recentIds = ids.slice(0, 30);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(this.recentIds));
        } catch {}
      }
    }
  }

  // User uploads
  public addUserUpload(name: string, dataUrl: string, category = 'uploads'): WallpaperItem {
    const newUpload: WallpaperItem = {
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: name || 'Custom Uploaded Wallpaper',
      category: 'minimal',
      subCategory: 'Custom User Uploads',
      tags: ['upload', 'custom', 'user'],
      thumbUrl: dataUrl,
      fullUrl: dataUrl,
      isLocal: true,
      source: 'User Device Upload',
      attribution: 'You (Personal Device)',
      license: 'Personal License',
      resolution: 'Custom',
      aspectRatio: '16:9',
      format: 'png',
      dateAdded: Date.now(),
    };

    this.userUploads = [newUpload, ...this.userUploads];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(this.userUploads));
      } catch {}
    }
    return newUpload;
  }

  public removeUserUpload(id: string): boolean {
    const prevLen = this.userUploads.length;
    this.userUploads = this.userUploads.filter(u => u.id !== id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(this.userUploads));
      } catch {}
    }
    return this.userUploads.length < prevLen;
  }

  public getUserUploads(): WallpaperItem[] {
    return this.userUploads;
  }

  // Download wallpaper
  public async downloadWallpaper(item: WallpaperItem): Promise<boolean> {
    try {
      const response = await fetch(item.fullUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanName = item.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      link.download = `flocus_wallpaper_${cleanName}.${item.format || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      return true;
    } catch {
      // Direct window download fallback
      const link = document.createElement('a');
      link.href = item.fullUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `wallpaper.${item.format || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
  }
}

export const wallpaperProvider = new WallpaperProvider();
