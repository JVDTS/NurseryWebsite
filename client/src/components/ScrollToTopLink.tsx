import { Link } from 'wouter';
import { ReactNode } from 'react';

interface ScrollToTopLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * A custom Link component that scrolls to the top of the page when clicked
 */
export default function ScrollToTopLink({ href, children, className, onClick }: ScrollToTopLinkProps) {
  
  const handleClick = () => {
    // Scroll to the top immediately
    window.scrollTo(0, 0);
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}