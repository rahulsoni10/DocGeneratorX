import { Alert, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material';

interface NotificationToastProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

export const NotificationToast = ({ 
  open, 
  message, 
  severity, 
  onClose, 
  autoHideDuration = 6000 
}: NotificationToastProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};