import { NextResponse } from 'next/server';
import { podcasts } from '@/app/lib/podcasts-store';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    podcasts: podcasts.size
  });
}

