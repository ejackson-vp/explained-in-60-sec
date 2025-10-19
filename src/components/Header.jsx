import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  AccountCircle,
  Mic,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ themeMode, onThemeToggle, onLoginClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseMenu();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCreateClick = () => {
    if (user) {
      navigate('/generate');
    } else {
      onLoginClick();
    }
    setMobileOpen(false);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleCreateClick}>
            <ListItemText primary="Create your own" />
          </ListItemButton>
        </ListItem>
        {user && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(30, 30, 30, 0.8)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <Mic 
              sx={{ 
                fontSize: { xs: 28, sm: 36 },
                color: 'primary.main',
              }} 
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  color: 'text.primary',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Explained
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    color: 'text.primary',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  in
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    color: 'primary.main',
                    letterSpacing: '0.05em',
                  }}
                >
                  60
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  color: 'text.primary',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  mt: 0.25,
                }}
              >
                Seconds
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={onThemeToggle}
              color="inherit"
              aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
            >
              {themeMode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>

            {!isMobile && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateClick}
                  sx={{ ml: 1 }}
                >
                  Create yours
                </Button>

                {user ? (
                  <>
                    <IconButton
                      onClick={handleProfileMenu}
                      aria-label="Account menu"
                      aria-controls="account-menu"
                      aria-haspopup="true"
                    >
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        sx={{ width: 36, height: 36 }}
                      />
                    </IconButton>
                    <Menu
                      id="account-menu"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleCloseMenu}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<AccountCircle />}
                    onClick={onLoginClick}
                    sx={{ ml: 1 }}
                  >
                    Login
                  </Button>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

