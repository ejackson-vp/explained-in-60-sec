// In-memory storage for podcast jobs (use database in production)
interface Podcast {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  topic: string;
  title?: string;
  summary?: string;
  audioUrl?: string;
  duration?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  vpJobId?: string; // Voltage Park job ID for polling
}

// Use globalThis to persist the Map across hot reloads in development
declare global {
  var podcastsStore: Map<string, Podcast> | undefined;
}

export const podcasts = globalThis.podcastsStore ?? new Map<string, Podcast>();

if (process.env.NODE_ENV === 'development') {
  globalThis.podcastsStore = podcasts;
}

