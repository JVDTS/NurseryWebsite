import type { Request, Response, NextFunction } from "express";

// Simple, reliable admin authentication
export const simpleAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check session
    if (req.session && req.session.user && req.session.user.id) {
      return next();
    }
    
    return res.status(401).json({ 
      message: "Authentication required",
      loginUrl: "/admin/login"
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Simple role check
export const requireSuperAdminSimple = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.user && req.session.user.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ message: "Super admin access required" });
};