import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import ShortenForm from '../components/ShortenForm';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: { xs: 'auto', md: 340 } }}>
        <ShortenForm />
      </Box>
      {/* Evaluation links removed as requested */}
    </Container>
  );
}
