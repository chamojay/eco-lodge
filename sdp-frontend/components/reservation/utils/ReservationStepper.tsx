'use client';
import { Stepper, Step, StepLabel, Box, StepConnector, stepConnectorClasses, styled } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const steps = ['Check Availability', 'Select Room', 'Guest Info', 'Confirmation'];

// Custom connector for the stepper
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 16,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
  [`&.${stepConnectorClasses.active}, 
    &.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#1a472a',
    },
  },
}));

// Custom step icon
const ColorlibStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    backgroundColor: ownerState.active ? '#1a472a' : '#e0e0e0',
    zIndex: 1,
    color: '#fff',
    width: 32,
    height: 32,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
      boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
  })
);

function ColorlibStepIcon(props: any) {
  const { active, completed, className } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <CheckCircle sx={{ color: '#2e7d32', fontSize: 28 }} />
      ) : (
        <div style={{ color: active ? 'white' : '#757575' }}>
          {props.icon}
        </div>
      )}
    </ColorlibStepIconRoot>
  );
}

interface ReservationStepperProps {
  activeStep: number;
}

const ReservationStepper = ({ activeStep }: ReservationStepperProps) => {
  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<ColorlibConnector />}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={ColorlibStepIcon}
              sx={{
                '& .MuiStepLabel-label': {
                  color: activeStep >= steps.indexOf(label) ? '#1a472a' : '#757575',
                  fontWeight: 600,
                },
                '& .Mui-completed': {
                  color: '#2e7d32',
                }
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ReservationStepper;