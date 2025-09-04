import React from 'react';
import { Container, Alert, Typography, Link } from '@mui/material';

export default function NotFound() {
  return (
    <Container sx={{ py: 6 }}>
      <Alert severity="error" sx={{ mb: 2 }}>Page not found.</Alert>
      <Typography>
        Go back to the <Link href="/">Home</Link>.
      </Typography>
    </Container>
  );
}
