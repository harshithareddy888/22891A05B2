import React, { useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Link,
  Tooltip,
  Stack,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteEntry, getAllEntries, isExpired } from '../utils/storage';
import DeleteDialog from '../components/DeleteDialog';
import { LOG_LEVELS, log } from '../utils/logger';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState('all'); // all | active | expired
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(() => {
    const list = getAllEntries();
    // sort by createdAt desc
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [refresh]);

  const filteredRows = useMemo(() => {
    if (filter === 'active') return rows.filter((r) => !isExpired(r));
    if (filter === 'expired') return rows.filter((r) => isExpired(r));
    return rows;
  }, [rows, filter]);

  function handleConfirmDelete() {
    if (toDelete) {
      deleteEntry(toDelete);
      log(LOG_LEVELS.INFO, `Deleted shortcode from dashboard: ${toDelete}`);
      setToDelete(null);
      setRefresh((x) => x + 1);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>URL Dashboard</Typography>
      <Tabs
        value={filter}
        onChange={(_, v) => setFilter(v)}
        sx={{ mb: 2 }}
        aria-label="Filter URLs"
      >
        <Tab label={`All (${rows.length})`} value="all" />
        <Tab label={`Active (${rows.filter((r) => !isExpired(r)).length})`} value="active" />
        <Tab label={`Expired (${rows.filter((r) => isExpired(r)).length})`} value="expired" />
      </Tabs>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Shortcode</TableCell>
              <TableCell>Long URL</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Clicks</TableCell>
              <TableCell>Last Accessed</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((r) => {
              const expired = isExpired(r);
              return (
                <TableRow key={r.shortcode} hover sx={{ opacity: expired ? 0.6 : 1 }}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={expired ? 'Expired' : 'Active'}>
                        <span>{r.shortcode}</span>
                      </Tooltip>
                      <Link href={`${window.location.origin}/${r.shortcode}`} target="_blank" rel="noreferrer">
                        open
                      </Link>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link href={r.longUrl} target="_blank" rel="noreferrer">{r.longUrl}</Link>
                  </TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(r.expiryAt).toLocaleString()} ({r.expiryMinutes}m)
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={expired ? 'Expired' : 'Active'} color={expired ? 'default' : 'success'} />
                  </TableCell>
                  <TableCell>{r.analytics?.clicks || 0}</TableCell>
                  <TableCell>
                    {r.analytics?.lastAccessed ? new Date(r.analytics.lastAccessed).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => setToDelete(r.shortcode)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No entries.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteDialog
        open={!!toDelete}
        shortcode={toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </Container>
  );
}
