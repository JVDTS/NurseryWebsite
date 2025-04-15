import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

export interface Review {
  id: string;
  text: string;
  author: string;
  date: string;
  rating: number;
  nurseryName: string;
}

/**
 * Fetch reviews from daynurseries.co.uk
 * @param url The URL of the nursery page on daynurseries.co.uk
 * @returns Array of review objects
 */
export async function fetchReviews(url: string): Promise<Review[]> {
  try {
    // Fetch the HTML content from the URL
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews. Status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML
    const root = parse(html);
    
    // Find the reviews container
    const reviewsContainer = root.querySelectorAll('.review'); 
    
    // Extract review data
    const reviews: Review[] = [];
    
    reviewsContainer.forEach((reviewElement, index) => {
      // Extract review text
      const textElement = reviewElement.querySelector('.review-text');
      const text = textElement ? textElement.textContent.trim() : '';
      
      // Extract author info
      const authorElement = reviewElement.querySelector('.reviewer');
      const author = authorElement ? authorElement.textContent.trim() : 'Anonymous';
      
      // Extract date
      const dateElement = reviewElement.querySelector('.review-date');
      const date = dateElement ? dateElement.textContent.trim() : '';
      
      // Extract rating
      const ratingElement = reviewElement.querySelector('.rating');
      // Count the number of filled stars
      const filledStars = ratingElement ? ratingElement.querySelectorAll('.icon-star').length : 5;
      
      // Extract nursery name
      const nurseryNameElement = root.querySelector('h1');
      const nurseryName = nurseryNameElement ? nurseryNameElement.textContent.trim() : 'Coat of Many Colours Nursery School';
      
      reviews.push({
        id: `review-${index}`,
        text,
        author,
        date,
        rating: filledStars,
        nurseryName
      });
    });
    
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Return fallback reviews if fetching fails
    return [
      {
        id: 'fallback-1',
        text: 'Unable to fetch live reviews. Please check back later.',
        author: 'System',
        date: new Date().toLocaleDateString(),
        rating: 5,
        nurseryName: 'Coat of Many Colours Nursery School'
      }
    ];
  }
}