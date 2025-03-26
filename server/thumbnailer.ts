import * as fs from 'fs';
import * as path from 'path';
import * as pdfjs from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

// Initialize pdf.js
const pdfjsLib = pdfjs;

// Get current file and directory paths in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path where thumbnails will be stored
const THUMBNAIL_DIR = path.join(__dirname, '../uploads/thumbnails');

// Ensure the thumbnail directory exists
if (!fs.existsSync(THUMBNAIL_DIR)) {
  fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
}

/**
 * Generates a thumbnail for a PDF file
 * @param pdfPath Path to the PDF file
 * @returns Path to the generated thumbnail
 */
export async function generatePdfThumbnail(pdfPath: string): Promise<string> {
  // Extract filename without extension
  const fullPath = path.resolve(path.join(process.cwd(), pdfPath));
  const fileName = path.basename(pdfPath, '.pdf');
  
  // Define thumbnail path
  const thumbnailPath = path.join(THUMBNAIL_DIR, `${fileName}.png`);
  
  // Check if thumbnail already exists
  if (fs.existsSync(thumbnailPath)) {
    return `/uploads/thumbnails/${fileName}.png`;
  }
  
  try {
    // Load the PDF document
    const data = new Uint8Array(fs.readFileSync(fullPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    
    // Set viewport for the page (scale it to a reasonable size)
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Create a canvas for rendering
    const canvas = createCanvas(viewport.width, viewport.height);
    // Using any to avoid type conflicts with pdf.js and node-canvas
    const context = canvas.getContext('2d') as any;
    
    // Render the PDF page to the canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Save the canvas as a PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(thumbnailPath, buffer);
    
    return `/uploads/thumbnails/${fileName}.png`;
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    return ''; // Return empty string if thumbnail generation fails
  }
}

/**
 * Gets the thumbnail URL for a PDF file
 * If the thumbnail doesn't exist, it will try to generate it
 * @param pdfPath Path to the PDF file
 * @returns URL of the thumbnail
 */
export async function getPdfThumbnailUrl(pdfPath: string): Promise<string> {
  try {
    if (!pdfPath) return '';
    
    // Extract filename without extension
    const fileName = path.basename(pdfPath, '.pdf');
    const thumbnailPath = path.join(THUMBNAIL_DIR, `${fileName}.png`);
    
    // Check if thumbnail already exists
    if (fs.existsSync(thumbnailPath)) {
      return `/uploads/thumbnails/${fileName}.png`;
    }
    
    // Generate thumbnail if it doesn't exist
    return await generatePdfThumbnail(pdfPath);
  } catch (error) {
    console.error('Error getting PDF thumbnail URL:', error);
    return ''; // Return empty string if there's an error
  }
}