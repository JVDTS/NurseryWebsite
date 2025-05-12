import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("Environment variable SESSION_SECRET not provided");
}

// Cache the OpenID configuration for 1 hour to avoid repeated requests
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

// Set up the session middleware
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Create PostgreSQL session store
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Try to create the table if missing
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Store the session store in the storage instance
  storage.sessionStore = sessionStore;
  
  // Return session middleware
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

// Update user session with information from tokens
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// Create or update user in the database from claims
async function upsertUser(claims: any) {
  const userId = claims["sub"];
  const email = claims["email"] || null;
  const firstName = claims["first_name"] || '';
  const lastName = claims["last_name"] || '';
  const profileImageUrl = claims["profile_image_url"] || null;
  
  // Check if user exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  
  if (existingUser) {
    // Update user profile information
    await db
      .update(users)
      .set({
        profileImageUrl,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
      
    return existingUser.id;
  } else {
    // Only create a user account if we have an email
    if (email) {
      // Create new user with default role 'editor'
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          firstName,
          lastName,
          role: 'editor', // Default role
          profileImageUrl,
          password: '', // We'll use a placeholder since we don't need password with SSO
        })
        .returning();
        
      return newUser.id;
    }
  }
  
  return null;
}

// Set up Passport with OIDC
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user: any = {};
    updateUserSession(user, tokens);
    const claims = tokens.claims();
    
    // Upsert user in database
    if (claims.email) {
      const userId = await upsertUser(claims);
      user.dbUserId = userId;
    }
    
    verified(null, user);
  };

  // Set up strategy for each domain
  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Auth routes
  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/admin/dashboard",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};

// Check if user has required role
export const hasRole = (roles: string[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;
    
    if (!req.isAuthenticated() || !user.dbUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Get user from database
      const dbUser = await storage.getUser(user.dbUserId);
      
      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Check if user has required role
      if (roles.includes(dbUser.role)) {
        return next();
      }
      
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    } catch (error) {
      console.error("Error checking user role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};