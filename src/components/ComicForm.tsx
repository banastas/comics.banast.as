import React, { useState, useEffect } from 'react';
import { Comic } from '../types/Comic';
import { X, Save, ImageIcon } from 'lucide-react';

interface ComicFormProps {
  comic?: Comic;
  onSave: (comic: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  allSeries: string[];
  allStorageLocations: string[];
}

const gradeOptions = [
  10.0, 9.9, 9.8, 9.6, 9.4, 9.2, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.8, 1.5, 1.0, 0.5
];

export const ComicForm: React.FC<ComicFormProps> = ({
  comic,
  onSave,
  onCancel,
  allSeries,
  allStorageLocations,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    seriesName: '',
    issueNumber: 1,
    releaseDate: '',
    coverImageUrl: '',
    grade: 9.0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    signedBy: '',
    storageLocation: '',
    tags: [] as string[],
    isSlabbed: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (comic) {
      setFormData({
        title: comic.title,
        seriesName: comic.seriesName,
        issueNumber: comic.issueNumber,
        releaseDate: comic.releaseDate,
        coverImageUrl: comic.coverImageUrl,
        grade: comic.grade,
        purchasePrice: comic.purchasePrice,
        purchaseDate: comic.purchaseDate,
        notes: comic.notes,
        signedBy: comic.signedBy,
        storageLocation: comic.storageLocation,
        tags: [...comic.tags],
        isSlabbed: comic.isSlabbed,
      });
    }
  }, [comic]);

  const handleInputChange = (field: string, value: any) => {
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
    if (formData.purchasePrice < 0) newErrors.purchasePrice = 'Purchase price must be positive';
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {comic ? 'Edit Comic' : 'Add New Comic'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 ${
                    errors.title ? 'border-red-400 bg-gray-700' : 'border-gray-600 bg-gray-700'
                  }`}
                  placeholder="Enter comic title"
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Series Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Series Name *
                </label>
                <input
                  type="text"
                  list="series-list"
                  value={formData.seriesName}
                  onChange={(e) => handleInputChange('seriesName', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 ${
                    errors.seriesName ? 'border-red-400 bg-gray-700' : 'border-gray-600 bg-gray-700'
                  }`}
                  placeholder="Enter series name"
                />
                <datalist id="series-list">
                  {allSeries.map(series => (
                    <option key={series} value={series} />
                  ))}
                </datalist>
                {errors.seriesName && <p className="text-red-400 text-sm mt-1">{errors.seriesName}</p>}
              </div>

              {/* Issue Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Issue Number *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.issueNumber}
                  onChange={(e) => handleInputChange('issueNumber', parseInt(e.target.value) || 0)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white ${
                    errors.issueNumber ? 'border-red-400 bg-gray-700' : 'border-gray-600 bg-gray-700'
                  }`}
                />
                {errors.issueNumber && <p className="text-red-400 text-sm mt-1">{errors.issueNumber}</p>}
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Release Date *
                </label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white ${
                    errors.releaseDate ? 'border-red-400 bg-gray-700' : 'border-gray-600 bg-gray-700'
                  }`}
                />
                {errors.releaseDate && <p className="text-red-400 text-sm mt-1">{errors.releaseDate}</p>}
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cover Image URL
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.coverImageUrl}
                      onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                      className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                  {formData.coverImageUrl && (
                    <div className="w-12 h-12 border border-gray-600 rounded overflow-hidden bg-gray-700">
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
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', parseFloat(e.target.value))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white ${
                    errors.grade ? 'border-red-400 bg-gray-700' : 'border-gray-600 bg-gray-700'
                  }`}
                >
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-red-400 text-sm mt-1">{errors.grade}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Purchase Price (USD) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white ${
                    errors.purchasePrice ? 'border-red-400 bg-gray-700' : 'border-gray-600 bg-gray-700'
                  }`}
                />
                {errors.purchasePrice && <p className="text-red-400 text-sm mt-1">{errors.purchasePrice}</p>}
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white ${
                    errors.purchaseDate ? 'border-red-400 bg-gray-700' : 'border-gray-600 bg-gray-700'
                  }`}
                />
                {errors.purchaseDate && <p className="text-red-400 text-sm mt-1">{errors.purchaseDate}</p>}
              </div>

              {/* Signed By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Signed By
                </label>
                <input
                  type="text"
                  value={formData.signedBy}
                  onChange={(e) => handleInputChange('signedBy', e.target.value)}
                  className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                  placeholder="Enter signer name"
                />
              </div>

              {/* Storage Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  list="storage-list"
                  value={formData.storageLocation}
                  onChange={(e) => handleInputChange('storageLocation', e.target.value)}
                  className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                  placeholder="Box 1, Shelf A, etc."
                />
                <datalist id="storage-list">
                  {allStorageLocations.map(location => (
                    <option key={location} value={location} />
                  ))}
                </datalist>
              </div>

              {/* Is Slabbed */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isSlabbed}
                    onChange={(e) => handleInputChange('isSlabbed', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-sm font-medium text-gray-300">Slabbed</span>
                </label>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded border border-blue-500/30"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-300 hover:text-blue-100"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-600 bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                  placeholder="Additional notes about this comic"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
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