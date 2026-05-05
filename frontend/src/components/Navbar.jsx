import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          CBCA - Gestion des Pasteurs
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Avatar sx={{ cursor: 'pointer', bgcolor: '#dc004e' }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
          <Button color="inherit" onClick={handleMenuOpen}>
            Menu
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => navigate('/pasteurs')}>Pasteurs</MenuItem>
            <MenuItem onClick={() => navigate('/mouvements')}>Mouvements</MenuItem>
            {user?.role === 'SUPER_ADMIN' && (
              <MenuItem onClick={() => navigate('/parametres')}>Paramètres</MenuItem>
            )}
            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
