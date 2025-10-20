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
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import DownloadIcon from '@mui/icons-material/Download';
import AudioCard from './components/AudioCard';

interface PodcastData {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  topic: string;
  title?: string;
  summary?: string;
  audioUrl?: string;
  duration?: number;
  createdAt?: string;
  completedAt?: string;
  error?: string;
}

const exampleEpisodes = [
  {
    id: 1,
    topic: 'Quantum Computing',
    title: 'Quantum Computing',
    teaser: 'Discover how quantum computers harness the strange properties of quantum mechanics to solve complex problems.',
    audioUrl: '/audio/quantum-computing.wav',
  },
  {
    id: 2,
    topic: 'Black Holes',
    title: 'Black Holes',
    teaser: 'Journey into the most mysterious objects in the universe where gravity becomes so strong that nothing can escape.',
    audioUrl: '/audio/black-holes.wav',
  },
  {
    id: 3,
    topic: 'CRISPR',
    title: 'CRISPR',
    teaser: 'Learn about the revolutionary gene-editing technology that could transform medicine and agriculture.',
    audioUrl: '/audio/crispr.wav',
  },
  {
    id: 4,
    topic: 'Neural Networks',
    title: 'Neural Networks',
    teaser: 'Understand the brain-inspired algorithms that power modern artificial intelligence and machine learning.',
    audioUrl: '/audio/neural-networks.wav',
  },
  {
    id: 5,
    topic: 'Blockchain',
    title: 'Blockchain',
    teaser: 'Explore the distributed ledger technology that enables cryptocurrencies and decentralized applications.',
    audioUrl: '/audio/blockchain.wav',
  },
  {
    id: 6,
    topic: 'Climate Change',
    title: 'Climate Change',
    teaser: 'Get a concise overview of the science behind global warming and its impact on our planet.',
    audioUrl: '/audio/climate-change.wav',
  },
];

export default function Home() {
  const theme = useTheme();
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPodcast, setCreatedPodcast] = useState<PodcastData | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);

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

      const data = await response.json() as PodcastData;
      setPollingId(data.id);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to create podcast');
      setIsCreating(false);
    }
  };

  // Poll for podcast status
  useEffect(() => {
    if (!pollingId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/podcast/${pollingId}`);
        if (!response.ok) throw new Error('Failed to fetch status');

        const data = await response.json() as PodcastData;

        if (data.status === 'completed') {
          setCreatedPodcast(data);
          setIsCreating(false);
          setPollingId(null);
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setError(data.error || 'Failed to generate podcast');
          setIsCreating(false);
          setPollingId(null);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [pollingId]);

  const handleDownload = () => {
    if (createdPodcast?.audioUrl) {
      const link = document.createElement('a');
      link.href = `${createdPodcast.audioUrl}?download=true`;
      link.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-podcast.wav`;
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
                audioUrl={createdPodcast.audioUrl || ''}
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
