import React from 'react';
import { ArrowLeft, Grid, List } from 'lucide-react';
import { DetailSortField } from '../utils/sorting';

interface DetailPageHeaderProps {
  onBack: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOptions?: { value: string; label: string }[];
}

const defaultSortOptions = [
  { value: 'series', label: 'Sort by Series' },
  { value: 'issue', label: 'Sort by Issue #' },
  { value: 'grade', label: 'Sort by Grade' },
  { value: 'value', label: 'Sort by Value' },
  { value: 'date', label: 'Sort by Release Date' },
];

export const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
  onBack,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  sortOptions = defaultSortOptions,
}) => (
  <div className="bg-gray-800 shadow-lg border-b border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Collection</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 border border-gray-600 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <List size={16} />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </div>
);
