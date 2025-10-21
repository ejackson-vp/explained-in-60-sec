import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { podcasts } from '@/app/lib/podcasts-store';
import { podcastLimiter } from '@/app/lib/concurrency-limiter';

// Helper function to create content text from topic
function createContentText(topic: string): string {
  return `Explain the following topic in a concise, engaging way suitable for a 60-second audio podcast: ${topic}`;
}

// Helper function to create thumbnail prompt from topic
function createThumbnailPrompt(topic: string): string {
  return `A Ghibli style thumbnail image for a podcast on the following topic: ${topic}.`;
}

// Async function to poll job status (works for both audio and thumbnail jobs)
async function pollJobStatus(jobId: string, bearerToken: string, apiBaseUrl: string, jobType: string = 'job'): Promise<any> {
  const maxAttempts = 48; // 4 minutes with 5 second intervals
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Construct the status check URL - assuming the job ID endpoint
      const statusUrl = `${apiBaseUrl}/${jobId}?user_id=anonymous-podcast`;
      
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      });

      if (!response.ok) {
        console.error(`${jobType} status check failed: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      const result = await response.json();

      if (result.status === 'completed') {
        return result;
      } else if (result.status === 'failed' || result.error) {
        throw new Error(result.error?.message || `${jobType} job failed`);
      }

      // Still processing, wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error(`Error polling ${jobType} job ${jobId}:`, error);
      throw error;
    }
  }

  throw new Error(`${jobType} job polling timeout`);
}

// Async function to process podcast with Voltage Park API
async function processPodcast(id: string, topic: string) {
  const apiUrl = process.env.VPSTUDIO_API_URL;
  const bearerToken = process.env.VPSTUDIO_BEARER_TOKEN;

  if (!apiUrl || !bearerToken) {
    throw new Error('VPSTUDIO_API_URL and VPSTUDIO_BEARER_TOKEN must be set in environment variables');
  }

  try {
    const contentText = createContentText(topic);

    // Step 1: Create the VP job
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

    const result = await response.json();
    const vpJobId = result.id;

    // Store the VP job ID
    const existingPodcast = podcasts.get(id);
    podcasts.set(id, {
      ...existingPodcast,
      id,
      status: 'processing',
      topic,
      vpJobId,
      createdAt: existingPodcast?.createdAt || new Date().toISOString()
    });

    // Step 2: Poll for completion
    const completedJob = await pollJobStatus(vpJobId, bearerToken, apiUrl, 'audio');

    // Step 3: Extract audio URL from artifacts or output
    let audioUrl = null;
    
    // Check artifacts array
    if (completedJob.artifacts && completedJob.artifacts.length > 0) {
      const audioArtifact = completedJob.artifacts.find((a: any) => a.type === 'audio' || a.mime_type?.includes('audio'));
      audioUrl = audioArtifact?.url || audioArtifact?.uri;
    }
    
    // Check output array as fallback
    if (!audioUrl && completedJob.output && completedJob.output.length > 0) {
      audioUrl = completedJob.output[0]?.url || completedJob.output[0]?.uri;
    }

    if (!audioUrl) {
      console.error('No audio URL found in completed job:', completedJob);
      throw new Error('No audio URL in completed job');
    }

    // Convert relative URL to absolute URL if needed (for storage)
    let vpAudioUrl = audioUrl;
    if (audioUrl.startsWith('/')) {
      // Extract the base URL from apiUrl (e.g., https://api.voltagepark.com)
      const apiBaseUrl = new URL(apiUrl).origin;
      vpAudioUrl = `${apiBaseUrl}${audioUrl}`;
    }

    // Step 3.5: Generate thumbnail image
    let thumbnailUrl = '/thumbnails/default.svg'; // Default fallback
    
    const thumbnailApiUrl = process.env.THUMBNAIL_API_URL;
    const thumbnailBearerToken = process.env.THUMBNAIL_BEARER_TOKEN;
    
    console.log(`[Podcast ${id}] Starting thumbnail generation for topic: ${topic}`);
    console.log(`[Podcast ${id}] Thumbnail API configured:`, !!thumbnailApiUrl && !!thumbnailBearerToken);
    
    if (thumbnailApiUrl && thumbnailBearerToken) {
      try {
        const thumbnailPrompt = createThumbnailPrompt(topic);
        console.log(`[Podcast ${id}] Thumbnail prompt:`, thumbnailPrompt);
        
        // Create the thumbnail generation job
        const thumbnailResponse = await fetch(thumbnailApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${thumbnailBearerToken}`
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
              preprocess_only: false
            },
            metadata: {
              user_id: 'anonymous-podcast',
              topic: topic
            }
          })
        });

        if (thumbnailResponse.ok) {
          const thumbnailResult = await thumbnailResponse.json();
          const thumbnailJobId = thumbnailResult.id;
          console.log(`[Podcast ${id}] Thumbnail job created with ID:`, thumbnailJobId);

          // Poll for thumbnail completion
          const completedThumbnail = await pollJobStatus(thumbnailJobId, thumbnailBearerToken, thumbnailApiUrl, 'thumbnail');
          console.log(`[Podcast ${id}] Thumbnail job completed:`, completedThumbnail);

          // Extract image URL from artifacts or output
          let imageUrl = null;
          
          // Check artifacts array
          if (completedThumbnail.artifacts && completedThumbnail.artifacts.length > 0) {
            const imageArtifact = completedThumbnail.artifacts.find((a: any) => 
              a.type === 'image' || a.mime_type?.includes('image')
            );
            imageUrl = imageArtifact?.url || imageArtifact?.uri;
          }
          
          // Check output array as fallback
          if (!imageUrl && completedThumbnail.output && completedThumbnail.output.length > 0) {
            imageUrl = completedThumbnail.output[0]?.url || completedThumbnail.output[0]?.uri;
          }

          if (imageUrl) {
            // Convert relative URL to absolute URL if needed
            if (imageUrl.startsWith('/')) {
              const apiBaseUrl = new URL(thumbnailApiUrl).origin;
              thumbnailUrl = `${apiBaseUrl}${imageUrl}`;
            } else {
              thumbnailUrl = imageUrl;
            }
            console.log(`[Podcast ${id}] Thumbnail URL extracted:`, thumbnailUrl);
          } else {
            console.warn(`[Podcast ${id}] No image URL found in completed thumbnail job`);
          }
        } else {
          console.error(`[Podcast ${id}] Thumbnail API request failed:`, thumbnailResponse.status, await thumbnailResponse.text());
        }
      } catch (thumbnailError) {
        console.error(`[Podcast ${id}] Failed to generate thumbnail, using default:`, thumbnailError);
        // Continue with default thumbnail
      }
    } else {
      console.log(`[Podcast ${id}] Thumbnail generation not configured, using default thumbnail`);
    }
    
    console.log(`[Podcast ${id}] Final thumbnail URL:`, thumbnailUrl);

    // Step 4: Update podcast with audio URL and thumbnail
    // Store the VP URL but use our proxy endpoint for the public audioUrl
    podcasts.set(id, {
      id,
      status: 'completed',
      topic,
      title: `60 seconds on: ${topic}`,
      summary: `An AI-generated podcast on "${topic}".`,
      audioUrl: vpAudioUrl, // Store the actual VP URL (used by proxy)
      thumbnailUrl: thumbnailUrl, // Generated or default thumbnail
      duration: 60,
      vpJobId,
      createdAt: existingPodcast?.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Failed to process podcast ${id}:`, error);
    throw error;
  }
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

    const id = randomUUID();

    // Get concurrency stats
    const stats = podcastLimiter.getStats();
    const willBeQueued = stats.activeCount >= stats.maxConcurrent;

    podcasts.set(id, {
      id,
      status: willBeQueued ? 'queued' : 'processing',
      topic: topic.trim(),
      createdAt: new Date().toISOString()
    });

    // Start async processing with concurrency limiting
    podcastLimiter.run(async () => {
      // Update status to processing when it actually starts
      const existing = podcasts.get(id);
      if (existing && existing.status === 'queued') {
        podcasts.set(id, {
          ...existing,
          status: 'processing'
        });
      }
      
      await processPodcast(id, topic.trim());
    }).catch(err => {
      console.error(`Error processing podcast ${id}:`, err);
      const existing = podcasts.get(id);
      if (existing) {
        podcasts.set(id, {
          ...existing,
          status: 'failed',
          error: err.message || 'Failed to generate podcast'
        });
      }
    });

    return NextResponse.json({
      id,
      status: willBeQueued ? 'queued' : 'processing',
      topic: topic.trim(),
      queueInfo: {
        position: willBeQueued ? stats.queuedCount + 1 : 0,
        activeGenerations: stats.activeCount,
        maxConcurrent: stats.maxConcurrent
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating podcast:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

