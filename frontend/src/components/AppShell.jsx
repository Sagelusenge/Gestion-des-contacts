import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  Assessment,
  Campaign,
  Dashboard,
  History,
  Logout,
  MapsHomeWork,
  Menu as MenuIcon,
  People,
  Search,
  Security
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAuthStore } from '../context/authStore';

const navItems = [
  { label: 'Pilotage', path: '/', icon: <Dashboard /> },
  { label: 'Pasteurs', path: '/pasteurs', icon: <People /> },
  { label: 'Paroisses', path: '/paroisses', icon: <MapsHomeWork /> },
  { label: 'Mouvements', path: '/mouvements', icon: <History /> },
  { label: 'WhatsApp', path: '/communication', icon: <Campaign /> },
  { label: 'Journal', path: '/audit', icon: <Assessment />, roles: ['SUPER_ADMIN'] }
];

const drawerWidth = 286;

const roleLabels = {
  SUPER_ADMIN: 'Représentant légal',
  PASTEUR_POSTE: 'Pasteur de poste',
  PASTEUR_SECTIONNAIRE: 'Pasteur sectionnaire',
  VIEWER: 'Lecture'
};

export default function AppShell({ children, onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));
  const activePath = visibleItems.find((item) => item.path === location.pathname)?.path || '/';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5 }}>
        <StackLogo />
      </Box>
      <Divider />
      <List sx={{ p: 1.25 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={activePath === item.path}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              minHeight: 48,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'primary.dark',
                '& .MuiListItemIcon-root': { color: 'primary.main' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activePath === item.path ? 800 : 650 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: '#FAFBFC' }}>
          <Security color="primary" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              Accès restreint
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {roleLabels[user?.role] || 'Session sécurisée'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRightColor: 'rgba(23,32,51,0.10)' }
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 68 }}>
          {isMobile && (
            <Tooltip title="Menu">
              <IconButton onClick={() => setDrawerOpen(true)} edge="start">
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <TextField
            size="small"
            placeholder="Rechercher un pasteur, un poste, une paroisse..."
            onChange={(event) => onSearch?.(event.target.value)}
            sx={{ flex: 1, maxWidth: 660 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <Button color="inherit" onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ minWidth: 0, gap: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 800 }}>
              {(user?.firstName?.[0] || user?.email?.[0] || 'C').toUpperCase()}
            </Avatar>
            {!isMobile && (
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'Cadre CBCA'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {roleLabels[user?.role] || 'Utilisateur'}
                </Typography>
              </Box>
            )}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} ModalProps={{ keepMounted: true }}>
        <Box sx={{ width: drawerWidth }}>{drawerContent}</Box>
      </Drawer>

      <Box component="main" sx={{ ml: { md: `${drawerWidth}px` }, pt: 10, pb: { xs: 9, md: 4 }, px: { xs: 2, sm: 3, lg: 4 } }}>
        {children}
      </Box>

      {isMobile && (
        <BottomNavigation
          showLabels
          value={activePath}
          onChange={(_, value) => navigate(value)}
          sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, borderTop: '1px solid', borderColor: 'divider', zIndex: 1200 }}
        >
          {visibleItems.slice(0, 4).map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} value={item.path} icon={item.icon} />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}

function StackLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src="/cbca-logo.jpg"
        alt="Logo CBCA"
        sx={{ width: 50, height: 50, objectFit: 'contain' }}
      />
      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>
          CBCA Interne
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.05 }}>
          Pilotage pastoral
        </Typography>
      </Box>
    </Box>
  );
}
