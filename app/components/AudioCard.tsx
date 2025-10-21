'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Slider,
  Box,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface AudioCardProps {
  title: string;
  teaser: string;
  audioUrl: string;
  thumbnailUrl?: string;
  onPlay?: () => void;
}

export default function AudioCard({ title, teaser, audioUrl, thumbnailUrl, onPlay }: AudioCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [imageError, setImageError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Check if metadata is already loaded
    if (audio.readyState >= 1) {
      setDuration(audio.duration);
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (onPlay) onPlay();
      audio.play().catch(err => console.error('Playback error:', err));
      setIsPlaying(true);
    }
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const audio = audioRef.current;
    if (audio) {
      const value = typeof newValue === 'number' ? newValue : newValue[0];
      audio.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [onPlay]);

  return (
    <Card 
      elevation={2}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': {
            transform: 'none',
          },
        },
      }}
    >
      {thumbnailUrl && !imageError && (
        <Box
          component="img"
          src={thumbnailUrl}
          alt={`${title} thumbnail`}
          onError={(e) => {
            console.error('Failed to load thumbnail:', thumbnailUrl);
            setImageError(true);
          }}
          sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
            bgcolor: (theme) => 
              theme.palette.mode === 'light' 
                ? 'grey.100' 
                : 'grey.900',
          }}
        />
      )}
      {(!thumbnailUrl || imageError) && (
        <Box
          sx={{
            width: '100%',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => 
              theme.palette.mode === 'light' 
                ? 'grey.100' 
                : 'grey.800',
          }}
        >
          <Typography variant="h3" sx={{ opacity: 0.3 }}>
            🎙️
          </Typography>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {teaser}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <IconButton
              onClick={togglePlay}
              color="primary"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                width: 44,
                height: 44,
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            <Box flexGrow={1}>
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSliderChange}
                aria-label="Audio progress"
                size="small"
                disabled={!duration}
                sx={{
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                  },
                }}
              />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {duration ? formatTime(duration) : '--:--'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ fontStyle: 'italic' }}
          >
            Generated with AI
          </Typography>
        </Box>

        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </CardContent>
    </Card>
  );
}

