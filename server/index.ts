import 'dotenv/config'; // This loads the .env file at the start
import express, { type Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import adminRoutes from './adminRoutes';
import adminAuthRoutes from './adminAuthRoutes';
import adminProfileRoutes from './adminProfileRoutes';
import usersRoutes from './usersRoutes';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import { requireAuth, AuthRequest } from './auth';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://dubai-rose.vercel.app', 'https://dubai-rose-spa.vercel.app']
        : 'http://localhost:3000',
    credentials: true,
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(app);
  const server = createServer(app);

  // Authentication routes
  app.use('/api/auth', adminAuthRoutes);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Protected admin routes
  app.use(
    '/api/admin',
    requireAuth,
    (req: Request, res: Response, next: NextFunction) => {
      // Additional admin role check if needed
      next();
    },
    adminRoutes
  );

  // Admin profile routes
  app.use('/api/admin', requireAuth, adminProfileRoutes);
  
  // User management routes
  app.use('/api/admin', requireAuth, usersRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 3000;
  server.listen(
    {
      port,
      host: '0.0.0.0',
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
