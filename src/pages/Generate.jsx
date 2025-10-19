import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../contexts/AuthContext';
import AudioCard from '../components/AudioCard';

export default function Generate({ onLoginClick }) {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedPodcast(null);

    // Simulate API call with setTimeout
    setTimeout(() => {
      // Mock generated podcast
      const mockPodcast = {
        topic: topic,
        title: `60 seconds on: ${topic}`,
        teaser: `An AI-generated deep dive into ${topic}, perfectly condensed into 60 seconds of engaging audio.`,
        audioUrl: '/audio/sample1.mp3', // In production, this would be the generated audio URL
      };

      setGeneratedPodcast(mockPodcast);
      setLoading(false);
      setTopic('');
    }, 2500); // Simulate 2.5 second generation time
  };

  // If not logged in, show login prompt
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: 3,
          }}
        >
          <LockIcon
            sx={{
              fontSize: 64,
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Login Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Create an account or log in to start generating your own 60-second podcasts
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onLoginClick}
            startIcon={<LockIcon />}
            sx={{ px: 4 }}
          >
            Log in to continue
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Create Your Podcast
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Enter any topic and we'll generate a 60-second podcast for you
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
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="What topic would you like to learn about?"
            placeholder="e.g., Photosynthesis, The Roman Empire, Machine Learning..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            multiline
            rows={3}
            variant="outlined"
            sx={{ mb: 3 }}
            inputProps={{
              'aria-label': 'Topic for podcast generation',
            }}
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
            disabled={loading || !topic.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            {loading ? 'Generating your podcast...' : 'Generate 60-second podcast'}
          </Button>
        </form>

        {loading && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Our AI is writing and voicing your podcast...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Generated Result */}
      {generatedPodcast && (
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
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            Your Podcast is Ready! 🎉
          </Typography>
          
          <AudioCard
            topic={generatedPodcast.topic}
            title={generatedPodcast.title}
            teaser={generatedPodcast.teaser}
            audioUrl={generatedPodcast.audioUrl}
          />

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setGeneratedPodcast(null);
                setTopic('');
              }}
            >
              Generate Another
            </Button>
          </Box>
        </Box>
      )}

      {/* Tips Section */}
      {!generatedPodcast && !loading && (
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
              Be specific: "Photosynthesis in desert plants" works better than just "Plants"
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Try complex topics: Our AI excels at breaking down difficult subjects
            </Typography>
            <Typography component="li" variant="body2">
              Ask questions: "How does GPS work?" or "Why is the sky blue?"
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

