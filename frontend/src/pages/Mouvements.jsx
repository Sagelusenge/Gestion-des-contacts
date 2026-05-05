import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { Add, EventBusy, Moving } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { mouvementService } from '../services';
import { mockAlertes, mockPasteurs } from '../data/mockData';

const fallbackMouvements = mockPasteurs.flatMap((pasteur) =>
  (pasteur.Mouvements || []).map((mouvement) => ({ ...mouvement, Pasteur: pasteur }))
);

export default function Mouvements() {
  const [mouvements, setMouvements] = useState(fallbackMouvements);
  const [alertes, setAlertes] = useState(mockAlertes);

  useEffect(() => {
    const load = async () => {
      try {
        const [mouvementResponse, alertResponse] = await Promise.all([
          mouvementService.list(),
          mouvementService.getAlertes({ moisAvant: 6 })
        ]);
        setMouvements(mouvementResponse.data.data.mouvements);
        setAlertes(alertResponse.data.data.alertes);
      } catch {
        setMouvements(fallbackMouvements);
        setAlertes(mockAlertes);
      }
    };

    load();
  }, []);

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="primary">Affectations</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Gestion des mouvements</Typography>
            <Typography color="text.secondary">
              Suivi des affectations, transferts, promotions et fins de mandat.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />}>Nouvelle affectation</Button>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Alertes à traiter</Typography>
              <Stack spacing={1.5}>
                {alertes.map((alerte) => (
                  <Alert key={alerte.id || alerte.pasteur} severity="warning" icon={<EventBusy />}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{alerte.pasteur}</Typography>
                    <Typography variant="caption">
                      {alerte.posteCourant} - {alerte.joursRestants} jours restants
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Historique récent</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                {mouvements.map((mouvement) => (
                  <Box key={mouvement.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '42px 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
                    <Box sx={{ color: 'primary.main' }}><Moving /></Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        {mouvement.Pasteur?.prenom} {mouvement.Pasteur?.nom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mouvement.posteSource?.nom ? `${mouvement.posteSource.nom} vers ` : ''}{mouvement.posteCible?.nom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Début {new Date(mouvement.dateDebut).toLocaleDateString('fr-FR')}
                        {mouvement.dateFin ? ` - fin ${new Date(mouvement.dateFin).toLocaleDateString('fr-FR')}` : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label={mouvement.typeMovement} size="small" color="primary" variant="outlined" />
                      <Chip label={mouvement.statut} size="small" />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}
