'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Box, Typography, Button, TextField, Select, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment 
} from '@mui/material';
import { Add, Search, Settings } from '@mui/icons-material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { 
  getRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom 
} from '@/app/services/roomService';
import { 
  getRoomTypes,  // Add this import
  createRoomType, 
  updateRoomType, 
  deleteRoomType 
} from '@/app/services/roomTypeService';
import { RoomType, RoomTypeDetail } from '@/types/roomTypes';
import { IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AdminRooms: React.FC = () => {
  // State Management
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDetail[]>([]);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomType>({ 
    RoomID: '', 
    RoomNumber: '', 
    TypeID: 0,  // Changed from Type to TypeID
    LocalPrice: 0,
    ForeignPrice: 0,
    MaxPeople: 1,
    Description: '' 
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [roomTypeDialogOpen, setRoomTypeDialogOpen] = useState(false);
  const [currentRoomType, setCurrentRoomType] = useState<RoomTypeDetail>({
    TypeID: 0,
    Name: '',
    Description: '',
    ImagePath: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch room types
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await getRoomTypes();
        setRoomTypes(types);
      } catch (err) {
        console.error('Failed to fetch room types:', err);
      }
    };
    fetchRoomTypes();
  }, []);

  // Fetch rooms on mount and when search/filter changes
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Dialog Handlers
  const handleRoomDialogOpen = () => {
    setCurrentRoom({ 
      RoomID: '', 
      RoomNumber: '', 
      TypeID: 0,  // Changed from Type to TypeID
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
    if (!currentRoom.RoomNumber || !currentRoom.TypeID || 
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
        TypeID: currentRoom.TypeID, // Changed from Type to TypeID
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

  // Room Type Dialog Handlers
  const handleRoomTypeDialogOpen = () => {
    setCurrentRoomType({
      TypeID: 0,
      Name: '',
      Description: '',
      ImagePath: ''
    });
    setRoomTypeDialogOpen(true);
  };

  const handleRoomTypeDialogClose = () => setRoomTypeDialogOpen(false);

  const handleSaveRoomType = async () => {
    if (!currentRoomType.Name) {
      alert('Room type name is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Name', currentRoomType.Name);
      formData.append('Description', currentRoomType.Description || '');
      
      // Add file to formData if it exists
      if (fileInputRef.current?.files?.[0]) {
        formData.append('image', fileInputRef.current.files[0]);
      }
      
      if (currentRoomType.TypeID) {
        await updateRoomType(currentRoomType.TypeID, formData);
      } else {
        await createRoomType(formData);
      }
      
      // Refresh room types
      const types = await getRoomTypes();
      setRoomTypes(types);
      setRoomTypeDialogOpen(false);
    } catch (err) {
      console.error('Save room type error:', err);
      alert('Failed to save room type');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoomType = (type: RoomTypeDetail) => {
    setCurrentRoomType(type);
    setRoomTypeDialogOpen(true);
  };

  const handleDeleteRoomType = async (TypeID: number) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteRoomType(TypeID);
      const types = await getRoomTypes();
      setRoomTypes(types);
    } catch (err) {
      console.error('Delete room type error:', err);
      alert('Failed to delete room type');
    } finally {
      setLoading(false);
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
        accessorKey: 'TypeName', // Changed from Type
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
            {roomTypes.map((type) => (
              <MenuItem key={type.TypeID} value={type.TypeID}>
                {type.Name}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
            <Button 
              variant="outlined" 
              startIcon={<Settings />} 
              onClick={handleRoomTypeDialogOpen}
              sx={{ 
                borderColor: '#1a472a', 
                color: '#1a472a',
                '&:hover': { borderColor: '#2e7d32', backgroundColor: '#f0f7f0' }
              }}
            >
              Manage Types
            </Button>
          </Box>
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
            value={currentRoom.TypeID}
            onChange={(e) => setCurrentRoom({ ...currentRoom, TypeID: Number(e.target.value) })}
            sx={{ my: 1 }}
          >
            {roomTypes.map((type) => (
              <MenuItem key={type.TypeID} value={type.TypeID}>
                {type.Name}
              </MenuItem>
            ))}
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

      {/* Add/Edit Room Type Dialog - New Feature */}
      <Dialog 
        open={roomTypeDialogOpen} 
        onClose={handleRoomTypeDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {currentRoomType.TypeID ? 'Edit Room Type' : 'Add New Room Type'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Type Name"
            fullWidth
            required
            value={currentRoomType.Name}
            onChange={(e) => setCurrentRoomType({ 
              ...currentRoomType, 
              Name: e.target.value 
            })}
            sx={{ my: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={currentRoomType.Description || ''}
            onChange={(e) => setCurrentRoomType({ 
              ...currentRoomType, 
              Description: e.target.value 
            })}
            sx={{ my: 1 }}
          />
          <Box sx={{ my: 2 }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Preview image if needed
                  setCurrentRoomType({
                    ...currentRoomType,
                    ImagePath: URL.createObjectURL(file)
                  });
                }
              }}
            />
            <Button
              variant="outlined"
              component="span"
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{
                borderColor: '#1a472a',
                color: '#1a472a',
                '&:hover': { borderColor: '#2e7d32', backgroundColor: '#f0f7f0' }
              }}
            >
              Upload Image
            </Button>
            {(currentRoomType.ImagePath || fileInputRef.current?.files?.[0]) && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={
                    fileInputRef.current?.files?.[0]
                      ? URL.createObjectURL(fileInputRef.current.files[0])
                      : currentRoomType.ImagePath 
                        ? `${API_BASE_URL}${currentRoomType.ImagePath}`
                        : ''
                  }
                  alt="Room Type Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            )}
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Existing Room Types:
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {roomTypes.map((type) => (
              <Box 
                key={type.TypeID} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  borderBottom: '1px solid #eee'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {type.ImagePath && (
                    <img
                      src={`${API_BASE_URL}${type.ImagePath}`}
                      alt={type.Name}
                      style={{
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1">{type.Name}</Typography>
                    {type.Description && (
                      <Typography variant="body2" color="text.secondary">
                        {type.Description}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <IconButton 
                    onClick={() => handleEditRoomType(type)}
                    sx={{ color: '#1a472a' }}
                    disabled={loading}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteRoomType(type.TypeID)}
                    sx={{ color: '#d32f2f' }}
                    disabled={loading}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleRoomTypeDialogClose} 
            color="error" 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveRoomType}
            sx={{ 
              backgroundColor: '#1a472a', 
              color: 'white', 
              '&:hover': { backgroundColor: '#2e7d32' } 
            }}
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