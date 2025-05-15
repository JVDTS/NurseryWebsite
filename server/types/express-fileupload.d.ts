declare module 'express-fileupload' {
  import { Request, Response, NextFunction } from 'express';
  
  interface UploadedFile {
    name: string;
    data: Buffer;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
    mv: (path: string, callback?: (err?: any) => void) => Promise<void>;
  }
  
  interface FileArray {
    [fieldname: string]: UploadedFile | UploadedFile[];
  }
  
  interface Options {
    createParentPath?: boolean;
    uriDecodeFileNames?: boolean;
    safeFileNames?: boolean | RegExp;
    preserveExtension?: boolean | number;
    abortOnLimit?: boolean;
    responseOnLimit?: string;
    limitHandler?: (req: Request, res: Response, next: NextFunction) => void;
    useTempFiles?: boolean;
    tempFileDir?: string;
    parseNested?: boolean;
    debug?: boolean;
    uploadTimeout?: number;
    limits?: {
      fileSize?: number;
    };
  }
  
  declare global {
    namespace Express {
      interface Request {
        files?: FileArray;
      }
    }
  }
  
  function fileUpload(options?: Options): (req: Request, res: Response, next: NextFunction) => void;
  
  export = fileUpload;
}