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
  AdminPanelSettings,
  Campaign,
  CheckCircle,
  Groups,
  MapsHomeWork,
  Schedule,
  TrendingUp,
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

const cardGradients = [
  ['#7C3AED', '#4F46E5'],
  ['#2BB3A3', '#178D81'],
  ['#FFB189', '#FF7D3F'],
  ['#A7D47F', '#65B82D']
];

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
    () => Math.max(...geographie.map((poste) => poste.pasteurs), 1),
    [geographie]
  );

  const gradeEntries = Object.entries(stats.pasteurParGrade || {});
  const activeRate = stats.totalPasteurs
    ? Math.round(((stats.pasteurParStatut?.Actif || 0) / stats.totalPasteurs) * 100)
    : 0;

  const topCards = [
    { label: 'Effectif pastoral', value: stats.totalPasteurs, caption: 'Pasteurs suivis', icon: <Groups /> },
    { label: 'Postes enregistrés', value: stats.totalPostes, caption: 'Territoires actifs', icon: <MapsHomeWork /> },
    { label: 'Sections pastorales', value: stats.totalSections, caption: 'Coordination locale', icon: <AdminPanelSettings /> },
    { label: 'Paroisses couvertes', value: stats.totalParoisses, caption: 'Présence communautaire', icon: <Schedule /> }
  ];

  return (
    <AppShell>
      <Stack spacing={3}>
        {loading && <LinearProgress />}

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={9}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                {topCards.map((item, index) => (
                  <Grid item xs={12} sm={6} xl={3} key={item.label}>
                    <Paper
                      sx={{
                        p: 2,
                        minHeight: 154,
                        borderRadius: 3,
                        color: 'common.white',
                        border: 0,
                        background: `linear-gradient(135deg, ${cardGradients[index][0]}, ${cardGradients[index][1]})`,
                        boxShadow: `0 18px 40px ${alpha(cardGradients[index][1], 0.22)}`
                      }}
                    >
                      <Stack spacing={2} justifyContent="space-between" sx={{ height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.18)' }}>
                            {item.icon}
                          </Box>
                          <TrendingUp fontSize="small" sx={{ opacity: 0.82 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', fontWeight: 800 }}>{item.label}</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 950, mt: 0.5 }}>{item.value}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.76)' }}>{item.caption}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Paper
                sx={{
                  p: { xs: 2.5, md: 3 },
                  minHeight: 180,
                  borderRadius: 3,
                  color: 'common.white',
                  overflow: 'hidden',
                  position: 'relative',
                  border: 0,
                  background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 48%, #4F46E5 100%)'
                }}
              >
                <Box sx={{ position: 'absolute', right: { xs: -50, md: 28 }, top: 8, fontSize: { xs: 98, md: 132 }, opacity: 0.18 }}>✦</Box>
                <Box sx={{ position: 'absolute', right: { xs: 20, md: 120 }, bottom: -18, fontSize: { xs: 80, md: 116 }, opacity: 0.2 }}>●</Box>
                <Stack spacing={2} sx={{ position: 'relative', maxWidth: 620 }}>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.82)' }}>Priorité de la direction</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1.08 }}>
                    Suivi des affectations, communication ciblée et couverture pastorale
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button variant="contained" color="secondary" startIcon={<Campaign />} onClick={() => navigate('/communication')}>
                      Diffuser un message
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: 'rgba(255,255,255,0.88)' } }} onClick={() => navigate('/organisation')}>
                      Modifier la structure
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 950 }}>Couverture par poste</Typography>
                    <Typography color="text.secondary">Nombre de pasteurs suivis par territoire</Typography>
                  </Box>
                  <Chip label="Année 2026" color="primary" />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(geographie.length, 1)}, minmax(56px, 1fr))`, gap: { xs: 1, md: 2 }, alignItems: 'end', minHeight: 260, pt: 2 }}>
                  {geographie.map((poste, index) => {
                    const height = 56 + (poste.pasteurs / maxPostePasteurs) * 150;
                    const colors = ['#6D28D9', '#2BB3A3', '#FF7D3F', '#8ED34F', '#EC4899'];
                    return (
                      <Box key={poste.id || poste.poste} sx={{ textAlign: 'center' }}>
                        <Box sx={{ height: 216, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', mb: 1 }}>
                          <Box
                            sx={{
                              width: { xs: 30, md: 42 },
                              height,
                              borderRadius: 999,
                              bgcolor: colors[index % colors.length],
                              boxShadow: `0 14px 28px ${alpha(colors[index % colors.length], 0.25)}`
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 900 }}>{poste.code}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{poste.pasteurs}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Stack spacing={2.5}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 950 }}>Rapport de couverture</Typography>
                  <Chip label={`${geographie.length} postes`} size="small" />
                </Box>
                <Stack spacing={1.25}>
                  {geographie.slice(0, 3).map((poste) => (
                    <Box key={poste.id || poste.code} sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 900 }} noWrap>{poste.poste}</Typography>
                        <Typography variant="caption" color="text.secondary">{poste.sections} sections / {poste.paroisses} paroisses</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 950, mb: 2 }}>Santé administrative</Typography>
                <Box sx={{ width: 174, height: 174, mx: 'auto', borderRadius: '50%', display: 'grid', placeItems: 'center', background: `conic-gradient(${theme.palette.primary.main} ${activeRate * 3.6}deg, ${alpha(theme.palette.primary.main, 0.1)} 0deg)` }}>
                  <Box sx={{ width: 128, height: 128, borderRadius: '50%', bgcolor: 'background.paper', display: 'grid', placeItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 950, color: 'primary.main' }}>{activeRate}%</Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 2, fontWeight: 900 }}>Pasteurs actifs</Typography>
                <Typography variant="body2" color="text.secondary">Contrôle des fiches et des statuts</Typography>
                <Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/pasteurs')}>Voir les fiches</Button>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>{alertes.length} alerte(s)</Typography>
                <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                  {alertes.slice(0, 3).map((alerte) => (
                    <Alert key={alerte.id || alerte.pasteur} severity="warning" icon={<WarningAmber />} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{alerte.pasteur}</Typography>
                      <Typography variant="caption">{alerte.joursRestants} jour(s) restants</Typography>
                    </Alert>
                  ))}
                  {!alertes.length && <Typography color="text.secondary">Aucune alerte active.</Typography>}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 950, mb: 2 }}>Répartition par grade</Typography>
          <Grid container spacing={2}>
            {gradeEntries.map(([grade, value]) => (
              <Grid item xs={12} sm={6} md={3} key={grade}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Typography sx={{ fontWeight: 900 }}>{grade}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 950, my: 1 }}>{value}</Typography>
                  <LinearProgress variant="determinate" value={stats.totalPasteurs ? (value / stats.totalPasteurs) * 100 : 0} sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Stack>
    </AppShell>
  );
}
