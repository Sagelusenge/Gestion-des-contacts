import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Add, MapsHomeWork } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { geographieService } from '../services';
import { useAuthStore } from '../context/authStore';

const emptyForm = {
  nom: '',
  code: '',
  posteId: '',
  sectionId: '',
  telephone: '',
  adresse: '',
  nombreMembers: 0
};

const slugCode = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^A-Za-z0-9 ]/g, '')
  .trim()
  .split(/\s+/)
  .map((part) => part[0])
  .join('')
  .slice(0, 8)
  .toUpperCase();

export default function Paroisses() {
  const { user } = useAuthStore();
  const [postes, setPostes] = useState([]);
  const [sections, setSections] = useState([]);
  const [paroisses, setParoisses] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState(null);

  const loadData = async () => {
    const [postesResponse, sectionsResponse, paroissesResponse] = await Promise.all([
      geographieService.getPostes({ limit: 100 }),
      geographieService.getSections(),
      geographieService.getParoisses()
    ]);
    const loadedPostes = postesResponse.data.data.postes || [];
    setPostes(loadedPostes);
    setSections(sectionsResponse.data.data.sections || []);
    setParoisses(paroissesResponse.data.data.paroisses || []);
    if ((user?.role === 'PASTEUR_POSTE' || user?.role === 'PASTEUR_SECTIONNAIRE') && loadedPostes[0]) {
      setForm((prev) => ({ ...prev, posteId: loadedPostes[0].id }));
    }
  };

  useEffect(() => {
    loadData().catch(() => setNotice({ severity: 'error', text: 'Chargement des paroisses impossible.' }));
  }, []);

  const filteredParoisses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return paroisses;
    return paroisses.filter((paroisse) => [
      paroisse.nom,
      paroisse.code,
      paroisse.Poste?.nom,
      paroisse.Section?.nom,
      paroisse.adresse
    ].some((value) => value?.toLowerCase().includes(term)));
  }, [paroisses, search]);

  const availableSections = useMemo(
    () => sections.filter((section) => !form.posteId || Number(section.posteId) === Number(form.posteId)),
    [form.posteId, sections]
  );

  const handleForm = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'nom' && !prev.code) {
        next.code = slugCode(value);
      }
      if (name === 'posteId') {
        next.sectionId = '';
      }
      return next;
    });
  };

  const handleCreate = async () => {
    setNotice(null);
    try {
      await geographieService.createParoisse({
        ...form,
        posteId: Number(form.posteId),
        sectionId: Number(form.sectionId),
        nombreMembers: Number(form.nombreMembers || 0)
      });
      setDialogOpen(false);
      setForm((prev) => ({ ...emptyForm, posteId: prev.posteId }));
      setNotice({ severity: 'success', text: 'Paroisse ajoutée avec succès.' });
      await loadData();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.error?.message || 'Création impossible.' });
    }
  };

  return (
    <AppShell onSearch={setSearch}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>Territoire pastoral</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Paroisses</Typography>
            <Typography color="text.secondary">
              Ajout et suivi des paroisses par poste et section.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Ajouter une paroisse
          </Button>
        </Box>

        {notice && <Alert severity={notice.severity}>{notice.text}</Alert>}

        <Paper sx={{ p: 2, borderRadius: 1 }}>
          <TextField fullWidth label="Recherche" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Paper>

        <Grid container spacing={2}>
          {filteredParoisses.map((paroisse) => (
            <Grid item xs={12} md={6} xl={4} key={paroisse.id}>
              <Paper sx={{ p: 2.5, borderRadius: 1, height: '100%' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{paroisse.nom}</Typography>
                      <Typography color="text.secondary">{paroisse.Poste?.nom} / {paroisse.Section?.nom}</Typography>
                    </Box>
                    <Chip label={paroisse.code} color="primary" variant="outlined" />
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip icon={<MapsHomeWork />} label={`${paroisse.nombreMembers || 0} membres`} size="small" />
                    {paroisse.telephone && <Chip label={paroisse.telephone} size="small" variant="outlined" />}
                  </Stack>
                  {paroisse.adresse && <Typography variant="body2" color="text.secondary">{paroisse.adresse}</Typography>}
                </Stack>
              </Paper>
            </Grid>
          ))}
          {!filteredParoisses.length && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Aucune paroisse trouvée.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter une paroisse</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nom de la paroisse" value={form.nom} onChange={(event) => handleForm('nom', event.target.value)} />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField fullWidth label="Code" value={form.code} onChange={(event) => handleForm('code', event.target.value.toUpperCase())} />
            </Grid>
            <Grid item xs={12} sm={7}>
              <TextField fullWidth type="number" label="Nombre de membres" value={form.nombreMembers} onChange={(event) => handleForm('nombreMembers', event.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Poste</InputLabel>
                <Select label="Poste" value={form.posteId} onChange={(event) => handleForm('posteId', event.target.value)} disabled={user?.role !== 'SUPER_ADMIN'}>
                  {postes.map((poste) => <MenuItem key={poste.id} value={poste.id}>{poste.nom}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select label="Section" value={form.sectionId} onChange={(event) => handleForm('sectionId', event.target.value)}>
                  {availableSections.map((section) => <MenuItem key={section.id} value={section.id}>{section.nom}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Téléphone" value={form.telephone} onChange={(event) => handleForm('telephone', event.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Adresse" value={form.adresse} onChange={(event) => handleForm('adresse', event.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.nom || !form.code || !form.posteId || !form.sectionId}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
