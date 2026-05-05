import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Lock, Security } from '@mui/icons-material';
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'grid', placeItems: 'center', px: 2 }}>
      <Grid container sx={{ maxWidth: 1080, minHeight: { md: 620 }, boxShadow: 2, borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 5 }, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline">CBCA - Accès interne</Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, lineHeight: 1.05 }}>
              Pilotage pastoral stratégique
            </Typography>
            <Typography sx={{ mt: 2, maxWidth: 440, opacity: 0.9 }}>
              Plateforme réservée au Représentant Légal, aux Secrétaires Communautaires et aux administrateurs autorisés.
            </Typography>
          </Box>
          <Stack spacing={1.5} sx={{ mt: 5 }}>
            {['Authentification administrateur', 'Accès par rôle et poste', 'Journalisation des modifications'].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Security fontSize="small" />
                <Typography>{item}</Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 5 }, display: 'flex', alignItems: 'center' }}>
          <Paper elevation={0} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
                <Lock />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Connexion sécurisée</Typography>
                <Typography color="text.secondary">Compte administrateur requis</Typography>
              </Box>
            </Box>

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
              <Button fullWidth variant="contained" type="submit" sx={{ mt: 3, py: 1.25 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrer dans le cockpit'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
