import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Campaign, CheckCircle, OpenInNew, Send, WhatsApp } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { messageService } from '../services';

const fallbackAudiences = [
  { type: 'TOUS', value: '', label: 'Tous les pasteurs actifs', count: 4 },
  { type: 'GRADE', value: 'Pasteur Stagiaire', label: 'Pasteurs stagiaires', count: 1 },
  { type: 'RESPONSABILITE', value: 'Pasteur de Poste', label: 'Pasteurs de poste', count: 1 },
  { type: 'RESPONSABILITE', value: 'Pasteur Sectionnaire', label: 'Pasteurs sectionnaires', count: 1 }
];

export default function Communication() {
  const [audiences, setAudiences] = useState(fallbackAudiences);
  const [messages, setMessages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [form, setForm] = useState({
    objet: '',
    contenu: '',
    canal: 'WHATSAPP',
    priorite: 'Normale'
  });
  const [whatsappLinks, setWhatsappLinks] = useState([]);
  const [notice, setNotice] = useState(null);
  const selectedAudience = useMemo(() => audiences[selectedIndex] || audiences[0], [audiences, selectedIndex]);

  const loadData = async () => {
    try {
      const [audienceResponse, messagesResponse] = await Promise.all([
        messageService.getAudiences(),
        messageService.list()
      ]);
      setAudiences(audienceResponse.data.data.audiences);
      setMessages(messagesResponse.data.data.messages || []);
    } catch {
      setAudiences(fallbackAudiences);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSend = async () => {
    setNotice(null);
    setWhatsappLinks([]);
    try {
      const response = await messageService.send({
        ...form,
        canal: 'WHATSAPP',
        audienceType: selectedAudience.type,
        audienceValeur: selectedAudience.value
      });

      const links = response.data.data.whatsappLinks || [];
      setWhatsappLinks(links);
      setNotice({ severity: 'success', text: `${links.length} lien(s) WhatsApp préparé(s) pour ${response.data.data.destinataires} destinataire(s).` });
      setForm({ objet: '', contenu: '', canal: 'WHATSAPP', priorite: 'Normale' });
      await loadData();

      if (links.length === 1) {
        window.open(links[0].url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setNotice({
        severity: 'error',
        text: error.response?.data?.error?.message || 'Préparation WhatsApp impossible pour le moment.'
      });
    }
  };

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>Communication stratégique</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Diffusion WhatsApp ciblée</Typography>
          <Typography color="text.secondary">
            Rédigez un texte, choisissez une cible, puis ouvrez les conversations WhatsApp des destinataires concernés.
          </Typography>
        </Box>

        {notice && <Alert severity={notice.severity}>{notice.text}</Alert>}

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Cibles rapides</Typography>
              <Stack spacing={1.25}>
                {audiences.map((audience, index) => (
                  <Button
                    key={`${audience.type}-${audience.value}`}
                    variant={selectedIndex === index ? 'contained' : 'outlined'}
                    startIcon={<Campaign />}
                    onClick={() => setSelectedIndex(index)}
                    sx={{ justifyContent: 'space-between', py: 1.35 }}
                  >
                    <span>{audience.label}</span>
                    <Chip label={audience.count} size="small" color={selectedIndex === index ? 'default' : 'primary'} />
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>{selectedAudience.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAudience.count} destinataire(s) dans cette cible
                  </Typography>
                </Box>
                <TextField label="Objet" value={form.objet} onChange={(event) => setForm((prev) => ({ ...prev, objet: event.target.value }))} />
                <TextField
                  label="Texte du message"
                  value={form.contenu}
                  onChange={(event) => setForm((prev) => ({ ...prev, contenu: event.target.value }))}
                  multiline
                  rows={7}
                  placeholder="Exemple : Les pasteurs stagiaires sont convoqués à la réunion de suivi..."
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Canal</InputLabel>
                      <Select label="Canal" value="WHATSAPP" disabled>
                        <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priorité</InputLabel>
                      <Select label="Priorité" value={form.priorite} onChange={(event) => setForm((prev) => ({ ...prev, priorite: event.target.value }))}>
                        <MenuItem value="Normale">Normale</MenuItem>
                        <MenuItem value="Haute">Haute</MenuItem>
                        <MenuItem value="Urgente">Urgente</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Button variant="contained" color="success" startIcon={<WhatsApp />} onClick={handleSend} disabled={!form.objet.trim() || !form.contenu.trim()}>
                  Préparer sur WhatsApp
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {whatsappLinks.length > 0 && (
          <Paper sx={{ p: 2.5, borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Conversations WhatsApp préparées</Typography>
            <Grid container spacing={1.5}>
              {whatsappLinks.map((item) => (
                <Grid item xs={12} sm={6} lg={4} key={item.pasteurId}>
                  <Button fullWidth variant="outlined" color="success" startIcon={<OpenInNew />} href={item.url} target="_blank" rel="noreferrer" sx={{ justifyContent: 'flex-start' }}>
                    {item.nom}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Paper sx={{ p: 2.5, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Journal des préparations WhatsApp</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {messages.slice(0, 6).map((message) => (
              <Box key={message.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>{message.objet}</Typography>
                  <Typography variant="body2" color="text.secondary">{message.audienceType} {message.audienceValeur}</Typography>
                </Box>
                <Chip label={`${message.MessageRecipients?.length || 0} contacts`} size="small" icon={<CheckCircle />} />
              </Box>
            ))}
            {!messages.length && <Typography color="text.secondary">Aucune préparation enregistrée pour le moment.</Typography>}
          </Stack>
        </Paper>
      </Stack>
    </AppShell>
  );
}
