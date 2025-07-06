import { User as AppUser } from '../../../shared/types';
import { Session, SessionData } from 'express-session';

// This declaration file is used to augment the Express Request object
// with properties added by middleware like passport.js.
// This provides type safety for `req.user`, `req.logout`, etc.
// It ensures that TypeScript knows about these properties globally
// in your server-side code.

declare global {
  namespace Express {
    // Augments the Request interface to include the session property
    // from express-session.
    interface Request {
      session: Session & Partial<SessionData>;
    }
    // Augments the `User` interface from passport.
    // This allows `req.user` to be correctly typed with our shared User type.
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends AppUser {}
  }
}

// This empty export converts the file into a module, which is required for augmentation.
export {};