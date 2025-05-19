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
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import axios from 'axios';
import { reservationService } from '@/app/services/reservationService';
import { packageTypeService } from '@/app/services/packageTypeService';
import { Room, PackageType } from '@/types/reservationtypes';

const steps = ['Select Dates', 'Choose Room', 'Guest Details', 'Reservation Details', 'Review Invoice'];

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getMinCheckInDate = (): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return formatDate(today);
};

const getMinCheckOutDate = (checkInDate: string): string => {
  if (!checkInDate) return '';
  const nextDay = new Date(checkInDate);
  nextDay.setDate(nextDay.getDate() + 1);
  return formatDate(nextDay);
};

const CheckInComponent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSriLankan, setIsSriLankan] = useState(true);
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
    PackageID: '', // Change from 1 to empty string
    Adults: 1,
    Children: 0,
    SpecialRequests: '',
    ArrivalTime: '14:00',
    DepartureTime: '12:00'
  });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

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

  // Set country to Sri Lanka for locals
  useEffect(() => {
    if (isSriLankan) {
      setCustomerData({ ...customerData, Country: 'Sri Lanka', PassportNumber: '' });
    } else {
      setCustomerData({ ...customerData, Country: '', NIC: '' });
    }
  }, [isSriLankan]);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const API_KEY = 'd46d62b08eb9229e97a8cf52';
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
        );
        
        // Add this inside the try block of fetchExchangeRate for debugging
        console.log('Exchange Rate Response:', response.data);

        const data = response.data;
        const rate = data.conversion_rates?.LKR;
        
        if (!rate) {
          throw new Error('LKR rate not found in response');
        }
        setExchangeRate(rate);
        setConversionError(null);
      } catch (error: any) {
        console.error('Error fetching exchange rate:', error);
        const errorMessage = error.response?.data?.error || error.message;
        setConversionError(`Unable to fetch exchange rate: ${errorMessage}. Using fallback rate.`);
        setExchangeRate(320); // Fallback rate
      }
    };

    if (!isSriLankan) {
      fetchExchangeRate();
    }
  }, [isSriLankan]);

  // Fetch package types
  useEffect(() => {
    const fetchPackageTypes = async () => {
      try {
        setPackagesLoading(true);
        const types = await packageTypeService.getAllPackageTypes();
        console.log('Fetched package types:', types);
        setPackageTypes(types);
        // Set the default package ID after fetching
        if (types && types.length > 0) {
          setReservationData(prev => ({
            ...prev,
            PackageID: types[0].PackageID
          }));
        }
      } catch (error) {
        console.error('Error fetching package types:', error);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackageTypes();
  }, []);

  // Validation functions
  const validateStep0 = () => {
    const newErrors: { [key: string]: string } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (!checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    } else if (checkInDate < today) {
      newErrors.checkIn = 'Check-in date cannot be in the past';
    }

    if (!checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    } else if (checkOutDate <= checkInDate) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,10}$/;
    const nicRegex = /^(?:\d{9}[vV]|\d{12})$/;
    const passportRegex = /^[A-Z0-9]{6,9}$/;

    if (!customerData.FirstName.trim()) {
      newErrors.FirstName = 'First name is required';
    } else if (customerData.FirstName.length < 2) {
      newErrors.FirstName = 'First name must be at least 2 characters';
    }

    if (!customerData.LastName.trim()) {
      newErrors.LastName = 'Last name is required';
    } else if (customerData.LastName.length < 2) {
      newErrors.LastName = 'Last name must be at least 2 characters';
    }

    if (!customerData.Email.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!emailRegex.test(customerData.Email)) {
      newErrors.Email = 'Invalid email format';
    }

    if (!customerData.Phone.trim()) {
      newErrors.Phone = 'Phone number is required';
    } else if (customerData.Phone.replace(/\D/g, '').length < 10) {
      newErrors.Phone = 'Phone number must have at least 10 digits';
    } else if (customerData.Phone.replace(/\D/g, '').length > 10) {
      newErrors.Phone = 'Phone number cannot exceed 10 digits';
    } else if (!phoneRegex.test(customerData.Phone)) {
      newErrors.Phone = 'Invalid phone number format';
    }

    if (!isSriLankan && !customerData.Country) {
      newErrors.Country = 'Country is required';
    }

    if (isSriLankan && !customerData.NIC.trim()) {
      newErrors.NIC = 'NIC is required';
    } else if (isSriLankan && !nicRegex.test(customerData.NIC)) {
      newErrors.NIC = 'Invalid NIC format (9 digits + V or 12 digits)';
    }

    if (!isSriLankan && !customerData.PassportNumber.trim()) {
      newErrors.PassportNumber = 'Passport number is required';
    } else if (!isSriLankan && !passportRegex.test(customerData.PassportNumber)) {
      newErrors.PassportNumber = 'Invalid passport number format (6-9 alphanumeric characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (reservationData.Adults < 1) {
      newErrors.Adults = 'At least one adult is required';
    }

    if (reservationData.Children < 0) {
      newErrors.Children = 'Children cannot be negative';
    }

    if (selectedRoom && (reservationData.Adults + reservationData.Children) > selectedRoom.MaxPeople) {
      newErrors.Adults = `Total guests (adults + children) cannot exceed ${selectedRoom.MaxPeople}`;
    }

    if (!reservationData.ArrivalTime) {
      newErrors.ArrivalTime = 'Arrival time is required';
    }

    if (!reservationData.DepartureTime) {
      newErrors.DepartureTime = 'Departure time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchRooms = async () => {
    if (!validateStep0()) return;
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

  const calculateTotalAmount = () => {
    if (!selectedRoom) return null;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
    const pricePerNight = isSriLankan ? selectedRoom.LocalPrice : selectedRoom.ForeignPrice;
    const baseRoomPrice = pricePerNight * numberOfNights;

    const selectedPackage = packageTypes.find(pkg => pkg.PackageID === reservationData.PackageID);
    const packageMultiplier = selectedPackage?.PriceMultiplier || 1;
    const adjustedRoomPrice = baseRoomPrice * packageMultiplier;

    const serviceCharge = adjustedRoomPrice * 0.10;
    const vat = adjustedRoomPrice * 0.18;
    let totalPrice = adjustedRoomPrice + serviceCharge + vat;

    let totalPriceLKR = totalPrice;
    if (!isSriLankan && exchangeRate) {
      totalPriceLKR = totalPrice * exchangeRate;
    }

    return {
      baseRoomPrice,
      adjustedRoomPrice,
      serviceCharge,
      vat,
      totalPrice,
      totalPriceLKR,
      numberOfNights,
      currency: isSriLankan ? 'LKR' : 'USD',
      currencyLKR: 'LKR',
      packageName: selectedPackage?.Name || 'Room Only'
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
          TotalAmount: invoice.totalPriceLKR,
          PackageType: reservationData.PackageType,
          Adults: reservationData.Adults,
          Children: reservationData.Children,
          SpecialRequests: reservationData.SpecialRequests,
          ArrivalTime: reservationData.ArrivalTime,
          DepartureTime: reservationData.DepartureTime
        }
      );
      setActiveStep(5);
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
    setLoading(false);
  };

  const invoice = activeStep === 4 ? calculateTotalAmount() : null;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minCheckOutDate = checkIn ? new Date(new Date(checkIn).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : today;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Typography variant="caption" sx={{ mb: 2, display: 'block', textAlign: 'center' }}>
        Rates by <a href="https://www.exchangerate-api.com">ExchangeRate-API</a>
      </Typography>
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
            InputProps={{ 
              inputProps: { 
                min: getMinCheckInDate(),
                max: '2025-12-31' // Set a reasonable maximum date
              } 
            }}
            value={checkIn}
            onChange={(e) => {
              const newCheckIn = e.target.value;
              setCheckIn(newCheckIn);
              // If check-out date is before new check-in date + 1 day, update it
              if (checkOut && new Date(checkOut) <= new Date(newCheckIn)) {
                setCheckOut(getMinCheckOutDate(newCheckIn));
              }
            }}
            error={!!errors.checkIn}
            helperText={errors.checkIn}
            sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
          />
          <TextField
            label="Check-out Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            InputProps={{ 
              inputProps: { 
                min: checkIn ? getMinCheckOutDate(checkIn) : getMinCheckInDate(),
                max: '2025-12-31' // Set a reasonable maximum date
              } 
            }}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            error={!!errors.checkOut}
            helperText={errors.checkOut}
            disabled={!checkIn} // Disable until check-in is selected
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
          {conversionError && (
            <Typography color="error">{conversionError}</Typography>
          )}
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
                  <Typography>Max Guests: {room.MaxPeople}</Typography>
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
            error={!!errors.FirstName}
            helperText={errors.FirstName}
          />
          <TextField
            label="Last Name"
            value={customerData.LastName}
            onChange={(e) => setCustomerData({ ...customerData, LastName: e.target.value })}
            error={!!errors.LastName}
            helperText={errors.LastName}
          />
          <TextField
            label="Email"
            type="email"
            value={customerData.Email}
            onChange={(e) => setCustomerData({ ...customerData, Email: e.target.value })}
            error={!!errors.Email}
            helperText={errors.Email}
          />
          <TextField
            label="Phone"
            value={customerData.Phone}
            onChange={(e) => setCustomerData({ ...customerData, Phone: e.target.value })}
            error={!!errors.Phone}
            helperText={errors.Phone}
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
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Country" 
                error={!!errors.Country}
                helperText={errors.Country}
              />
            )}
          />
          {isSriLankan ? (
            <TextField
              label="NIC"
              value={customerData.NIC}
              onChange={(e) => setCustomerData({ ...customerData, NIC: e.target.value })}
              error={!!errors.NIC}
              helperText={errors.NIC}
            />
          ) : (
            <TextField
              label="Passport Number"
              value={customerData.PassportNumber}
              onChange={(e) => setCustomerData({ ...customerData, PassportNumber: e.target.value })}
              error={!!errors.PassportNumber}
              helperText={errors.PassportNumber}
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => setActiveStep(1)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (validateStep2()) {
                  setActiveStep(3);
                }
              }}
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
          <FormControl fullWidth error={!!errors.PackageID}>
            <InputLabel>Package Type</InputLabel>
            <Select
              value={reservationData.PackageID}
              onChange={(e) => {
                console.log('Selected package:', e.target.value);
                setReservationData({
                  ...reservationData,
                  PackageID: e.target.value
                });
              }}
              label="Package Type"
            >
              {packagesLoading ? (
                <MenuItem disabled>Loading packages...</MenuItem>
              ) : packageTypes.length > 0 ? (
                packageTypes.map((pkg) => (
                  <MenuItem key={pkg.PackageID} value={pkg.PackageID}>
                    {pkg.Name} ({((pkg.PriceMultiplier * 100) - 100).toFixed(0)}% extra)
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No package types available</MenuItem>
              )}
            </Select>
            {errors.PackageID && (
              <FormHelperText>{errors.PackageID}</FormHelperText>
            )}
          </FormControl>
          <TextField
            label="Adults"
            type="number"
            value={reservationData.Adults}
            onChange={(e) => setReservationData({
              ...reservationData,
              Adults: e.target.value ? parseInt(e.target.value) : 1
            })}
            inputProps={{ min: 1 }}
            error={!!errors.Adults}
            helperText={errors.Adults}
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
            error={!!errors.Children}
            helperText={errors.Children}
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
            error={!!errors.ArrivalTime}
            helperText={errors.ArrivalTime}
          />
          <TextField
            label="Departure Time"
            type="time"
            value={reservationData.DepartureTime}
            onChange={(e) => setReservationData({ ...reservationData, DepartureTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            error={!!errors.DepartureTime}
            helperText={errors.DepartureTime}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => setActiveStep(2)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (validateStep3()) {
                  setActiveStep(4);
                }
              }}
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
                  <TableCell>
                    Package Adjustment ({invoice.packageName})
                  </TableCell>
                  <TableCell align="right">
                    {invoice.currency} {(invoice.adjustedRoomPrice - invoice.baseRoomPrice).toFixed(2)}
                  </TableCell>
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
                {!isSriLankan && (
                  <TableRow>
                    <TableCell><strong>Total Price in LKR (Exchange Rate: 1 USD = {exchangeRate?.toFixed(2)} LKR)</strong></TableCell>
                    <TableCell align="right"><strong>LKR {invoice.totalPriceLKR.toFixed(2)}</strong></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {conversionError && (
            <Typography color="error">{conversionError}</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => setActiveStep(3)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitReservation}
              disabled={loading || (!isSriLankan && !exchangeRate)}
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