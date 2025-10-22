import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Next.js automatically decodes path parameters once, so no need to decode again
    const { id: thumbnailUrl } = params;

    // If it's a local thumbnail (default.svg or pre-generated), serve it directly
    if (thumbnailUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(thumbnailUrl, request.url));
    }

    // Validate it's a proper URL
    try {
      new URL(thumbnailUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid thumbnail URL' },
        { status: 400 }
      );
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

    // Add user_id query parameter if not already present
    const fullThumbnailUrl = new URL(thumbnailUrl);
    if (!fullThumbnailUrl.searchParams.has('user_id')) {
      fullThumbnailUrl.searchParams.set('user_id', 'anonymous-podcast');
    }
    
    // Fetch the thumbnail from Voltage Park with authentication
    const thumbnailResponse = await fetch(fullThumbnailUrl.toString(), {
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

