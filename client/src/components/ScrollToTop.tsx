import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A component that automatically scrolls to the top of the page on route changes
 */
export default function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null; // This component doesn't render anything
}