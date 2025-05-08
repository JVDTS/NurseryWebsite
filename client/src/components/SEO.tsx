import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export default function SEO({
  title = 'Little Blossoms Nursery',
  description = 'Providing exceptional childcare services in Hayes, Uxbridge, and Hounslow with a safe, nurturing environment for children to grow and learn.',
  canonical,
  ogType = 'website',
  ogImage = '/open-graph-image.jpg',
  twitterCard = 'summary_large_image',
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Find or create meta elements
    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: ogType },
      { property: 'og:image', content: ogImage },
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ];

    metaTags.forEach(({ name, property, content }) => {
      // Try to find existing tag
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      // If tag doesn't exist, create it
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (name) metaTag.name = name;
        if (property) metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      
      // Set the content
      metaTag.content = content;
    });

    // Handle canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    
    if (canonical) {
      linkCanonical.href = canonical;
    } else {
      // Default to current URL
      linkCanonical.href = window.location.href;
    }

    // Cleanup
    return () => {
      // We don't remove the tags on cleanup since they should be updated
      // by the next page's SEO component
    };
  }, [title, description, canonical, ogType, ogImage, twitterCard]);

  return null;
}