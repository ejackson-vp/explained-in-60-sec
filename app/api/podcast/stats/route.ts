import { NextResponse } from 'next/server';
import { podcastLimiter } from '@/app/lib/concurrency-limiter';

/**
 * GET /api/podcast/stats
 * Returns current concurrency limiter statistics
 */
export async function GET() {
  try {
    const stats = podcastLimiter.getStats();
    
    return NextResponse.json({
      concurrency: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching podcast stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

