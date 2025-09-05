export interface Comic {
  id: string;
  title: string;
  seriesName: string;
  issueNumber: number;
  releaseDate: string;
  coverImageUrl: string;
  coverArtist: string;
  grade: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue?: number;
  notes: string;
  signedBy: string;
  storageLocation: string;
  tags: string[];
  isSlabbed: boolean;
  isVariant: boolean;
  isGraphicNovel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComicStats {
  totalComics: number;
  totalValue: number;
  totalPurchaseValue: number;
  totalCurrentValue: number;
  highestValuedComic: Comic | null;
  highestValuedSlabbedComic: Comic | null;
  highestValuedRawComic: Comic | null;
  biggestGainer: Comic | null;
  biggestLoser: Comic | null;
  rawComics: number;
  slabbedComics: number;
  signedComics: number;
  averageGrade: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  comicsWithCurrentValue: number;
}

export type SortField = 'title' | 'seriesName' | 'issueNumber' | 'releaseDate' | 'grade' | 'purchaseDate' | 'purchasePrice' | 'currentValue';
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