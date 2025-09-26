import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface GradientButtonProps extends Omit<ButtonProps, 'color'> {
  gradient?: 'primary' | 'secondary' | 'success';
}

export const GradientButton = ({ gradient = 'primary', sx, ...props }: GradientButtonProps) => {
  const gradients = {
    primary: 'linear-gradient(45deg, rgb(0, 188, 255) 0%, rgb(31, 189, 129) 100%)',
    secondary: 'linear-gradient(45deg, rgb(31, 189, 129) 0%, rgb(138, 211, 42) 100%)',
    success: 'linear-gradient(45deg, rgb(138, 211, 42) 0%, rgb(31, 189, 129) 100%)',
  };

  return (
    <Button
      variant="contained"
      sx={{
        background: gradients[gradient],
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease-in-out',
        ...sx,
      }}
      {...props}
    />
  );
};