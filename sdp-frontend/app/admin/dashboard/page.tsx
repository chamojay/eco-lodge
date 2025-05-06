'use client';
import React, { useState } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, CssBaseline, 
  AppBar, Typography, IconButton, Button, Avatar, styled 
} from '@mui/material';
import {
  Menu as MenuIcon, ChevronLeft, Dashboard, People, CalendarToday, Hotel, Restaurant, Assessment, Logout
} from '@mui/icons-material';
import AdminRooms from '@/components/Admin-Rooms/page';
import AdminExtraCharges from '@/components/Admin-Extracharges/page';

type MenuItemType = {
  id: string;
  label: string;
  icon: JSX.Element;
};

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{ open: boolean }>(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    marginTop: theme.spacing(4),
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AdminDashboard: React.FC = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [selectedMenu, setSelectedMenu] = useState<string>('overview');

  const handleDrawerToggle = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login/staff';
  };

  const menuItems: MenuItemType[] = [
    { id: 'overview', label: 'Overview', icon: <Dashboard /> },
    { id: 'users', label: 'User Management', icon: <People /> },
    { id: 'rooms', label: 'Room Management', icon: <Hotel /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarToday /> },
    { id: 'extra-charges', label: 'Extra Charges', icon: <Assessment /> },
    { id: 'restaurant', label: 'Restaurant Orders', icon: <Restaurant /> },
    { id: 'reports', label: 'Reports', icon: <Assessment /> },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'rooms':
        return <AdminRooms />;
      case'extra-charges':
        return <AdminExtraCharges />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Dashboard Overview
            </Typography>
          </Box>
        );
      
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1a472a' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
            Hotel Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1a472a',
            color: 'white',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Avatar 
            src="/logo.png" 
            sx={{ width: open ? 80 : 40, height: open ? 80 : 40, mb: 1, transition: '0.3s', backgroundColor: 'white' }}
          />
          <Typography variant="h6" sx={{ opacity: open ? 1 : 0, transition: '0.3s' }}>
            Hotel Algama Ella
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton 
                selected={selectedMenu === item.id} 
                onClick={() => setSelectedMenu(item.id)}
                sx={{ '&.Mui-selected': { backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#2e7d32' } } }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                {open && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<Logout sx={{ color: 'white' }} />} 
            onClick={handleLogout}
            sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#9a0007' } }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {renderContent()}
      </Main>
    </Box>
  );
};

export default AdminDashboard;