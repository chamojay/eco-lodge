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
  Avatar,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Menu,
  ChevronLeft,
  MeetingRoom,
  ExitToApp,
  PersonAdd,
  CalendarToday,
  Assignment,
  Logout,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface Room {
  number: number;
  reserved: boolean;
  customer: string | null;
  checkIn: string | null;
  checkOut: string | null;
}

const drawerWidth = 240;
const collapsedDrawerWidth = 56;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{ open: boolean }>(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    marginTop: theme.spacing(8),
    backgroundColor: '#ffffff',
    minHeight: 'calc(100vh - 64px)', // Full height minus app bar
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    ...(!open && {
      marginLeft: `${collapsedDrawerWidth}px`,
    }),
  }),
);

const ReceptionDashboard: React.FC = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [selectedMenu, setSelectedMenu] = useState<string>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInOpen, setCheckInOpen] = useState<boolean>(false);
  const [roomDetailsOpen, setRoomDetailsOpen] = useState<boolean>(false);

  const [rooms, setRooms] = useState<Room[]>([
    { number: 101, reserved: false, customer: null, checkIn: null, checkOut: null },
    { number: 102, reserved: true, customer: 'John Doe', checkIn: '2023-08-15', checkOut: '2023-08-20' },
  ]);

  const handleDrawerToggle = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login/staff';
  };

  const menuItems = [
    { id: 'checkin', label: 'Check-In', icon: <PersonAdd /> },
    { id: 'checkout', label: 'Check-Out', icon: <ExitToApp /> },
    { id: 'rooms', label: 'Rooms', icon: <MeetingRoom /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarToday /> },
    { id: 'reports', label: 'Reports', icon: <Assignment /> },
  ];

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    room.reserved ? setRoomDetailsOpen(true) : setCheckInOpen(true);
  };

  const handleCheckIn = () => setCheckInOpen(false);

  const renderContent = () => {
    switch(selectedMenu) {
      case 'rooms':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Room Status
            </Typography>
            <Grid container spacing={3}>
              {rooms.map((room) => (
                <Grid item key={room.number} xs={4}>
                  <Paper
                    onClick={() => handleRoomClick(room)}
                    sx={{
                      p: 2,
                      height: 100,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: room.reserved ? '#ffebee' : '#e8f5e9',
                      '&:hover': { transform: 'scale(1.05)' },
                      transition: 'all 0.3s',
                    }}
                  >
                    <Typography variant="h5" color={room.reserved ? 'error' : 'success.main'}>
                      Room {room.number}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 'calendar':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Reservation Calendar
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body1">
                Calendar component is temporarily disabled.
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Reception Dashboard
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#ffffff' // Ensures full background coverage
    }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#1a472a'
      }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeft /> : <Menu />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
            Reception Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedDrawerWidth,
            backgroundColor: '#1a472a',
            color: 'white',
            top: '64px',
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: open ? 2 : 1,
          transition: '0.3s'
        }}>
          <Avatar 
            src="/logo.png"
            sx={{ 
              width: open ? 56 : 40,
              height: open ? 56 : 40,
              mb: 1,
              backgroundColor: 'white'
            }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: open ? 1 : 0,
              transition: '0.3s',
              color: 'white'
            }}
          >
            Hotel Algama
          </Typography>
        </Box>
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={selectedMenu === item.id}
                onClick={() => setSelectedMenu(item.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#2e7d32',
                    '&:hover': { backgroundColor: '#2e7d32' }
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                {open && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogout}
            sx={{ 
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#9a0007' }
            }}
          >
            <Logout sx={{ mr: open ? 1 : 0 }} />
            {open && 'Logout'}
          </Button>
        </Box>
      </Drawer>
      <Main open={open}>
        <Toolbar /> {/* Creates spacing under app bar */}
        {renderContent()}
      </Main>

      <Dialog open={checkInOpen} onClose={() => setCheckInOpen(false)}>
        <DialogTitle>Check-In Guest</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Guest Name"
            fullWidth
            sx={{ my: 2 }}
          />
          <TextField
            margin="dense"
            label="Check-In Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ my: 2 }}
          />
          <TextField
            margin="dense"
            label="Check-Out Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ my: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCheckInOpen(false)}
            color="error"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCheckIn}
            sx={{
              backgroundColor: '#1a472a',
              color: 'white',
              '&:hover': { backgroundColor: '#2e7d32' }
            }}
          >
            Check-In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceptionDashboard;