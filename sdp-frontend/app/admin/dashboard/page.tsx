'use client';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, CssBaseline, 
  AppBar, Typography, IconButton, TextField, Select, MenuItem, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, 
  InputAdornment 
} from '@mui/material';
import {
  Menu as MenuIcon, ChevronLeft, Dashboard, People, CalendarToday, Hotel, Restaurant, Assessment, 
  Logout, Add, Edit, Delete, Search
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

type RoomType = {
  RoomID: string;
  RoomNumber: string;
  Type: 'Delux' | 'Suite' | 'Standard'|'Cabana';
  Price: number;
  Description: string;
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

const API_BASE_URL = 'http://localhost:5000/api/rooms'; // Backend URL

const AdminDashboard: React.FC = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [selectedMenu, setSelectedMenu] = useState<string>('overview');
  const [newUser] = useState<UserType>({ name: '', email: '', password: '', role: 'reception' });
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomType>({ 
    RoomID: '', RoomNumber: '', Type: 'Standard', Price: 0, Description: '' 
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms from backend
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<RoomType[]>(API_BASE_URL, {
        params: { 
          search: searchTerm || undefined, 
          type: filterType === 'All' ? undefined : filterType 
        }
      });
      setRooms(response.data);
    } catch (err) {
      console.error('Fetch rooms error:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType]); // Dependencies include searchTerm and filterType for instant updates

  // Fetch rooms on mount and when search/filter changes
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]); // fetchRooms is memoized with useCallback

  const handleDrawerToggle = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login/staff';
  };

  const handleRoomDialogOpen = () => {
    setCurrentRoom({ RoomID: '', RoomNumber: '', Type: 'Standard', Price: 0, Description: '' });
    setRoomDialogOpen(true);
  };

  const handleRoomDialogClose = () => setRoomDialogOpen(false);

  const handleSaveRoom = async () => {
    const wordCount = currentRoom.Description.trim().split(/\s+/).length;
    if (wordCount > 100) {
      alert('Description cannot exceed 100 words');
      return;
    }

    setLoading(true);
    try {
      const roomData = {
        RoomNumber: currentRoom.RoomNumber,
        Type: currentRoom.Type,
        Price: currentRoom.Price,
        Description: currentRoom.Description
      };

      if (currentRoom.RoomID) {
        // Update room
        const response = await axios.put<RoomType>(`${API_BASE_URL}/${currentRoom.RoomID}`, roomData);
        setRooms(rooms.map(room => room.RoomID === currentRoom.RoomID ? response.data : room));
      } else {
        // Create room
        const response = await axios.post<RoomType>(API_BASE_URL, roomData);
        setRooms([...rooms, response.data]);
      }
      setRoomDialogOpen(false);
    } catch (err) {
      console.error('Save room error:', err);
      alert('Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room: RoomType) => {
    setCurrentRoom(room);
    setRoomDialogOpen(true);
  };

  const handleDeleteRoom = async (RoomID: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/${RoomID}`);
        setRooms(rooms.filter(room => room.RoomID !== RoomID));
      } catch (err) {
        console.error('Delete room error:', err);
        alert('Failed to delete room');
      } finally {
        setLoading(false);
      }
    }
  };

  const menuItems: MenuItemType[] = [
    { id: 'overview', label: 'Overview', icon: <Dashboard /> },
    { id: 'users', label: 'User Management', icon: <People /> },
    { id: 'rooms', label: 'Room Management', icon: <Hotel /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarToday /> },
    { id: 'restaurant', label: 'Restaurant Orders', icon: <Restaurant /> },
    { id: 'reports', label: 'Reports', icon: <Assessment /> },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'rooms':
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4" gutterBottom color="primary">
                Room Management
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleRoomDialogOpen}
                disabled={loading}
                sx={{ backgroundColor: '#1a472a', '&:hover': { backgroundColor: '#2e7d32' } }}
              >
                Add Room
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Search Rooms"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ minWidth: 150 }}
                disabled={loading}
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Delux">Delux</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Cabana">Cabana</MenuItem>
              </Select>
            </Box>

            {loading ? (
              <Typography>Loading...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#1a472a' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white' }}>Room Number</TableCell>
                      <TableCell sx={{ color: 'white' }}>Type</TableCell>
                      <TableCell sx={{ color: 'white' }}>Price</TableCell>
                      <TableCell sx={{ color: 'white' }}>Description</TableCell>
                      <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.RoomID}>
                        <TableCell>{room.RoomNumber}</TableCell>
                        <TableCell>{room.Type}</TableCell>
                        <TableCell>${room.Price}</TableCell>
                        <TableCell>{room.Description}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEditRoom(room)} sx={{ color: '#1a472a' }} disabled={loading}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteRoom(room.RoomID)} sx={{ color: '#d32f2f' }} disabled={loading}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Dialog open={roomDialogOpen} onClose={handleRoomDialogClose}>
              <DialogTitle>{currentRoom.RoomID ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Room Number"
                  fullWidth
                  value={currentRoom.RoomNumber}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, RoomNumber: e.target.value })}
                  sx={{ my: 2 }}
                />
                <Select
                  fullWidth
                  value={currentRoom.Type}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, Type: e.target.value as RoomType['Type'] })}
                  sx={{ my: 2 }}
                >
                  <MenuItem value="Delux">Delux</MenuItem>
                  <MenuItem value="Suite">Suite</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Cabana">Cabana</MenuItem>
                </Select>
                <TextField
                  margin="dense"
                  label="Price"
                  type="number"
                  fullWidth
                  value={currentRoom.Price === 0 && !currentRoom.RoomID ? '' : currentRoom.Price}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentRoom({ 
                      ...currentRoom, 
                      Price: value === '' ? 0 : Number(value)
                    });
                  }}
                  sx={{ my: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Description (max 100 words)"
                  fullWidth
                  multiline
                  rows={4}
                  value={currentRoom.Description}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, Description: e.target.value })}
                  sx={{ my: 2 }}
                  helperText={`${currentRoom.Description.trim().split(/\s+/).length}/100 words`}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleRoomDialogClose} color="error" disabled={loading}>Cancel</Button>
                <Button 
                  onClick={handleSaveRoom}
                  sx={{ backgroundColor: '#1a472a', color: 'white', '&:hover': { backgroundColor: '#2e7d32' } }}
                  disabled={loading}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
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