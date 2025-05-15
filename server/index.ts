import 'dotenv/config'; // This loads the .env file at the start
import express, { type Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import adminRoutes from './adminRoutes';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

  // Protect admin routes: require auth and restrict to single admin user
  app.use(
    '/api/admin',
    ClerkExpressRequireAuth(),
    (req: Request, res: Response, next: NextFunction) => {
      // ClerkExpressRequireAuth populates req.auth.userId
      const currentUser = (req as any).auth?.userId;
      const allowed = process.env.CLERK_ADMIN_USER_ID;
      if (!currentUser || currentUser !== allowed) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    },
    adminRoutes
  );

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
