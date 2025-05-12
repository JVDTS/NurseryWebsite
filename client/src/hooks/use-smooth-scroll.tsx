import { useEffect } from 'react';

interface SmoothScrollOptions {
  speed?: number;  // Speed factor (lower = faster)
  threshold?: number; // Threshold in pixels to trigger custom scroll
}

export function useSmoothScroll({ speed = 8, threshold = 100 }: SmoothScrollOptions = {}) {
  useEffect(() => {
    // Store the original scroll position
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let rafId: number | null = null;
    let isScrolling = false;

    // Function to handle the smooth scroll animation
    const smoothScroll = () => {
      // Calculate the difference between current and target scroll positions
      const diff = targetScrollY - currentScrollY;
      
      // If the difference is very small, just set it directly
      if (Math.abs(diff) < 0.5) {
        currentScrollY = targetScrollY;
        window.scrollTo(0, currentScrollY);
        isScrolling = false;
        return;
      }
      
      // Calculate the scroll increment using the speed factor
      const scrollIncrement = diff / speed;
      
      // Update the current scroll position
      currentScrollY += scrollIncrement;
      
      // Apply the scroll
      window.scrollTo(0, currentScrollY);
      
      // Continue the animation
      rafId = requestAnimationFrame(smoothScroll);
    };

    // Handle scroll events
    const handleScroll = () => {
      // Update the target scroll position
      targetScrollY = window.scrollY;
      
      // Start the smooth scroll animation if not already running
      // and if the scroll distance is greater than threshold
      if (!isScrolling && Math.abs(targetScrollY - currentScrollY) > threshold) {
        isScrolling = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(smoothScroll);
      }
    };

    // Add the scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed, threshold]);
}

export default useSmoothScroll;