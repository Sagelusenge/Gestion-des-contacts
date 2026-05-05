import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
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
import { Add, Call, FilterAlt, Visibility, WhatsApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { geographieService, pasteurService } from '../services';
import { grades, mockPasteurs, statuts } from '../data/mockData';

const responsabilites = ['Pasteur de Poste', 'Pasteur Sectionnaire', 'Pasteur de Paroisse', 'Assistant Pastoral', 'Administration'];

const emptyForm = {
  nom: '',
  prenom: '',
  matricule: '',
  grade: 'Pasteur',
  responsabilite: 'Pasteur de Paroisse',
  fonction: '',
  telephone: '',
  email: '',
  dateOrdination: '',
  posteId: '',
  sectionId: '',
  paroisseId: '',
  statut: 'Actif'
};

export default function Pasteurs() {
  const navigate = useNavigate();
  const [pasteurs, setPasteurs] = useState(mockPasteurs);
  const [postes, setPostes] = useState([]);
  const [sections, setSections] = useState([]);
  const [paroisses, setParoisses] = useState([]);
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [statut, setStatut] = useState('');
  const [responsabilite, setResponsabilite] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState(null);

  const loadPasteurs = async () => {
    try {
      const response = await pasteurService.list({ limit: 100 });
      setPasteurs(response.data.data.pasteurs);
    } catch {
      setPasteurs(mockPasteurs);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadPasteurs();
      try {
        const [postesResponse, sectionsResponse, paroissesResponse] = await Promise.all([
          geographieService.getPostes({ limit: 100 }),
          geographieService.getSections(),
          geographieService.getParoisses()
        ]);
        setPostes(postesResponse.data.data.postes);
        setSections(sectionsResponse.data.data.sections);
        setParoisses(paroissesResponse.data.data.paroisses);
      } catch {
        setPostes([]);
        setSections([]);
        setParoisses([]);
      }
    };

    load();
  }, []);

  const filteredPasteurs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return pasteurs.filter((pasteur) => {
      const matchesSearch = !term || [
        pasteur.nom,
        pasteur.prenom,
        pasteur.matricule,
        pasteur.fonction,
        pasteur.responsabilite,
        pasteur.Poste?.nom,
        pasteur.Paroisse?.nom
      ].some((value) => value?.toLowerCase().includes(term));

      return matchesSearch
        && (!grade || pasteur.grade === grade)
        && (!statut || pasteur.statut === statut)
        && (!responsabilite || pasteur.responsabilite === responsabilite);
    });
  }, [grade, pasteurs, responsabilite, search, statut]);

  const handleForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    setNotice(null);
    try {
      await pasteurService.create({
        ...form,
        posteId: Number(form.posteId),
        sectionId: form.sectionId ? Number(form.sectionId) : null,
        paroisseId: form.paroisseId ? Number(form.paroisseId) : null
      });
      setDialogOpen(false);
      setForm(emptyForm);
      setNotice({ severity: 'success', text: 'Pasteur ajouté avec succès.' });
      await loadPasteurs();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.error?.message || 'Création impossible.' });
    }
  };

  return (
    <AppShell onSearch={setSearch}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="primary">Registre interne</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Pasteurs et responsables</Typography>
            <Typography color="text.secondary">
              Recherche par matricule, poste, paroisse, grade, responsabilité ou fonction pastorale.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Ajouter
          </Button>
        </Box>

        {notice && <Alert severity={notice.severity}>{notice.text}</Alert>}

        <Paper sx={{ p: 2, borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Recherche" value={search} onChange={(event) => setSearch(event.target.value)} />
            </Grid>
            <Grid item xs={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select label="Grade" value={grade} onChange={(event) => setGrade(event.target.value)}>
                  <MenuItem value="">Tous</MenuItem>
                  {grades.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Responsabilité</InputLabel>
                <Select label="Responsabilité" value={responsabilite} onChange={(event) => setResponsabilite(event.target.value)}>
                  <MenuItem value="">Toutes</MenuItem>
                  {responsabilites.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select label="Statut" value={statut} onChange={(event) => setStatut(event.target.value)}>
                  <MenuItem value="">Tous</MenuItem>
                  {statuts.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAlt color="primary" />
          <Typography sx={{ fontWeight: 700 }}>{filteredPasteurs.length} fiche(s) visibles</Typography>
        </Box>

        <Grid container spacing={2}>
          {filteredPasteurs.map((pasteur) => (
            <Grid item xs={12} lg={6} key={pasteur.id}>
              <Paper sx={{ p: 2.5, borderRadius: 1, height: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar src={pasteur.photo} sx={{ width: 58, height: 58, bgcolor: 'primary.main', fontWeight: 800 }}>
                    {pasteur.prenom?.[0]}{pasteur.nom?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {pasteur.prenom} {pasteur.nom}
                      </Typography>
                      <Chip label={pasteur.grade} size="small" color="primary" variant="outlined" />
                      <Chip label={pasteur.responsabilite || 'Pasteur de Paroisse'} size="small" color="secondary" variant="outlined" />
                      <Chip label={pasteur.statut} size="small" />
                    </Stack>
                    <Typography color="text.secondary">{pasteur.fonction}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {pasteur.Poste?.nom} / {pasteur.Section?.nom} / {pasteur.Paroisse?.nom}
                    </Typography>
                    <Grid container spacing={1.5} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Matricule</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{pasteur.matricule}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Ordination</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {pasteur.dateOrdination ? new Date(pasteur.dateOrdination).toLocaleDateString('fr-FR') : '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                  <Button size="small" variant="contained" startIcon={<Visibility />} onClick={() => navigate(`/pasteurs/${pasteur.id}`)}>
                    Fiche
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<Call />} href={pasteur.telephone ? `tel:${pasteur.telephone.replaceAll(' ', '')}` : undefined}>
                    Appeler
                  </Button>
                  <Button size="small" variant="outlined" color="success" startIcon={<WhatsApp />} href={pasteur.telephone ? `https://wa.me/${pasteur.telephone.replace(/\D/g, '')}` : undefined} target="_blank">
                    WhatsApp
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Ajouter un pasteur</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Nom" value={form.nom} onChange={(e) => handleForm('nom', e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Prénom" value={form.prenom} onChange={(e) => handleForm('prenom', e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Matricule" value={form.matricule} onChange={(e) => handleForm('matricule', e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Date d'ordination" InputLabelProps={{ shrink: true }} value={form.dateOrdination} onChange={(e) => handleForm('dateOrdination', e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select label="Grade" value={form.grade} onChange={(e) => handleForm('grade', e.target.value)}>
                  {grades.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Responsabilité</InputLabel>
                <Select label="Responsabilité" value={form.responsabilite} onChange={(e) => handleForm('responsabilite', e.target.value)}>
                  {responsabilites.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Fonction" value={form.fonction} onChange={(e) => handleForm('fonction', e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Téléphone" value={form.telephone} onChange={(e) => handleForm('telephone', e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={form.email} onChange={(e) => handleForm('email', e.target.value)} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Poste</InputLabel>
                <Select label="Poste" value={form.posteId} onChange={(e) => handleForm('posteId', e.target.value)}>
                  {postes.map((item) => <MenuItem key={item.id} value={item.id}>{item.nom}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select label="Section" value={form.sectionId} onChange={(e) => handleForm('sectionId', e.target.value)}>
                  <MenuItem value="">Aucune</MenuItem>
                  {sections.map((item) => <MenuItem key={item.id} value={item.id}>{item.nom}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Paroisse</InputLabel>
                <Select label="Paroisse" value={form.paroisseId} onChange={(e) => handleForm('paroisseId', e.target.value)}>
                  <MenuItem value="">Aucune</MenuItem>
                  {paroisses.map((item) => <MenuItem key={item.id} value={item.id}>{item.nom}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.nom || !form.prenom || !form.matricule || !form.dateOrdination || !form.posteId}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
