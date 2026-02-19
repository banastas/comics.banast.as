import { Comic } from '../types/Comic';
import { validateComic } from '../validation/comicSchema';

const STORAGE_KEYS = {
  COMICS: 'comic-collection-comics',
  SETTINGS: 'comic-collection-settings',
  FILTERS: 'comic-collection-filters',
} as const;

interface StorageSettings {
  theme: 'light' | 'dark' | 'system';
  viewMode: 'grid' | 'list';
  sortField: string;
  sortDirection: 'asc' | 'desc';
  autoSave: boolean;
}

interface StorageFilters {
  searchTerm: string;
  seriesName: string;
  minGrade: number;
  maxGrade: number;
  minPrice: number;
  maxPrice: number;
  isSlabbed: boolean | null;
  isSigned: boolean | null;
  tags: string[];
}

class StorageManager {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkStorageAvailability();
  }

  private checkStorageAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Comics storage
  saveComics(comics: Comic[]): boolean {
    if (!this.isAvailable) {
      console.warn('LocalStorage not available, comics not saved');
      return false;
    }

    try {
      // Validate comics before saving
      const validComics = comics.filter(comic => {
        const result = validateComic(comic);
        if (!result.success) {
          console.warn('Invalid comic data, skipping:', comic.id, result.error);
        }
        return result.success;
      });

      localStorage.setItem(STORAGE_KEYS.COMICS, JSON.stringify(validComics));
      return true;
    } catch (error) {
      console.error('Error saving comics:', error);
      return false;
    }
  }

  loadComics(): Comic[] {
    if (!this.isAvailable) {
      console.warn('LocalStorage not available, returning empty array');
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMICS);
      if (!stored) return [];

      const comics = JSON.parse(stored) as Comic[];
      
      // Validate loaded comics
      const validComics = comics.filter(comic => {
        const result = validateComic(comic);
        if (!result.success) {
          console.warn('Invalid comic data found in storage, skipping:', comic.id, result.error);
        }
        return result.success;
      });

      return validComics;
    } catch (error) {
      console.error('Error loading comics:', error);
      return [];
    }
  }

  // Settings storage
  saveSettings(settings: Partial<StorageSettings>): boolean {
    if (!this.isAvailable) return false;

    try {
      const existing = this.loadSettings();
      const updated = { ...existing, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  loadSettings(): StorageSettings {
    if (!this.isAvailable) {
      return this.getDefaultSettings();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) return this.getDefaultSettings();

      const settings = JSON.parse(stored) as Partial<StorageSettings>;
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): StorageSettings {
    return {
      theme: 'system',
      viewMode: 'grid',
      sortField: 'releaseDate',
      sortDirection: 'desc',
      autoSave: true,
    };
  }

  // Filters storage
  saveFilters(filters: Partial<StorageFilters>): boolean {
    if (!this.isAvailable) return false;

    try {
      const existing = this.loadFilters();
      const updated = { ...existing, ...filters };
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving filters:', error);
      return false;
    }
  }

  loadFilters(): StorageFilters {
    if (!this.isAvailable) {
      return this.getDefaultFilters();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FILTERS);
      if (!stored) return this.getDefaultFilters();

      const filters = JSON.parse(stored) as Partial<StorageFilters>;
      return { ...this.getDefaultFilters(), ...filters };
    } catch (error) {
      console.error('Error loading filters:', error);
      return this.getDefaultFilters();
    }
  }

  private getDefaultFilters(): StorageFilters {
    return {
      searchTerm: '',
      seriesName: '',
      minGrade: 0.5,
      maxGrade: 10.0,
      minPrice: 0,
      maxPrice: 10000,
      isSlabbed: null,
      isSigned: null,
      tags: [],
    };
  }

  // Export/Import functionality
  exportData(): string {
    try {
      const data = {
        comics: this.loadComics(),
        settings: this.loadSettings(),
        filters: this.loadFilters(),
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate imported data
      if (!data.comics || !Array.isArray(data.comics)) {
        throw new Error('Invalid data format: comics array missing');
      }

      // Validate each comic
      const validComics = data.comics.filter((comic: unknown) => {
        const result = validateComic(comic);
        if (!result.success) {
          console.warn('Invalid comic in import, skipping:', comic.id, result.error);
        }
        return result.success;
      });

      // Save imported data
      this.saveComics(validComics);
      
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      
      if (data.filters) {
        this.saveFilters(data.filters);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: ' + (error as Error).message);
    }
  }

  // Clear all data
  clearAll(): boolean {
    if (!this.isAvailable) return false;

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isAvailable) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      });

      // Estimate available storage (localStorage typically has 5-10MB limit)
      const estimatedAvailable = 5 * 1024 * 1024; // 5MB
      const percentage = (totalSize / estimatedAvailable) * 100;

      return {
        used: totalSize,
        available: estimatedAvailable,
        percentage: Math.min(percentage, 100),
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

export const storageManager = new StorageManager();

// Convenience functions
export const saveComics = (comics: Comic[]) => storageManager.saveComics(comics);
export const loadComics = () => storageManager.loadComics();
export const saveSettings = (settings: Partial<StorageSettings>) => storageManager.saveSettings(settings);
export const loadSettings = () => storageManager.loadSettings();
export const saveFilters = (filters: Partial<StorageFilters>) => storageManager.saveFilters(filters);
export const loadFilters = () => storageManager.loadFilters();
export const exportData = () => storageManager.exportData();
export const importData = (jsonData: string) => storageManager.importData(jsonData);
export const clearAll = () => storageManager.clearAll();
export const getStorageInfo = () => storageManager.getStorageInfo();
