import React from 'react';

interface FluidTypographyProps {
  children: React.ReactNode;
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const FluidTypography: React.FC<FluidTypographyProps> = ({
  children,
  variant,
  className = '',
  as
}) => {
  const variantStyles = {
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-bold leading-tight',
    h3: 'text-lg sm:text-xl lg:text-2xl font-semibold leading-snug',
    h4: 'text-base sm:text-lg lg:text-xl font-semibold leading-snug',
    body: 'text-sm sm:text-base leading-relaxed',
    caption: 'text-xs sm:text-sm leading-normal',
    label: 'text-xs sm:text-sm font-medium leading-normal'
  };

  const defaultElements = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    caption: 'span',
    label: 'label'
  };

  const Component = as || defaultElements[variant];

  return React.createElement(
    Component,
    {
      className: `${variantStyles[variant]} ${className}`
    },
    children
  );
};