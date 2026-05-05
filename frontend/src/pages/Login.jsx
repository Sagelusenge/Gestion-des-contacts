import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Lock } from '@mui/icons-material';
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
        py: 5,
        backgroundColor: '#F5F7FA',
        backgroundImage: 'linear-gradient(180deg, rgba(11,92,171,0.10) 0%, rgba(245,247,250,0) 45%)'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 1,
          borderTop: '5px solid',
          borderTopColor: 'primary.main',
          boxShadow: '0 20px 50px rgba(23,32,51,0.10)'
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <Box
              component="img"
              src="/cbca-logo.jpg"
              alt="Logo CBCA"
              sx={{ width: 92, height: 92, objectFit: 'contain' }}
            />
            <Box>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                Accès institutionnel
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                CBCA Pilotage
              </Typography>
              <Typography color="text.secondary">
                Connexion réservée aux responsables autorisés
              </Typography>
            </Box>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Email institutionnel"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                disabled={loading}
                required
              />
              <Button fullWidth variant="contained" type="submit" startIcon={!loading && <Lock />} sx={{ py: 1.35 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
