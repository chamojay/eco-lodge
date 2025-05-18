'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, MenuItem, Select, InputLabel, FormControl, Divider,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import {
  fetchAllReservations,
  fetchReservationById,
  updateReservation,
} from '@/app/services/reservationinfoService';
import { reservationService } from '@/app/services/reservationService';

const countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Sri Lanka', 'India', 'United States', 'Zambia', 'Zimbabwe'];
const packageTypes = ['Fullboard', 'Halfboard', 'RoomOnly'];
const titles = ['Mr', 'Mrs', 'Ms'];
const statusOptions = ['All', 'Active', 'Future', 'Past'];

type Reservation = {
  ReservationID: number;
  CheckInDate: string;
  CheckOutDate: string;
  Room_Status: string;
  PackageID: number;
  PackageName: string;
  PriceMultiplier: number;
  Adults: number;
  Children: number;
  SpecialRequests: string;
  ArrivalTime: string;
  DepartureTime: string;
  RoomNumber: string;
  RoomType: string;
  Status: string;
  CustomerID: number;
  Title: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Country: string;
  NIC: string;
  PassportNumber: string;
};

const ReservationComponent = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Fetch reservations
  const loadReservations = useCallback(async () => {
    const data = await fetchAllReservations();
    setReservations(data);
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleEditClick = async (id: number) => {
    try {
      console.log('Editing reservation:', id);
      const data = await fetchReservationById(id);
      console.log('Fetched reservation data:', data);
      
      if (!data) {
        console.error('No data received for reservation:', id);
        return;
      }

      setSelected(data);
      
      // Format dates properly
      const formattedData = {
        ...data,
        CheckInDate: data.CheckInDate?.split('T')[0] || '',
        CheckOutDate: data.CheckOutDate?.split('T')[0] || '',
      };
      setSelected(formattedData);

      if (formattedData.CheckInDate && formattedData.CheckOutDate) {
        try {
          const rooms = await reservationService.checkAvailability(
            formattedData.CheckInDate,
            formattedData.CheckOutDate
          );
          // Include current room in available rooms
          const availableRoomNumbers = rooms.map((room: any) => room.RoomNumber);
          if (!availableRoomNumbers.includes(formattedData.RoomNumber)) {
            availableRoomNumbers.push(formattedData.RoomNumber);
          }
          setAvailableRooms(availableRoomNumbers);
        } catch (error) {
          console.error('Error fetching available rooms:', error);
        }
      }
      setOpen(true);
    } catch (error) {
      console.error('Error in handleEditClick:', error);
    }
  };

  const handleViewClick = async (id: number) => {
    try {
      console.log('Viewing reservation:', id);
      const data = await fetchReservationById(id);
      console.log('Fetched reservation data:', data);
      
      if (!data) {
        console.error('No data received for reservation:', id);
        return;
      }

      // Format dates properly
      const formattedData = {
        ...data,
        CheckInDate: data.CheckInDate?.split('T')[0] || '',
        CheckOutDate: data.CheckOutDate?.split('T')[0] || '',
      };
      setSelected(formattedData);
      setViewOpen(true);
    } catch (error) {
      console.error('Error in handleViewClick:', error);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (selected) {
      const updated = { ...selected, [e.target.name as string]: e.target.value };
      setSelected(updated);

      if (e.target.name === 'CheckInDate' || e.target.name === 'CheckOutDate') {
        if (updated.CheckInDate && updated.CheckOutDate) {
          try {
            const rooms = await reservationService.checkAvailability(updated.CheckInDate, updated.CheckOutDate);
            setAvailableRooms(rooms.map((room: any) => room.RoomNumber));
          } catch (error) {
            console.error('Error checking availability:', error);
          }
        }
      }
    }
  };

  const handleUpdate = async () => {
    if (selected) {
      await updateReservation(selected.ReservationID, selected);
      setOpen(false);
      loadReservations();
    }
  };

  // Filter reservations based on status
  const filteredReservations = useMemo(() => {
    if (!Array.isArray(reservations)) {
      return [];
    }
    
    if (filterStatus === 'All') {
      return reservations;
    }
    
    return reservations.filter((r) => {
      const status = r.Status;
      return status === filterStatus;
    });
  }, [reservations, filterStatus]);

  // Add debug logging
  useEffect(() => {
    console.log('Current reservations:', reservations);
    console.log('Filter status:', filterStatus);
    console.log('Filtered reservations:', filteredReservations);
  }, [reservations, filterStatus, filteredReservations]);

  // Define columns for MaterialReactTable
  const columns = useMemo<MRT_ColumnDef<Reservation>[]>(
    () => [
      {
        accessorKey: 'ReservationID',
        header: 'Reservation ID',
        size: 120,
        minSize: 100,
      },
      {
        accessorFn: (row) => `${row.Title} ${row.FirstName} ${row.LastName}`,
        header: 'Customer Name',
        size: 180,
        minSize: 150,
      },
      {
        accessorKey: 'RoomNumber',
        header: 'Room',
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: 'CheckInDate',
        header: 'Check-In',
        size: 140,
        minSize: 120,
        Cell: ({ cell }) => cell.getValue<string>().split('T')[0],
      },
      {
        accessorKey: 'CheckOutDate',
        header: 'Check-Out',
        size: 140,
        minSize: 120,
        Cell: ({ cell }) => cell.getValue<string>().split('T')[0],
      },
      {
        accessorKey: 'Status',
        header: 'Status',
        size: 100,
        Cell: ({ cell }) => (
          <Typography
            sx={{
              color: cell.getValue() === 'Active' ? 'success.main' : 
                     cell.getValue() === 'Future' ? 'info.main' : 'text.secondary'
            }}
          >
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'ReservationID',
        header: 'Actions',
        size: 140,
        minSize: 120,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                if (row.original.ReservationID) {
                  handleEditClick(row.original.ReservationID);
                }
              }}
              sx={{ minWidth: 60 }}
            >
              Edit
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                if (row.original.ReservationID) {
                  handleViewClick(row.original.ReservationID);
                }
              }}
              sx={{ minWidth: 60 }}
            >
              View
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredReservations,
    enableColumnVirtualization: true,
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#2e7d32',
        color: 'white',
        '& .MuiTableSortLabel-icon': {
          color: 'white !important',
        },
        '& .MuiIconButton-root': {
          color: 'white !important',
        },
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: 'auto',
        width: '100%',
        '@media (max-width: 600px)': {
          minWidth: 'auto',
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        whiteSpace: 'normal',
        wordBreak: 'break-word',
      },
    },
  });

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 2,
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography variant="h4" sx={{ color: 'darkgreen' }}>
          Reservation Management
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{
              flex: { xs: '1 0 100%', sm: '0 1 auto' },
              minWidth: { xs: '100%', sm: 120 },
              backgroundColor: 'white'
            }}
          >
            {statusOptions.map((status) => (
              <MenuItem 
                key={status} 
                value={status}
                sx={{
                  color: status === 'Active' ? 'success.main' : 
                        status === 'Future' ? 'info.main' : 
                        status === 'All' ? 'text.primary' : 'text.secondary'
                }}
              >
                {status}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <MaterialReactTable table={table} />
      </Box>

      {/* Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Reservation</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} mt={1}>
            <TextField
              name="CheckInDate"
              label="Check-In Date"
              type="date"
              value={selected?.CheckInDate || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="CheckOutDate"
              label="Check-Out Date"
              type="date"
              value={selected?.CheckOutDate || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="Room_Status"
              label="Room Status"
              value={selected?.Room_Status || ''}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>Package Type</InputLabel>
              <Select
                name="PackageID"
                value={selected?.PackageID || ''}
                onChange={handleChange}
              >
                {packageTypes.map((pkg) => (
                  <MenuItem key={pkg} value={pkg}>
                    {pkg}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="Adults"
              label="Adults"
              type="number"
              value={selected?.Adults || 0}
              onChange={handleChange}
            />
            <TextField
              name="Children"
              label="Children"
              type="number"
              value={selected?.Children || 0}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>Room Number</InputLabel>
              <Select
                name="RoomNumber"
                value={selected?.RoomNumber || ''}
                onChange={handleChange}
              >
                {availableRooms.map((room) => (
                  <MenuItem key={room} value={room}>
                    {room}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="SpecialRequests"
              label="Special Requests"
              value={selected?.SpecialRequests || ''}
              onChange={handleChange}
            />
            <TextField
              name="ArrivalTime"
              label="Arrival Time"
              type="time"
              value={selected?.ArrivalTime || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="DepartureTime"
              label="Departure Time"
              type="time"
              value={selected?.DepartureTime || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Title</InputLabel>
              <Select
                name="Title"
                value={selected?.Title || ''}
                onChange={handleChange}
              >
                {titles.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="FirstName"
              label="First Name"
              value={selected?.FirstName || ''}
              onChange={handleChange}
            />
            <TextField
              name="LastName"
              label="Last Name"
              value={selected?.LastName || ''}
              onChange={handleChange}
            />
            <TextField
              name="Email"
              label="Email"
              value={selected?.Email || ''}
              onChange={handleChange}
            />
            <TextField
              name="Phone"
              label="Phone"
              value={selected?.Phone || ''}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                name="Country"
                value={selected?.Country || ''}
                onChange={handleChange}
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="NIC"
              label="NIC"
              value={selected?.NIC || ''}
              onChange={handleChange}
            />
            <TextField
              name="PassportNumber"
              label="Passport Number"
              value={selected?.PassportNumber || ''}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: 'darkgreen' }}
            onClick={handleUpdate}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: '90%', sm: '100%' },
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle>Reservation Details</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'bold', color: 'darkgreen' }}
            >
              Customer Details
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography>
              <strong>Name:</strong>{' '}
              {`${selected?.Title} ${selected?.FirstName} ${selected?.LastName}`}
            </Typography>
            <Typography>
              <strong>Email:</strong> {selected?.Email}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {selected?.Phone}
            </Typography>
            <Typography>
              <strong>Country:</strong> {selected?.Country}
            </Typography>
            <Typography>
              <strong>NIC:</strong> {selected?.NIC}
            </Typography>
            <Typography>
              <strong>Passport Number:</strong> {selected?.PassportNumber}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'bold', color: 'darkgreen' }}
            >
              Reservation Details
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography>
              <strong>Reservation ID:</strong> {selected?.ReservationID}
            </Typography>
            <Typography>
              <strong>Room Number:</strong> {selected?.RoomNumber}
            </Typography>
            <Typography>
              <strong>Room Status:</strong> {selected?.Room_Status}
            </Typography>
            <Typography>
              <strong>Package:</strong> {selected?.PackageName} 
              {selected?.PriceMultiplier && ` (${(selected.PriceMultiplier * 100 - 100).toFixed(0)}% extra)`}
            </Typography>
            <Typography>
              <strong>Check-In:</strong> {selected?.CheckInDate?.split('T')[0]}
            </Typography>
            <Typography>
              <strong>Check-Out:</strong> {selected?.CheckOutDate?.split('T')[0]}
            </Typography>
            <Typography>
              <strong>Adults:</strong> {selected?.Adults}
            </Typography>
            <Typography>
              <strong>Children:</strong> {selected?.Children}
            </Typography>
            <Typography>
              <strong>Arrival Time:</strong> {selected?.ArrivalTime}
            </Typography>
            <Typography>
              <strong>Departure Time:</strong> {selected?.DepartureTime}
            </Typography>
            <Typography>
              <strong>Special Requests:</strong> {selected?.SpecialRequests}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReservationComponent;