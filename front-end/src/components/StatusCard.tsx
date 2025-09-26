import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import type { ReactNode } from 'react';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

export const StatusCard = ({ title, value, icon, color = 'primary', loading }: StatusCardProps) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          {icon && <Box mb={1}>{icon}</Box>}
          <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </>
      )}
    </Paper>
  );
};