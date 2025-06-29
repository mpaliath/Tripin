import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Profile, Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../../../shared/types';
import { usersContainer } from '../lib/cosmos';

const router = Router();

// Configure passport Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/auth/google/callback'
}, async (_accessToken, _refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value;
  const photoUrl = profile.photos?.[0]?.value;
  if (!email) {
    return done(new Error("No email found in Google profile"), undefined);
  }

  const documentId = `google:${profile.id}`;

  try {
    // Check if user exists
    const { resource: existingUser } = await usersContainer.item(documentId, documentId).read<User>();
    return done(null, existingUser);
  } catch (error: any) {
    if (error.code === 404) {
      // User not found, create a new one
      const newUser: User = {
        id: documentId,
        provider: 'google',
        providerId: profile.id,
        name: profile.displayName,
        email: email,
        photoUrl: photoUrl,
        status: 'trial' // Default status
      };
      try {
        const { resource: createdUser } = await usersContainer.items.create(newUser);
        return done(null, createdUser);
      } catch (creationError) {
        return done(creationError, undefined);
      }
    }
    // Other database error
    return done(error, undefined);
  }
}));

// Configure passport Facebook strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails', 'photos']
}, async (_accessToken, _refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value;
  const photoUrl = profile.photos?.[0]?.value;
  if (!email) {
    return done(new Error("No email found in Facebook profile"), undefined);
  }

  const documentId = `facebook:${profile.id}`;

  try {
    // Check if user exists
    const { resource: existingUser } = await usersContainer.item(documentId, documentId).read<User>();
    return done(null, existingUser);
  } catch (error: any) {
    if (error.code === 404) {
      // User not found, create a new one
      const newUser: User = {
        id: documentId,
        provider: 'facebook',
        providerId: profile.id,
        name: profile.displayName,
        email: email,
        photoUrl: photoUrl,
        status: 'trial' // Default status
      };
      try {
        const { resource: createdUser } = await usersContainer.items.create(newUser);
        return done(null, createdUser);
      } catch (creationError) {
        return done(creationError, undefined);
      }
    }
    // Other database error
    return done(error, undefined);
  }
}));

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
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json(null);
  }
});

router.post('/auth/logout', (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    req.session.destroy((destroyErr) => {
      if (destroyErr) { return next(destroyErr); }
      res.clearCookie('connect.sid'); // Default session cookie name
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});

export default router;
