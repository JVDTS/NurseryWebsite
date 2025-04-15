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
    
    console.log(`[DEBUG] Fetched HTML from ${url}, length: ${html.length}`);
    
    // Parse HTML
    const root = parse(html);
    
    // Log some debug info
    console.log(`[DEBUG] Page title: ${root.querySelector('title')?.textContent || 'Not found'}`);
    
    // Try multiple selectors for reviews
    const selectors = ['.review', '.review-item', '.testimonial', '.client-testimonial'];
    let reviewElements = root.querySelectorAll('.review');
    
    if (!reviewElements || reviewElements.length === 0) {
      for (const selector of selectors) {
        const elements = root.querySelectorAll(selector);
        console.log(`[DEBUG] Trying selector "${selector}": found ${elements.length} elements`);
        if (elements && elements.length > 0) {
          reviewElements = elements;
          break;
        }
      }
    }
    
    const nurseryName = root.querySelector('.company-profile h1')?.textContent.trim() || 
                         root.querySelector('h1')?.textContent.trim() || 
                         'Coat of Many Colours Nursery';
    
    // Extract review data
    const reviews: Review[] = reviewElements.map((el, index) => {
      console.log(`[DEBUG] Review element ${index} HTML: ${el.innerHTML.substring(0, 150)}...`);
      
      // Try multiple selectors for review text
      let text = '';
      const textSelectors = [
        '.review-content p', 
        '.review-text', 
        '.testimonial-text', 
        '.comment-content',
        'p'
      ];
      
      for (const selector of textSelectors) {
        const element = el.querySelector(selector);
        if (element && element.textContent.trim()) {
          text = element.textContent.trim();
          break;
        }
      }
      
      // If still no text, try getting all text from the element
      if (!text) {
        text = el.textContent.trim().substring(0, 200) + '...';
      }
      
      // Try multiple selectors for author
      const authorSelectors = ['.reviewer', '.author', '.name', '.client-name'];
      let author = 'Parent';
      
      for (const selector of authorSelectors) {
        const element = el.querySelector(selector);
        if (element && element.textContent.trim()) {
          author = element.textContent.trim();
          break;
        }
      }
      
      // Try multiple selectors for date
      const dateSelectors = ['.date', '.review-date', '.timestamp'];
      let date = '';
      
      for (const selector of dateSelectors) {
        const element = el.querySelector(selector);
        if (element && element.textContent.trim()) {
          date = element.textContent.trim();
          break;
        }
      }
      
      // Try multiple selectors for rating
      const ratingSelectors = ['.stars', '.rating', '.score'];
      let rating = 5;
      
      for (const selector of ratingSelectors) {
        const element = el.querySelector(selector);
        if (element) {
          // Check for star icons
          const stars = element.querySelectorAll('.fas.fa-star, .fa-star, .star-filled');
          if (stars && stars.length > 0) {
            rating = stars.length;
            break;
          }
          
          // Check for numerical rating
          const ratingText = element.textContent.trim();
          const ratingMatch = ratingText.match(/(\d+(\.\d+)?)\s*\/\s*(\d+)/);
          if (ratingMatch) {
            const numerator = parseFloat(ratingMatch[1]);
            const denominator = parseFloat(ratingMatch[3]);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
              rating = Math.round((numerator / denominator) * 5);
              break;
            }
          }
        }
      }
      
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