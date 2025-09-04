import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardActions, TextField, Button, Stack, Alert, Typography, Link, Snackbar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { isValidUrl, isValidExpiryMinutes, isValidShortcode, normalizeUrl } from '../utils/validation';
import { addEntry, getEntry } from '../utils/storage';
import { generateUniqueShortcode, generateJumbledShortcode } from '../utils/shortcode';
import { log, LOG_LEVELS } from '../utils/logger';
import { getShortBase } from '../utils/appConfig';

export default function ShortenForm() {
  const [longUrl, setLongUrl] = useState('');
  const [expiry, setExpiry] = useState('');
  const [shortcode, setShortcode] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyMsg, setCopyMsg] = useState('Copied!');
  const [shortBase, setShortBase] = useState('');

  useEffect(() => {
    setShortBase(getShortBase());
  }, []);

  // Preview URL removed to avoid eslint unused var.

  async function handleCopy(url) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopyMsg('Copied to clipboard');
      setCopyOpen(true);
    } catch (err) {
      setCopyMsg('Failed to copy');
      setCopyOpen(true);
    }
  }

  // Short Link Base input removed; base is derived from appConfig/localStorage.

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    const normalized = normalizeUrl(longUrl.trim());

    if (!isValidUrl(normalized)) {
      setError('Please enter a valid URL (e.g., https://example.com).');
      log(LOG_LEVELS.WARN, 'Validation failed: invalid URL');
      return;
    }
    if (!isValidExpiryMinutes(expiry)) {
      setError('Expiry must be a positive integer (minutes).');
      log(LOG_LEVELS.WARN, 'Validation failed: invalid expiry');
      return;
    }
    if (!isValidShortcode(shortcode)) {
      setError('Shortcode must be alphanumeric or hyphen (3-32 chars).');
      log(LOG_LEVELS.WARN, 'Validation failed: invalid shortcode');
      return;
    }

    let code = shortcode.trim();
    if (!code) {
      code = generateUniqueShortcode(6);
    } else {
      // If user provided a custom token, jumble it with a random suffix to ensure uniqueness
      // Try a few attempts until unique
      let attempt = 0;
      let candidate;
      do {
        candidate = generateJumbledShortcode(code, 5);
        attempt++;
        if (!getEntry(candidate)) {
          code = candidate;
          break;
        }
      } while (attempt < 10);
      if (getEntry(code)) {
        setError('Unable to create a unique shortcode from the provided token. Please try again.');
        log(LOG_LEVELS.WARN, 'Shortcode collision after jumbles');
        return;
      }
    }

    const expInt = expiry === '' ? undefined : parseInt(expiry, 10);
    const res = addEntry(code, normalized, expInt);
    if (!res.ok) {
      setError('Failed to create short URL due to a collision. Try again.');
      return;
    }

    setResult({ shortcode: code, entry: res.entry });
    log(LOG_LEVELS.INFO, `Short URL created: ${code}`);
  }

  return (
    <Card component="form" onSubmit={handleSubmit}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Create a Short URL</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Long URL"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            fullWidth
            required
            placeholder="https://example.com/page"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
            <TextField
              label="Custom token (optional)"
              placeholder="my-custom"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              helperText="3-32 chars, letters-digits-hyphens. We'll auto-add a random suffix to keep it unique."
              fullWidth
            />
          </Stack>
          {(() => {
            const base = getShortBase();
            const codePreview = shortcode && shortcode.trim() ? `${shortcode.trim()}-xxxxx` : 'xxxxxx';
            return (
              <Typography variant="body2" color="text.secondary">
                Preview: {base}/{codePreview}
              </Typography>
            );
          })()}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Expiry (minutes)"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="30 (default)"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              fullWidth
            />
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="contained" type="submit">Shorten</Button>
      </CardActions>

      {result && (
        <CardContent>
          <Alert severity="success" sx={{ mb: 2 }}>Short URL created!</Alert>
          {(() => {
            const base = shortBase || getShortBase();
            const shortUrl = `${base}/${result.shortcode}`;
            const internalPath = `/${result.shortcode}`;
            return (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                <Typography sx={{ wordBreak: 'break-all' }}>
                  Short URL: {' '}
                  <Link component={RouterLink} to={internalPath}>
                    {shortUrl}
                  </Link>
                </Typography>
                <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => handleCopy(shortUrl)}>
                  Copy
                </Button>
              </Stack>
            );
          })()}
          <Typography variant="body2" color="text.secondary">
            Expires at: {new Date(result.entry.expiryAt).toLocaleString()} (in {result.entry.expiryMinutes} minutes)
          </Typography>
        </CardContent>
      )}

      <Snackbar
        open={copyOpen}
        autoHideDuration={2000}
        onClose={() => setCopyOpen(false)}
        message={copyMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Card>
  );
}
