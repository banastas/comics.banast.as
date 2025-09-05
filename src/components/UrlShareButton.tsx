import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { getCurrentUrl, copyUrlToClipboard } from '../utils/routing';

interface UrlShareButtonProps {
  className?: string;
  title?: string;
  size?: number;
}

export const UrlShareButton: React.FC<UrlShareButtonProps> = ({ 
  className = '', 
  title = 'Share URL',
  size = 16 
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = getCurrentUrl();
    const success = await copyUrlToClipboard(url);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors ${className}`}
      title={title}
    >
      {copied ? (
        <Check size={size} className="text-green-400" />
      ) : (
        <Share2 size={size} />
      )}
    </button>
  );
};

export default UrlShareButton;
