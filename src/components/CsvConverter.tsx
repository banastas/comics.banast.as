import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface CsvConverterProps {
  onBack: () => void;
}

export const CsvConverter: React.FC<CsvConverterProps> = ({ onBack }) => {
  const [csvData, setCsvData] = useState<string>('');
  const [jsonData, setJsonData] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<{
    totalComics: number;
    variants: number;
    slabbed: number;
    graphicNovels: number;
  } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
        setError('');
        setSuccess(false);
        setStats(null);
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const parseCsvValue = (value: string): string | number | boolean | undefined => {
    if (!value || value.trim() === '') return undefined;
    
    // Handle currency values
    if (value.startsWith('$')) {
      const numValue = parseFloat(value.replace('$', '').replace(',', ''));
      return isNaN(numValue) ? 0 : numValue;
    }
    
    // Handle boolean values
    if (value.toUpperCase() === 'TRUE') return true;
    if (value.toUpperCase() === 'FALSE') return false;
    
    // Handle numeric values
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && value.match(/^\d+\.?\d*$/)) {
      return numValue;
    }
    
    return value.trim();
  };

  const convertCsvToJson = () => {
    if (!csvData.trim()) {
      setError('Please upload a CSV file first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      
      const comics = lines.slice(1).map((line, index) => {
        // Handle CSV parsing with potential commas in quoted fields
        const values: string[] = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue); // Add the last value

        // Create comic object
        const comic: any = {
          id: `comic-${index + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Map CSV columns to comic properties
        headers.forEach((header, i) => {
          const value = values[i]?.replace(/^"|"$/g, ''); // Remove surrounding quotes
          
          switch (header.trim()) {
            case 'title':
              comic.title = value || '';
              break;
            case 'seriesName':
              comic.seriesName = value || '';
              break;
            case 'issueNumber':
              comic.issueNumber = parseInt(value) || 1;
              break;
            case 'releaseDate':
              comic.releaseDate = value || new Date().toISOString().split('T')[0];
              break;
            case 'coverImageUrl':
              comic.coverImageUrl = value || '';
              break;
            case 'coverArtist':
              comic.coverArtist = value || '';
              break;
            case 'grade':
              comic.grade = parseFloat(value) || 9.0;
              break;
            case 'purchasePrice':
              const purchasePrice = parseCsvValue(value);
              comic.purchasePrice = typeof purchasePrice === 'number' ? purchasePrice : 0;
              break;
            case 'purchaseDate':
              comic.purchaseDate = value || new Date().toISOString().split('T')[0];
              break;
            case 'currentValue':
              const currentValue = parseCsvValue(value);
              comic.currentValue = typeof currentValue === 'number' ? currentValue : undefined;
              break;
            case 'notes':
              comic.notes = value || '';
              break;
            case 'signedBy':
              comic.signedBy = value || '';
              break;
            case 'storageLocation':
              comic.storageLocation = value || '';
              break;
            case 'tags':
              comic.tags = value ? value.split(',').map(tag => tag.trim()).filter(Boolean) : [];
              break;
            case 'isVariant':
              comic.isVariant = parseCsvValue(value) === true;
              break;
            case 'isGraphicNovel':
              comic.isGraphicNovel = parseCsvValue(value) === true;
              break;
            case 'isSlabbed':
              comic.isSlabbed = parseCsvValue(value) === true;
              break;
          }
        });

        return comic;
      });

      // Calculate stats
      const totalComics = comics.length;
      const variants = comics.filter(comic => comic.isVariant).length;
      const slabbed = comics.filter(comic => comic.isSlabbed).length;
      const graphicNovels = comics.filter(comic => comic.isGraphicNovel).length;

      setStats({ totalComics, variants, slabbed, graphicNovels });
      setJsonData(JSON.stringify(comics, null, 2));
      setSuccess(true);
    } catch (err) {
      setError(`Error converting CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadJson = () => {
    if (!jsonData) return;

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comics.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            <h1 className="text-xl font-bold text-white">CSV to JSON Converter</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Instructions */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-blue-400" />
              CSV to JSON Converter
            </h2>
            <p className="text-gray-300 mb-4">
              Upload your comics.banast.as.csv file to convert it to the JSON format required by the comic collection app.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2">Expected CSV Format:</h3>
              <p className="text-blue-200 text-sm">
                The CSV should contain columns: id, title, seriesName, issueNumber, releaseDate, coverImageUrl, 
                coverArtist, grade, purchasePrice, purchaseDate, currentValue, notes, signedBy, storageLocation, 
                tags, isVariant, isGraphicNovel, isSlabbed, createdAt, updatedAt
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Step 1: Upload CSV File</h3>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload size={48} className="mx-auto text-gray-500 mb-4" />
              <label className="cursor-pointer">
                <span className="text-blue-400 hover:text-blue-300 font-medium">
                  Click to upload CSV file
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-gray-400 text-sm mt-2">
                Select your comics.banast.as.csv file
              </p>
            </div>
            
            {csvData && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-green-300 font-medium">CSV file loaded successfully</span>
                </div>
                <p className="text-green-200 text-sm mt-1">
                  {csvData.split('\n').length - 1} rows detected
                </p>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Step 2: Convert to JSON</h3>
            <button
              onClick={convertCsvToJson}
              disabled={!csvData || isProcessing}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>Convert CSV to JSON</span>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-red-300 font-medium">Error</span>
                </div>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            )}

            {success && stats && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-green-300 font-medium">Conversion successful!</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">{stats.totalComics}</p>
                    <p className="text-gray-400">Total Comics</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">{stats.variants}</p>
                    <p className="text-gray-400">Variants</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">{stats.slabbed}</p>
                    <p className="text-gray-400">Slabbed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">{stats.graphicNovels}</p>
                    <p className="text-gray-400">Graphic Novels</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Download JSON */}
          {jsonData && (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Step 3: Download JSON</h3>
              <button
                onClick={downloadJson}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download size={20} />
                <span>Download comics.json</span>
              </button>
              
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">Next Steps:</h4>
                <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                  <li>Download the comics.json file using the button above</li>
                  <li>Replace the existing src/data/comics.json file with your new file</li>
                  <li>The app will automatically reload with your comic collection</li>
                </ol>
              </div>
            </div>
          )}

          {/* JSON Preview */}
          {jsonData && (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">JSON Preview</h3>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-gray-300 text-xs whitespace-pre-wrap break-words">
                  {jsonData.substring(0, 2000)}
                  {jsonData.length > 2000 && '\n... (truncated for display)'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};