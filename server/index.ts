import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./mongodb";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration with MongoDB storage
const MONGODB_URI = "mongodb+srv://sathishreddyk0337:MmNdrMQ7lWp0I5m1@cluster0.fs4vkd7.mongodb.net/clothbusiness";
// Create MongoStore with connection to same database
const store = MongoStore.create({
  mongoUrl: MONGODB_URI,
  collectionName: 'sessions',
  ttl: 60 * 60 * 24 * 7 // 7 days in seconds
});

store.on('error', function(error) {
  console.error('Session store error:', error);
});

store.on('connected', function() {
  console.log('Session store connected to MongoDB');
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true, // Prevents XSS attacks
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB
  await connectDB();
  
  // Initialize MongoDB storage with seeding after connection
  const { MongoStorage } = await import("./mongodb");
  new MongoStorage();
  
  // Import routes after dotenv is configured
  const { registerRoutes } = await import("./routes");
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
