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
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Slide
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { reservationService } from '@/app/services/reservationService';
import { extraChargesService, ExtraCharge, ExtraChargeType } from '@/app/services/extraChargesService';
import { activityService, ReservationActivity } from '@/app/services/activityService';
import styles from '../../styles/checkout.module.css';

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
  return checkoutMidnight < todayMidnight ? 'overdue' : checkoutMidnight.getTime() === todayMidnight.getTime() ? 'today' : 'future';
};

const formatAmount = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const CheckOutComponent = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'invoice' | 'addCharge'>('list');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [extraChargeTypes, setExtraChargeTypes] = useState<ExtraChargeType[]>([]);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [activities, setActivities] = useState<ReservationActivity[]>([]);
  const [newCharge, setNewCharge] = useState<ExtraCharge>({ ChargeID: 0, Description: '', Amount: 0, ReservationID: 0, TypeID: null });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [reservationsData, typesData] = await Promise.all([
          reservationService.getActiveReservations(),
          extraChargesService.getAllTypes()
        ]);
        setReservations(reservationsData);
        setExtraChargeTypes(typesData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const fetchReservationDetails = async (reservationId: string) => {
    try {
      const [charges, activities] = await Promise.all([
        extraChargesService.getChargesByReservation(Number(reservationId)),
        activityService.getActivitiesForReservation(Number(reservationId))
      ]);
      setExtraCharges(charges);
      setActivities(activities);
    } catch (error) {
      console.error('Error fetching reservation details:', error);
    }
  };

  const handleViewInvoice = async (reservation: Reservation) => {
    setSelectedReservation(reservation);
    await fetchReservationDetails(reservation.ReservationID);
    setNewCharge({ ...newCharge, ReservationID: Number(reservation.ReservationID) });
    setView('invoice');
  };

  const handleAddCharge = async () => {
    if (!selectedReservation || !newCharge.Description || newCharge.Amount <= 0) return;
    try {
      await extraChargesService.addCharge({
        ReservationID: Number(selectedReservation.ReservationID),
        TypeID: newCharge.TypeID,
        Description: newCharge.Description,
        Amount: Number(newCharge.Amount)
      });
      await fetchReservationDetails(selectedReservation.ReservationID);
      setNewCharge({ ChargeID: 0, Description: '', Amount: 0, ReservationID: Number(selectedReservation.ReservationID), TypeID: null });
      setView('invoice');
    } catch (error) {
      console.error('Error adding charge:', error);
    }
  };

  const handleRemoveCharge = async (chargeId: number) => {
    try {
      await extraChargesService.deleteCharge(chargeId);
      selectedReservation && await fetchReservationDetails(selectedReservation.ReservationID);
    } catch (error) {
      console.error('Error removing charge:', error);
    }
  };

  const handleCompleteCheckout = async () => {
    if (!selectedReservation) return;
    setProcessing(selectedReservation.ReservationID);
    try {
      await reservationService.completeCheckout(selectedReservation.ReservationID);
      setReservations(reservations.filter(r => r.ReservationID !== selectedReservation.ReservationID));
      setView('list');
      setSelectedReservation(null);
      setExtraCharges([]);
      setActivities([]);
      setOpenConfirmDialog(false);
      setOpenSuccessSnackbar(true);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
    setProcessing(null);
  };

  const totalInvoice = (
    (selectedReservation?.TotalAmount || 0) +
    extraCharges.reduce((sum, charge) => sum + (typeof charge.Amount === 'string' ? parseFloat(charge.Amount) : charge.Amount) || 0, 0) +
    activities.reduce((sum, activity) => sum + (typeof activity.Amount === 'string' ? parseFloat(activity.Amount) : activity.Amount) || 0, 0)
  ).toFixed(2);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Slide direction="right" in={view === 'list'} mountOnEnter unmountOnExit>
        <Box className={styles.reservationList}>
          <Typography variant="h5" sx={{ color: '#1a472a', mb: 3, fontWeight: 600 }}>
            Active Reservations
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : reservations.length === 0 ? (
            <Typography color="text.secondary">No active reservations</Typography>
          ) : (
            <List sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
              {reservations.map(res => {
                const status = getCheckoutStatus(res.CheckOutDate);
                return (
                  <ListItem
                    key={res.ReservationID}
                    sx={{ borderBottom: '1px solid #eee', py: 2 }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {status === 'today' && <Typography className={styles.statusToday}>Checkout today</Typography>}
                        {status === 'overdue' && <Typography className={styles.statusOverdue}>Checkout overdue</Typography>}
                        <Button
                          className={styles.buttonPrimary}
                          onClick={() => handleViewInvoice(res)}
                          disabled={processing === res.ReservationID}
                          sx={{ minWidth: 140 }}
                        >
                          {processing === res.ReservationID ? <CircularProgress size={24} /> : 'Process Checkout'}
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`${res.FirstName} ${res.LastName}`}
                      secondary={`Room ${res.RoomNumber} - Checkout: ${new Date(res.CheckOutDate).toLocaleDateString()}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Slide>

      <Slide direction="left" in={view === 'invoice' || view === 'addCharge'} mountOnEnter unmountOnExit>
        <Box className={styles.invoicePage}>
          <Typography variant="h6" sx={{ color: '#1a472a', mb: 2, fontWeight: 600 }}>
            Checkout for {selectedReservation?.FirstName} {selectedReservation?.LastName}
          </Typography>

          {view === 'invoice' ? (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#374151' }}>Invoice Details</Typography>
              <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Room Charges</TableCell>
                      <TableCell>Base reservation cost</TableCell>
                      <TableCell align="right">LKR {formatAmount(selectedReservation?.TotalAmount)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    {activities.map(activity => (
                      <TableRow key={`activity-${activity.ReservationActivityID}`}>
                        <TableCell>Activity</TableCell>
                        <TableCell>
                          {activity.Name} ({activity.Participants} participants)
                          <Typography variant="caption" display="block" color="text.secondary">
                            {new Date(activity.ScheduledDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">LKR {formatAmount(activity.Amount)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                    {extraCharges.map(charge => (
                      <TableRow key={charge.ChargeID}>
                        <TableCell>{charge.TypeName || 'Custom'}</TableCell>
                        <TableCell>{charge.Description}</TableCell>
                        <TableCell align="right">LKR {formatAmount(charge.Amount)}</TableCell>
                        <TableCell align="right">
                          <IconButton color="error" onClick={() => handleRemoveCharge(charge.ChargeID)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2}><strong>Grand Total</strong></TableCell>
                      <TableCell align="right"><strong>LKR {totalInvoice}</strong></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Button className={styles.buttonPrimary} onClick={() => setView('addCharge')}>
                  Add Extra Charge
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={() => setView('list')}>
                    Back
                  </Button>
                  <Button
                    className={styles.buttonPrimary}
                    onClick={() => setOpenConfirmDialog(true)}
                    disabled={processing === selectedReservation?.ReservationID}
                  >
                    {processing === selectedReservation?.ReservationID ? <CircularProgress size={24} /> : 'Proceed to Checkout'}
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#374151' }}>Add Extra Charge</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Charge Type</InputLabel>
                <Select
                  value={newCharge.TypeID || ''}
                  onChange={e => {
                    const typeID = Number(e.target.value);
                    const type = extraChargeTypes.find(t => t.TypeID === typeID);
                    setNewCharge({
                      ...newCharge,
                      TypeID: typeID || null,
                      Amount: type?.DefaultAmount || newCharge.Amount,
                      Description: type?.Name || newCharge.Description
                    });
                  }}
                >
                  <MenuItem value="">Custom Charge</MenuItem>
                  {extraChargeTypes.map(type => (
                    <MenuItem key={type.TypeID} value={type.TypeID}>
                      {type.Name} (LKR {formatAmount(type.DefaultAmount)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Description"
                value={newCharge.Description}
                onChange={e => setNewCharge({ ...newCharge, Description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newCharge.Amount}
                onChange={e => setNewCharge({ ...newCharge, Amount: parseFloat(e.target.value) || 0 })}
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setView('invoice')}>
                  Back
                </Button>
                <Button
                  className={styles.buttonPrimary}
                  onClick={handleAddCharge}
                  disabled={!newCharge.Description || newCharge.Amount <= 0}
                >
                  Add Charge
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Slide>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Checkout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Checkout Summary for {selectedReservation?.FirstName} {selectedReservation?.LastName}:
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Room Charges: LKR {formatAmount(selectedReservation?.TotalAmount)}</li>
              {activities.length > 0 && (
                <li>Activity Charges: LKR {formatAmount(activities.reduce((sum, a) => sum + Number(a.Amount), 0))}</li>
              )}
              {extraCharges.length > 0 && (
                <li>Extra Charges: LKR {formatAmount(extraCharges.reduce((sum, c) => sum + Number(c.Amount), 0))}</li>
              )}
              <li><strong>Total Amount Due: LKR {totalInvoice}</strong></li>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button
            className={styles.buttonPrimary}
            onClick={handleCompleteCheckout}
            disabled={processing === selectedReservation?.ReservationID}
          >
            {processing === selectedReservation?.ReservationID ? <CircularProgress size={24} /> : 'Confirm Checkout'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setOpenSuccessSnackbar(false)}>
          Checkout completed successfully for {selectedReservation?.FirstName} {selectedReservation?.LastName}!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckOutComponent;