import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, CardActions, TextField, Button, Stack, Typography, Alert } from '@mui/material';
import { register, ensureCredentialsFromConfig, hasCredentials } from '../utils/evalApi';
import { useNavigate } from 'react-router-dom';
import { LOG_LEVELS, log } from '../utils/logger';

export default function RegisterEval() {
  const [form, setForm] = useState({
    email: '',
    name: '',
    mobileNo: '',
    githubUsername: '',
    rollNo: '',
    accessCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      await ensureCredentialsFromConfig();
      if (!active) return;
      if (hasCredentials()) {
        // Credentials already available; skip registration UI
        navigate('/auth-token', { replace: true });
      } else {
        setReady(true);
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await register(form);
      setResult(res);
      log(LOG_LEVELS.INFO, 'Evaluation registration completed');
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  if (!ready && !hasCredentials()) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card component="form" onSubmit={onSubmit}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Evaluation Registration</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {result && (
              <Alert severity="success">
                Registered! Save your clientID and clientSecret securely.
              </Alert>
            )}
            <TextField label="Email" name="email" value={form.email} onChange={onChange} required fullWidth />
            <TextField label="Name" name="name" value={form.name} onChange={onChange} required fullWidth />
            <TextField label="Mobile No" name="mobileNo" value={form.mobileNo} onChange={onChange} required fullWidth />
            <TextField label="GitHub Username" name="githubUsername" value={form.githubUsername} onChange={onChange} required fullWidth />
            <TextField label="Roll No" name="rollNo" value={form.rollNo} onChange={onChange} required fullWidth />
            <TextField label="Access Code" name="accessCode" value={form.accessCode} onChange={onChange} required fullWidth />
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </CardActions>
      </Card>

      {result && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Response</Typography>
            <Stack spacing={1}>
              <Typography variant="body2">clientID: {result.clientID}</Typography>
              <Typography variant="body2">clientSecret: {result.clientSecret}</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
