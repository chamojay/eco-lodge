'use client';
import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  InputLabel, 
  FormControl, 
  Select, 
  MenuItem, 
  Typography 
} from '@mui/material';
import { StepComponentProps } from './utils/types';

export interface Customer {
  title: "Mr" | "Mrs" | "Ms";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  arrivalTime: string;
  specialRequests: string;
}

const GuestInfo = ({ data, setData, onNext, onBack }: StepComponentProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!data.customer.firstName) newErrors.firstName = 'Required';
    if (!data.customer.lastName) newErrors.lastName = 'Required';
    if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(data.customer.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!data.customer.phone) newErrors.phone = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) onNext();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="#1a472a">
        Guest Information
      </Typography>

      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Title</InputLabel>
          <Select
            value={data.customer.title}
            onChange={(e) => setData(prev => ({
              ...prev,
              customer: { ...prev.customer, title: e.target.value }
            }))}
            label="Title"
          >
            <MenuItem value="Mr">Mr</MenuItem>
            <MenuItem value="Mrs">Mrs</MenuItem>
            <MenuItem value="Ms">Ms</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="First Name"
          value={data.customer.firstName}
          onChange={(e) => setData(prev => ({
            ...prev,
            customer: { ...prev.customer, firstName: e.target.value }
          }))}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />

        <TextField
          label="Last Name"
          value={data.customer.lastName}
          onChange={(e) => setData(prev => ({
            ...prev,
            customer: { ...prev.customer, lastName: e.target.value }
          }))}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />

        <TextField
          label="Email"
          type="email"
          value={data.customer.email}
          onChange={(e) => setData(prev => ({
            ...prev,
            customer: { ...prev.customer, email: e.target.value }
          }))}
          error={!!errors.email}
          helperText={errors.email}
        />

        <TextField
          label="Phone Number"
          value={data.customer.phone}
          onChange={(e) => setData(prev => ({
            ...prev,
            customer: { ...prev.customer, phone: e.target.value }
          }))}
          error={!!errors.phone}
          helperText={errors.phone}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onBack} sx={{ color: '#1a472a' }}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: '#1a472a', '&:hover': { bgcolor: '#2e7d32' } }}
          >
            Show Rates
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GuestInfo;