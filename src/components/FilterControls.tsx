import React from 'react';
import { FilterOptions, SortField, SortDirection } from '../types/Comic';
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';

interface FilterControlsProps {
  filters: FilterOptions;
  sortField: SortField;
  sortDirection: SortDirection;
  onFiltersChange: (filters: FilterOptions) => void;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  allSeries: string[];
  allTags: string[];
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  sortField,
  sortDirection,
  onFiltersChange,
  onSortChange,
  allSeries,
  allTags,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      seriesName: '',
      minGrade: 0.5,
      maxGrade: 10.0,
      minPrice: 0,
      maxPrice: 10000,
      isSlabbed: null,
      isSigned: null,
      tags: [],
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.seriesName || 
    filters.minGrade > 0.5 || filters.maxGrade < 10.0 || 
    filters.minPrice > 0 || filters.maxPrice < 10000 ||
    filters.isSlabbed !== null || filters.isSigned !== null || 
    filters.tags.length > 0;

  const sortFields: { field: SortField; label: string }[] = [
    { field: 'title', label: 'Title' },
    { field: 'seriesName', label: 'Series' },
    { field: 'issueNumber', label: 'Issue #' },
    { field: 'releaseDate', label: 'Release Date' },
    { field: 'grade', label: 'Grade' },
    { field: 'purchasePrice', label: 'Price' },
    { field: 'purchaseDate', label: 'Purchase Date' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-6">
      {/* Search and Basic Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search comics, series, notes..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={sortField}
            onChange={(e) => handleSortClick(e.target.value as SortField)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
          >
            {sortFields.map(({ field, label }) => (
              <option key={field} value={field}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => handleSortClick(sortField)}
            className="p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
          >
            {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
          >
            <Filter size={16} />
            <span className="text-sm">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
              title="Clear all filters"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Series Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Series</label>
              <select
                value={filters.seriesName}
                onChange={(e) => handleFilterChange('seriesName', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
              >
                <option value="">All Series</option>
                {allSeries.map((series) => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </div>

            {/* Grade Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Grade Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={filters.minGrade}
                  onChange={(e) => handleFilterChange('minGrade', parseFloat(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={filters.maxGrade}
                  onChange={(e) => handleFilterChange('maxGrade', parseFloat(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 10000)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
                />
              </div>
            </div>

            {/* Slabbed Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Condition</label>
              <select
                value={filters.isSlabbed === null ? '' : filters.isSlabbed.toString()}
                onChange={(e) => handleFilterChange('isSlabbed', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
              >
                <option value="">All</option>
                <option value="true">Slabbed</option>
                <option value="false">Raw</option>
              </select>
            </div>

            {/* Signed Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Signed</label>
              <select
                value={filters.isSigned === null ? '' : filters.isSigned.toString()}
                onChange={(e) => handleFilterChange('isSigned', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
              >
                <option value="">All</option>
                <option value="true">Signed</option>
                <option value="false">Not Signed</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};