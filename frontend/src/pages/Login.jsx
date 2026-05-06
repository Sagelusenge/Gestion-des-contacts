import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../context/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

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
        bgcolor: 'background.default',
        backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(11,92,171,0.18), transparent 34%), radial-gradient(circle at 85% 20%, rgba(182,138,44,0.18), transparent 30%)'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 3, sm: 4 },
          borderRadius: 1,
          boxShadow: '0 24px 70px rgba(15,23,42,0.16)'
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <Box component="img" src="/cbca-logo.jpg" alt="Logo CBCA" sx={{ width: 94, height: 94, objectFit: 'contain' }} />
            <Box>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 900 }}>
                Accès institutionnel
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 950, mt: 0.5 }}>
                CBCA Direction
              </Typography>
              <Typography color="text.secondary">
                Gestion pastorale sécurisée
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
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((value) => !value)} edge="end" aria-label="Afficher le mot de passe">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button fullWidth variant="contained" type="submit" startIcon={!loading && <Lock />} sx={{ py: 1.4 }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
