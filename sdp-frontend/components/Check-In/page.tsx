'use client';
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import { reservationService } from '@/app/services/reservationService';
import { Room } from '@/types/reservationtypes';

// Updated steps array to include 'Review Invoice' as the 5th step
const steps = ['Select Dates', 'Choose Room', 'Guest Details', 'Reservation Details', 'Review Invoice'];

const CheckInComponent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSriLankan, setIsSriLankan] = useState(true); // Default to true
  const [customerData, setCustomerData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    Country: '',
    NIC: '',
    PassportNumber: '',
  });
  const [reservationData, setReservationData] = useState({
    PackageType: 'RoomOnly',
    Adults: 1,
    Children: 0,
    SpecialRequests: '',
    ArrivalTime: '14:00',
    DepartureTime: '12:00'
  });

  // list of countries 
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 
    'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 
    'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 
    'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 
    'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 
    'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 
    'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 
    'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 
    'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 
    'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 
    'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 
    'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 
    'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 
    'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 
    'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 
    'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 
    'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 
    'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 
    'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 
    'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 
    'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 
    'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 
    'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 
    'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
    'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 
    'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  // Country is set to "Sri Lanka" when isSriLankan is true
  useEffect(() => {
    if (isSriLankan) {
      setCustomerData({ ...customerData, Country: 'Sri Lanka' });
    }
  }, [isSriLankan]);

  const handleSearchRooms = async () => {
    setLoading(true);
    try {
      const availableRooms = await reservationService.checkAvailability(checkIn, checkOut);
      setRooms(availableRooms as Room[]);
      setActiveStep(1);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
    setLoading(false);
  };

  // Function to calculate the total amount including package adjustment and taxes
  const calculateTotalAmount = () => {
    if (!selectedRoom) return null;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
    const pricePerNight = isSriLankan ? selectedRoom.LocalPrice : selectedRoom.ForeignPrice;
    const baseRoomPrice = pricePerNight * numberOfNights;

    // Adjust price based on package type
    let packageMultiplier = 1;
    if (reservationData.PackageType === 'HalfBoard') {
      packageMultiplier = 1.3;
    } else if (reservationData.PackageType === 'FullBoard') {
      packageMultiplier = 1.5;
    }
    const adjustedRoomPrice = baseRoomPrice * packageMultiplier;

    // Calculate taxes
    const serviceCharge = adjustedRoomPrice * 0.10; // 10% service charge
    const vat = adjustedRoomPrice * 0.18; // 18% VAT
    const totalPrice = adjustedRoomPrice + serviceCharge + vat;

    return {
      baseRoomPrice,
      adjustedRoomPrice,
      serviceCharge,
      vat,
      totalPrice,
      numberOfNights,
      currency: isSriLankan ? 'LKR' : 'USD'
    };
  };

  const handleSubmitReservation = async () => {
    setLoading(true);
    try {
      if (!selectedRoom) throw new Error('No room selected');
      const invoice = calculateTotalAmount();
      if (!invoice) throw new Error('Unable to calculate total amount');

      await reservationService.createReservation(
        selectedRoom.RoomNumber,
        customerData,
        {
          CheckInDate: checkIn,
          CheckOutDate: checkOut,
          TotalAmount: invoice.totalPrice,
          PackageType: reservationData.PackageType,
          Adults: reservationData.Adults,
          Children: reservationData.Children,
          SpecialRequests: reservationData.SpecialRequests,
          ArrivalTime: reservationData.ArrivalTime,
          DepartureTime: reservationData.DepartureTime
        }
      );
      setActiveStep(5); // Move to success state after submission
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
    setLoading(false);
  };

  const invoice = activeStep === 4 ? calculateTotalAmount() : null;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Select Dates */}
      {activeStep === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a472a' }}>
            Select Check-in/Check-out Dates
          </Typography>
          <TextField
            label="Check-in Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
          />
          <TextField
            label="Check-out Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1a472a' }}>
            <Typography>Are you Sri Lankan?</Typography>
            <Checkbox
              checked={isSriLankan}
              onChange={(e) => setIsSriLankan(e.target.checked)}
              sx={{ color: '#1a472a' }}
            />
          </Box>
          <Button 
            variant="contained" 
            onClick={handleSearchRooms}
            disabled={!checkIn || !checkOut || loading}
            sx={{ backgroundColor: '#1a472a', color: 'white' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search Rooms'}
          </Button>
        </Box>
      )}

      {/* Step 1: Choose Room */}
      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Available Rooms</Typography>
          <Grid container spacing={3}>
            {rooms.map((room) => (
              <Grid item xs={6} key={room.RoomNumber}>
                <Paper 
                  onClick={() => setSelectedRoom(room)}
                  sx={{ 
                    p: 2, 
                    border: selectedRoom?.RoomNumber === room.RoomNumber ? '2px solid #1a472a' : '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                >
                  <Typography variant="subtitle1">Room {room.RoomNumber}</Typography>
                  <Typography>Type: {room.Type}</Typography>
                  <Typography>
                    Price: {isSriLankan ? `LKR ${room.LocalPrice}` : `USD ${room.ForeignPrice}`}/night
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => setActiveStep(0)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveStep(2)}
              disabled={!selectedRoom}
              sx={{ backgroundColor: '#1a472a', color: 'white' }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Guest Details */}
      {activeStep === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6">Guest Information</Typography>
          <TextField
            label="First Name"
            value={customerData.FirstName}
            onChange={(e) => setCustomerData({ ...customerData, FirstName: e.target.value })}
          />
          <TextField
            label="Last Name"
            value={customerData.LastName}
            onChange={(e) => setCustomerData({ ...customerData, LastName: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            value={customerData.Email}
            onChange={(e) => setCustomerData({ ...customerData, Email: e.target.value })}
          />
          <TextField
            label="Phone"
            value={customerData.Phone}
            onChange={(e) => setCustomerData({ ...customerData, Phone: e.target.value })}
          />
          <Autocomplete
            options={countries}
            value={customerData.Country}
            onChange={(event, newValue) => {
              if (!isSriLankan) {
                setCustomerData({ ...customerData, Country: newValue || '' });
              }
            }}
            disabled={isSriLankan}
            renderInput={(params) => <TextField {...params} label="Country" />}
          />
          <TextField
            label="NIC"
            value={customerData.NIC}
            onChange={(e) => setCustomerData({ ...customerData, NIC: e.target.value })}
            
          />

          <TextField
            label="Passport Number"
            value={customerData.PassportNumber}
            onChange={(e) => setCustomerData({ ...customerData, PassportNumber: e.target.value })}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => setActiveStep(1)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveStep(3)}
              sx={{ backgroundColor: '#1a472a', color: 'white' }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 3: Reservation Details */}
      {activeStep === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6">Reservation Details</Typography>
          <TextField
            select
            label="Package Type"
            value={reservationData.PackageType}
            onChange={(e) => setReservationData({ ...reservationData, PackageType: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="RoomOnly">Room Only</option>
            <option value="HalfBoard">Half Board</option>
            <option value="FullBoard">Full Board</option>
          </TextField>
          <TextField
            label="Adults"
            type="number"
            value={reservationData.Adults}
            onChange={(e) => setReservationData({
              ...reservationData,
              Adults: e.target.value ? parseInt(e.target.value) : 1
            })}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Children"
            type="number"
            value={reservationData.Children}
            onChange={(e) => setReservationData({
              ...reservationData,
              Children: e.target.value ? parseInt(e.target.value) : 0
            })}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Special Requests"
            multiline
            rows={4}
            value={reservationData.SpecialRequests}
            onChange={(e) => setReservationData({ ...reservationData, SpecialRequests: e.target.value })}
          />
          <TextField
            label="Arrival Time"
            type="time"
            value={reservationData.ArrivalTime}
            onChange={(e) => setReservationData({ ...reservationData, ArrivalTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Departure Time"
            type="time"
            value={reservationData.DepartureTime}
            onChange={(e) => setReservationData({ ...reservationData, DepartureTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => setActiveStep(2)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveStep(4)}
              sx={{ backgroundColor: '#1a472a', color: 'white' }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 4: Review Invoice */}
      {activeStep === 4 && invoice && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6">Invoice Summary</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    Base Room Price ({invoice.currency} {isSriLankan ? selectedRoom?.LocalPrice : selectedRoom?.ForeignPrice}/night x {invoice.numberOfNights} nights)
                  </TableCell>
                  <TableCell align="right">{invoice.currency} {invoice.baseRoomPrice.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Package Adjustment ({reservationData.PackageType})</TableCell>
                  <TableCell align="right">{invoice.currency} {(invoice.adjustedRoomPrice - invoice.baseRoomPrice).toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Service Charge (10%)</TableCell>
                  <TableCell align="right">{invoice.currency} {invoice.serviceCharge.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>VAT (18%)</TableCell>
                  <TableCell align="right">{invoice.currency} {invoice.vat.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Total Price</strong></TableCell>
                  <TableCell align="right"><strong>{invoice.currency} {invoice.totalPrice.toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => setActiveStep(3)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitReservation}
              disabled={loading}
              sx={{ backgroundColor: '#1a472a', color: 'white' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm Reservation'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 5: Success */}
      {activeStep === 5 && (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#1a472a' }}>
            Reservation Successful!
          </Typography>
          <Typography>Room {selectedRoom?.RoomNumber} has been booked.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CheckInComponent;