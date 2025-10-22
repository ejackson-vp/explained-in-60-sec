import { NextRequest, NextResponse } from 'next/server';
import { podcastLimiter } from '@/app/lib/concurrency-limiter';

function createContentText(topic: string): string {
  return `Explain the following topic in a concise, engaging way suitable for a 60-second audio podcast: ${topic}`;
}

function createThumbnailPrompt(topic: string): string {
  return `A Ghibli style image representing the following topic (do not include text in the image): ${topic}.`;
}

async function createVPJob(topic: string) {
  const apiUrl = process.env.VPSTUDIO_API_URL;
  const bearerToken = process.env.VPSTUDIO_BEARER_TOKEN;

  if (!apiUrl || !bearerToken) {
    throw new Error('VPSTUDIO_API_URL and VPSTUDIO_BEARER_TOKEN must be set');
  }

  const contentText = createContentText(topic);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    },
    body: JSON.stringify({
      data: {
        text: {
          content: contentText,
        }
      },
      factory_settings: {
        content_type: 'general',
        style: 'educational',
        length: 'short',
        speaker1_voice_style: 'conversational and inquisitive',
        speaker2_voice_style: 'confident and articulate',
        enable_background_music: false,
        preprocess_only: false
      },
      metadata: {
        user_id: 'anonymous-podcast',
        topic: topic
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Voltage Park API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function createThumbnailJob(topic: string) {
  const apiUrl = process.env.THUMBNAIL_API_URL;
  const bearerToken = process.env.THUMBNAIL_BEARER_TOKEN;

  if (!apiUrl || !bearerToken) {
    return null;
  }

  const thumbnailPrompt = createThumbnailPrompt(topic);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
    },
    body: JSON.stringify({
      data: {
        text: {
          content: thumbnailPrompt,
          language: 'en'
        }
      },
      factory_settings: {
        num_inference_steps: 50,
        enhance_prompt: true,
        preprocess_only: false,
        width: 1664,
        height: 928,
      },
      metadata: {
        user_id: 'anonymous-podcast',
        topic: topic
      }
    })
  });

  if (!response.ok) {
    console.error('Thumbnail creation failed:', response.status);
    return null;
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    // Validate input
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    if (topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic cannot be empty' },
        { status: 400 }
      );
    }

    if (topic.length > 128) {
      return NextResponse.json(
        { error: 'Topic must be 128 characters or less' },
        { status: 400 }
      );
    }

    // Check concurrency limit
    const stats = podcastLimiter.getStats();
    if (stats.activeCount >= stats.maxConcurrent) {
      return NextResponse.json(
        { 
          error: 'Server is at capacity. Please try again in a moment.',
          queueInfo: {
            activeGenerations: stats.activeCount,
            maxConcurrent: stats.maxConcurrent
          }
        },
        { status: 503 }
      );
    }

    // Create VP job with concurrency limiting
    const result = await podcastLimiter.run(async () => {
      const [audioJob, thumbnailJob] = await Promise.all([
        createVPJob(topic.trim()),
        createThumbnailJob(topic.trim()).catch(() => null)
      ]);

      return {
        audioJobId: audioJob.id,
        thumbnailJobId: thumbnailJob?.id || null
      };
    });

    return NextResponse.json({
      audioJobId: result.audioJobId,
      thumbnailJobId: result.thumbnailJobId,
      topic: topic.trim(),
      status: 'processing'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating podcast:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

