import { useState, useEffect, useCallback } from 'react';
import { Comic, ComicStats, SortField, SortDirection, FilterOptions } from '../types/Comic';
import initialComicsData from '../data/comics.json';

const defaultFilters: FilterOptions = {
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

export const useComics = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);

  // Load comics from imported data
  useEffect(() => {
    try {
      // Handle both array format and object format with comics property
      const comicsData = Array.isArray(initialComicsData) 
        ? initialComicsData 
        : (initialComicsData as any).comics || [];
      setComics(comicsData as Comic[]);
    } catch (error) {
      console.error('Error loading comics:', error);
      setComics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new comic
  const addComic = useCallback((comic: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newComic: Comic = {
      ...comic,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedComics = [...comics, newComic];
    setComics(updatedComics);
  }, [comics]);

  // Update an existing comic
  const updateComic = useCallback((id: string, updates: Partial<Comic>) => {
    const updatedComics = comics.map(comic => 
      comic.id === id 
        ? { ...comic, ...updates, updatedAt: new Date().toISOString() }
        : comic
    );
    setComics(updatedComics);
  }, [comics]);

  // Delete a comic
  const deleteComic = useCallback((id: string) => {
    const updatedComics = comics.filter(comic => comic.id !== id);
    setComics(updatedComics);
  }, [comics]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...comics];

    // Apply filters
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(comic =>
        comic.title.toLowerCase().includes(searchLower) ||
        comic.seriesName.toLowerCase().includes(searchLower) ||
        comic.notes.toLowerCase().includes(searchLower) ||
        comic.signedBy.toLowerCase().includes(searchLower) ||
        comic.coverArtist.toLowerCase().includes(searchLower)
      );
    }

    if (filters.seriesName) {
      filtered = filtered.filter(comic => 
        comic.seriesName.toLowerCase().includes(filters.seriesName.toLowerCase())
      );
    }

    filtered = filtered.filter(comic => 
      comic.grade >= filters.minGrade && comic.grade <= filters.maxGrade
    );

    filtered = filtered.filter(comic => 
      comic.purchasePrice >= filters.minPrice && comic.purchasePrice <= filters.maxPrice
    );

    if (filters.isSlabbed !== null) {
      filtered = filtered.filter(comic => comic.isSlabbed === filters.isSlabbed);
    }

    if (filters.isSigned !== null) {
      filtered = filtered.filter(comic => 
        filters.isSigned ? comic.signedBy.trim() !== '' : comic.signedBy.trim() === ''
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(comic =>
        filters.tags.some(tag => comic.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | undefined;
      let bValue: string | number | undefined;
      
      // Handle currentValue sorting specially since it might be undefined
      if (sortField === 'currentValue') {
        aValue = a.currentValue || a.purchasePrice;
        bValue = b.currentValue || b.purchasePrice;
      } else {
        aValue = a[sortField as keyof Comic] as string | number | undefined;
        bValue = b[sortField as keyof Comic] as string | number | undefined;
      }
      
      let comparison = 0;
      
      // Special handling for title sorting - also sort by issue number
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
        if (comparison === 0) {
          // If titles are the same, sort by issue number
          comparison = a.issueNumber - b.issueNumber;
        }
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredComics(filtered);
  }, [comics, filters, sortField, sortDirection]);

  // Calculate statistics
  const comicsWithCurrentValue = comics.filter(comic => comic.currentValue !== undefined);
  const totalPurchaseValue = comics.reduce((sum, comic) => sum + comic.purchasePrice, 0);
  const totalCurrentValue = comicsWithCurrentValue.reduce((sum, comic) => sum + (comic.currentValue || 0), 0);
  const totalGainLoss = totalCurrentValue - comicsWithCurrentValue.reduce((sum, comic) => sum + comic.purchasePrice, 0);
  const totalGainLossPercentage = comicsWithCurrentValue.length > 0 
    ? (totalGainLoss / comicsWithCurrentValue.reduce((sum, comic) => sum + comic.purchasePrice, 0)) * 100 
    : 0;

  // Find biggest gainer and loser
  const biggestGainer = comicsWithCurrentValue.reduce((biggest, comic) => {
    const gain = (comic.currentValue || 0) - comic.purchasePrice;
    const biggestGain = biggest ? ((biggest.currentValue || 0) - biggest.purchasePrice) : -Infinity;
    return gain > biggestGain ? comic : biggest;
  }, null as Comic | null);

  const biggestLoser = comicsWithCurrentValue.reduce((biggest, comic) => {
    const loss = (comic.currentValue || 0) - comic.purchasePrice;
    const biggestLoss = biggest ? ((biggest.currentValue || 0) - biggest.purchasePrice) : Infinity;
    return loss < biggestLoss ? comic : biggest;
  }, null as Comic | null);

  const stats: ComicStats = {
    totalComics: comics.length,
    totalValue: totalPurchaseValue, // Keep for backward compatibility
    totalPurchaseValue,
    totalCurrentValue,
    highestValuedComic: comics.reduce((highest, comic) => 
      !highest || comic.purchasePrice > highest.purchasePrice ? comic : highest, 
      null as Comic | null
    ),
    highestValuedSlabbedComic: comics
      .filter(comic => comic.isSlabbed)
      .reduce((highest, comic) => {
        const comicValue = comic.currentValue || comic.purchasePrice;
        const highestValue = highest ? (highest.currentValue || highest.purchasePrice) : 0;
        return comicValue > highestValue ? comic : highest;
      }, null as Comic | null),
    highestValuedRawComic: comics
      .filter(comic => !comic.isSlabbed)
      .reduce((highest, comic) => {
        const comicValue = comic.currentValue || comic.purchasePrice;
        const highestValue = highest ? (highest.currentValue || highest.purchasePrice) : 0;
        return comicValue > highestValue ? comic : highest;
      }, null as Comic | null),
    biggestGainer,
    biggestLoser,
    rawComics: comics.filter(comic => !comic.isSlabbed).length,
    slabbedComics: comics.filter(comic => comic.isSlabbed).length,
    signedComics: comics.filter(comic => comic.signedBy.trim() !== '').length,
    averageGrade: comics.length > 0 
      ? comics.reduce((sum, comic) => sum + comic.grade, 0) / comics.length 
      : 0,
    totalGainLoss,
    totalGainLossPercentage,
    comicsWithCurrentValue: comicsWithCurrentValue.length,
  };

  return {
    comics: filteredComics,
    allComics: comics,
    stats,
    filters,
    sortField,
    sortDirection,
    loading,
    addComic,
    updateComic,
    deleteComic,
    setFilters,
    setSortField,
    setSortDirection,
  };
};