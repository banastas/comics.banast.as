import React, { useEffect, useRef } from 'react';
import { Grid, List, SortAsc, SortDesc, X } from 'lucide-react';
import { SortField } from '../types/Comic';

interface MobileControlsProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: () => void;
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'title', label: 'Title' },
  { value: 'seriesName', label: 'Series' },
  { value: 'issueNumber', label: 'Issue #' },
  { value: 'grade', label: 'Grade' },
  { value: 'purchasePrice', label: 'Purchase Price' },
  { value: 'currentValue', label: 'Current Value' },
  { value: 'purchaseDate', label: 'Purchase Date' },
];

export const MobileControls: React.FC<MobileControlsProps> = ({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={dialogRef}
        className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-controls-title"
      >
        <div className="bg-surface-elevated border-t border-slate-700/50 rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4 pt-2">
            <h3 id="mobile-controls-title" className="text-lg font-semibold text-white">View & Sort</h3>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              aria-label="Close view and sort controls"
            >
              <X size={20} />
            </button>
          </div>

          {/* View Mode */}
          <div className="px-5 pb-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">View</p>
            <div className="flex gap-2">
              <button
                onClick={() => onViewModeChange('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-surface-secondary text-slate-400 border border-slate-700/50 hover:text-slate-300'
                }`}
              >
                <Grid size={18} />
                Grid
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                aria-pressed={viewMode === 'list'}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-surface-secondary text-slate-400 border border-slate-700/50 hover:text-slate-300'
                }`}
              >
                <List size={18} />
                List
              </button>
            </div>
          </div>

          {/* Sort Field */}
          <div className="px-5 pb-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Sort By</p>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortFieldChange(option.value)}
                  aria-pressed={sortField === option.value}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-left ${
                    sortField === option.value
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-surface-secondary text-slate-400 border border-slate-700/50 hover:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Direction */}
          <div className="px-5 pb-8">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Direction</p>
            <button
              onClick={onSortDirectionChange}
              aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-surface-secondary border border-slate-700/50 text-slate-300 hover:text-white transition-colors"
            >
              {sortDirection === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
              <span className="text-sm font-medium">
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
