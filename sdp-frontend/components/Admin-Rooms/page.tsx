'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, Typography, Button, TextField, Select, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment 
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { getRooms, createRoom, updateRoom, deleteRoom } from '@/app/services/roomService';
import { RoomType } from '@/types/roomTypes';
import { IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const AdminRooms: React.FC = () => {
  // State Management
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomType>({ 
    RoomID: '', 
    RoomNumber: '', 
    Type: 'Standard', 
    LocalPrice: 0,
    ForeignPrice: 0,
    MaxPeople: 1,
    Description: '' 
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Rooms Callback
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRooms(searchTerm, filterType);
      setRooms(data);
    } catch (err) {
      console.error('Fetch rooms error:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType]);

  // Fetch rooms on mount and when search/filter changes
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Dialog Handlers
  const handleRoomDialogOpen = () => {
    setCurrentRoom({ 
      RoomID: '', 
      RoomNumber: '', 
      Type: 'Standard', 
      LocalPrice: 0,
      ForeignPrice: 0,
      MaxPeople: 1,
      Description: '' 
    });
    setRoomDialogOpen(true);
  };

  const handleRoomDialogClose = () => setRoomDialogOpen(false);

  // Save Room (Add or Update)
  const handleSaveRoom = async () => {
    if (!currentRoom.RoomNumber || !currentRoom.Type || 
        !currentRoom.LocalPrice || !currentRoom.ForeignPrice || !currentRoom.MaxPeople) {
      alert('All fields except description are required');
      return;
    }

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
        LocalPrice: currentRoom.LocalPrice,
        ForeignPrice: currentRoom.ForeignPrice,
        MaxPeople: currentRoom.MaxPeople,
        Description: currentRoom.Description
      };

      if (currentRoom.RoomID) {
        const updatedRoom = await updateRoom(currentRoom.RoomID, roomData);
        setRooms(rooms.map(room => room.RoomID === currentRoom.RoomID ? updatedRoom : room));
      } else {
        const newRoom = await createRoom(roomData);
        setRooms([...rooms, newRoom]);
      }
      setRoomDialogOpen(false);
    } catch (err) {
      console.error('Save room error:', err);
      alert('Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  // Edit Room
  const handleEditRoom = (room: RoomType) => {
    setCurrentRoom(room);
    setRoomDialogOpen(true);
  };

  // Delete Room
  const handleDeleteRoom = async (RoomID: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setLoading(true);
      try {
        await deleteRoom(RoomID);
        setRooms(rooms.filter(room => room.RoomID !== RoomID));
      } catch (err) {
        console.error('Delete room error:', err);
        alert('Failed to delete room');
      } finally {
        setLoading(false);
      }
    }
  };

  // Define columns for MaterialReactTable
  const columns = useMemo<MRT_ColumnDef<RoomType>[]>(
    () => [
      {
        accessorKey: 'RoomNumber',
        header: 'Room Number',
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: 'Type',
        header: 'Type',
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: 'LocalPrice',
        header: 'Local Price (LKR)',
        size: 140,
        minSize: 120,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: 'ForeignPrice',
        header: 'Foreign Price ($)',
        size: 140,
        minSize: 120,
        Cell: ({ cell }) => `$${cell.getValue<number>().toLocaleString()}`,
      },
      {
        accessorKey: 'MaxPeople',
        header: 'Max People',
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: 'Description',
        header: 'Description',
        size: 180,
        minSize: 150,
      },
      {
        accessorKey: 'RoomID',
        header: 'Actions',
        size: 120,
        minSize: 100,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ row }) => (
          <>
            <IconButton 
              onClick={() => handleEditRoom(row.original)} 
              sx={{ color: '#1a472a' }} 
              disabled={loading}
            >
              <Edit />
            </IconButton>
            <IconButton 
              onClick={() => handleDeleteRoom(row.original.RoomID)} 
              sx={{ color: '#d32f2f' }} 
              disabled={loading}
            >
              <Delete />
            </IconButton>
          </>
        ),
      },
    ],
    [loading]
  );

  const table = useMaterialReactTable({
    columns,
    data: rooms,
    state: { isLoading: loading },
    enableColumnVirtualization: true, // Enable column virtualization for better performance on small screens
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#1a472a',
        color: 'white',
        '& .MuiTableSortLabel-icon': {
          color: 'white !important', // Ensure sort icons are white
        },
        '& .MuiIconButton-root': {
          color: 'white !important', // Ensure other icons are white
        },
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: 'auto',
        width: '100%',
        '@media (max-width: 600px)': {
          minWidth: 'auto', // Allow table to shrink on small screens
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        whiteSpace: 'normal', // Allow text wrapping in cells
        wordBreak: 'break-word',
      },
    },
  });

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header with Search, Filter, and Add Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2,
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Typography variant="h5">Rooms Management</Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            gap: 1,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <TextField
            placeholder="Search rooms..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: { xs: '1 0 100%', sm: '0 1 auto' }, 
              mr: { sm: 2 },
              minWidth: { sm: 200 }
            }}
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            size="small"
            sx={{ 
              flex: { xs: '1 0 100%', sm: '0 1 auto' }, 
              minWidth: { xs: '100%', sm: 120 }, 
              mr: { sm: 2 }
            }}
          >
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Delux">Delux</MenuItem>
            <MenuItem value="Suite">Suite</MenuItem>
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Cabana">Cabana</MenuItem>
          </Select>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleRoomDialogOpen}
            sx={{ 
              flex: { xs: '1 0 100%', sm: '0 1 auto' }, 
              backgroundColor: '#1a472a', 
              '&:hover': { backgroundColor: '#2e7d32' },
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Add Room
          </Button>
        </Box>
      </Box>

      {/* MaterialReactTable */}
      <Box sx={{ overflowX: 'auto' }}>
        <MaterialReactTable table={table} />
      </Box>

      {/* Add/Edit Room Dialog */}
      <Dialog 
        open={roomDialogOpen} 
        onClose={handleRoomDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: '90%', sm: '100%' },
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle>{currentRoom.RoomID ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Number"
            fullWidth
            required
            value={currentRoom.RoomNumber}
            onChange={(e) => setCurrentRoom({ ...currentRoom, RoomNumber: e.target.value })}
            sx={{ my: 1 }}
          />
          <Select
            fullWidth
            required
            value={currentRoom.Type}
            onChange={(e) => setCurrentRoom({ ...currentRoom, Type: e.target.value as RoomType['Type'] })}
            sx={{ my: 1 }}
          >
            <MenuItem value="Delux">Delux</MenuItem>
            <MenuItem value="Suite">Suite</MenuItem>
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Cabana">Cabana</MenuItem>
          </Select>
          <TextField
            margin="dense"
            label="Local Price (LKR)"
            type="number"
            fullWidth
            required
            value={currentRoom.LocalPrice || ''}
            onChange={(e) => setCurrentRoom({ ...currentRoom, LocalPrice: Number(e.target.value) })}
            sx={{ my: 1 }}
          />
          <TextField
            margin="dense"
            label="Foreign Price ($)"
            type="number"
            fullWidth
            required
            value={currentRoom.ForeignPrice || ''}
            onChange={(e) => setCurrentRoom({ ...currentRoom, ForeignPrice: Number(e.target.value) })}
            sx={{ my: 1 }}
          />
          <TextField
            margin="dense"
            label="Max People"
            type="number"
            fullWidth
            required
            value={currentRoom.MaxPeople || 1}
            onChange={(e) => setCurrentRoom({ ...currentRoom, MaxPeople: Number(e.target.value) })}
            inputProps={{ min: 1 }}
            sx={{ my: 1 }}
          />
          <TextField
            margin="dense"
            label="Description (max 100 words)"
            fullWidth
            multiline
            rows={4}
            value={currentRoom.Description}
            onChange={(e) => setCurrentRoom({ ...currentRoom, Description: e.target.value })}
            sx={{ my: 1 }}
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
};

export default AdminRooms;