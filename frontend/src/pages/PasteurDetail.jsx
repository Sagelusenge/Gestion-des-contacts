import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { ArrowBack, Call, Mail, WhatsApp } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { pasteurService } from '../services';
import { mockPasteurs } from '../data/mockData';

const Info = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 700 }}>{value || '-'}</Typography>
  </Box>
);

export default function PasteurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pasteur, setPasteur] = useState(mockPasteurs.find((item) => String(item.id) === String(id)) || mockPasteurs[0]);

  useEffect(() => {
    const loadPasteur = async () => {
      try {
        const response = await pasteurService.getById(id);
        setPasteur(response.data.data);
      } catch {
        setPasteur(mockPasteurs.find((item) => String(item.id) === String(id)) || mockPasteurs[0]);
      }
    };

    loadPasteur();
  }, [id]);

  const mouvements = pasteur.Mouvements || pasteur.Mouvements || [];

  return (
    <AppShell>
      <Stack spacing={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/pasteurs')} sx={{ alignSelf: 'flex-start' }}>
          Retour
        </Button>

        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Avatar src={pasteur.photo} sx={{ width: 132, height: 132, bgcolor: 'primary.main', fontSize: 36, fontWeight: 800 }}>
                  {pasteur.prenom?.[0]}{pasteur.nom?.[0]}
                </Avatar>
                <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{pasteur.prenom} {pasteur.nom}</Typography>
                  <Typography color="text.secondary">{pasteur.fonction}</Typography>
                  <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'center' }} flexWrap="wrap" sx={{ mt: 1 }}>
                    <Chip label={pasteur.grade} color="primary" />
                    <Chip label={pasteur.statut} />
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'center' }}>
                  <Button variant="contained" startIcon={<Call />} href={pasteur.telephone ? `tel:${pasteur.telephone.replaceAll(' ', '')}` : undefined}>Appeler</Button>
                  <Button variant="outlined" startIcon={<WhatsApp />} color="success" href={pasteur.telephone ? `https://wa.me/${pasteur.telephone.replace(/\D/g, '')}` : undefined} target="_blank">WhatsApp</Button>
                  <Button variant="outlined" startIcon={<Mail />} href={pasteur.email ? `mailto:${pasteur.email}` : undefined}>Email</Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="overline" color="primary">Carte d'identité ecclésiastique</Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={6} md={4}><Info label="Matricule" value={pasteur.matricule} /></Grid>
                <Grid item xs={6} md={4}><Info label="Identifiant CBCA" value={pasteur.numeroIdentifiant} /></Grid>
                <Grid item xs={6} md={4}><Info label="Date d'ordination" value={pasteur.dateOrdination ? new Date(pasteur.dateOrdination).toLocaleDateString('fr-FR') : '-'} /></Grid>
                <Grid item xs={6} md={4}><Info label="Poste" value={pasteur.Poste?.nom} /></Grid>
                <Grid item xs={6} md={4}><Info label="Section" value={pasteur.Section?.nom} /></Grid>
                <Grid item xs={6} md={4}><Info label="Paroisse" value={pasteur.Paroisse?.nom} /></Grid>
                <Grid item xs={6} md={4}><Info label="État civil" value={pasteur.etatCivil} /></Grid>
                <Grid item xs={6} md={4}><Info label="Conjoint" value={pasteur.conjoint?.nom} /></Grid>
                <Grid item xs={12} md={4}><Info label="Téléphone" value={pasteur.telephone} /></Grid>
              </Grid>

              {pasteur.notes && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Note administrative</Typography>
                  <Typography>{pasteur.notes}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2.5, borderRadius: 1, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Formation</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {(pasteur.formation || []).map((formation, index) => (
                  <Box key={`${formation.diplome}-${index}`}>
                    <Typography sx={{ fontWeight: 700 }}>{formation.diplome}</Typography>
                    <Typography variant="body2" color="text.secondary">{formation.institution} - {formation.annee}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Historique des affectations</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                {mouvements.map((mouvement) => (
                  <Box key={mouvement.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '150px 1fr auto' }, gap: 1.5, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(mouvement.dateDebut).toLocaleDateString('fr-FR')}
                      {mouvement.dateFin ? ` - ${new Date(mouvement.dateFin).toLocaleDateString('fr-FR')}` : ''}
                    </Typography>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{mouvement.posteCible?.nom}</Typography>
                      <Typography variant="body2" color="text.secondary">{mouvement.typeMovement}</Typography>
                    </Box>
                    <Chip label={mouvement.statut} size="small" />
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
