'use client';

import { Box, Container, Typography, Link } from '@mui/material';
import { Bolt } from '@mui/icons-material';

export default function Banner() {
  return (
    <Box
      sx={{
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #5e35b1 0%, #1e88e5 100%)'
            : 'linear-gradient(135deg, #7c4dff 0%, #42a5f5 100%)',
        color: 'white',
        py: 2,
        px: 2,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Bolt sx={{ fontSize: 28, color: 'white', opacity: 0.9 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
              textAlign: 'center',
            }}
          >
            Powered by{' '}Voltage Park AI Factory.{' '}
            <Link
              href="https://voltagepark.com/ai-factory-preview"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 800,
                borderBottom: '2px solid rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s',
                '&:hover': {
                  borderBottomColor: 'white',
                  opacity: 0.9,
                },
              }}
            >
              Try for free
            </Link>
          </Typography>
          <Bolt sx={{ fontSize: 28, color: 'white', opacity: 0.9 }} />
        </Box>
      </Container>
    </Box>
  );
}

