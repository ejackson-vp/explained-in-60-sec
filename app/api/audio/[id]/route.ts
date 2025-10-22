import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Next.js automatically decodes path parameters once, so no need to decode again
    const { id: audioUrl } = params;

    // Validate it's a proper URL
    try {
      new URL(audioUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid audio URL' },
        { status: 400 }
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

    // Add user_id query parameter if not already present
    const fullAudioUrl = new URL(audioUrl);
    if (!fullAudioUrl.searchParams.has('user_id')) {
      fullAudioUrl.searchParams.set('user_id', 'anonymous-podcast');
    }
    
    // Fetch the audio from Voltage Park with authentication
    const audioResponse = await fetch(fullAudioUrl.toString(), {
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
    const requestUrl = new URL(request.url);
    const isDownload = requestUrl.searchParams.get('download') === 'true';
    const topic = requestUrl.searchParams.get('topic') || 'podcast';

    // Create filename from topic
    const filename = `${topic.replace(/\s+/g, '-').toLowerCase()}-podcast.wav`;

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

