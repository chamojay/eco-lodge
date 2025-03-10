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
  TextField,
} from '@mui/material';
import {
  Menu,
  ChevronLeft,
  Event,
  MeetingRoom,
  ExitToApp,
  PersonAdd,
  CalendarToday,
  Assignment,
  Logout,
  Add
} from '@mui/icons-material';
// Commented out DateCalendar import due to error
// import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { styled } from '@mui/material/styles';

// Define types for the state data
interface Room {
  number: number;
  reserved: boolean;
  customer: string | null;
  checkIn: string | null;
  checkOut: string | null;
}

const drawerWidth = 240;
const collapsedDrawerWidth = 56;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }: { theme: any, open: boolean }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    marginTop: theme.spacing(8),
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

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

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
    if (room.reserved) {
      setRoomDetailsOpen(true);
    } else {
      setCheckInOpen(true);
    }
  };

  const handleCheckIn = () => {
    setCheckInOpen(false);
  };

  const renderContent = () => {
    switch(selectedMenu) {
      case 'rooms':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Room Status</Typography>
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
            <Typography variant="h4" gutterBottom>Reservation Calendar</Typography>
            <Paper sx={{ p: 2 }}>
              {/* Commented out DateCalendar usage due to import error */}
              {/* <DateCalendar
                sx={{ width: '100%' }}
                showDaysOutsideCurrentMonth
                fixedWeekNumber={6}
              /> */}
              <Typography variant="body1">
                Calendar component is temporarily disabled.
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reception Dashboard</Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeft /> : <Menu />}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
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
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedDrawerWidth,
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: open 
                  ? theme.transitions.duration.enteringScreen
                  : theme.transitions.duration.leavingScreen,
              }),
            top: '64px',
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          p: open ? 2 : 1,
          minHeight: '64px !important'
        }}>
          <Avatar 
            src="/logo.png"
            sx={{ 
              width: open ? 56 : 40,
              height: open ? 56 : 40,
              transition: '0.3s',
              mb: open ? 1 : 0
            }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: open ? 1 : 0,
              transition: '0.3s',
              fontSize: open ? '1.25rem' : '0rem'
            }}
          >
            Hotel Algama
          </Typography>
        </Toolbar>
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                sx={{
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  minHeight: 48,
                }}
                selected={selectedMenu === item.id}
                onClick={() => setSelectedMenu(item.id)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    transition: 'opacity 0.3s' 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ 
          p: open ? 2 : 1,
          transition: '0.3s' 
        }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            sx={{
              justifyContent: open ? 'flex-start' : 'center',
              px: 2.5,
              minHeight: 48,
            }}
            onClick={handleLogout}
          >
            <Logout sx={{ mr: open ? 2 : 0 }} />
            <span style={{ 
              opacity: open ? 1 : 0, 
              transition: 'opacity 0.3s',
              whiteSpace: 'nowrap',
            }}>
              Log out
            </span>
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

export default ReceptionDashboard;
