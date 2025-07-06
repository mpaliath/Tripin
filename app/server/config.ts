import dotenv from 'dotenv';
import path from 'path';

// This is the first and only place dotenv should be configured.
// We provide an explicit path to the .env file to make loading independent
// of the Current Working Directory (CWD).
//
// After compilation, this file will be in `dist/server/`, so we navigate
// up two directories to find the `.env` file in the `app/server/` root.
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  // This is expected in production environments like Azure where variables are set by the platform.
  console.log("No .env file found. Using platform-provided environment variables.");
} else {
  console.log("Loaded environment variables from .env file.");
}


const config = {
  port: process.env.PORT || '3000',
  sessionSecret: process.env.SESSION_SECRET,
  cosmos: {
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
    databaseId: process.env.COSMOS_DATABASE_ID || process.env.COSMOS_DB_NAME,
    usersContainerId: 'users',
    cacheContainerId: process.env.COSMOS_CONTAINER_NAME || 'cache',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  }
};

// A helper to find missing keys for a better error message.
const getMissingKeys = (cfg: object, prefix = ''): string[] => {
  return Object.entries(cfg).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value === undefined || value === null || value === '') {
      // Exclude keys that have defaults or are optional
      if (fullKey === 'port' || fullKey === 'cosmos.cacheContainerId') return [];
      return [fullKey];
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return getMissingKeys(value, fullKey);
    }
    return [];
  });
};

const missingKeys = getMissingKeys(config);

if (missingKeys.length > 0) {
  throw new Error(`FATAL: Missing required environment variables: ${missingKeys.join(', ')}`);
}

// We can now safely use non-null assertion `!` because we've validated them.
export default {
  port: config.port,
  sessionSecret: config.sessionSecret!,
  cosmos: { ...config.cosmos, endpoint: config.cosmos.endpoint!, key: config.cosmos.key!, databaseId: config.cosmos.databaseId! },
  google: { clientId: config.google.clientId!, clientSecret: config.google.clientSecret! },
  facebook: { clientId: config.facebook.clientId!, clientSecret: config.facebook.clientSecret! }
};