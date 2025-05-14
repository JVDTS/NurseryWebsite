import 'express-session';

declare module 'express-session' {
  interface SessionData {
    preferences?: {
      theme?: string;
    };
    user?: any; // For admin user authentication
  }
}