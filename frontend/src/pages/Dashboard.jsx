import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { Campaign, Groups, Map, Moving, WarningAmber } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { dashboardService, mouvementService } from '../services';
import { dashboardFallback, mockAlertes, mockGeographie } from '../data/mockData';

const fetchOrFallback = async (request, fallback) => {
  try {
    const response = await request();
    return response.data.data;
  } catch {
    return fallback;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(dashboardFallback);
  const [geographie, setGeographie] = useState(mockGeographie);
  const [alertes, setAlertes] = useState(mockAlertes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [statsData, geoData, alertesData] = await Promise.all([
        fetchOrFallback(() => dashboardService.getStatistiques(), dashboardFallback),
        fetchOrFallback(() => dashboardService.getGeographie(), { parPosition: mockGeographie }),
        fetchOrFallback(() => mouvementService.getAlertes({ moisAvant: 6 }), { alertes: mockAlertes })
      ]);

      setStats(statsData);
      setGeographie(geoData.parPosition || mockGeographie);
      setAlertes(alertesData.alertes || mockAlertes);
      setLoading(false);
    };

    load();
  }, []);

  const maxPostePasteurs = useMemo(
    () => Math.max(...geographie.map((poste) => poste.pasteurs), 1),
    [geographie]
  );

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="primary">
              Tableau de bord national
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Pilotage stratégique des pasteurs
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
              Vue synthétique pour suivre les effectifs, les affectations, les alertes de mandat et les communications critiques.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Moving />} onClick={() => navigate('/mouvements')}>
              Mouvements
            </Button>
            <Button variant="contained" startIcon={<Campaign />} onClick={() => navigate('/communication')}>
              Communiquer
            </Button>
          </Stack>
        </Box>

        {loading && <LinearProgress />}

        <Grid container spacing={2.5}>
          {[
            { label: 'Pasteurs suivis', value: stats.totalPasteurs, icon: <Groups /> },
            { label: 'Postes', value: stats.totalPostes, icon: <Map /> },
            { label: 'Sections', value: stats.totalSections, icon: <Map /> },
            { label: 'Paroisses', value: stats.totalParoisses, icon: <Groups /> }
          ].map((item) => (
            <Grid item xs={6} md={3} key={item.label}>
              <Paper sx={{ p: 2.5, height: '100%', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    {item.label}
                  </Typography>
                  <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                </Box>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Répartition par grade
              </Typography>
              <Stack spacing={2}>
                {Object.entries(stats.pasteurParGrade || {}).map(([grade, value]) => (
                  <Box key={grade}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{grade}</Typography>
                      <Typography variant="body2" color="text.secondary">{value}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.totalPasteurs ? (value / stats.totalPasteurs) * 100 : 0}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 2.5, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Alertes de mandat
              </Typography>
              <Stack spacing={1.5}>
                {alertes.map((alerte) => (
                  <Alert
                    key={alerte.id || alerte.pasteur}
                    severity="warning"
                    icon={<WarningAmber />}
                    sx={{ alignItems: 'center' }}
                    action={<Chip label={`${alerte.joursRestants} j`} size="small" color="warning" />}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{alerte.pasteur}</Typography>
                    <Typography variant="caption">{alerte.posteCourant} - fin prévue le {new Date(alerte.dateFinMandat).toLocaleDateString('fr-FR')}</Typography>
                  </Alert>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2.5, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Couverture géographique par poste
          </Typography>
          <Grid container spacing={2}>
            {geographie.map((poste) => (
              <Grid item xs={12} md={6} xl={3} key={poste.id || poste.poste}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontWeight: 800 }}>{poste.poste}</Typography>
                    <Chip label={poste.code} size="small" />
                  </Box>
                  <LinearProgress variant="determinate" value={(poste.pasteurs / maxPostePasteurs) * 100} sx={{ height: 7, borderRadius: 1, mb: 1.5 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`${poste.pasteurs} pasteurs`} size="small" color="primary" variant="outlined" />
                    <Chip label={`${poste.sections} sections`} size="small" variant="outlined" />
                    <Chip label={`${poste.paroisses} paroisses`} size="small" variant="outlined" />
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Stack>
    </AppShell>
  );
}
