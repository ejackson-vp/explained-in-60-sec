import { NextRequest, NextResponse } from 'next/server';
import { podcasts } from '@/app/lib/podcasts-store';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    // Get the podcast from the store
    const podcast = podcasts.get(id);

    if (!podcast || !podcast.audioUrl) {
      return NextResponse.json(
        { error: 'Podcast audio not found' },
        { status: 404 }
      );
    }

    // Get bearer token from environment
    const bearerToken = process.env.VPSTUDIO_BEARER_TOKEN;
    if (!bearerToken) {
      console.error('VPSTUDIO_BEARER_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch the audio from Voltage Park with authentication
    // Add user_id query parameter if not already present
    const audioUrl = new URL(podcast.audioUrl);
    if (!audioUrl.searchParams.has('user_id')) {
      audioUrl.searchParams.set('user_id', 'anonymous-podcast');
    }
    
    const audioResponse = await fetch(audioUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });

    if (!audioResponse.ok) {
      console.error(`Failed to fetch audio from VP: ${audioResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch audio' },
        { status: audioResponse.status }
      );
    }

    // Get the audio data
    const audioData = await audioResponse.arrayBuffer();

    // Check if this is a download request
    const url = new URL(request.url);
    const isDownload = url.searchParams.get('download') === 'true';

    // Create filename from topic
    const filename = `${podcast.topic.replace(/\s+/g, '-').toLowerCase()}-podcast.wav`;

    // Return the audio with appropriate headers
    const headers: Record<string, string> = {
      'Content-Type': audioResponse.headers.get('Content-Type') || 'audio/wav',
      'Content-Length': audioData.byteLength.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(audioData, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error proxying audio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

