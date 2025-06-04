import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerCMSRoutes } from "./cmsRoutes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { generateSecureToken } from "./security";
import fs from "fs";
import fileUpload from "express-fileupload";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  createParentPath: true,
  useTempFiles: false,
  debug: process.env.NODE_ENV === 'development'
}));

// Add security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  // Allow iframe embedding for PDF preview
  frameguard: {
    action: 'sameorigin'
  },
  // Set secure cookies in production
  hsts: process.env.NODE_ENV === 'production' ? undefined : false
}));

// Add rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." }
});

// Apply rate limiting to API routes
app.use("/api/", apiLimiter);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Serve public files (PDFs, etc.) statically
app.use(express.static(publicDir));

// API request logger middleware
app.use((req, res, next) => {
  // Only log API requests
  if (!req.path.startsWith("/api")) {
    return next();
  }
  
  const start = Date.now();
  
  // Use the finish event without modifying core methods
  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
    
    // Truncate log line if too long
    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }
    
    log(logLine);
  });
  
  next();
});

(async () => {
  const server = await registerRoutes(app);
  await registerCMSRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for server-side debugging
    console.error(`[ERROR] ${status}: ${message}`, err);
    
    // Return a clean response to the client without throwing
    res.status(status).json({ 
      success: false,
      message: message
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
