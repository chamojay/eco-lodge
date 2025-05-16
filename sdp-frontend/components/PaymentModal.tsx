import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';

// Test card details for development
const TEST_CARDS = {
  VISA: { number: '4111 1111 1111 1111', holder: 'TEST USER' },
  MASTER: { number: '5555 5555 5555 4444', holder: 'TEST USER' },
  AMEX: { number: '3782 822463 10005', holder: 'TEST USER' }
};

interface PaymentDetails {
  method: 'Cash' | 'Card' | 'Online';  // Updated to match database ENUM
  cardNumber?: string;
  cardHolder?: string;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (details: PaymentDetails) => Promise<void>;
  total: number;
  isProcessing: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onConfirm,
  total,
  isProcessing
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Online'>('Cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [showTestData, setShowTestData] = useState(false);

  const handleTestDataLoad = (type: string) => {
    switch(type) {
      case 'VISA':
      case 'MASTER':
      case 'AMEX':
        setCardNumber(TEST_CARDS[type].number);
        setCardHolder(TEST_CARDS[type].holder);
        break;
    }
  };

  const renderTestDataSection = () => (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Alert severity="info" sx={{ mb: 1 }}>
        Test Payment Data Available
      </Alert>
      {paymentMethod === 'Card' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => handleTestDataLoad('VISA')}>
            Load VISA Test
          </Button>
          <Button size="small" onClick={() => handleTestDataLoad('MASTER')}>
            Load MASTER Test
          </Button>
          <Button size="small" onClick={() => handleTestDataLoad('AMEX')}>
            Load AMEX Test
          </Button>
        </Box>
      )}
    </Box>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const details: PaymentDetails = {
      method: paymentMethod,
      ...(paymentMethod === 'Card' && { cardNumber, cardHolder })
    };
    await onConfirm(details);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Payment Details (Demo Mode)</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary">
              Total Amount: Rs. {total.toFixed(2)}
            </Typography>
          </Box>
          
          {renderTestDataSection()}
          
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Card' | 'Online')}
          >
            <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
            <FormControlLabel value="Card" control={<Radio />} label="Card" />
            <FormControlLabel value="Online" control={<Radio />} label="Online Payment" />
          </RadioGroup>

          {paymentMethod === 'Card' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                margin="normal"
                required
                helperText="Use test card numbers for demo"
              />
              <TextField
                fullWidth
                label="Card Holder Name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                margin="normal"
                required
              />
            </Box>
          )}

          {paymentMethod === 'Online' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                Redirecting to online payment gateway...
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isProcessing}
          >
            {isProcessing ? <CircularProgress size={24} /> : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PaymentModal;