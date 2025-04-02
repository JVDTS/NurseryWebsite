import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Request } from 'express';
import Busboy from 'busboy';

// Directory to store uploaded files
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// File interface
interface UploadedFile {
  originalname: string;
  filename: string;
  mimetype: string;
  path: string;
  size: number;
}

// FileInfo interface
interface FileInfo {
  filename: string;
  mimeType: string;
}

// Generate a unique filename
function generateFilename(originalname: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  return `${timestamp}-${randomString}${extension}`;
}

// Process a file upload
export async function processFileUpload(req: Request): Promise<UploadedFile | null> {
  return new Promise((resolve, reject) => {
    try {
      const bb = Busboy({ headers: req.headers });
      let fileData: UploadedFile | null = null;
      let filePromises: Promise<void>[] = [];

      bb.on('file', (fieldname: string, file: NodeJS.ReadableStream, info: FileInfo) => {
        const { filename, mimeType } = info;
        const saveTo = path.join(UPLOAD_DIR, generateFilename(filename));
        const writeStream = fs.createWriteStream(saveTo);
        
        let fileSize = 0;
        
        file.on('data', (data: Buffer) => {
          fileSize += data.length;
        });
        
        // Create a promise for this file's completion
        const filePromise = new Promise<void>((resolveFile, rejectFile) => {
          writeStream.on('finish', () => {
            fileData = {
              originalname: filename,
              filename: path.basename(saveTo),
              mimetype: mimeType,
              path: saveTo,
              size: fileSize
            };
            resolveFile();
          });
          
          writeStream.on('error', (err) => {
            rejectFile(err);
          });
        });
        
        filePromises.push(filePromise);
        file.pipe(writeStream);
      });
      
      bb.on('finish', async () => {
        try {
          // Wait for all file writes to complete
          if (filePromises.length > 0) {
            await Promise.all(filePromises);
            resolve(fileData);
          } else {
            resolve(null); // No files were processed
          }
        } catch (err) {
          reject(err);
        }
      });
      
      bb.on('error', (err: Error) => {
        reject(err);
      });
      
      req.pipe(bb);
    } catch (err) {
      reject(err);
    }
  });
}

// Delete a file
export function deleteFile(filename: string): boolean {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error deleting file:', err);
    return false;
  }
}

// Get the URL path for a file
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}

// Get the full path for a file
export function getFilePath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}