'use client';
import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  CssBaseline, 
  AppBar, 
  Typography, 
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  People,
  CalendarToday,
  Hotel,
  Restaurant,
  Assessment,
  Logout,
  Add
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Define types
type MenuItemType = {
  id: string;
  label: string;
  icon: JSX.Element;
};

type UserType = {
  name: string;
  email: string;
  password: string;
  role: 'reception' | 'cashier' | 'admin';
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
  const [newUser, setNewUser] = useState<UserType>({
    name: '',
    email: '',
    password: '',
    role: 'reception',
  });

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login/staff';
  };

  const menuItems: MenuItemType[] = [
    { id: 'overview', label: 'Overview', icon: <Dashboard /> },
    { id: 'users', label: 'User Management', icon: <People /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarToday /> },
    { id: 'rooms', label: 'Rooms', icon: <Hotel /> },
    { id: 'restaurant', label: 'Restaurant Orders', icon: <Restaurant /> },
    { id: 'reports', label: 'Reports', icon: <Assessment /> },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'users':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              User Management
            </Typography>
            <Box component="form" sx={{ mb: 4, display: 'flex', gap: 2 }}>
              <TextField
                label="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                fullWidth
              />
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserType['role'] })}
              >
                <MenuItem value="reception">Reception</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              <Button variant="contained" startIcon={<Add />} onClick={() => window.location.href = '/admin/adduser'}>
                Add User
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Sample Data - Replace with API data */}
                  <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>john@hotel.com</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>
                      <Button variant="outlined" color="primary" sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Dashboard Overview
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
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
            sx={{ width: open ? 80 : 40, height: open ? 80 : 40, mb: 1, transition: '0.3s' }}
          />
          <Typography variant="h6" sx={{ opacity: open ? 1 : 0, transition: '0.3s' }}>
            Hotel Algama Ella
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton selected={selectedMenu === item.id} onClick={() => setSelectedMenu(item.id)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                {open && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button fullWidth variant="contained" color="error" startIcon={<Logout />} onClick={handleLogout}>
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
