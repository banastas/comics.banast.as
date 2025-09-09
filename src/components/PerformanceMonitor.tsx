import React, { useEffect } from 'react';
import { measurePerformance } from '../utils/performance';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  componentName: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  children, 
  componentName 
}) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Only log if render time is significant (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      } else if (renderTime > 8) {
        console.log(`⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  return <>{children}</>;
};

// Higher-order component for easy wrapping
export const withPerformanceMonitor = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = (props: P) => (
    <PerformanceMonitor componentName={componentName}>
      <Component {...props} />
    </PerformanceMonitor>
  );
  
  WrappedComponent.displayName = `withPerformanceMonitor(${componentName})`;
  return WrappedComponent;
};
