export interface Comic {
  id: string;
  title: string;
  seriesName: string;
  issueNumber: number;
  releaseDate: string;
  coverImageUrl: string;
  grade: number;
  purchasePrice: number;
  purchaseDate: string;
  notes: string;
  signedBy: string;
  storageLocation: string;
  tags: string[];
  isSlabbed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComicStats {
  totalComics: number;
  totalValue: number;
  highestValuedComic: Comic | null;
  rawComics: number;
  slabbedComics: number;
  signedComics: number;
  averageGrade: number;
}

export type SortField = 'title' | 'seriesName' | 'issueNumber' | 'releaseDate' | 'grade' | 'purchaseDate' | 'purchasePrice';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
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