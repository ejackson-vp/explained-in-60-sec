import { NextRequest, NextResponse } from 'next/server';
import { podcasts } from '@/app/lib/podcasts-store';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const podcast = podcasts.get(id);

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    // Return the podcast with the proxy URL for audio
    const response = {
      ...podcast,
      audioUrl: podcast.status === 'completed' && podcast.audioUrl 
        ? `/api/audio/${id}` 
        : podcast.audioUrl
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

