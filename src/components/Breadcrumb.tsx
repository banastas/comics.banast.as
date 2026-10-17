import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { AppLink } from './AppLink';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (items.length <= 1) return null;

  return (
    <nav className="min-w-0 py-2 text-sm" aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={`flex items-center gap-1.5 ${isLast ? 'min-w-0' : 'shrink-0'}`}>
              {index === 0 && <Home size={14} className="flex-shrink-0 text-slate-400" aria-hidden="true" />}
              {index > 0 && <ChevronRight size={14} className="flex-shrink-0 text-slate-500" aria-hidden="true" />}
              {isLast ? (
                <span className="truncate font-medium text-slate-200" aria-current="page">{item.label}</span>
              ) : item.href && item.onClick ? (
                <AppLink href={item.href} onNavigate={item.onClick} className="whitespace-nowrap text-slate-400 transition-colors hover:text-blue-300">
                  {item.label}
                </AppLink>
              ) : (
                <button onClick={item.onClick} className="whitespace-nowrap text-slate-400 transition-colors hover:text-blue-300">
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
