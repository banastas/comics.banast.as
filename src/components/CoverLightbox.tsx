import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CoverLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export const CoverLightbox: React.FC<CoverLightboxProps> = ({ src, alt, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      // Only one focusable control: keep focus inside the dialog.
      if (event.key === 'Tab') { event.preventDefault(); closeRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in"
    >
      {/* Clicking anywhere outside the close button also dismisses the cover. */}
      <button type="button" tabIndex={-1} aria-hidden="true" className="absolute inset-0 h-full w-full cursor-zoom-out" onClick={onClose} />
      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-slate-800/90 p-2 text-white transition-colors hover:bg-slate-700"
        aria-label="Close cover"
      >
        <X size={22} />
      </button>
      <img
        src={src}
        alt={alt}
        className="pointer-events-none relative max-h-full max-w-full rounded-lg object-contain shadow-2xl"
      />
    </div>
  );
};
