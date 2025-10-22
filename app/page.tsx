'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  alpha,
  useTheme,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Link,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import DownloadIcon from '@mui/icons-material/Download';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AudioCard from './components/AudioCard';

interface PodcastData {
  audioJobId: string;
  thumbnailJobId: string | null;
  status: 'processing' | 'completed' | 'failed';
  topic: string;
  title?: string;
  summary?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

const exampleEpisodes = [
  {
    id: 1,
    topic: 'Quantum Computing',
    title: 'Quantum Computing',
    teaser: 'Discover how quantum computers harness the strange properties of quantum mechanics to solve complex problems.',
    audioUrl: '/audio/quantum-computing.wav',
    thumbnailUrl: '/thumbnails/quantum-computing.png',
  },
  {
    id: 2,
    topic: 'Black Holes',
    title: 'Black Holes',
    teaser: 'Journey into the most mysterious objects in the universe where gravity becomes so strong that nothing can escape.',
    audioUrl: '/audio/black-holes.wav',
    thumbnailUrl: '/thumbnails/black-holes.png',
  },
  {
    id: 3,
    topic: 'CRISPR',
    title: 'CRISPR',
    teaser: 'Learn about the revolutionary gene-editing technology that could transform medicine and agriculture.',
    audioUrl: '/audio/crispr.wav',
    thumbnailUrl: '/thumbnails/crispr.png',
  },
  {
    id: 4,
    topic: 'Neural Networks',
    title: 'Neural Networks',
    teaser: 'Understand the brain-inspired algorithms that power modern artificial intelligence and machine learning.',
    audioUrl: '/audio/neural-networks.wav',
    thumbnailUrl: '/thumbnails/neural-networks.png',
  },
  {
    id: 5,
    topic: 'Blockchain',
    title: 'Blockchain',
    teaser: 'Explore the distributed ledger technology that enables cryptocurrencies and decentralized applications.',
    audioUrl: '/audio/blockchain.wav',
    thumbnailUrl: '/thumbnails/blockchain.png',
  },
  {
    id: 6,
    topic: 'Climate Change',
    title: 'Climate Change',
    teaser: 'Get a concise overview of the science behind global warming and its impact on our planet.',
    audioUrl: '/audio/climate-change.wav',
    thumbnailUrl: '/thumbnails/climate-change.png',
  },
];

export default function Home() {
  const theme = useTheme();
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPodcast, setCreatedPodcast] = useState<PodcastData | null>(null);
  const [pollingData, setPollingData] = useState<{
    audioJobId: string;
    thumbnailJobId: string | null;
    topic: string;
    startTime: number;
  } | null>(null);

  const handleScrollToExamples = () => {
    const element = document.getElementById('examples-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToCreate = () => {
    const element = document.getElementById('create-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardPlay = (_id: number) => {
    // Could be used to pause other players
  };

  const handleCreatePodcast = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!topic.trim()) return;

    setIsCreating(true);
    setError(null);
    setCreatedPodcast(null);

    try {
      const response = await fetch('/api/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create podcast');
      }

      const data = await response.json();
      setPollingData({
        audioJobId: data.audioJobId,
        thumbnailJobId: data.thumbnailJobId,
        topic: topic.trim(),
        startTime: Date.now()
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to create podcast');
      setIsCreating(false);
    }
  };

  // Poll for podcast status with proper error handling and timeout
  useEffect(() => {
    if (!pollingData) return;

    const POLL_INTERVAL = 3000; // 3 seconds
    const MAX_POLL_TIME = 180000; // 3 minutes timeout
    const { audioJobId, thumbnailJobId, topic, startTime } = pollingData;

    let retryCount = 0;
    const MAX_RETRIES = 3;

    const pollInterval = setInterval(async () => {
      // Check for timeout
      const elapsed = Date.now() - startTime;
      if (elapsed > MAX_POLL_TIME) {
        setError('Generation timed out. Please try again.');
        setIsCreating(false);
        setPollingData(null);
        clearInterval(pollInterval);
        return;
      }

      try {
        // Poll both audio and thumbnail jobs
        const [audioResponse, thumbnailResponse] = await Promise.all([
          fetch(`/api/podcast/${audioJobId}`),
          thumbnailJobId 
            ? fetch(`/api/podcast/${thumbnailJobId}?type=thumbnail`) 
            : Promise.resolve(null)
        ]);

        if (!audioResponse.ok) {
          throw new Error(`Audio job status check failed: ${audioResponse.status}`);
        }

        const audioData = await audioResponse.json();
        const thumbnailData = thumbnailResponse?.ok 
          ? await thumbnailResponse.json() 
          : null;

        // Reset retry count on successful poll
        retryCount = 0;

        // Check if audio job failed
        if (audioData.status === 'failed') {
          setError(audioData.error || 'Audio generation failed');
          setIsCreating(false);
          setPollingData(null);
          clearInterval(pollInterval);
          return;
        }

        // Check if audio job completed
        const audioCompleted = audioData.status === 'completed';
        const thumbnailCompleted = !thumbnailJobId || thumbnailData?.status === 'completed' || thumbnailData?.status === 'failed';
        
        if (audioCompleted && thumbnailCompleted) {
          // Both jobs are done (or thumbnail not requested), show result
          // Extract audio URL from artifacts or output
          let audioUrl = null;
          if (audioData.artifacts?.length > 0) {
            const audioArtifact = audioData.artifacts.find((a: any) => 
              a.type === 'audio' || a.mime_type?.includes('audio')
            );
            audioUrl = audioArtifact?.url || audioArtifact?.uri;
          }
          if (!audioUrl && audioData.output?.length > 0) {
            audioUrl = audioData.output[0]?.url || audioData.output[0]?.uri;
          }

          // Validate that we got an audio URL
          if (!audioUrl) {
            setError('No audio file found in completed job');
            setIsCreating(false);
            setPollingData(null);
            clearInterval(pollInterval);
            return;
          }

          // Validate it's a full URL (not relative)
          if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://')) {
            console.error('Received invalid audio URL:', audioUrl);
            setError('Invalid audio URL format. Please try again or contact support if the issue persists.');
            setIsCreating(false);
            setPollingData(null);
            clearInterval(pollInterval);
            return;
          }

          // Extract thumbnail URL if available
          let thumbnailUrl = '/thumbnails/default.svg';
          console.log('[Thumbnail] Status check:', {
            thumbnailJobId,
            thumbnailStatus: thumbnailData?.status,
            hasArtifacts: thumbnailData?.artifacts?.length,
            hasOutput: thumbnailData?.output?.length
          });
          
          if (thumbnailData?.status === 'completed') {
            let extractedThumbUrl = null;
            if (thumbnailData.artifacts?.length > 0) {
              const imgArtifact = thumbnailData.artifacts.find((a: any) => 
                a.type === 'image' || a.mime_type?.includes('image')
              );
              extractedThumbUrl = imgArtifact?.url || imgArtifact?.uri;
            }
            if (!extractedThumbUrl && thumbnailData.output?.length > 0) {
              extractedThumbUrl = thumbnailData.output[0]?.url || thumbnailData.output[0]?.uri;
            }
            
            console.log('[Thumbnail] Extracted URL:', extractedThumbUrl);
            
            // Validate and use thumbnail URL
            if (extractedThumbUrl) {
              // Only use if it's a full URL or local path
              if (extractedThumbUrl.startsWith('http://') || extractedThumbUrl.startsWith('https://')) {
                thumbnailUrl = extractedThumbUrl;
                console.log('[Thumbnail] Using extracted URL:', thumbnailUrl);
              } else if (extractedThumbUrl.startsWith('/')) {
                // Relative URLs should not happen - backend should normalize them
                console.warn('[Thumbnail] Received relative URL (should be normalized by backend):', extractedThumbUrl);
              } else {
                console.warn('[Thumbnail] Invalid URL format:', extractedThumbUrl);
              }
            } else {
              console.warn('[Thumbnail] No URL found in completed job');
            }
          } else if (thumbnailData) {
            console.log('[Thumbnail] Still processing, status:', thumbnailData.status);
          } else {
            console.log('[Thumbnail] No thumbnail job or job failed');
          }

          // Preload the thumbnail image before showing result
          const finalThumbnailUrl = thumbnailUrl && !thumbnailUrl.startsWith('/') 
            ? `/api/thumbnail/${encodeURIComponent(thumbnailUrl)}` 
            : thumbnailUrl;

          if (finalThumbnailUrl && !finalThumbnailUrl.startsWith('/thumbnails/')) {
            // Preload remote thumbnail
            const img = new Image();
            img.onload = () => {
              console.log('[Thumbnail] Preloaded successfully');
              // Set completed podcast data after image is loaded
              setCreatedPodcast({
                audioJobId,
                thumbnailJobId,
                status: 'completed',
                topic,
                title: `60 seconds on: ${topic}`,
                summary: `An AI-generated podcast on "${topic}".`,
                audioUrl,
                thumbnailUrl
              });

              setIsCreating(false);
              setPollingData(null);
              clearInterval(pollInterval);
            };
            img.onerror = () => {
              console.error('[Thumbnail] Preload failed, showing anyway');
              // Show result even if thumbnail fails to load
              setCreatedPodcast({
                audioJobId,
                thumbnailJobId,
                status: 'completed',
                topic,
                title: `60 seconds on: ${topic}`,
                summary: `An AI-generated podcast on "${topic}".`,
                audioUrl,
                thumbnailUrl
              });

              setIsCreating(false);
              setPollingData(null);
              clearInterval(pollInterval);
            };
            img.src = finalThumbnailUrl;
          } else {
            // Local thumbnail or default - no preload needed
            setCreatedPodcast({
              audioJobId,
              thumbnailJobId,
              status: 'completed',
              topic,
              title: `60 seconds on: ${topic}`,
              summary: `An AI-generated podcast on "${topic}".`,
              audioUrl,
              thumbnailUrl
            });

            setIsCreating(false);
            setPollingData(null);
            clearInterval(pollInterval);
          }
        } else if (audioCompleted && !thumbnailCompleted) {
          // Audio is done but waiting for thumbnail
          console.log('[Polling] Audio completed, waiting for thumbnail...');
        } else {
          // Audio still processing
          console.log('[Polling] Audio still processing...');
        }
        // Continue polling
      } catch (err) {
        console.error('Polling error:', err);
        retryCount++;
        
        // If we've exceeded max retries, fail gracefully
        if (retryCount >= MAX_RETRIES) {
          setError('Failed to check generation status. Please try again.');
          setIsCreating(false);
          setPollingData(null);
          clearInterval(pollInterval);
        }
        // Otherwise, retry on next interval
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [pollingData]);

  const handleDownload = () => {
    if (createdPodcast?.audioUrl) {
      const link = document.createElement('a');
      const encodedUrl = encodeURIComponent(createdPodcast.audioUrl);
      link.href = `/api/audio/${encodedUrl}?download=true&topic=${encodeURIComponent(createdPodcast.topic)}`;
      link.download = `${createdPodcast.topic.replace(/\s+/g, '-').toLowerCase()}-podcast.wav`;
      link.click();
    }
  };

  return (
    <Box component="main">
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'light'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.secondary.dark, 0.2)} 100%)`,
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 3,
              }}
            >
              Turn any topic into a crisp 60-second podcast.
            </Typography>

            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 400 }}
            >
              Type a topic. We&apos;ll draft, voice, and deliver your mini-podcast using cutting-edge AI.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
                mb: 6,
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleScrollToExamples}
                startIcon={<HeadphonesIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Listen to examples
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleScrollToCreate}
                startIcon={<AutoAwesomeIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Create your own
              </Button>
            </Box>

            {/* Voltage Park AI Factory Info Box */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, rgba(94, 53, 177, 0.05) 0%, rgba(30, 136, 229, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(124, 77, 255, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%)',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.3),
                maxWidth: '900px',
                mx: 'auto',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="overline"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'primary.main',
                    letterSpacing: '0.1em',
                  }}
                >
                  DEMO APPLICATION
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    mb: 2,
                  }}
                >
                  Built with{' '}
                  <Link
                    href="https://www.voltagepark.com/ai-factory"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'inherit',
                      textDecoration: 'none',
                      borderBottom: '3px solid',
                      borderBottomColor: 'primary.main',
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    Voltage Park AI Factory
                  </Link>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
                  This app was built using pre-configured, customizable templates that let you deploy 
                  production AI systems in minutes on a model- and compute-agnostic stack.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 3,
                  mt: 4,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: (theme) =>
                        theme.palette.mode === 'light'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <RocketLaunchIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Deploy in Minutes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    No infrastructure setup required
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: (theme) =>
                        theme.palette.mode === 'light'
                          ? alpha(theme.palette.secondary.main, 0.1)
                          : alpha(theme.palette.secondary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <SpeedIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Lightning Fast
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Optimized AI inference
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: (theme) =>
                        theme.palette.mode === 'light'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Enterprise Security
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Built-in compliance
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Example Episodes Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} id="examples-section">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Explore Sample Episodes
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Listen to AI-generated podcasts on various topics.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
            justifyContent: 'center',
          }}
        >
          {exampleEpisodes.map((episode) => (
            <Box key={episode.id} sx={{ display: 'flex' }}>
              <AudioCard
                title={episode.title}
                teaser={episode.teaser}
                audioUrl={episode.audioUrl}
                thumbnailUrl={episode.thumbnailUrl}
                onPlay={() => handleCardPlay(episode.id)}
              />
            </Box>
          ))}
        </Box>
      </Container>

      {/* Create Your Own Section */}
      <Box
        id="create-section"
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'light'
              ? alpha(theme.palette.primary.main, 0.03)
              : alpha(theme.palette.primary.main, 0.08),
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Create Your Own Podcast
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Enter a topic and we&apos;ll generate a 60-second podcast for you
            </Typography>
          </Box>

          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              mb: 4,
            }}
          >
            <Box component="form" onSubmit={handleCreatePodcast} noValidate>
              <TextField
                fullWidth
                label="What topic would you like to learn about?"
                placeholder="e.g., Photosynthesis, The Roman Empire, Machine Learning"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isCreating}
                variant="outlined"
                autoComplete="off"
                inputProps={{
                  maxLength: 128,
                  'aria-label': 'Topic for podcast generation',
                }}
                helperText={`${topic.length}/128 characters`}
                sx={{ mb: 3 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isCreating || !topic.trim()}
                startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                {isCreating ? 'Generating your podcast...' : 'Generate 60-second podcast'}
              </Button>
            </Box>

            {isCreating && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Our AI is writing and voicing your podcast. This usually takes 60-90 seconds...
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Generated Result */}
          {createdPodcast && (
            <Box
              sx={{
                maxWidth: 576,
                mx: 'auto',
                animation: 'fadeIn 0.5s ease-in',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                  Your Podcast is Ready! 🎉
                </Typography>
                <IconButton
                  onClick={handleDownload}
                  color="primary"
                  aria-label="Download podcast"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>

              <AudioCard
                title={createdPodcast.title || `60 seconds on: ${createdPodcast.topic}`}
                teaser={createdPodcast.summary || `An AI-generated deep dive into ${createdPodcast.topic}.`}
                audioUrl={createdPodcast.audioUrl ? `/api/audio/${encodeURIComponent(createdPodcast.audioUrl)}` : ''}
                thumbnailUrl={createdPodcast.thumbnailUrl && !createdPodcast.thumbnailUrl.startsWith('/') 
                  ? `/api/thumbnail/${encodeURIComponent(createdPodcast.thumbnailUrl)}` 
                  : createdPodcast.thumbnailUrl}
              />

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setCreatedPodcast(null);
                    setTopic('');
                  }}
                >
                  Generate Another
                </Button>
              </Box>
            </Box>
          )}

          {/* Tips Section */}
          {!isCreating && !createdPodcast && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'primary.50'
                    : 'rgba(124, 77, 255, 0.1)',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                💡 Tips for great podcasts:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Be specific: &quot;Photosynthesis in desert plants&quot; works better than just &quot;Plants&quot;
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Try complex topics: Our AI excels at breaking down difficult subjects
                </Typography>
                <Typography component="li" variant="body2">
                  Ask questions: &quot;How does GPS work?&quot; or &quot;Why is the sky blue?&quot;
                </Typography>
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
}
