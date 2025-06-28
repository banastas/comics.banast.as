import React, { useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

interface DataManagerProps {
  onExport: () => void;
  onImport: (file: File, merge: boolean) => void;
  onClearAll: () => void;
  totalComics: number;
}

export const DataManager: React.FC<DataManagerProps> = ({
  onExport,
  onImport,
  onClearAll,
  totalComics,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);
  const [importMode, setImportMode] = React.useState<'replace' | 'merge'>('merge');

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file, importMode === 'merge');
      e.target.value = '';
    }
  };

  const handleClearAll = () => {
    onClearAll();
    setShowConfirmClear(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export */}
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-700/30">
          <h4 className="font-medium text-white mb-2">Export Collection</h4>
          <p className="text-sm text-gray-400 mb-3">
            Download your collection as a JSON file for backup or transfer.
          </p>
          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full justify-center shadow-lg"
          >
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>

        {/* Import */}
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-700/30">
          <h4 className="font-medium text-white mb-2">Import Collection</h4>
          <p className="text-sm text-gray-400 mb-3">
            Import comics from a JSON file.
          </p>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">Import Mode</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={(e) => setImportMode(e.target.value as 'merge')}
                  className="text-blue-500 focus:ring-blue-400 bg-gray-700 border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-300">Merge (keep existing)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={(e) => setImportMode(e.target.value as 'replace')}
                  className="text-blue-500 focus:ring-blue-400 bg-gray-700 border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-300">Replace all</span>
              </label>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors w-full justify-center shadow-lg"
          >
            <Upload size={16} />
            <span>Import Data</span>
          </button>
        </div>

        {/* Clear All */}
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/10">
          <h4 className="font-medium text-red-400 mb-2">Clear Collection</h4>
          <p className="text-sm text-red-300 mb-3">
            Permanently delete all comics. This cannot be undone.
          </p>
          
          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              disabled={totalComics === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle size={16} />
                <span>This will delete {totalComics} comics!</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 px-3 py-2 border border-gray-600 text-gray-300 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};