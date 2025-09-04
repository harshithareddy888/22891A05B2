import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, CardActions, TextField, Button, Stack, Typography, Alert } from '@mui/material';
import { getAuthToken, getCredentials, ensureCredentialsFromConfig, hasCredentials } from '../utils/evalApi';
import { LOG_LEVELS, log } from '../utils/logger';

export default function AuthToken() {
  const stored = getCredentials();
  const [form, setForm] = useState({
    email: stored?.email || '',
    name: stored?.name || '',
    rollNo: stored?.rollNo || '',
    accessCode: stored?.accessCode || '',
    clientID: stored?.clientID || '',
    clientSecret: stored?.clientSecret || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    let active = true;
    (async () => {
      await ensureCredentialsFromConfig();
      if (!active) return;
      const now = getCredentials();
      setForm({
        email: now?.email || '',
        name: now?.name || '',
        rollNo: now?.rollNo || '',
        accessCode: now?.accessCode || '',
        clientID: now?.clientID || '',
        clientSecret: now?.clientSecret || '',
      });
      setReady(true);
      if (hasCredentials()) {
        setError('');
        setResult(null);
        setLoading(true);
        try {
          const res = await getAuthToken(now);
          setResult(res);
          log(LOG_LEVELS.INFO, 'Evaluation auth token acquired');
        } catch (e) {
          setError(e.message || 'Auth failed');
        } finally {
          setLoading(false);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await getAuthToken(form);
      setResult(res);
      log(LOG_LEVELS.INFO, 'Evaluation auth token acquired');
    } catch (e) {
      setError(e.message || 'Auth failed');
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const showForm = !hasCredentials();

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card component={showForm ? 'form' : 'div'} onSubmit={showForm ? onSubmit : undefined}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Get Authorization Token</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {result && (
              <Alert severity="success">
                Token received. Save it securely.
              </Alert>
            )}
            {showForm ? (
              <>
                <TextField label="Email" name="email" value={form.email} onChange={onChange} required fullWidth />
                <TextField label="Name" name="name" value={form.name} onChange={onChange} required fullWidth />
                <TextField label="Roll No" name="rollNo" value={form.rollNo} onChange={onChange} required fullWidth />
                <TextField label="Access Code" name="accessCode" value={form.accessCode} onChange={onChange} required fullWidth />
                <TextField label="Client ID" name="clientID" value={form.clientID} onChange={onChange} required fullWidth />
                <TextField label="Client Secret" name="clientSecret" value={form.clientSecret} onChange={onChange} required fullWidth />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Credentials loaded from secure storage/config. Fetching token...</Typography>
            )}
          </Stack>
        </CardContent>
        {showForm && (
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Requesting...' : 'Get Token'}
            </Button>
          </CardActions>
        )}
      </Card>

      {result && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Response</Typography>
            <Stack spacing={1}>
              <Typography variant="body2">token_type: {result.token_type}</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>access_token: {result.access_token}</Typography>
              <Typography variant="body2">expires_in: {result.expires_in}</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
