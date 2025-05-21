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
import DownloadIcon from '@mui/icons-material/Download';
import { reservationService } from '@/app/services/reservationService';
import { extraChargesService, ExtraCharge, ExtraChargeType } from '@/app/services/extraChargesService';
import { activityService, ReservationActivity } from '@/app/services/activityService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from '../../styles/checkout.module.css';

interface Reservation {
  ReservationID: string;
  CheckInDate: string;
  CheckOutDate: string;
  FirstName: string;
  LastName: string;
  RoomNumber: string;
  TotalAmount: number;
  PaymentStatus?: string;
  PaymentMethod?: string;
  PaymentSource?: string;
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

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) 
    ? date.toLocaleDateString()
    : 'Invalid date';
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
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
  const [baseAmountPaidOnline, setBaseAmountPaidOnline] = useState<boolean>(false);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  // Add a new state to track if checkout is completed
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);

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
        setErrorMessage('Failed to load reservations');
        setOpenErrorSnackbar(true);
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const fetchReservationDetails = async (reservationId: string) => {
    try {
      const [charges, activities, reservation] = await Promise.all([
        extraChargesService.getChargesByReservation(Number(reservationId)),
        activityService.getActivitiesForReservation(Number(reservationId)),
        reservationService.getReservationDetails(reservationId)
      ]);
      setExtraCharges(charges);
      setActivities(activities);
      setBaseAmountPaidOnline(reservation.PaymentSource === 'Web');
      setPaidAmount(reservation.TotalAmount || 0);
    } catch (error) {
      console.error('Error fetching reservation details:', error);
      setErrorMessage('Failed to load reservation details');
      setOpenErrorSnackbar(true);
    }
  };

  const handleViewInvoice = async (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setBaseAmountPaidOnline(false); // Reset to avoid stale state
    setPaidAmount(0);
    setCheckoutCompleted(false); // Reset the state
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
      setNewCharge({ ...newCharge, Description: '', Amount: 0, TypeID: null });
      setView('invoice');
    } catch (error) {
      console.error('Error adding charge:', error);
      setErrorMessage('Failed to add extra charge');
      setOpenErrorSnackbar(true);
    }
  };

  const handleRemoveCharge = async (chargeId: number) => {
    try {
      await extraChargesService.deleteCharge(chargeId);
      selectedReservation && await fetchReservationDetails(selectedReservation.ReservationID);
    } catch (error) {
      console.error('Error removing charge:', error);
      setErrorMessage('Failed to remove charge');
      setOpenErrorSnackbar(true);
    }
  };

  const handleCompleteCheckout = async () => {
    if (!selectedReservation) return;
    setProcessing(selectedReservation.ReservationID);
    try {
      const response = await reservationService.completeCheckout(selectedReservation.ReservationID, paymentMethod);
      setCheckoutCompleted(true); // Set to true after successful checkout
      setOpenConfirmDialog(false);
      setOpenSuccessSnackbar(true);
    } catch (error) {
      console.error('Checkout failed:', error);
      setErrorMessage('Checkout failed. Please try again.');
      setOpenErrorSnackbar(true);
    }
    setProcessing(null);
  };

  const totalInvoice = (
    (baseAmountPaidOnline ? 0 : (selectedReservation?.TotalAmount || 0)) +
    extraCharges.reduce((sum, charge) => sum + (typeof charge.Amount === 'string' ? parseFloat(charge.Amount) : charge.Amount) || 0, 0) +
    activities.reduce((sum, activity) => sum + (typeof activity.Amount === 'string' ? parseFloat(activity.Amount) : activity.Amount) || 0, 0)
  ).toFixed(2);

  const generatePDF = async () => {
    if (!selectedReservation) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Eco Lodge Resort', pageWidth/2, margin, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Invoice', pageWidth/2, margin + 10, { align: 'center' });
    
    // Customer Details
    doc.setFontSize(12);
    doc.text('Customer Details:', margin, margin + 25);
    doc.setFontSize(10);
    const customerDetails = [
      [`Name: ${selectedReservation.FirstName} ${selectedReservation.LastName}`],
      [`Reservation ID: ${selectedReservation.ReservationID}`],
      [`Room Number: ${selectedReservation.RoomNumber}`],
      [`Check-in Date: ${formatDate(selectedReservation.CheckInDate)}`],
      [`Check-out Date: ${formatDate(selectedReservation.CheckOutDate)}`]
    ];
    autoTable(doc, {
      startY: margin + 30,
      body: customerDetails,
      theme: 'plain',
      styles: { cellPadding: 1 }
    });

    // Base Reservation Charges
    doc.setFontSize(12);
    doc.text('Base Reservation Charges:', margin, doc.lastAutoTable.finalY + 15);
    
    const baseCharges = [
      ['Description', 'Amount (LKR)'],
      ['Base Room Price', formatAmount(baseAmountPaidOnline ? paidAmount : selectedReservation.TotalAmount)],
      ['Payment Status', baseAmountPaidOnline ? 'Paid Online' : 'To be paid']
    ];
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [baseCharges[0]],
      body: baseCharges.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [26, 71, 42] }
    });

    // Extra Charges
    if (extraCharges.length > 0) {
      doc.text('Extra Charges:', margin, doc.lastAutoTable.finalY + 15);
      const extraChargesData = extraCharges.map(charge => [
        charge.TypeName || 'Custom',
        charge.Description,
        `LKR ${formatAmount(charge.Amount)}`
      ]);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Type', 'Description', 'Amount']],
        body: extraChargesData,
        theme: 'striped',
        headStyles: { fillColor: [26, 71, 42] }
      });
    }

    // Activities
    if (activities.length > 0) {
      doc.text('Activities:', margin, doc.lastAutoTable.finalY + 15);
      const activitiesData = activities.map(activity => [
        activity.Name,
        `${activity.Participants} participants`,
        formatDate(activity.ScheduledDate),
        `LKR ${formatAmount(activity.Amount)}`
      ]);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Activity', 'Participants', 'Date', 'Amount']],
        body: activitiesData,
        theme: 'striped',
        headStyles: { fillColor: [26, 71, 42] }
      });
    }

    // Total Amount (updated text)
    doc.text('Payment Summary:', margin, doc.lastAutoTable.finalY + 15);
    const paymentSummary = [
      ['Description', 'Amount (LKR)'],
      ['Base Amount', formatAmount(baseAmountPaidOnline ? paidAmount : selectedReservation.TotalAmount)],
      ['Extra Charges', formatAmount(extraCharges.reduce((sum, charge) => sum + Number(charge.Amount), 0))],
      ['Activities', formatAmount(activities.reduce((sum, activity) => sum + Number(activity.Amount), 0))],
      ['Total Amount Paid', formatAmount(totalInvoice)] // Changed from 'Total Amount Due'
    ];
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [paymentSummary[0]],
      body: paymentSummary.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [26, 71, 42] }
    });

    // Footer
    const today = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${today}`, margin, pageHeight - margin);
    doc.text('Eco Lodge Resort', pageWidth - margin, pageHeight - margin, { align: 'right' });

    // Save the PDF
    doc.save(`invoice-${selectedReservation.ReservationID}.pdf`);
  };

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
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography component="span">
                            {res.FirstName} {res.LastName}
                          </Typography>
                          <Typography 
                            component="span" 
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.875rem',
                              backgroundColor: '#f3f4f6',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            | RES.ID: {res.ReservationID}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" component="span">
                            Room {res.RoomNumber} | Check-in: {formatDate(res.CheckInDate)} | Check-out: {formatDate(res.CheckOutDate)}
                          </Typography>
                        </Box>
                      }
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
                      <TableCell align="right">
                        {baseAmountPaidOnline ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Typography color="success.main">
                              Paid Online
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              (LKR {formatAmount(paidAmount)})
                            </Typography>
                          </Box>
                        ) : (
                          `LKR ${formatAmount(selectedReservation?.TotalAmount)}`
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    
                    {/* Only show additional charges if they exist */}
                    {activities.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', my: 1 }}>
                            Additional Charges
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    
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

                    {/* Only show total if there are additional charges or the base amount wasn't paid online */}
                    {(!baseAmountPaidOnline || activities.length > 0 || extraCharges.length > 0) && (
                      <TableRow>
                        <TableCell colSpan={2}><strong>Amount Due</strong></TableCell>
                        <TableCell align="right">
                          <strong>LKR {totalInvoice}</strong>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                {checkoutCompleted && ( // Only show download button after checkout
                  <Button 
                    onClick={generatePDF}
                    startIcon={<DownloadIcon />}
                    sx={{ 
                      bgcolor: '#1a472a', 
                      color: 'white',
                      '&:hover': { bgcolor: '#2c6a43' }
                    }}
                  >
                    Download Invoice
                  </Button>
                )}
                {!checkoutCompleted && ( // Show these buttons before checkout
                  <>
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
                        {processing === selectedReservation?.ReservationID ? 
                          <CircularProgress size={24} /> : 
                          'Proceed to Checkout'
                        }
                      </Button>
                    </Box>
                  </>
                )}
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
              <li>
                Room Charges: {baseAmountPaidOnline ? (
                  <Typography component="span" color="success.main">
                    Paid Online (LKR {formatAmount(paidAmount)})
                  </Typography>
                ) : (
                  `LKR ${formatAmount(selectedReservation?.TotalAmount)}`
                )}
              </li>
              {activities.length > 0 && (
                <li>Activity Charges: LKR {formatAmount(activities.reduce((sum, a) => sum + Number(a.Amount), 0))}</li>
              )}
              {extraCharges.length > 0 && (
                <li>Extra Charges: LKR {formatAmount(extraCharges.reduce((sum, c) => sum + Number(c.Amount), 0))}</li>
              )}
              {(!baseAmountPaidOnline || activities.length > 0 || extraCharges.length > 0) && (
                <li><strong>Total Amount Due: LKR {totalInvoice}</strong></li>
              )}
            </Box>
          </DialogContentText>

          {/* Only show payment method if there's an amount due */}
          {Number(totalInvoice) > 0 && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Card')}
                label="Payment Method"
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
              </Select>
            </FormControl>
          )}
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

      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setOpenErrorSnackbar(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckOutComponent;