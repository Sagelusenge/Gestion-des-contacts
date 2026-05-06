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
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { Add, MapsHomeWork } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { geographieService } from '../services';
import { useAuthStore } from '../context/authStore';

const emptyPoste = { nom: '', code: '', telephone: '', email: '', adresse: '' };
const emptySection = { nom: '', code: '', posteId: '', telephone: '', adresse: '' };
const emptyParoisse = { nom: '', code: '', posteId: '', sectionId: '', telephone: '', adresse: '' };

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

export default function Organisation() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('postes');
  const [postes, setPostes] = useState([]);
  const [sections, setSections] = useState([]);
  const [paroisses, setParoisses] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [posteForm, setPosteForm] = useState(emptyPoste);
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [paroisseForm, setParoisseForm] = useState(emptyParoisse);
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
      setSectionForm((prev) => ({ ...prev, posteId: loadedPostes[0].id }));
      setParoisseForm((prev) => ({ ...prev, posteId: loadedPostes[0].id }));
    }
  };

  useEffect(() => {
    loadData().catch(() => setNotice({ severity: 'error', text: 'Chargement de l’organisation impossible.' }));
  }, []);

  const availableSections = useMemo(
    () => sections.filter((section) => !paroisseForm.posteId || Number(section.posteId) === Number(paroisseForm.posteId)),
    [paroisseForm.posteId, sections]
  );

  const handleAutoCode = (setter) => (name, value) => {
    setter((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'nom' && !prev.code) next.code = slugCode(value);
      if (name === 'posteId') next.sectionId = '';
      return next;
    });
  };

  const createPoste = async () => {
    setNotice(null);
    try {
      await geographieService.createPoste(posteForm);
      setDialog(null);
      setPosteForm(emptyPoste);
      setNotice({ severity: 'success', text: 'Poste enregistré avec succès.' });
      await loadData();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.error?.message || 'Création impossible.' });
    }
  };

  const createSection = async () => {
    setNotice(null);
    try {
      await geographieService.createSection({ ...sectionForm, posteId: Number(sectionForm.posteId) });
      setDialog(null);
      setSectionForm((prev) => ({ ...emptySection, posteId: prev.posteId }));
      setNotice({ severity: 'success', text: 'Section enregistrée avec succès.' });
      await loadData();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.error?.message || 'Création impossible.' });
    }
  };

  const createParoisse = async () => {
    setNotice(null);
    try {
      await geographieService.createParoisse({
        ...paroisseForm,
        posteId: Number(paroisseForm.posteId),
        sectionId: Number(paroisseForm.sectionId)
      });
      setDialog(null);
      setParoisseForm((prev) => ({ ...emptyParoisse, posteId: prev.posteId }));
      setNotice({ severity: 'success', text: 'Paroisse enregistrée avec succès.' });
      await loadData();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.error?.message || 'Création impossible.' });
    }
  };

  const openAdd = () => {
    if (tab === 'postes') setDialog('poste');
    if (tab === 'sections') setDialog('section');
    if (tab === 'paroisses') setDialog('paroisse');
  };

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 900 }}>Structure CBCA</Typography>
            <Typography variant="h4" sx={{ fontWeight: 950 }}>Postes, sections et paroisses</Typography>
            <Typography color="text.secondary">Enregistrez les entités géographiques utilisées par les fiches pasteurs.</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openAdd}>
            Ajouter
          </Button>
        </Box>

        {notice && <Alert severity={notice.severity}>{notice.text}</Alert>}

        <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tab value="postes" label="Postes" />
            <Tab value="sections" label="Sections" />
            <Tab value="paroisses" label="Paroisses" />
          </Tabs>
          <Box sx={{ p: 2.5 }}>
            {tab === 'postes' && (
              <Grid container spacing={2}>
                {postes.map((poste) => (
                  <Grid item xs={12} md={6} xl={4} key={poste.id}>
                    <EntityCard title={poste.nom} code={poste.code} subtitle={poste.adresse} meta={[poste.telephone, poste.email]} />
                  </Grid>
                ))}
              </Grid>
            )}
            {tab === 'sections' && (
              <Grid container spacing={2}>
                {sections.map((section) => (
                  <Grid item xs={12} md={6} xl={4} key={section.id}>
                    <EntityCard title={section.nom} code={section.code} subtitle={section.Poste?.nom} meta={[section.telephone, section.adresse]} />
                  </Grid>
                ))}
              </Grid>
            )}
            {tab === 'paroisses' && (
              <Grid container spacing={2}>
                {paroisses.map((paroisse) => (
                  <Grid item xs={12} md={6} xl={4} key={paroisse.id}>
                    <EntityCard title={paroisse.nom} code={paroisse.code} subtitle={`${paroisse.Poste?.nom || '-'} / ${paroisse.Section?.nom || '-'}`} meta={[paroisse.telephone, paroisse.adresse]} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Paper>
      </Stack>

      <Dialog open={dialog === 'poste'} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un poste</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Nom du poste" value={posteForm.nom} onChange={(e) => handleAutoCode(setPosteForm)('nom', e.target.value)} /></Grid>
            <Grid item xs={12} sm={5}><TextField fullWidth label="Code" value={posteForm.code} onChange={(e) => setPosteForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} /></Grid>
            <Grid item xs={12} sm={7}><TextField fullWidth label="Téléphone" value={posteForm.telephone} onChange={(e) => setPosteForm((prev) => ({ ...prev, telephone: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Email" value={posteForm.email} onChange={(e) => setPosteForm((prev) => ({ ...prev, email: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Adresse" value={posteForm.adresse} onChange={(e) => setPosteForm((prev) => ({ ...prev, adresse: e.target.value }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Annuler</Button>
          <Button variant="contained" onClick={createPoste} disabled={!posteForm.nom || !posteForm.code}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'section'} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter une section</DialogTitle>
        <DialogContent>
          <GeoForm form={sectionForm} setForm={setSectionForm} postes={postes} showSection={false} user={user} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Annuler</Button>
          <Button variant="contained" onClick={createSection} disabled={!sectionForm.nom || !sectionForm.code || !sectionForm.posteId}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'paroisse'} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter une paroisse</DialogTitle>
        <DialogContent>
          <GeoForm form={paroisseForm} setForm={setParoisseForm} postes={postes} sections={availableSections} user={user} showSection />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Annuler</Button>
          <Button variant="contained" onClick={createParoisse} disabled={!paroisseForm.nom || !paroisseForm.code || !paroisseForm.posteId || !paroisseForm.sectionId}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}

function EntityCard({ title, code, subtitle, meta }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 1, height: '100%', bgcolor: 'background.paper' }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>{title}</Typography>
            <Typography color="text.secondary">{subtitle || '-'}</Typography>
          </Box>
          <Chip icon={<MapsHomeWork />} label={code} color="primary" variant="outlined" />
        </Box>
        <Stack spacing={0.5}>
          {meta.filter(Boolean).map((item) => (
            <Typography key={item} variant="body2" color="text.secondary">{item}</Typography>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

function GeoForm({ form, setForm, postes, sections = [], showSection, user }) {
  const handleChange = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'nom' && !prev.code) next.code = slugCode(value);
      if (name === 'posteId') next.sectionId = '';
      return next;
    });
  };

  return (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      <Grid item xs={12}><TextField fullWidth label="Nom" value={form.nom} onChange={(e) => handleChange('nom', e.target.value)} /></Grid>
      <Grid item xs={12} sm={5}><TextField fullWidth label="Code" value={form.code} onChange={(e) => handleChange('code', e.target.value.toUpperCase())} /></Grid>
      <Grid item xs={12} sm={7}><TextField fullWidth label="Téléphone" value={form.telephone} onChange={(e) => handleChange('telephone', e.target.value)} /></Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Poste</InputLabel>
          <Select label="Poste" value={form.posteId} onChange={(e) => handleChange('posteId', e.target.value)} disabled={user?.role !== 'SUPER_ADMIN'}>
            {postes.map((poste) => <MenuItem key={poste.id} value={poste.id}>{poste.nom}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      {showSection && (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Section</InputLabel>
            <Select label="Section" value={form.sectionId} onChange={(e) => handleChange('sectionId', e.target.value)}>
              {sections.map((section) => <MenuItem key={section.id} value={section.id}>{section.nom}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      )}
      <Grid item xs={12}><TextField fullWidth label="Adresse" value={form.adresse} onChange={(e) => handleChange('adresse', e.target.value)} /></Grid>
    </Grid>
  );
}
