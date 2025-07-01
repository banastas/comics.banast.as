import React from 'react';

interface TouchTargetProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  variant?: 'button' | 'link' | 'icon';
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  ariaLabel,
  variant = 'button'
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center
    min-h-[44px] min-w-[44px]
    touch-manipulation
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    button: `
      px-3 py-2 sm:px-4 sm:py-2
      bg-blue-500 hover:bg-blue-600 active:bg-blue-700
      text-white font-medium rounded-lg
      shadow-lg hover:shadow-xl
    `,
    link: `
      px-2 py-2 sm:px-3 sm:py-2
      text-blue-400 hover:text-blue-300 active:text-blue-500
      hover:bg-blue-500/10 active:bg-blue-500/20
      rounded-lg
    `,
    icon: `
      p-2 sm:p-3
      text-gray-400 hover:text-gray-300 active:text-gray-500
      hover:bg-gray-700/50 active:bg-gray-700/70
      rounded-lg
    `
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};