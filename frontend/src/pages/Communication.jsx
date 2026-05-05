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
import { AllInbox, Campaign, CheckCircle, Send } from '@mui/icons-material';
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
  const [inbox, setInbox] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [form, setForm] = useState({
    objet: '',
    contenu: '',
    canal: 'BOITE_INTERNE',
    priorite: 'Normale'
  });
  const [notice, setNotice] = useState(null);
  const selectedAudience = useMemo(() => audiences[selectedIndex] || audiences[0], [audiences, selectedIndex]);

  const loadData = async () => {
    try {
      const [audienceResponse, messagesResponse, inboxResponse] = await Promise.all([
        messageService.getAudiences(),
        messageService.list(),
        messageService.inbox()
      ]);
      setAudiences(audienceResponse.data.data.audiences);
      setMessages(messagesResponse.data.data.messages || []);
      setInbox(inboxResponse.data.data.inbox || []);
    } catch {
      setAudiences(fallbackAudiences);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSend = async () => {
    setNotice(null);
    try {
      const response = await messageService.send({
        ...form,
        audienceType: selectedAudience.type,
        audienceValeur: selectedAudience.value
      });
      setNotice({ severity: 'success', text: `Message envoyé à ${response.data.data.destinataires} destinataire(s).` });
      setForm({ objet: '', contenu: '', canal: 'BOITE_INTERNE', priorite: 'Normale' });
      await loadData();
    } catch (error) {
      setNotice({
        severity: 'error',
        text: error.response?.data?.error?.message || 'Envoi impossible pour le moment.'
      });
    }
  };

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary">Communication stratégique</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Diffusion ciblée et boîtes internes</Typography>
          <Typography color="text.secondary">
            Rédigez un texte, choisissez une cible, et le message arrive dans la boîte des pasteurs concernés.
          </Typography>
        </Box>

        {notice && <Alert severity={notice.severity}>{notice.text}</Alert>}

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Cibles rapides</Typography>
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
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedAudience.label}</Typography>
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
                      <Select label="Canal" value={form.canal} onChange={(event) => setForm((prev) => ({ ...prev, canal: event.target.value }))}>
                        <MenuItem value="BOITE_INTERNE">Boîte interne</MenuItem>
                        <MenuItem value="SMS">SMS</MenuItem>
                        <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
                        <MenuItem value="MIXTE">Mixte</MenuItem>
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
                <Button variant="contained" startIcon={<Send />} onClick={handleSend} disabled={!form.objet.trim() || !form.contenu.trim()}>
                  Envoyer dans les boîtes
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Derniers messages envoyés</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {messages.slice(0, 5).map((message) => (
                  <Box key={message.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>{message.objet}</Typography>
                      <Typography variant="body2" color="text.secondary">{message.audienceType} {message.audienceValeur}</Typography>
                    </Box>
                    <Chip label={`${message.MessageRecipients?.length || 0} reçus`} size="small" icon={<CheckCircle />} />
                  </Box>
                ))}
                {!messages.length && <Typography color="text.secondary">Aucun message envoyé pour le moment.</Typography>}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Aperçu des boîtes internes</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {inbox.slice(0, 6).map((item) => (
                  <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 1.5, alignItems: 'center' }}>
                    <AllInbox color="primary" />
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>{item.Pasteur?.prenom} {item.Pasteur?.nom}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.Message?.objet}</Typography>
                    </Box>
                    <Chip label={item.statutLecture} size="small" />
                  </Box>
                ))}
                {!inbox.length && <Typography color="text.secondary">Les boîtes sont vides.</Typography>}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}
