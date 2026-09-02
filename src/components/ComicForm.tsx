import React, { useState, useEffect, useRef } from 'react';
import type { Comic } from '../types/Comic';
import { X, Save } from 'lucide-react';

interface ComicFormProps {
  comic?: Comic;
  onSave: (comic: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  allSeries: string[];
  allVirtualBoxes: string[];
}

const gradeOptions = [
  10.0, 9.9, 9.8, 9.6, 9.4, 9.2, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.8, 1.5, 1.0, 0.5
];

type ComicFormData = Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>;

const createInitialFormData = (comic?: Comic): ComicFormData => comic ? {
  title: comic.title,
  seriesName: comic.seriesName,
  issueNumber: comic.issueNumber,
  releaseDate: comic.releaseDate,
  coverImageUrl: comic.coverImageUrl,
  coverArtist: comic.coverArtist,
  grade: comic.grade,
  purchasePrice: comic.purchasePrice,
  purchaseDate: comic.purchaseDate,
  currentValue: comic.currentValue,
  notes: comic.notes,
  signedBy: comic.signedBy,
  storageLocation: comic.storageLocation,
  tags: [...comic.tags],
  isSlabbed: comic.isSlabbed,
  isVariant: comic.isVariant || false,
  isGraphicNovel: comic.isGraphicNovel || false,
} : {
  title: '',
  seriesName: '',
  issueNumber: 1,
  releaseDate: '',
  coverImageUrl: '',
  coverArtist: '',
  grade: 9.0,
  purchasePrice: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  currentValue: undefined,
  notes: '',
  signedBy: '',
  storageLocation: '',
  tags: [],
  isSlabbed: false,
  isVariant: false,
  isGraphicNovel: false,
};

export const ComicForm: React.FC<ComicFormProps> = ({
  comic,
  onSave,
  onCancel,
  allSeries,
  allVirtualBoxes,
}) => {
  const [formData, setFormData] = useState<ComicFormData>(() => createInitialFormData(comic));

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    titleInputRef.current?.focus();

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hasAttribute('hidden'));
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

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onCancel]);

  const handleInputChange = (field: string, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.seriesName.trim()) newErrors.seriesName = 'Series name is required';
    if (formData.issueNumber < 0) newErrors.issueNumber = 'Issue number must be positive';
    if (!formData.releaseDate) newErrors.releaseDate = 'Release date is required';
    if (formData.grade < 0.5 || formData.grade > 10) newErrors.grade = 'Grade must be between 0.5 and 10';
    if (formData.purchasePrice !== undefined && formData.purchasePrice < 0) newErrors.purchasePrice = 'Purchase price must be positive';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div
        ref={dialogRef}
        className="bg-surface-primary rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comic-form-title"
      >
        <div className="sticky top-0 bg-surface-primary border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 id="comic-form-title" className="text-lg sm:text-xl font-bold text-white">
            {comic ? 'Edit Comic' : 'Add New Comic'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-surface-secondary rounded-lg transition-colors"
            type="button"
            aria-label="Close comic form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="comic-title" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="comic-title"
                  ref={titleInputRef}
                  required
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? 'comic-title-error' : undefined}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full border rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm sm:text-base ${
                    errors.title ? 'border-red-400 bg-surface-secondary' : 'border-slate-700 bg-surface-secondary'
                  }`}
                  placeholder="Enter comic title"
                />
                {errors.title && <p id="comic-title-error" className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Series Name */}
              <div>
                <label htmlFor="comic-series" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Series Name *
                </label>
                <input
                  type="text"
                  id="comic-series"
                  required
                  aria-invalid={Boolean(errors.seriesName)}
                  aria-describedby={errors.seriesName ? 'comic-series-error' : undefined}
                  list="series-list"
                  value={formData.seriesName}
                  onChange={(e) => handleInputChange('seriesName', e.target.value)}
                  className={`w-full border rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm sm:text-base ${
                    errors.seriesName ? 'border-red-400 bg-surface-secondary' : 'border-slate-700 bg-surface-secondary'
                  }`}
                  placeholder="Enter series name"
                />
                <datalist id="series-list">
                  {allSeries.map(series => (
                    <option key={series} value={series} />
                  ))}
                </datalist>
                {errors.seriesName && <p id="comic-series-error" className="text-red-400 text-sm mt-1">{errors.seriesName}</p>}
              </div>

              {/* Issue Number */}
              <div>
                <label htmlFor="comic-issue-number" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Issue Number *
                </label>
                <input
                  type="number"
                  id="comic-issue-number"
                  required
                  aria-invalid={Boolean(errors.issueNumber)}
                  aria-describedby={errors.issueNumber ? 'comic-issue-number-error' : undefined}
                  min="0"
                  value={formData.issueNumber}
                  onChange={(e) => handleInputChange('issueNumber', parseInt(e.target.value) || 0)}
                  className={`w-full border rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white text-sm sm:text-base ${
                    errors.issueNumber ? 'border-red-400 bg-surface-secondary' : 'border-slate-700 bg-surface-secondary'
                  }`}
                />
                {errors.issueNumber && <p id="comic-issue-number-error" className="text-red-400 text-sm mt-1">{errors.issueNumber}</p>}
              </div>

              {/* Release Date */}
              <div>
                <label htmlFor="comic-release-date" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Release Date *
                </label>
                <input
                  type="date"
                  id="comic-release-date"
                  required
                  aria-invalid={Boolean(errors.releaseDate)}
                  aria-describedby={errors.releaseDate ? 'comic-release-date-error' : undefined}
                  value={formData.releaseDate}
                  onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                  className={`w-full border rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white text-sm sm:text-base ${
                    errors.releaseDate ? 'border-red-400 bg-surface-secondary' : 'border-slate-700 bg-surface-secondary'
                  }`}
                />
                {errors.releaseDate && <p id="comic-release-date-error" className="text-red-400 text-sm mt-1">{errors.releaseDate}</p>}
              </div>

              {/* Cover Image URL */}
              <div>
                <label htmlFor="comic-cover-url" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Cover Image URL
                </label>
                <div className="flex space-x-2 items-start">
                  <div className="flex-1">
                    <input
                      type="url"
                      id="comic-cover-url"
                      value={formData.coverImageUrl}
                      onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                      className="w-full border border-slate-700 bg-surface-secondary rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm sm:text-base"
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                  {formData.coverImageUrl && (
                    <div className="w-12 h-12 border border-slate-700 rounded overflow-hidden bg-surface-secondary">
                      <img
                        src={formData.coverImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Grade */}
              <div>
                <label htmlFor="comic-grade" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Grade *
                </label>
                <select
                  id="comic-grade"
                  required
                  aria-invalid={Boolean(errors.grade)}
                  aria-describedby={errors.grade ? 'comic-grade-error' : undefined}
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', parseFloat(e.target.value))}
                  className={`w-full border rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white text-sm sm:text-base ${
                    errors.grade ? 'border-red-400 bg-surface-secondary' : 'border-slate-700 bg-surface-secondary'
                  }`}
                >
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && <p id="comic-grade-error" className="text-red-400 text-sm mt-1">{errors.grade}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              {/* Purchase Price */}
              <div>
                <label htmlFor="comic-purchase-price" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Purchase Price (USD)
                </label>
                <input
                  type="number"
                  id="comic-purchase-price"
                  aria-invalid={Boolean(errors.purchasePrice)}
                  aria-describedby={errors.purchasePrice ? 'comic-purchase-price-error' : undefined}
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full border rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white text-sm sm:text-base ${
                    errors.purchasePrice ? 'border-red-400 bg-surface-secondary' : 'border-slate-700 bg-surface-secondary'
                  }`}
                  placeholder="Enter purchase price"
                />
                {errors.purchasePrice && <p id="comic-purchase-price-error" className="text-red-400 text-sm mt-1">{errors.purchasePrice}</p>}
              </div>

              {/* Current Value */}
              <div>
                <label htmlFor="comic-current-value" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Current Value (USD)
                </label>
                <input
                  type="number"
                  id="comic-current-value"
                  min="0"
                  step="0.01"
                  value={formData.currentValue || ''}
                  onChange={(e) => handleInputChange('currentValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full border border-slate-700 bg-surface-secondary rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white text-sm sm:text-base"
                  placeholder="Enter current market value"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label htmlFor="comic-purchase-date" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  id="comic-purchase-date"
                  required
                  aria-invalid={Boolean(errors.purchaseDate)}
                  aria-describedby={errors.purchaseDate ? 'comic-purchase-date-error' : undefined}
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className={`w-full border rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white text-sm sm:text-base ${
                    errors.purchaseDate ? 'border-red-400 bg-surface-secondary' : 'border-slate-700 bg-surface-secondary'
                  }`}
                />
                {errors.purchaseDate && <p id="comic-purchase-date-error" className="text-red-400 text-sm mt-1">{errors.purchaseDate}</p>}
              </div>

              {/* Signed By */}
              <div>
                <label htmlFor="comic-signed-by" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Signed By
                </label>
                <input
                  type="text"
                  id="comic-signed-by"
                  value={formData.signedBy}
                  onChange={(e) => handleInputChange('signedBy', e.target.value)}
                  className="w-full border border-slate-700 bg-surface-secondary rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter signer name"
                />
              </div>

              {/* Storage Location */}
              <div>
                <label htmlFor="comic-storage-location" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Virtual Box
                </label>
                <input
                  type="text"
                  id="comic-storage-location"
                  list="virtualbox-list"
                  value={formData.storageLocation}
                  onChange={(e) => handleInputChange('storageLocation', e.target.value)}
                  className="w-full border border-slate-700 bg-surface-secondary rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Box 1, Shelf A, etc."
                />
                <datalist id="virtualbox-list">
                  {allVirtualBoxes.map(location => (
                    <option key={location} value={location} />
                  ))}
                </datalist>
              </div>

              {/* Is Slabbed */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSlabbed}
                    onChange={(e) => handleInputChange('isSlabbed', e.target.checked)}
                    className="rounded border-slate-700 bg-surface-secondary text-blue-500 focus:ring-blue-400 w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm font-medium text-slate-300">Slabbed</span>
                </label>
              </div>

              {/* Is Variant */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVariant}
                    onChange={(e) => handleInputChange('isVariant', e.target.checked)}
                    className="rounded border-slate-700 bg-surface-secondary text-blue-500 focus:ring-blue-400 w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm font-medium text-slate-300">Variant Cover</span>
                </label>
              </div>

              {/* Is Graphic Novel */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGraphicNovel}
                    onChange={(e) => handleInputChange('isGraphicNovel', e.target.checked)}
                    className="rounded border-slate-700 bg-surface-secondary text-blue-500 focus:ring-blue-400 w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm font-medium text-slate-300">Graphic Novel</span>
                </label>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="comic-tags" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Tags
                </label>
                <div className="flex space-x-2 mb-2 items-stretch">
                  <input
                    type="text"
                    id="comic-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border border-slate-700 bg-surface-secondary rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs sm:text-sm rounded border border-blue-500/30"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-300 hover:text-blue-100"
                          aria-label={`Remove ${tag} tag`}
                        >
                          <X size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Artist */}
              <div>
                <label htmlFor="comic-cover-artist" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Cover Artist
                </label>
                <input
                  type="text"
                  id="comic-cover-artist"
                  value={formData.coverArtist}
                  onChange={(e) => handleInputChange('coverArtist', e.target.value)}
                  className="w-full border border-slate-700 bg-surface-secondary rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter cover artist name"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="comic-notes" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  id="comic-notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full border border-slate-700 bg-surface-secondary rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 text-sm sm:text-base resize-none"
                  placeholder="Additional notes about this comic"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 sm:px-6 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-surface-secondary transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg text-sm sm:text-base"
            >
              <Save size={16} />
              <span>{comic ? 'Update' : 'Save'} Comic</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
