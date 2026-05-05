import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
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
import { pasteurService } from '../services';
import { grades, mockPasteurs, statuts } from '../data/mockData';

export default function Pasteurs() {
  const navigate = useNavigate();
  const [pasteurs, setPasteurs] = useState(mockPasteurs);
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [statut, setStatut] = useState('');

  useEffect(() => {
    const loadPasteurs = async () => {
      try {
        const response = await pasteurService.list({ limit: 100 });
        setPasteurs(response.data.data.pasteurs);
      } catch {
        setPasteurs(mockPasteurs);
      }
    };

    loadPasteurs();
  }, []);

  const filteredPasteurs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return pasteurs.filter((pasteur) => {
      const matchesSearch = !term || [
        pasteur.nom,
        pasteur.prenom,
        pasteur.matricule,
        pasteur.fonction,
        pasteur.Poste?.nom,
        pasteur.Paroisse?.nom
      ].some((value) => value?.toLowerCase().includes(term));

      return matchesSearch && (!grade || pasteur.grade === grade) && (!statut || pasteur.statut === statut);
    });
  }, [grade, pasteurs, search, statut]);

  return (
    <AppShell onSearch={setSearch}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="primary">Registre interne</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Pasteurs et responsables</Typography>
            <Typography color="text.secondary">
              Recherche par matricule, poste, paroisse, grade ou fonction pastorale.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />}>
            Ajouter
          </Button>
        </Box>

        <Paper sx={{ p: 2, borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Recherche" value={search} onChange={(event) => setSearch(event.target.value)} />
            </Grid>
            <Grid item xs={6} md={3}>
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
    </AppShell>
  );
}
