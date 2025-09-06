import React, { useEffect } from 'react';
import { Comic } from '../types/Comic';
import { 
  ArrowLeft, 
  MapPin,
  Archive,
} from 'lucide-react';

interface StorageLocationsListingProps {
  allComics: Comic[];
  onBack: () => void;
  onViewStorageLocation: (storageLocation: string) => void;
}

export const StorageLocationsListing: React.FC<StorageLocationsListingProps> = ({ 
  allComics,
  onBack,
  onViewStorageLocation
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || !isFinite(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get unique storage locations with statistics
  const storageLocations = Array.from(new Set(allComics.map(comic => comic.storageLocation).filter(Boolean)))
    .map(location => {
      const locationComics = allComics.filter(comic => comic.storageLocation === location);
      const totalValue = locationComics.reduce((sum, comic) => sum + (comic.currentValue || comic.purchasePrice || 0), 0);
      const slabbedCount = locationComics.filter(comic => comic.isSlabbed).length;
      const rawCount = locationComics.filter(comic => !comic.isSlabbed).length;
      
      return {
        name: location,
        count: locationComics.length,
        totalValue,
        slabbedCount,
        rawCount,
        averageGrade: locationComics.length > 0 
          ? locationComics.reduce((sum, comic) => sum + comic.grade, 0) / locationComics.length 
          : 0
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Storage Locations Header */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-orange-500 rounded-lg">
                <MapPin size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Virtual Boxes</h1>
                <p className="text-gray-300">
                  {storageLocations.length} virtual box{storageLocations.length !== 1 ? 'es' : ''} in your collection
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{storageLocations.length}</p>
                <p className="text-sm text-gray-400">Virtual Boxes</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {storageLocations.reduce((sum, loc) => sum + loc.count, 0)}
                </p>
                <p className="text-sm text-gray-400">Total Comics</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(storageLocations.reduce((sum, loc) => sum + loc.totalValue, 0))}
                </p>
                <p className="text-sm text-gray-400">Total Value</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {storageLocations.length > 0 
                    ? (storageLocations.reduce((sum, loc) => sum + (loc.averageGrade * loc.count), 0) / 
                       storageLocations.reduce((sum, loc) => sum + loc.count, 0)).toFixed(1)
                    : '0.0'
                  }
                </p>
                <p className="text-sm text-gray-400">Avg Grade</p>
              </div>
            </div>
          </div>

          {/* Storage Locations List */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">All Virtual Boxes</h3>
            
            {storageLocations.length > 0 ? (
              <div className="space-y-3">
                {storageLocations.map((location) => (
                  <div
                    key={location.name}
                    className="bg-gray-700/50 rounded-lg border border-gray-600 p-4 hover:border-orange-500 transition-all cursor-pointer group"
                    onClick={() => onViewStorageLocation(location.name)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                          <MapPin size={20} className="text-orange-400" />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white text-lg group-hover:text-orange-400 transition-colors">
                            {location.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-400 mt-1">
                            <span>{location.count} comics</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Avg Grade: {location.averageGrade.toFixed(1)}</span>
                            {location.slabbedCount > 0 && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <div className="flex items-center space-x-1">
                                  <Archive size={12} className="text-purple-400" />
                                  <span>{location.slabbedCount} slabbed</span>
                                </div>
                              </>
                            )}
                            {location.rawCount > 0 && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span>{location.rawCount} raw</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-xl font-bold text-white">
                          {formatCurrency(location.totalValue)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatCurrency(location.count > 0 ? location.totalValue / location.count : 0)} avg
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Virtual Boxes</h3>
                <p className="text-gray-400">
                  Add virtual box information to your comics to see them organized here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};