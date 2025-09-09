import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsiveBreakpoint = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs');
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      let newBreakpoint: Breakpoint = 'xs';
      
      if (width >= breakpoints['2xl']) {
        newBreakpoint = '2xl';
      } else if (width >= breakpoints.xl) {
        newBreakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        newBreakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        newBreakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        newBreakpoint = 'sm';
      }

      setCurrentBreakpoint(newBreakpoint);
    };

    // Set initial values
    handleResize();

    // Add event listener with passive option for better performance
    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup - ensure the exact same function reference is removed
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array is correct here

  const isBreakpoint = (breakpoint: Breakpoint): boolean => {
    return windowWidth >= breakpoints[breakpoint];
  };

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md' || currentBreakpoint === 'lg';
  const isDesktop = currentBreakpoint === 'xl' || currentBreakpoint === '2xl';

  return {
    currentBreakpoint,
    windowWidth,
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  };
};