'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, MenuItem, Select, InputLabel, FormControl, Divider
} from '@mui/material';
import {
  fetchAllReservations,
  fetchReservationById,
  updateReservation,
} from '@/app/services/reservationinfoService';
import { reservationService } from '@/app/services/reservationService';

const countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Sri Lanka', 'India', 'United States', 'Zambia', 'Zimbabwe'];
const packageTypes = ['Fullboard', 'Halfboard', 'RoomOnly'];
const titles = ['Mr', 'Mrs', 'Ms'];

type Reservation = {
  ReservationID: number;
  CheckInDate: string;
  CheckOutDate: string;
  Room_Status: string;
  PackageType: string;
  Adults: number;
  Children: number;
  SpecialRequests: string;
  ArrivalTime: string;
  DepartureTime: string;
  RoomNumber: string;
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

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    const data = await fetchAllReservations();
    setReservations(data);
  };

  const handleEditClick = async (id: number) => {
    const data = await fetchReservationById(id);
    setSelected(data);
    if (data.CheckInDate && data.CheckOutDate) {
      try {
        const rooms = await reservationService.checkAvailability(data.CheckInDate, data.CheckOutDate);
        setAvailableRooms(rooms.map((room: any) => room.RoomNumber));
      } catch (error) {
        console.error('Error fetching available rooms:', error);
      }
    }
    setOpen(true);
  };

  const handleViewClick = async (id: number) => {
    const data = await fetchReservationById(id);
    setSelected(data);
    setViewOpen(true);
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

  const renderTable = (status: string) => {
    const filtered = reservations.filter((r) => r.Status === status);
    return (
      <Box mb={5}>
        <Typography variant="h6" gutterBottom sx={{ color: 'darkgreen' }}>
          {status} Reservations
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#2e7d32' }}>
                <TableCell sx={{ color: 'white' }}>Reservation ID</TableCell>
                <TableCell sx={{ color: 'white' }}>Customer Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Room</TableCell>
                <TableCell sx={{ color: 'white' }}>Check-In</TableCell>
                <TableCell sx={{ color: 'white' }}>Check-Out</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.ReservationID}>
                  <TableCell>{r.ReservationID}</TableCell>
                  <TableCell>{`${r.Title} ${r.FirstName} ${r.LastName}`}</TableCell>
                  <TableCell>{r.RoomNumber}</TableCell>
                  <TableCell>{r.CheckInDate}</TableCell>
                  <TableCell>{r.CheckOutDate}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleEditClick(r.ReservationID)}>Edit</Button>
                    <Button variant="text" size="small" onClick={() => handleViewClick(r.ReservationID)} sx={{ ml: 1 }}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom sx={{ color: 'darkgreen' }}>Reservation Management</Typography>
      {renderTable('Active')}
      {renderTable('Future')}
      {renderTable('Past')}

      {/* Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Reservation</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} mt={1}>
            <TextField name="CheckInDate" label="Check-In Date" type="date" value={selected?.CheckInDate || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField name="CheckOutDate" label="Check-Out Date" type="date" value={selected?.CheckOutDate || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField name="Room_Status" label="Room Status" value={selected?.Room_Status || ''} onChange={handleChange} />
            
            <FormControl fullWidth>
              <InputLabel>Package Type</InputLabel>
              <Select name="PackageType" value={selected?.PackageType || ''} onChange={handleChange}>
                {packageTypes.map((pkg) => <MenuItem key={pkg} value={pkg}>{pkg}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField name="Adults" label="Adults" type="number" value={selected?.Adults || 0} onChange={handleChange} />
            <TextField name="Children" label="Children" type="number" value={selected?.Children || 0} onChange={handleChange} />

            <FormControl fullWidth>
              <InputLabel>Room Number</InputLabel>
              <Select name="RoomNumber" value={selected?.RoomNumber || ''} onChange={handleChange}>
                {availableRooms.map((room) => <MenuItem key={room} value={room}>{room}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField name="SpecialRequests" label="Special Requests" value={selected?.SpecialRequests || ''} onChange={handleChange} />
            <TextField name="ArrivalTime" label="Arrival Time" type="time" value={selected?.ArrivalTime || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField name="DepartureTime" label="Departure Time" type="time" value={selected?.DepartureTime || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />

            <FormControl fullWidth>
              <InputLabel>Title</InputLabel>
              <Select name="Title" value={selected?.Title || ''} onChange={handleChange}>
                {titles.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField name="FirstName" label="First Name" value={selected?.FirstName || ''} onChange={handleChange} />
            <TextField name="LastName" label="Last Name" value={selected?.LastName || ''} onChange={handleChange} />
            <TextField name="Email" label="Email" value={selected?.Email || ''} onChange={handleChange} />
            <TextField name="Phone" label="Phone" value={selected?.Phone || ''} onChange={handleChange} />
            
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select name="Country" value={selected?.Country || ''} onChange={handleChange}>
                {countries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField name="NIC" label="NIC" value={selected?.NIC || ''} onChange={handleChange} />
            <TextField name="PassportNumber" label="Passport Number" value={selected?.PassportNumber || ''} onChange={handleChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: 'darkgreen' }} onClick={handleUpdate}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reservation Details</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'darkgreen' }}>Customer Details</Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography><strong>Name:</strong> {`${selected?.Title} ${selected?.FirstName} ${selected?.LastName}`}</Typography>
            <Typography><strong>Email:</strong> {selected?.Email}</Typography>
            <Typography><strong>Phone:</strong> {selected?.Phone}</Typography>
            <Typography><strong>Country:</strong> {selected?.Country}</Typography>
            <Typography><strong>NIC:</strong> {selected?.NIC}</Typography>
            <Typography><strong>Passport Number:</strong> {selected?.PassportNumber}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'darkgreen' }}>Reservation Details</Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography><strong>Reservation ID:</strong> {selected?.ReservationID}</Typography>
            <Typography><strong>Room Number:</strong> {selected?.RoomNumber}</Typography>
            <Typography><strong>Room Status:</strong> {selected?.Room_Status}</Typography>
            <Typography><strong>Package Type:</strong> {selected?.PackageType}</Typography>
            <Typography><strong>Check-In:</strong> {selected?.CheckInDate?.split('T')[0]}</Typography>
            <Typography><strong>Check-Out:</strong> {selected?.CheckOutDate?.split('T')[0]}</Typography>
            <Typography><strong>Adults:</strong> {selected?.Adults}</Typography>
            <Typography><strong>Children:</strong> {selected?.Children}</Typography>
            <Typography><strong>Arrival Time:</strong> {selected?.ArrivalTime}</Typography>
            <Typography><strong>Departure Time:</strong> {selected?.DepartureTime}</Typography>
            <Typography><strong>Special Requests:</strong> {selected?.SpecialRequests}</Typography>
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
