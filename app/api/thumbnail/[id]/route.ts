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

    if (!podcast || !podcast.thumbnailUrl) {
      return NextResponse.json(
        { error: 'Podcast thumbnail not found' },
        { status: 404 }
      );
    }

    // If it's a local thumbnail (default.svg or pre-generated), serve it directly
    if (podcast.thumbnailUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(podcast.thumbnailUrl, request.url));
    }

    // Get bearer token from environment for remote thumbnails
    const bearerToken = process.env.THUMBNAIL_BEARER_TOKEN;
    if (!bearerToken) {
      console.error('THUMBNAIL_BEARER_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch the thumbnail from Voltage Park with authentication
    // Add user_id query parameter if not already present
    const thumbnailUrl = new URL(podcast.thumbnailUrl);
    if (!thumbnailUrl.searchParams.has('user_id')) {
      thumbnailUrl.searchParams.set('user_id', 'anonymous-podcast');
    }
    
    const thumbnailResponse = await fetch(thumbnailUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });

    if (!thumbnailResponse.ok) {
      console.error(`Failed to fetch thumbnail from VP: ${thumbnailResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch thumbnail' },
        { status: thumbnailResponse.status }
      );
    }

    // Get the image data
    const imageData = await thumbnailResponse.arrayBuffer();

    // Return the image with appropriate headers
    const headers: Record<string, string> = {
      'Content-Type': thumbnailResponse.headers.get('Content-Type') || 'image/png',
      'Content-Length': imageData.byteLength.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    return new NextResponse(imageData, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error proxying thumbnail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

