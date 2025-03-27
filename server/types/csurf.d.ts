declare module 'csurf' {
  import { RequestHandler } from 'express';
  
  interface CsurfOptions {
    cookie?: boolean | Object;
    ignoreMethods?: string[];
    sessionKey?: string;
    value?: (req: any) => string;
  }
  
  function csurf(options?: CsurfOptions): RequestHandler;
  
  export = csurf;
}