import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, CircularProgress, Stack, Typography, Link } from '@mui/material';
import { getEntry, isExpired, recordClick } from '../utils/storage';
import { log, LOG_LEVELS } from '../utils/logger';

// Mock geolocation/referrer data for analytics
function getMockLocation() {
  const regions = ['US', 'EU', 'IN', 'APAC', 'LATAM', 'AFR'];
  const cities = ['San Francisco', 'Berlin', 'Bengaluru', 'Singapore', 'Sao Paulo', 'Nairobi'];
  return {
    region: regions[Math.floor(Math.random() * regions.length)],
    city: cities[Math.floor(Math.random() * cities.length)],
  };
}

export default function Redirect() {
  const { shortcode } = useParams();
  const [status, setStatus] = useState('loading'); // loading | invalid | expired

  useEffect(() => {
    try {
      const entry = getEntry(shortcode);
      if (!entry) {
        setStatus('invalid');
        log(LOG_LEVELS.WARN, `Redirect failed: ${shortcode} not found`);
        return;
      }
      if (isExpired(entry)) {
        setStatus('expired');
        log(LOG_LEVELS.INFO, `Redirect failed: ${shortcode} expired`);
        return;
      }
      const referrer = document.referrer || 'direct';
      const location = getMockLocation();
      recordClick(shortcode, referrer, location);
      log(LOG_LEVELS.INFO, `Redirecting ${shortcode} -> ${entry.longUrl}`);
      // Redirect immediately for snappier UX in dev
      setTimeout(() => {
        window.location.href = entry.longUrl;
      }, 0);
    } catch (e) {
      setStatus('invalid');
      log(LOG_LEVELS.ERROR, `Redirect error: ${e?.message || 'unknown'}`);
    }
  }, [shortcode]);

  if (status === 'loading') {
    return (
      <Container sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="body2">Redirecting...</Typography>
        </Stack>
      </Container>
    );
  }

  if (status === 'invalid' || status === 'expired') {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {status === 'expired' ? 'This link has expired.' : 'This link is invalid.'}
        </Alert>
        <Typography>
          Go back to the{' '}
          <Link href="/">Home</Link>
          {' '}or view the{' '}
          <Link href="/dashboard">Dashboard</Link>.
        </Typography>
      </Container>
    );
  }

  return null;
}
