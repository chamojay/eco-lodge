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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
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
  Add,
  Edit,
  Delete,
  Search,
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
  id: string;
  roomNumber: string;
  type: 'Cabana' | 'Delux' | 'Suite' | 'Standard';
  price: number;
  description: string;
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
  const [newUser, setNewUser] = useState<UserType>({
    name: '',
    email: '',
    password: '',
    role: 'reception',
  });
  const [rooms, setRooms] = useState<RoomType[]>([
    { id: '1', roomNumber: '101', type: 'Standard', price: 100, description: 'Cozy standard room with basic amenities' },
    { id: '2', roomNumber: '201', type: 'Delux', price: 200, description: 'Spacious deluxe room with mountain view' },
  ]);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomType>({ 
    id: '', 
    roomNumber: '', 
    type: 'Standard', 
    price: 0, 
    description: '' 
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login/staff';
  };

  const handleRoomDialogOpen = () => {
    setCurrentRoom({ id: '', roomNumber: '', type: 'Standard', price: 0, description: '' });
    setRoomDialogOpen(true);
  };

  const handleRoomDialogClose = () => {
    setRoomDialogOpen(false);
  };

  const handleSaveRoom = () => {
    const wordCount = currentRoom.description.trim().split(/\s+/).length;
    if (wordCount > 100) {
      alert('Description cannot exceed 100 words');
      return;
    }
    
    if (currentRoom.id) {
      setRooms(rooms.map(room => room.id === currentRoom.id ? currentRoom : room));
    } else {
      setRooms([...rooms, { ...currentRoom, id: Date.now().toString() }]);
    }
    setRoomDialogOpen(false);
  };

  const handleEditRoom = (room: RoomType) => {
    setCurrentRoom(room);
    setRoomDialogOpen(true);
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || room.type === filterType;
    return matchesSearch && matchesType;
  });

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
      case 'users':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom color="primary">
              User Management
            </Typography>
          </Box>
        );
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
                sx={{ 
                  backgroundColor: '#1a472a',
                  '&:hover': { backgroundColor: '#2e7d32' }
                }}
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
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Cabana">Cabana</MenuItem>
                <MenuItem value="Delux">Delux</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
              </Select>
            </Box>

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
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>{room.roomNumber}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>${room.price}</TableCell>
                      <TableCell>{room.description}</TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleEditRoom(room)}
                          sx={{ color: '#1a472a' }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteRoom(room.id)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Dialog open={roomDialogOpen} onClose={handleRoomDialogClose}>
              <DialogTitle>{currentRoom.id ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Room Number"
                  fullWidth
                  value={currentRoom.roomNumber}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, roomNumber: e.target.value })}
                  sx={{ my: 2 }}
                />
                <Select
                  fullWidth
                  value={currentRoom.type}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, type: e.target.value as RoomType['type'] })}
                  sx={{ my: 2 }}
                >
                  <MenuItem value="Cabana">Cabana</MenuItem>
                  <MenuItem value="Delux">Delux</MenuItem>
                  <MenuItem value="Suite">Suite</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                </Select>
                <TextField
                  margin="dense"
                  label="Price"
                  type="number"
                  fullWidth
                  value={currentRoom.price}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, price: Number(e.target.value) })}
                  sx={{ my: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Description (max 100 words)"
                  fullWidth
                  multiline
                  rows={4}
                  value={currentRoom.description}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, description: e.target.value })}
                  sx={{ my: 2 }}
                  helperText={`${currentRoom.description.trim().split(/\s+/).length}/100 words`}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleRoomDialogClose} color="error">Cancel</Button>
                <Button 
                  onClick={handleSaveRoom}
                  sx={{ backgroundColor: '#1a472a', color: 'white', '&:hover': { backgroundColor: '#2e7d32' } }}
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
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1a472a'
        }}
      >
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
            sx={{ 
              width: open ? 80 : 40, 
              height: open ? 80 : 40, 
              mb: 1, 
              transition: '0.3s',
              backgroundColor: 'white'
            }}
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
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<Logout sx={{ color: 'white' }} />} 
            onClick={handleLogout}
            sx={{ 
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#9a0007' }
            }}
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