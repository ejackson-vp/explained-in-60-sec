import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  alpha,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import { useNavigate } from 'react-router-dom';
import AudioCard from '../components/AudioCard';
import { useAuth } from '../contexts/AuthContext';

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

export default function Home({ onLoginClick }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const handleScrollToExamples = () => {
    const element = document.getElementById('examples-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCreateClick = () => {
    if (user) {
      navigate('/generate');
    } else {
      onLoginClick();
    }
  };

  const handleCardPlay = (id) => {
    setCurrentlyPlaying(id);
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
              Type a topic. We'll draft, voice, and deliver your mini-podcast using cutting-edge AI.
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
                Try free examples
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleCreateClick}
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

        <Grid 
          container 
          spacing={3}
          sx={{
            justifyContent: 'center',
          }}
        >
          {exampleEpisodes.map((episode) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={episode.id}
              sx={{ 
                display: 'flex',
                maxWidth: { xs: '100%', sm: '50%', md: '33.333333%' },
                flexBasis: { xs: '100%', sm: '50%', md: '33.333333%' },
              }}
            >
              <AudioCard
                topic={episode.topic}
                title={episode.title}
                teaser={episode.teaser}
                audioUrl={episode.audioUrl}
                onPlay={() => handleCardPlay(episode.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Create Your Own Section */}
      <Box
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
              Generate custom 60-second podcasts on any topic you choose
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleCreateClick}
              startIcon={<AutoAwesomeIcon />}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                mb: 6,
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

