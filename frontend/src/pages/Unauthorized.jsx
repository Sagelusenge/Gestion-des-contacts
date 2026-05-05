import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 900 }}>
          403
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Accès refusé
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Votre rôle ne permet pas d'accéder à cette section.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Retour au pilotage
        </Button>
      </Box>
    </Container>
  );
}
