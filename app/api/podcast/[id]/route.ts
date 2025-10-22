import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: jobId } = params;

    // Get job type from query parameter (audio or thumbnail)
    const url = new URL(request.url);
    const jobType = url.searchParams.get('type') || 'audio';

    // Determine which API to call based on job type
    const apiUrl = jobType === 'thumbnail' 
      ? process.env.THUMBNAIL_API_URL 
      : process.env.VPSTUDIO_API_URL;
    const bearerToken = jobType === 'thumbnail'
      ? process.env.THUMBNAIL_BEARER_TOKEN
      : process.env.VPSTUDIO_BEARER_TOKEN;

    if (!apiUrl || !bearerToken) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    // Proxy the status request to Voltage Park
    const statusUrl = `${apiUrl}/${jobId}?user_id=anonymous-podcast`;
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch job status' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Convert relative URLs to absolute URLs in artifacts and output
    const apiBaseUrl = new URL(apiUrl).origin;
    
    const normalizeUrl = (url: string | undefined) => {
      if (!url) return url;
      if (url.startsWith('/')) {
        return `${apiBaseUrl}${url}`;
      }
      return url;
    };

    // Normalize artifacts
    const normalizedArtifacts = data.artifacts?.map((artifact: any) => ({
      ...artifact,
      url: normalizeUrl(artifact.url),
      uri: normalizeUrl(artifact.uri)
    }));

    // Normalize output
    const normalizedOutput = data.output?.map((item: any) => ({
      ...item,
      url: normalizeUrl(item.url),
      uri: normalizeUrl(item.uri)
    }));

    // Normalize the response for the frontend
    const normalizedResponse = {
      status: data.status,
      jobId: jobId,
      error: data.error?.message || data.error,
      artifacts: normalizedArtifacts,
      output: normalizedOutput
    };

    return NextResponse.json(normalizedResponse);

  } catch (error) {
    console.error('Error proxying job status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

