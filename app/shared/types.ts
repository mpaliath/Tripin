// Shared types for both client and server

export type Location = {
  name: string;
  latitude: number;
  longitude: number;
};

// Add id to Adventure for client-side usage
export interface Adventure {
  id: string;
  title: string;
  heroImage: string;
  driveTimeMin: number;
  outline: { name: string; start: Location; end: Location; startHint: string; durationMin: number }[];
  tags: string[];
  costUSD: string;
  sources: { title: string; url: string }[];
}

export interface User {
  id: string; // Will be `provider:providerId`, e.g., "google:12345"
  provider: 'google' | 'facebook';
  providerId: string;
  email: string;
  name: string;
  photoUrl?: string; // Optional field for profile picture
  status: 'trial' | 'paid'; // Default to 'trial'
}
