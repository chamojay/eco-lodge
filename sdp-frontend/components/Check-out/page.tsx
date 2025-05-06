'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material';
import { reservationService } from '@/app/services/reservationService';
import { extraChargesService, ExtraCharge, ExtraChargeType } from '@/app/services/extraChargesService';

interface Reservation {
  ReservationID: string;
  CheckOutDate: string;
  FirstName: string;
  LastName: string;
  RoomNumber: string;
  TotalAmount: number;
}

const getCheckoutStatus = (checkoutDate: string): 'today' | 'overdue' | 'future' => {
  const checkout = new Date(checkoutDate);
  const today = new Date();
  const checkoutMidnight = new Date(checkout.getFullYear(), checkout.getMonth(), checkout.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (checkoutMidnight < todayMidnight) return 'overdue';
  if (checkoutMidnight.getTime() === todayMidnight.getTime()) return 'today';
  return 'future';
};

// Add a formatting helper function at the top of your component
const formatAmount = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) ? numAmount.toFixed(2) : '0.00';
};

const CheckOutComponent = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [showAddChargeForm, setShowAddChargeForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [extraChargeTypes, setExtraChargeTypes] = useState<ExtraChargeType[]>([]);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [newCharge, setNewCharge] = useState<ExtraCharge>({
    ChargeID: 0,
    Description: '',
    Amount: 0,
    ReservationID: 0,
    TypeID: null
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const reservationsData = await reservationService.getActiveReservations();
        setReservations(reservationsData);
        const typesData = await extraChargesService.getAllTypes();
        setExtraChargeTypes(typesData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const fetchExtraCharges = async (reservationId: string) => {
    try {
      const charges = await extraChargesService.getChargesByReservation(Number(reservationId));
      setExtraCharges(charges);
    } catch (error) {
      console.error('Error fetching extra charges:', error);
    }
  };

  const handleOpenModal = async (reservation: Reservation) => {
    setSelectedReservation(reservation);
    await fetchExtraCharges(reservation.ReservationID);
    setNewCharge({
      ...newCharge,
      ReservationID: Number(reservation.ReservationID)
    });
    setShowAddChargeForm(false);
    setOpenModal(true);
  };

  const handleAddCharge = async () => {
    if (!selectedReservation || !newCharge.Description || newCharge.Amount <= 0) return;

    try {
      await extraChargesService.addCharge({
        ReservationID: Number(selectedReservation.ReservationID),
        TypeID: newCharge.TypeID,
        Description: newCharge.Description,
        Amount: Number(newCharge.Amount) // Ensure it's a number
      });
      
      await fetchExtraCharges(selectedReservation.ReservationID);
      setNewCharge({
        ChargeID: 0,
        Description: '',
        Amount: 0,
        ReservationID: Number(selectedReservation.ReservationID),
        TypeID: null
      });
      setShowAddChargeForm(false);
    } catch (error) {
      console.error('Error adding charge:', error);
    }
  };

  const handleCompleteCheckout = async () => {
    if (!selectedReservation) return;

    setProcessing(selectedReservation.ReservationID);
    try {
      const totalExtraCharges = extraCharges.reduce((sum, charge) => sum + charge.Amount, 0);
      const baseAmount = selectedReservation.TotalAmount || 0;
      const TotalAmount = baseAmount + totalExtraCharges;
      await reservationService.completeCheckout(selectedReservation.ReservationID, TotalAmount);
      setReservations(reservations.filter(r => r.ReservationID !== selectedReservation.ReservationID));
      setOpenModal(false);
      setSelectedReservation(null);
      setExtraCharges([]);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
    setProcessing(null);
  };

  const totalInvoice = (
    (selectedReservation?.TotalAmount || 0) +
    extraCharges.reduce((sum, charge) => {
      const amount = typeof charge.Amount === 'string' ? parseFloat(charge.Amount) : charge.Amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0)
  );

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#1a472a' }}>
        Active Reservations
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : reservations.length === 0 ? (
        <Typography>No active reservations</Typography>
      ) : (
        <List>
          {reservations.map((res) => {
            const status = getCheckoutStatus(res.CheckOutDate);
            return (
              <ListItem
                key={res.ReservationID}
                sx={{
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <ListItemText
                  primary={`${res.FirstName} ${res.LastName}`}
                  secondary={`Room ${res.RoomNumber} - Checkout: ${new Date(res.CheckOutDate).toLocaleDateString()}`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {status === 'today' && (
                    <Typography sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                      Checkout today
                    </Typography>
                  )}
                  {status === 'overdue' && (
                    <Typography sx={{ color: '#dc3545', fontWeight: 'bold' }}>
                      Checkout overdue
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    onClick={() => handleOpenModal(res)}
                    disabled={processing === res.ReservationID}
                    sx={{
                      backgroundColor:
                        status === 'overdue' ? '#dc3545' :
                        status === 'today' ? '#ffd700' :
                        '#1a472a',
                      color:
                        status === 'overdue' || status === 'today' ? 'black' : 'white',
                      '&:hover': {
                        backgroundColor:
                          status === 'overdue' ? '#bb2d3b' :
                          status === 'today' ? '#ffc107' :
                          '#2e7d32'
                      },
                      minWidth: 160
                    }}
                  >
                    {processing === res.ReservationID ? <CircularProgress size={24} /> : 'Process Checkout'}
                  </Button>
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          bgcolor: 'white',
          p: 4,
          borderRadius: 2,
          maxWidth: 600,
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <Typography variant="h6" gutterBottom>
            Checkout for {selectedReservation?.FirstName} {selectedReservation?.LastName}
          </Typography>

          {!showAddChargeForm ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Invoice Details
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedReservation?.TotalAmount !== undefined && (
                      <TableRow>
                        <TableCell>Room Charges</TableCell>
                        <TableCell>Base reservation cost</TableCell>
                        <TableCell align="right">
                          ${selectedReservation.TotalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                    {extraCharges.map((charge) => (
                      <TableRow key={charge.ChargeID}>
                        <TableCell>{charge.TypeName || 'Custom'}</TableCell>
                        <TableCell>{charge.Description}</TableCell>
                        <TableCell align="right">
                          ${formatAmount(charge.Amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2}><strong>Grand Total</strong></TableCell>
                      <TableCell align="right"><strong>${totalInvoice.toFixed(2)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setShowAddChargeForm(true)}
                >
                  Add Extra Charges
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCompleteCheckout}
                    disabled={processing === selectedReservation?.ReservationID}
                  >
                    {processing === selectedReservation?.ReservationID ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Complete Checkout'
                    )}
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="subtitle1">Add Extra Charge</Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Charge Type</InputLabel>
                <Select
                  value={newCharge.TypeID || ''}
                  onChange={(e) => {
                    const typeID = Number(e.target.value);
                    const selectedType = extraChargeTypes.find(t => t.TypeID === typeID);
                    setNewCharge({
                      ...newCharge,
                      TypeID: typeID || null,
                      Amount: selectedType ? selectedType.DefaultAmount : newCharge.Amount,
                      Description: selectedType ? selectedType.Name : newCharge.Description
                    });
                  }}
                >
                  <MenuItem value="">Custom Charge</MenuItem>
                  {extraChargeTypes.map((type) => (
                    <MenuItem key={type.TypeID} value={type.TypeID}>
                      {type.Name} (${type.DefaultAmount})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Description"
                value={newCharge.Description}
                onChange={(e) => setNewCharge({ ...newCharge, Description: e.target.value })}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newCharge.Amount}
                onChange={(e) => setNewCharge({ 
                  ...newCharge, 
                  Amount: parseFloat(e.target.value) || 0 
                })}
                sx={{ mt: 2 }}
              />
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowAddChargeForm(false)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddCharge}
                  disabled={!newCharge.Description || newCharge.Amount <= 0}
                >
                  Add Charge
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default CheckOutComponent;