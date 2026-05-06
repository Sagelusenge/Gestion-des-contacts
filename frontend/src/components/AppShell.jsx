import React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  Campaign,
  Dashboard,
  DarkMode,
  Description,
  LightMode,
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
import { useThemeMode } from '../context/themeMode';

const navItems = [
  { label: 'Tableau de bord', path: '/', icon: <Dashboard /> },
  { label: 'Pasteurs', path: '/pasteurs', icon: <People /> },
  { label: 'Organisation', path: '/organisation', icon: <MapsHomeWork /> },
  { label: 'États', path: '/etats', icon: <Description /> },
  { label: 'WhatsApp', path: '/communication', icon: <Campaign /> }
];

const drawerWidth = 292;

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
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const activePath = navItems.find((item) => item.path === location.pathname)?.path || '/';

  const handleLogout = async () => {
    await logout();
    setConfirmLogout(false);
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/cbca-logo.jpg"
            alt="Logo CBCA"
            sx={{ width: 54, height: 54, objectFit: 'contain' }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1, color: 'primary.dark' }}>
              CBCA
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
              Direction pastorale
            </Typography>
          </Box>
        </Box>
      </Box>
      <List sx={{ px: 1.5, py: 0 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={activePath === item.path}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 1,
              mb: 0.75,
              minHeight: 52,
              color: activePath === item.path ? 'common.white' : 'text.secondary',
              bgcolor: activePath === item.path ? 'primary.main' : 'transparent',
              boxShadow: activePath === item.path ? `0 12px 24px ${alpha(theme.palette.primary.main, 0.22)}` : 'none',
              '&:hover': {
                bgcolor: activePath === item.path ? 'primary.main' : alpha(theme.palette.primary.main, 0.08)
              },
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'common.white',
                '& .MuiListItemIcon-root': { color: 'common.white' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 42, color: activePath === item.path ? 'common.white' : 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 850 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: mode === 'dark' ? alpha('#FFFFFF', 0.05) : '#0F172A', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 900 }}>
              {(user?.firstName?.[0] || user?.email?.[0] || 'C').toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, textTransform: 'uppercase' }} noWrap>
                {roleLabels[user?.role] || 'Utilisateur'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.62)' }} noWrap>
                {user?.email || 'session CBCA'}
              </Typography>
            </Box>
            <Tooltip title="Déconnexion">
              <IconButton size="small" onClick={() => setConfirmLogout(true)} sx={{ color: 'rgba(255,255,255,0.75)' }}>
                <Logout fontSize="small" />
              </IconButton>
            </Tooltip>
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
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRightColor: 'divider' }
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
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(12px)'
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
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
            sx={{ flex: 1, maxWidth: 680 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <Tooltip title={mode === 'light' ? 'Mode sombre' : 'Mode clair'}>
            <IconButton onClick={toggleMode} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
          <Button color="inherit" onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ minWidth: 0, gap: 1 }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: 14, fontWeight: 900 }}>
              {(user?.firstName?.[0] || user?.email?.[0] || 'C').toUpperCase()}
            </Avatar>
            {!isMobile && (
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 900, lineHeight: 1 }}>
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'Cadre CBCA'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {roleLabels[user?.role] || 'Utilisateur'}
                </Typography>
              </Box>
            )}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <ListItemIcon><Security fontSize="small" /></ListItemIcon>
              {roleLabels[user?.role] || 'Session sécurisée'}
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setConfirmLogout(true)}>
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
          {navItems.slice(0, 4).map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} value={item.path} icon={item.icon} />
          ))}
        </BottomNavigation>
      )}

      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmer la déconnexion</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Voulez-vous vraiment fermer cette session CBCA ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogout(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleLogout}>Se déconnecter</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
