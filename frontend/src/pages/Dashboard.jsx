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
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import {
  AccountTree,
  AdminPanelSettings,
  Assessment,
  Campaign,
  CheckCircle,
  Groups,
  MapsHomeWork,
  NotificationsActive,
  TrendingUp,
  VerifiedUser,
  WarningAmber
} from '@mui/icons-material';
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

const palette = ['#6D3DF5', '#2BB3A3', '#FF8A4C', '#8BCF45', '#F05FA8'];

function MetricCard({ item, index }) {
  const color = palette[index % palette.length];

  return (
    <Paper
      sx={{
        p: 2,
        minHeight: 154,
        borderRadius: '8px',
        color: 'common.white',
        border: 0,
        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.82)} 100%)`,
        boxShadow: `0 18px 40px ${alpha(color, 0.22)}`
      }}
    >
      <Stack spacing={2} justifyContent="space-between" sx={{ height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '8px',
              bgcolor: 'rgba(255,255,255,0.18)'
            }}
          >
            {item.icon}
          </Box>
          <TrendingUp fontSize="small" sx={{ opacity: 0.82 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.84)', fontWeight: 800 }}>
            {item.label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 950, mt: 0.5 }}>
            {item.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.76)' }}>
            {item.caption}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
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
    () => Math.max(...geographie.map((poste) => poste.pasteurs || 0), 1),
    [geographie]
  );

  const gradeEntries = Object.entries(stats.pasteurParGrade || {});
  const activeRate = stats.totalPasteurs
    ? Math.round(((stats.pasteurParStatut?.Actif || 0) / stats.totalPasteurs) * 100)
    : 0;

  const topCards = [
    { label: 'Effectif pastoral', value: stats.totalPasteurs, caption: 'Fiches centralisees', icon: <Groups /> },
    { label: 'Postes actifs', value: stats.totalPostes, caption: 'Ressorts geographiques', icon: <MapsHomeWork /> },
    { label: 'Sections pastorales', value: stats.totalSections, caption: 'Coordination locale', icon: <AccountTree /> },
    { label: 'Paroisses couvertes', value: stats.totalParoisses, caption: 'Presence communautaire', icon: <VerifiedUser /> }
  ];

  return (
    <AppShell>
      <Stack spacing={3}>
        {loading && <LinearProgress />}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={9}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                {topCards.map((item, index) => (
                  <Grid item xs={12} sm={6} xl={3} key={item.label}>
                    <MetricCard item={item} index={index} />
                  </Grid>
                ))}
              </Grid>

              <Paper
                sx={{
                  p: { xs: 2.5, md: 3 },
                  minHeight: 178,
                  borderRadius: '8px',
                  color: 'common.white',
                  overflow: 'hidden',
                  position: 'relative',
                  border: 0,
                  background: 'linear-gradient(135deg, #5F33EF 0%, #7447F8 52%, #3AAAF2 100%)'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    right: { xs: -30, md: 22 },
                    top: 20,
                    width: { xs: 120, md: 210 },
                    height: { xs: 120, md: 210 },
                    borderRadius: '50%',
                    border: '32px solid rgba(255,255,255,0.12)'
                  }}
                />
                <Stack spacing={2} sx={{ position: 'relative', maxWidth: 680 }}>
                  <Chip
                    label="Pilotage pastoral CBCA"
                    sx={{
                      width: 'fit-content',
                      color: 'white',
                      fontWeight: 900,
                      bgcolor: 'rgba(255,255,255,0.16)'
                    }}
                  />
                  <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1.08 }}>
                    Suivi national des pasteurs, des postes et des communications strategiques
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button variant="contained" color="secondary" startIcon={<Campaign />} onClick={() => navigate('/communication')}>
                      Diffuser WhatsApp
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AdminPanelSettings />}
                      sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                      onClick={() => navigate('/organisation')}
                    >
                      Gerer la structure
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 950 }}>
                      Couverture par poste
                    </Typography>
                    <Typography color="text.secondary">
                      Lecture rapide du nombre de pasteurs suivis par ressort.
                    </Typography>
                  </Box>
                  <Chip icon={<Assessment />} label="Rapport 2026" color="primary" />
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.max(geographie.length, 1)}, minmax(56px, 1fr))`,
                    gap: { xs: 1, md: 2 },
                    alignItems: 'end',
                    minHeight: 260,
                    pt: 2
                  }}
                >
                  {geographie.map((poste, index) => {
                    const height = 56 + ((poste.pasteurs || 0) / maxPostePasteurs) * 150;
                    const color = palette[index % palette.length];
                    return (
                      <Box key={poste.id || poste.poste} sx={{ textAlign: 'center' }}>
                        <Box sx={{ height: 216, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', mb: 1 }}>
                          <Box
                            sx={{
                              width: { xs: 30, md: 42 },
                              height,
                              borderRadius: '8px 8px 2px 2px',
                              bgcolor: color,
                              boxShadow: `0 14px 28px ${alpha(color, 0.25)}`
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 900 }}>
                          {poste.code || poste.poste}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {poste.pasteurs || 0}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Stack spacing={2.5}>
              <Paper sx={{ p: 2, borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 950 }}>Couverture</Typography>
                  <Chip label={`${geographie.length} postes`} size="small" />
                </Box>
                <Stack spacing={1.25}>
                  {geographie.slice(0, 4).map((poste) => (
                    <Box
                      key={poste.id || poste.code}
                      sx={{
                        p: 1.25,
                        borderRadius: '8px',
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25
                      }}
                    >
                      <CheckCircle color="success" fontSize="small" />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 900 }} noWrap>
                          {poste.poste}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {poste.sections} sections / {poste.paroisses} paroisses
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: '8px', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 950, mb: 2 }}>Sante administrative</Typography>
                <Box
                  sx={{
                    width: 174,
                    height: 174,
                    mx: 'auto',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: `conic-gradient(${theme.palette.primary.main} ${activeRate * 3.6}deg, ${alpha(theme.palette.primary.main, 0.1)} 0deg)`
                  }}
                >
                  <Box sx={{ width: 128, height: 128, borderRadius: '50%', bgcolor: 'background.paper', display: 'grid', placeItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 950, color: 'primary.main' }}>
                      {activeRate}%
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 2, fontWeight: 900 }}>Pasteurs actifs</Typography>
                <Typography variant="body2" color="text.secondary">
                  Controle des fiches et des statuts
                </Typography>
                <Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/pasteurs')}>
                  Voir les fiches
                </Button>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <NotificationsActive color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 950 }}>
                    {alertes.length} alerte(s)
                  </Typography>
                </Box>
                <Stack spacing={1.25}>
                  {alertes.slice(0, 3).map((alerte) => (
                    <Alert key={alerte.id || alerte.pasteur} severity="warning" icon={<WarningAmber />} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {alerte.pasteur}
                      </Typography>
                      <Typography variant="caption">{alerte.joursRestants} jour(s) restants</Typography>
                    </Alert>
                  ))}
                  {!alertes.length && <Typography color="text.secondary">Aucune alerte active.</Typography>}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2.5, borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ fontWeight: 950, mb: 2 }}>
            Repartition par grade
          </Typography>
          <Grid container spacing={2}>
            {gradeEntries.map(([grade, value]) => (
              <Grid item xs={12} sm={6} md={3} key={grade}>
                <Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'action.hover' }}>
                  <Typography sx={{ fontWeight: 900 }}>{grade}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 950, my: 1 }}>
                    {value}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalPasteurs ? (value / stats.totalPasteurs) * 100 : 0}
                    sx={{ height: 8, borderRadius: '8px' }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Stack>
    </AppShell>
  );
}
