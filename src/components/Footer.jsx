import { Box, Container, Typography, Link, IconButton, Divider } from '@mui/material';
import { GitHub, Twitter } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Explained in 60 seconds
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered micro podcasts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              © {currentYear} All rights reserved
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Legal
            </Typography>
            <Link
              component={RouterLink}
              to="/privacy"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Privacy Policy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Terms of Service
            </Link>
            <Link
              href="mailto:contact@explainedin60sec.com"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Contact Us
            </Link>
          </Box>

          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Follow Us
            </Typography>
            <Box>
              <IconButton
                aria-label="GitHub"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <GitHub />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <Twitter />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ fontSize: '0.75rem' }}
        >
          Built using{' '}
          <Link
            href="https://voltagepark.com/ai-factory"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            Voltage Park AI Factory
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

