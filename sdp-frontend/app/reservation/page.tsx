'use client';
import { useState } from 'react';
import { Container, Paper } from '@mui/material';
import CheckAvailability from '@/components/reservation/CheckAvilability';
import RoomSelection from '@/components/reservation/RoomSelection';
import GuestInfo from '@/components/reservation/GuestInfo';
import Confirmation from '@/components/reservation/Confirmation';
import ReservationStepper from '@/components/reservation/utils/ReservationStepper';
import { ReservationData } from '@/components/reservation/utils/types';

const steps = ['Check Availability', 'Select Room', 'Guest Info', 'Confirmation'];

export default function ReservationPage() {
  const [activeStep, setActiveStep] = useState(0);
const [reservationData, setReservationData] = useState<ReservationData>({
    checkIn: null,
    checkOut: null,
    isSriLankan: false,
    packageType: 'RoomOnly',
    customer: {
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        adults: 1,
        children: 0,
        arrivalTime: '',
        specialRequests: ''
    }
});

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <ReservationStepper activeStep={activeStep} />
        
        {activeStep === 0 && (
          <CheckAvailability 
            data={reservationData}
            setData={setReservationData}
            onNext={handleNext}
          />
        )}

        {activeStep === 1 && (
          <RoomSelection 
            data={reservationData}
            setData={setReservationData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {activeStep === 2 && (
          <GuestInfo 
            data={reservationData}
            setData={setReservationData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {activeStep === 3 && (
          <Confirmation 
            data={reservationData}
            onBack={handleBack}
            onSubmit={() => console.log('Submit reservation')}
          />
        )}
      </Paper>
    </Container>
  );
}