import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { AdminPanelSettings, Lock, Shield, VerifiedUser } from '@mui/icons-material';
import { useAuthStore } from '../context/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(formData.email, formData.password);
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        bgcolor: 'primary.dark',
        backgroundImage: 'linear-gradient(135deg, #073D73 0%, #0B5CAB 52%, #F5F7FA 52%, #F5F7FA 100%)'
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 1120,
          minHeight: { md: 650 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          overflow: 'hidden',
          borderRadius: 1
        }}
      >
        <Box sx={{ p: { xs: 3, md: 5 }, color: 'primary.contrastText', bgcolor: 'primary.main', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 48, height: 48, border: '1px solid rgba(255,255,255,.35)', borderRadius: 1, display: 'grid', placeItems: 'center' }}>
                <Shield />
              </Box>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.85 }}>Accès restreint</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>CBCA Pilotage</Typography>
              </Box>
            </Stack>

            <Typography variant="h3" sx={{ mt: 7, fontWeight: 900, lineHeight: 1.05, maxWidth: 520 }}>
              Direction pastorale, données fiables, communication maîtrisée.
            </Typography>
            <Typography sx={{ mt: 2.5, maxWidth: 520, opacity: 0.9, fontSize: 17 }}>
              Outil interne pour le Représentant Légal, les Secrétaires Communautaires et les responsables autorisés.
            </Typography>
          </Box>

          <Stack spacing={1.25} sx={{ mt: 6 }}>
            {[
              ['RBAC', 'Super-Admin, Admin de Poste et lecture contrôlée'],
              ['Traçabilité', 'Journal des modifications sensibles'],
              ['Communication', 'Diffusion ciblée vers les boîtes internes']
            ].map(([title, text]) => (
              <Box key={title} sx={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 1.5, alignItems: 'center' }}>
                <VerifiedUser fontSize="small" />
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.82 }}>{text}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 3, md: 5 }, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <Box sx={{ width: 48, height: 48, display: 'grid', placeItems: 'center', bgcolor: 'primary.light', color: 'primary.dark', borderRadius: 1 }}>
                <AdminPanelSettings />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>Connexion</Typography>
                <Typography color="text.secondary">Session administrative sécurisée</Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2.5 }} />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email institutionnel"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                disabled={loading}
                required
              />
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                disabled={loading}
                required
              />
              <Button fullWidth variant="contained" type="submit" startIcon={!loading && <Lock />} sx={{ mt: 3, py: 1.35 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Ouvrir le tableau de bord'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
