import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Campaign, Send, Sms, WhatsApp } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { mockGeographie, mockPasteurs } from '../data/mockData';

const lists = [
  { id: 'postes', label: 'Responsables de postes', count: mockGeographie.length, channel: 'WhatsApp + SMS' },
  { id: 'pasteurs', label: 'Tous les pasteurs actifs', count: mockPasteurs.length, channel: 'WhatsApp' },
  { id: 'stagiaires', label: 'Pasteurs stagiaires', count: mockPasteurs.filter((p) => p.grade === 'Pasteur Stagiaire').length, channel: 'SMS' }
];

export default function Communication() {
  const [selected, setSelected] = useState('postes');
  const [message, setMessage] = useState('');
  const currentList = useMemo(() => lists.find((item) => item.id === selected), [selected]);

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary">Communication stratégique</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Diffusion ciblée</Typography>
          <Typography color="text.secondary">
            Envoyer une consigne aux responsables sans créer de groupe encombrant.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Listes intelligentes</Typography>
              <Stack spacing={1.5}>
                {lists.map((list) => (
                  <Button
                    key={list.id}
                    variant={selected === list.id ? 'contained' : 'outlined'}
                    onClick={() => setSelected(list.id)}
                    startIcon={<Campaign />}
                    sx={{ justifyContent: 'space-between', py: 1.5 }}
                  >
                    <span>{list.label}</span>
                    <Chip label={list.count} size="small" color={selected === list.id ? 'default' : 'primary'} />
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{currentList.label}</Typography>
                  <Typography variant="body2" color="text.secondary">{currentList.count} destinataires - {currentList.channel}</Typography>
                </Box>
                <TextField
                  label="Message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  multiline
                  rows={7}
                  placeholder="Exemple : Convocation urgente du conseil communautaire..."
                />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" startIcon={<Send />} disabled={!message.trim()}>Envoyer</Button>
                  <Button variant="outlined" color="success" startIcon={<WhatsApp />}>WhatsApp</Button>
                  <Button variant="outlined" startIcon={<Sms />}>SMS</Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}
