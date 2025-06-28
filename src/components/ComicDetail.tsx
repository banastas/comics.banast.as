import React, { useState } from 'react';
import { Comic } from '../types/Comic';
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  DollarSign, 
  MapPin, 
  Edit, 
  Trash2, 
  Award, 
  PenTool, 
  Palette,
  Tag,
  FileText,
  Archive,
  User
} from 'lucide-react';

interface ComicDetailProps {
  comic: Comic;
  allComics: Comic[];
  onBack: () => void;
  onEdit: (comic: Comic) => void;
  onDelete: (id: string) => void;
  onView: (comic: Comic) => void;
}

export const ComicDetail: React.FC<ComicDetailProps> = ({ 
  comic, 
  allComics,
  onBack, 
  onEdit, 
  onDelete,
  onView
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comic?')) {
      onDelete(comic.id);
      onBack();
    }
  };

  // Get related comics from the same series
  const relatedComics = allComics
    .filter(c => c.id !== comic.id && c.seriesName === comic.seriesName)
    .sort((a, b) => a.issueNumber - b.issueNumber);

  // Get consecutive issues (within 5 issues before/after)
  const consecutiveIssues = relatedComics.filter(c => 
    Math.abs(c.issueNumber - comic.issueNumber) <= 5
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
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
              <button
                onClick={() => onEdit(comic)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Title Section with Cover */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Cover Image */}
              <div className="flex-shrink-0">
                <div className="relative aspect-[2/3] w-48 bg-gray-700 rounded-lg overflow-hidden shadow-xl border border-gray-600">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
                      <div className="w-6 h-6 border-4 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                  {!imageError && comic.coverImageUrl ? (
                    <img
                      src={comic.coverImageUrl}
                      alt={`${comic.seriesName} #${comic.issueNumber}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Award size={32} className="mx-auto mb-2" />
                        <p className="text-xs font-medium">No Cover</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {comic.isSlabbed && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs font-medium rounded shadow-lg backdrop-blur-sm">
                        Slabbed
                      </span>
                    )}
                    {comic.signedBy && (
                      <span className="px-1.5 py-0.5 bg-rose-500 text-white text-xs font-medium rounded flex items-center shadow-lg backdrop-blur-sm">
                        <PenTool size={8} className="mr-1" />
                        Signed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Title and Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {comic.seriesName} #{comic.issueNumber}
                    </h1>
                    <h2 className="text-xl text-gray-300 mb-4">{comic.title}</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star size={24} className="text-amber-400" />
                    <span className="text-2xl font-bold text-white">{comic.grade}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar size={20} className="text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Release Date</p>
                        <p className="text-white font-medium">{formatDate(comic.releaseDate)}</p>
                      </div>
                    </div>
                    
                    {comic.coverArtist && (
                      <div className="flex items-center space-x-3">
                        <Palette size={20} className="text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Cover Artist</p>
                          <p className="text-white font-medium">{comic.coverArtist}</p>
                        </div>
                      </div>
                    )}
                    
                    {comic.signedBy && (
                      <div className="flex items-center space-x-3">
                        <PenTool size={20} className="text-rose-400" />
                        <div>
                          <p className="text-sm text-gray-400">Signed By</p>
                          <p className="text-white font-medium">{comic.signedBy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign size={20} className="text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Purchase Price</p>
                        <p className="text-white font-medium text-xl">{formatCurrency(comic.purchasePrice)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar size={20} className="text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Purchase Date</p>
                        <p className="text-white font-medium">{formatDate(comic.purchaseDate)}</p>
                      </div>
                    </div>
                    
                    {comic.storageLocation && (
                      <div className="flex items-center space-x-3">
                        <MapPin size={20} className="text-orange-400" />
                        <div>
                          <p className="text-sm text-gray-400">Storage Location</p>
                          <p className="text-white font-medium">{comic.storageLocation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Condition & Status */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Archive size={20} className="mr-2 text-indigo-400" />
                Condition & Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <Star size={24} className="mx-auto mb-2 text-amber-400" />
                  <p className="text-sm text-gray-400 mb-1">Grade</p>
                  <p className="text-xl font-bold text-white">{comic.grade}</p>
                </div>
                
                <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <Archive size={24} className={`mx-auto mb-2 ${comic.isSlabbed ? 'text-purple-400' : 'text-gray-500'}`} />
                  <p className="text-sm text-gray-400 mb-1">Condition</p>
                  <p className="text-lg font-semibold text-white">{comic.isSlabbed ? 'Slabbed' : 'Raw'}</p>
                </div>
                
                <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <PenTool size={24} className={`mx-auto mb-2 ${comic.signedBy ? 'text-rose-400' : 'text-gray-500'}`} />
                  <p className="text-sm text-gray-400 mb-1">Signature</p>
                  <p className="text-lg font-semibold text-white">{comic.signedBy ? 'Signed' : 'Not Signed'}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {comic.tags.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Tag size={20} className="mr-2 text-blue-400" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {comic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {comic.notes && (
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileText size={20} className="mr-2 text-green-400" />
                  Notes
                </h3>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{comic.notes}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User size={20} className="mr-2 text-gray-400" />
                Record Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Added to Collection</p>
                  <p className="text-white">{formatDate(comic.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Last Updated</p>
                  <p className="text-white">{formatDate(comic.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Related Issues */}
            {relatedComics.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Award size={20} className="mr-2 text-yellow-400" />
                  Related Issues from {comic.seriesName}
                </h3>
                
                {/* Consecutive Issues */}
                {consecutiveIssues.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-300 mb-3">Consecutive Issues</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {consecutiveIssues.map((relatedComic) => (
                        <div
                          key={relatedComic.id}
                          onClick={() => onView(relatedComic)}
                          className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-blue-500 transition-all cursor-pointer group"
                        >
                          <div className="aspect-[2/3] bg-gray-600 rounded mb-2 overflow-hidden">
                            {relatedComic.coverImageUrl ? (
                              <img
                                src={relatedComic.coverImageUrl}
                                alt={`${relatedComic.seriesName} #${relatedComic.issueNumber}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Award size={24} className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-white">#{relatedComic.issueNumber}</p>
                            <p className="text-xs text-gray-400">Grade: {relatedComic.grade}</p>
                            <p className="text-xs text-green-400">{formatCurrency(relatedComic.purchasePrice)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Series Issues */}
                {relatedComics.length > consecutiveIssues.length && (
                  <div>
                    <h4 className="text-md font-medium text-gray-300 mb-3">
                      All Issues in Collection ({relatedComics.length} total)
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {relatedComics.map((relatedComic) => (
                        <div
                          key={relatedComic.id}
                          onClick={() => onView(relatedComic)}
                          className={`bg-gray-700/50 rounded-lg p-2 border transition-all cursor-pointer text-center ${
                            consecutiveIssues.some(c => c.id === relatedComic.id)
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <p className="text-sm font-medium text-white">#{relatedComic.issueNumber}</p>
                          <p className="text-xs text-gray-400">{relatedComic.grade}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};