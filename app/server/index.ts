// This MUST be the first import to ensure environment variables are loaded and validated.
import config from './config';
import express, { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';

// Import your route handlers
import adventureRouter from './routes/adventure';
import recommendationRouter from './routes/recommendation';
import authRouter from './routes/auth';

// Trust proxy for Azure App Service
const app = express();
app.set('trust proxy', 1);

app.use(express.json());
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the built client
// The client files are copied to dist/client during build
const clientPath = path.join(__dirname, "../client");
app.use(express.static(clientPath));

// Register API routes
app.use(adventureRouter);
app.use(recommendationRouter);
app.use(authRouter);

// SPA fallback - serve index.html for any non-API routes
app.get('*', (req: Request, res: Response) => {
  // Ensure API calls (like /api/* or /auth/*) don't get redirected to the index.html
  const isApiRoute = req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/auth/');
  if (isApiRoute) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`));
