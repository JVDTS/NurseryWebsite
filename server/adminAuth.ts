import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Admin authentication middleware that works with session-based login
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is logged in via admin session
    if (req.session && req.session.user) {
      // User is authenticated via admin login
      return next();
    }

    // No valid session found
    return res.status(401).json({ 
      message: "Admin authentication required",
      loginUrl: "/admin/login"
    });
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Check if user has required role
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRole = req.session.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
          userRole: userRole
        });
      }

      return next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};

// Super admin only middleware
export const requireSuperAdmin = requireRole(['super_admin']);

// Admin or super admin middleware  
export const requireAdmin = requireRole(['super_admin', 'admin']);

// Any admin role middleware
export const requireAnyAdmin = requireRole(['super_admin', 'admin', 'editor']);