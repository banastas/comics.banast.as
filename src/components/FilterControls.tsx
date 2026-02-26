import React from 'react';
import { FilterOptions } from '../types/Comic';

interface FilterControlsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  allSeries: string[];
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  allSeries,
}) => {

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | boolean | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };


  return (
    <div className="bg-surface-primary rounded-lg shadow-lg border border-slate-800 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Series Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Series</label>
          <select
            value={filters.seriesName}
            onChange={(e) => handleFilterChange('seriesName', e.target.value)}
            className="w-full bg-surface-secondary border border-slate-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
          >
            <option value="">All Series</option>
            {allSeries.map((series) => (
              <option key={series} value={series}>{series}</option>
            ))}
          </select>
        </div>

        {/* Grade Range */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Grade Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              value={filters.minGrade}
              onChange={(e) => handleFilterChange('minGrade', parseFloat(e.target.value))}
              className="w-full bg-surface-secondary border border-slate-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
            />
            <span className="text-slate-400 text-xs sm:text-sm">to</span>
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              value={filters.maxGrade}
              onChange={(e) => handleFilterChange('maxGrade', parseFloat(e.target.value))}
              className="w-full bg-surface-secondary border border-slate-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Price Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-secondary border border-slate-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
            />
            <span className="text-slate-400 text-xs sm:text-sm">to</span>
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 10000)}
              className="w-full bg-surface-secondary border border-slate-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
            />
          </div>
        </div>

        {/* Slabbed Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Condition</label>
          <select
            value={filters.isSlabbed === null ? '' : filters.isSlabbed.toString()}
            onChange={(e) => handleFilterChange('isSlabbed', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full bg-surface-secondary border border-slate-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
          >
            <option value="">All</option>
            <option value="true">Slabbed</option>
            <option value="false">Raw</option>
          </select>
        </div>

        {/* Signed Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Signed</label>
          <select
            value={filters.isSigned === null ? '' : filters.isSigned.toString()}
            onChange={(e) => handleFilterChange('isSigned', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full bg-surface-secondary border border-slate-700 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
          >
            <option value="">All</option>
            <option value="true">Signed</option>
            <option value="false">Not Signed</option>
          </select>
        </div>
      </div>
    </div>
  );
};