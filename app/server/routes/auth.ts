import { Router } from 'express';
import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../../shared/types';
import config from '../config';
import { usersContainer } from '../lib/cosmos';

const router = Router();

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

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/landing?auth_error=true'
}), (_req, res) => {
  res.redirect('/');
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/landing?auth_error=true'
}), (_req, res) => {
  res.redirect('/');
});

router.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json(null);
  }
});

router.post('/auth/logout', (req, res, next) => {
  req.logout((err: Error) => {
    if (err) { return next(err); }
    req.session.destroy((destroyErr: Error) => {
      if (destroyErr) { return next(destroyErr); }
      res.clearCookie('connect.sid'); // Default session cookie name
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});

export default router;
