import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (items.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm py-3 overflow-x-auto" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index === 0 && (
              <Home size={14} className="text-slate-500 flex-shrink-0" />
            )}
            {index > 0 && (
              <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
            )}
            {isLast ? (
              <span className="text-slate-300 font-medium truncate">{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-slate-500 hover:text-blue-400 transition-colors truncate whitespace-nowrap"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
