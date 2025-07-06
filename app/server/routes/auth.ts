import { Router, Request, Response, NextFunction } from 'express';
import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../../shared/types';
import config from '../config';
import { usersContainer } from '../lib/cosmos';

const router = Router();

// Extend Express's session to include our custom property.
// This avoids using `any` and provides type safety.
declare module 'express-session' {
  interface SessionData {
    returnTo?: string;
  }
}

type AuthProvider = 'google' | 'facebook';

/**
 * Finds an existing user or creates a new one based on the OAuth profile.
 * This function is used by all Passport strategies to keep the logic consistent.
 */
const findOrCreateUser = async (provider: AuthProvider, profile: Profile, done: (error: any, user?: any) => void) => {
  const email = profile.emails?.[0]?.value;
  const photoUrl = profile.photos?.[0]?.value;

  if (!email) {
    return done(new Error(`No email found in ${provider} profile`), undefined);
  }

  // The documentId is the unique identifier for the user and also the partition key.
  const documentId = `${provider}:${profile.id}`;

  try {
    // A point read is the most efficient way to get an item in Cosmos DB.
    // The `read` method does not throw on 404, but returns a resource that is `undefined`.
    const { resource: existingUser } = await usersContainer.item(documentId, documentId).read<User>();

    if (existingUser) {
      // User was found, return it.
      return done(null, existingUser);
    }

    // User was not found, create a new one.
    const newUser: User = {
      id: documentId,
      provider: provider,
      providerId: profile.id,
      name: profile.displayName,
      email: email,
      photoUrl: photoUrl,
      status: 'trial' // Default status
    };
    const { resource: createdUser } = await usersContainer.items.create(newUser);
    return done(null, createdUser);
  } catch (error: any) {
    // This will now only catch actual database/network errors, not 404s.
    return done(error, undefined);
  }
};

// Configure passport strategies
passport.use(new GoogleStrategy({
  clientID: config.google.clientId,
  clientSecret: config.google.clientSecret,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => findOrCreateUser('google', profile, done)));
passport.use(new FacebookStrategy({
  clientID: config.facebook.clientId,
  clientSecret: config.facebook.clientSecret,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails', 'photos']
}, (accessToken, refreshToken, profile, done) => findOrCreateUser('facebook', profile, done)));

// Store only the user's unique ID in the session for efficiency and security.
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Retrieve the full user object from the database using the ID from the session.
passport.deserializeUser(async (id: string, done) => {
  try {
    const { resource: user } = await usersContainer.item(id, id).read<User>();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Creates a middleware to initiate an OAuth flow.
 * It saves the `returnTo` URL in the session before redirecting to the provider.
 */
const handleAuthRequest = (provider: AuthProvider, options: passport.AuthenticateOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const returnTo = req.query.returnTo as string | undefined;
    if (req.session) {
      req.session.returnTo = returnTo || '/';
    }
    passport.authenticate(provider, options)(req, res, next);
  };
};

/**
 * Creates a middleware to handle the OAuth callback.
 * This uses a custom callback with `req.logIn` to securely handle the session
 * and prevent session fixation attacks, while still allowing a dynamic redirect.
 */
const handleAuthCallback = (provider: AuthProvider) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Capture the returnTo URL from the session before Passport regenerates it.
    const returnTo = req.session?.returnTo || '/';

    passport.authenticate(provider, (err: any, user: any) => {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/landing?auth_error=true'); }

      // Manually log in the user. This is where the session is regenerated.
      req.logIn(user, (loginErr) => {
        if (loginErr) { return next(loginErr); }
        // The old session is gone, but we have the `returnTo` URL in our closure.
        return res.redirect(returnTo);
      });
    })(req, res, next);
  };
};

router.get('/auth/google', handleAuthRequest('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', handleAuthCallback('google'));
router.get('/auth/facebook', handleAuthRequest('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', handleAuthCallback('facebook'));

router.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json(null);
  }
});

router.post('/auth/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err: any) => {
    if (err) { return next(err); }
    // Passport's logout function clears the login session.
    // Explicitly destroying the session is a robust way to ensure a full cleanup.
    req.session.destroy((destroyErr: any) => {
      if (destroyErr) { return next(destroyErr); }
      // The session cookie is typically cleared by the session middleware upon destruction,
      // but this call provides an extra layer of certainty.
      res.clearCookie('connect.sid'); // Default session cookie name
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});

export default router;
