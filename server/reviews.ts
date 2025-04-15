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
    // Fetch HTML content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const html = await response.text();
    
    // Parse HTML
    const root = parse(html);
    const reviewElements = root.querySelectorAll('.review');
    const nurseryName = root.querySelector('.company-profile h1')?.textContent.trim() || 'Coat of Many Colours Nursery';
    
    // Extract review data
    const reviews: Review[] = reviewElements.map((el, index) => {
      const text = el.querySelector('.review-content p')?.textContent.trim() || 
                   el.querySelector('.review-text')?.textContent.trim() || '';
      const authorEl = el.querySelector('.reviewer');
      const author = authorEl ? authorEl.textContent.trim() : 'Parent';
      const dateEl = el.querySelector('.date');
      const date = dateEl ? dateEl.textContent.trim() : '';
      const ratingEl = el.querySelector('.stars');
      const rating = ratingEl ? (ratingEl.querySelectorAll('.fas.fa-star').length || 5) : 5;
      
      return { 
        id: `review-${index}`, 
        text, 
        author, 
        date, 
        rating,
        nurseryName
      };
    });
    
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
}