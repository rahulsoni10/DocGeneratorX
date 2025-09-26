import { Box, Stepper, Step, StepLabel, StepConnector } from '@mui/material';
import { styled } from '@mui/material/styles';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.grey[200],
    borderRadius: 1,
  },
  '&.Mui-active .MuiStepConnector-line': {
    background: 'linear-gradient(45deg, rgb(0, 188, 255) 0%, rgb(31, 189, 129) 100%)',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    background: 'linear-gradient(45deg, rgb(31, 189, 129) 0%, rgb(138, 211, 42) 100%)',
  },
}));

interface ProgressStepsProps {
  steps: string[];
  activeStep: number;
}

export const ProgressSteps = ({ steps, activeStep }: ProgressStepsProps) => {
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper activeStep={activeStep} connector={<ColorlibConnector />}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};