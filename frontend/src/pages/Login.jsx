import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, CardActions, TextField, Button, Stack, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { LOG_LEVELS, log } from '../utils/logger';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = location.state?.from?.pathname || '/';

  function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    try {
      auth.login(username.trim());
      log(LOG_LEVELS.INFO, `Login success for ${username.trim()}`);
      navigate(from, { replace: true });
    } catch (e) {
      setError('Login failed.');
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card component="form" onSubmit={onSubmit}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Login</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button type="submit" variant="contained">Login</Button>
        </CardActions>
      </Card>
    </Container>
  );
}
