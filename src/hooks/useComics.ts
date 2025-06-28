import { useState, useEffect, useCallback } from 'react';
import { Comic, ComicStats, SortField, SortDirection, FilterOptions } from '../types/Comic';

const STORAGE_KEY = 'comic-collection';

const sampleComics: Comic[] = [
  {
    id: 'sample-1',
    title: 'The Amazing Spider-Man',
    seriesName: 'The Amazing Spider-Man',
    issueNumber: 300,
    releaseDate: '1988-05-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Todd McFarlane',
    grade: 9.6,
    purchasePrice: 850,
    purchaseDate: '2023-03-15',
    currentValue: 1200,
    notes: 'First appearance of Venom. Classic McFarlane cover art.',
    signedBy: 'Todd McFarlane',
    storageLocation: 'Box A-1',
    tags: ['key issue', 'signed', 'first appearance'],
    isSlabbed: true,
    createdAt: '2023-03-15T10:30:00Z',
    updatedAt: '2023-03-15T10:30:00Z',
  },
  {
    id: 'sample-2',
    title: 'Batman: The Killing Joke',
    seriesName: 'Batman: The Killing Joke',
    issueNumber: 1,
    releaseDate: '1988-03-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373479/pexels-photo-6373479.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Brian Bolland',
    grade: 9.8,
    purchasePrice: 1200,
    purchaseDate: '2023-01-20',
    currentValue: 1800,
    notes: 'Iconic Joker story by Alan Moore and Brian Bolland.',
    signedBy: '',
    storageLocation: 'Box A-2',
    tags: ['classic', 'graphic novel', 'dc'],
    isSlabbed: true,
    createdAt: '2023-01-20T14:15:00Z',
    updatedAt: '2023-01-20T14:15:00Z',
  },
  {
    id: 'sample-3',
    title: 'X-Men',
    seriesName: 'Uncanny X-Men',
    issueNumber: 141,
    releaseDate: '1981-01-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373480/pexels-photo-6373480.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'John Byrne',
    grade: 8.5,
    purchasePrice: 450,
    purchaseDate: '2023-02-10',
    currentValue: 380,
    notes: 'Days of Future Past storyline begins. Classic Byrne/Claremont.',
    signedBy: '',
    storageLocation: 'Box B-1',
    tags: ['key issue', 'classic', 'marvel'],
    isSlabbed: false,
    createdAt: '2023-02-10T09:45:00Z',
    updatedAt: '2023-02-10T09:45:00Z',
  },
  {
    id: 'sample-4',
    title: 'Watchmen',
    seriesName: 'Watchmen',
    issueNumber: 1,
    releaseDate: '1986-09-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373481/pexels-photo-6373481.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Dave Gibbons',
    grade: 9.4,
    purchasePrice: 320,
    purchaseDate: '2023-04-05',
    currentValue: 420,
    notes: 'First issue of the legendary Alan Moore series.',
    signedBy: 'Dave Gibbons',
    storageLocation: 'Box A-3',
    tags: ['signed', 'classic', 'alan moore'],
    isSlabbed: false,
    createdAt: '2023-04-05T16:20:00Z',
    updatedAt: '2023-04-05T16:20:00Z',
  },
  {
    id: 'sample-5',
    title: 'The Walking Dead',
    seriesName: 'The Walking Dead',
    issueNumber: 1,
    releaseDate: '2003-10-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373482/pexels-photo-6373482.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Tony Moore',
    grade: 9.0,
    purchasePrice: 2800,
    purchaseDate: '2023-05-12',
    currentValue: 3500,
    notes: 'First appearance of Rick Grimes. Black and white cover.',
    signedBy: 'Robert Kirkman',
    storageLocation: 'Box C-1',
    tags: ['first appearance', 'signed', 'modern classic'],
    isSlabbed: true,
    createdAt: '2023-05-12T11:30:00Z',
    updatedAt: '2023-05-12T11:30:00Z',
  },
  {
    id: 'sample-6',
    title: 'Saga',
    seriesName: 'Saga',
    issueNumber: 1,
    releaseDate: '2012-03-14',
    coverImageUrl: 'https://images.pexels.com/photos/6373483/pexels-photo-6373483.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Fiona Staples',
    grade: 9.8,
    purchasePrice: 180,
    purchaseDate: '2023-06-08',
    currentValue: 220,
    notes: 'First issue of Brian K. Vaughan and Fiona Staples epic.',
    signedBy: '',
    storageLocation: 'Box C-2',
    tags: ['modern', 'image comics', 'space opera'],
    isSlabbed: true,
    createdAt: '2023-06-08T13:45:00Z',
    updatedAt: '2023-06-08T13:45:00Z',
  },
  {
    id: 'sample-7',
    title: 'Incredible Hulk',
    seriesName: 'The Incredible Hulk',
    issueNumber: 181,
    releaseDate: '1974-11-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373484/pexels-photo-6373484.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Herb Trimpe',
    grade: 7.5,
    purchasePrice: 1500,
    purchaseDate: '2023-07-22',
    currentValue: 1800,
    notes: 'First full appearance of Wolverine. Historic issue.',
    signedBy: '',
    storageLocation: 'Box A-4',
    tags: ['key issue', 'wolverine', 'first appearance'],
    isSlabbed: false,
    createdAt: '2023-07-22T10:15:00Z',
    updatedAt: '2023-07-22T10:15:00Z',
  },
  {
    id: 'sample-8',
    title: 'Sandman',
    seriesName: 'The Sandman',
    issueNumber: 1,
    releaseDate: '1989-01-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373485/pexels-photo-6373485.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Sam Kieth',
    grade: 9.2,
    purchasePrice: 280,
    purchaseDate: '2023-08-14',
    currentValue: 350,
    notes: 'First appearance of Dream. Neil Gaiman masterpiece begins.',
    signedBy: 'Neil Gaiman',
    storageLocation: 'Box B-2',
    tags: ['signed', 'vertigo', 'neil gaiman', 'first appearance'],
    isSlabbed: false,
    createdAt: '2023-08-14T15:30:00Z',
    updatedAt: '2023-08-14T15:30:00Z',
  },
  {
    id: 'sample-9',
    title: 'Spawn',
    seriesName: 'Spawn',
    issueNumber: 1,
    releaseDate: '1992-05-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373486/pexels-photo-6373486.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Todd McFarlane',
    grade: 8.0,
    purchasePrice: 95,
    purchaseDate: '2023-09-03',
    currentValue: 85,
    notes: 'Todd McFarlane creates his own universe. Image Comics launch.',
    signedBy: '',
    storageLocation: 'Box C-3',
    tags: ['image comics', '90s', 'todd mcfarlane'],
    isSlabbed: false,
    createdAt: '2023-09-03T12:20:00Z',
    updatedAt: '2023-09-03T12:20:00Z',
  },
  {
    id: 'sample-10',
    title: 'Teenage Mutant Ninja Turtles',
    seriesName: 'Teenage Mutant Ninja Turtles',
    issueNumber: 1,
    releaseDate: '1984-05-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373487/pexels-photo-6373487.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Kevin Eastman',
    grade: 6.5,
    purchasePrice: 3200,
    purchaseDate: '2023-10-18',
    currentValue: 4200,
    notes: 'First appearance of the Turtles. Mirage Studios first print.',
    signedBy: 'Kevin Eastman',
    storageLocation: 'Box A-5',
    tags: ['first appearance', 'signed', 'indie classic', 'mirage'],
    isSlabbed: true,
    createdAt: '2023-10-18T14:45:00Z',
    updatedAt: '2023-10-18T14:45:00Z',
  },
  {
    id: 'sample-11',
    title: 'Invincible',
    seriesName: 'Invincible',
    issueNumber: 1,
    releaseDate: '2003-01-22',
    coverImageUrl: 'https://images.pexels.com/photos/6373488/pexels-photo-6373488.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Cory Walker',
    grade: 9.6,
    purchasePrice: 420,
    purchaseDate: '2023-11-07',
    currentValue: 380,
    notes: 'Robert Kirkman superhero series. Great condition copy.',
    signedBy: '',
    storageLocation: 'Box C-4',
    tags: ['modern', 'superhero', 'image comics'],
    isSlabbed: true,
    createdAt: '2023-11-07T09:30:00Z',
    updatedAt: '2023-11-07T09:30:00Z',
  },
  {
    id: 'sample-12',
    title: 'Y: The Last Man',
    seriesName: 'Y: The Last Man',
    issueNumber: 1,
    releaseDate: '2002-09-01',
    coverImageUrl: 'https://images.pexels.com/photos/6373489/pexels-photo-6373489.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverArtist: 'Pia Guerra',
    grade: 9.4,
    purchasePrice: 150,
    purchaseDate: '2023-12-01',
    currentValue: 180,
    notes: 'Brian K. Vaughan post-apocalyptic series. Vertigo Comics.',
    signedBy: 'Brian K. Vaughan',
    storageLocation: 'Box B-3',
    tags: ['signed', 'vertigo', 'post-apocalyptic', 'modern classic'],
    isSlabbed: false,
    createdAt: '2023-12-01T16:15:00Z',
    updatedAt: '2023-12-01T16:15:00Z',
  },
];

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
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [loading, setLoading] = useState(true);

  // Load comics from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedComics = JSON.parse(stored);
        setComics(parsedComics);
      } else {
        // If no data exists, populate with sample data
        setComics(sampleComics);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleComics));
      }
    } catch (error) {
      console.error('Error loading comics:', error);
      // Fallback to sample data if there's an error
      setComics(sampleComics);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save comics to localStorage
  const saveComics = useCallback((newComics: Comic[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newComics));
      setComics(newComics);
    } catch (error) {
      console.error('Error saving comics:', error);
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
    saveComics(updatedComics);
  }, [comics, saveComics]);

  // Update an existing comic
  const updateComic = useCallback((id: string, updates: Partial<Comic>) => {
    const updatedComics = comics.map(comic => 
      comic.id === id 
        ? { ...comic, ...updates, updatedAt: new Date().toISOString() }
        : comic
    );
    saveComics(updatedComics);
  }, [comics, saveComics]);

  // Delete a comic
  const deleteComic = useCallback((id: string) => {
    const updatedComics = comics.filter(comic => comic.id !== id);
    saveComics(updatedComics);
  }, [comics, saveComics]);

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
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredComics(filtered);
  }, [comics, filters, sortField, sortDirection]);

  // Calculate statistics
  const stats: ComicStats = {
    totalComics: comics.length,
    totalValue: comics.reduce((sum, comic) => sum + comic.purchasePrice, 0),
    highestValuedComic: comics.reduce((highest, comic) => 
      !highest || comic.purchasePrice > highest.purchasePrice ? comic : highest, 
      null as Comic | null
    ),
    rawComics: comics.filter(comic => !comic.isSlabbed).length,
    slabbedComics: comics.filter(comic => comic.isSlabbed).length,
    signedComics: comics.filter(comic => comic.signedBy.trim() !== '').length,
    averageGrade: comics.length > 0 
      ? comics.reduce((sum, comic) => sum + comic.grade, 0) / comics.length 
      : 0,
  };

  // Export/Import functions
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(comics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comic-collection-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [comics]);

  const importData = useCallback((file: File, merge: boolean = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedComics: Comic[] = JSON.parse(e.target?.result as string);
        if (merge) {
          const existingIds = new Set(comics.map(c => c.id));
          const newComics = importedComics.filter(c => !existingIds.has(c.id));
          saveComics([...comics, ...newComics]);
        } else {
          saveComics(importedComics);
        }
      } catch (error) {
        console.error('Error importing comics:', error);
      }
    };
    reader.readAsText(file);
  }, [comics, saveComics]);

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
    exportData,
    importData,
  };
};