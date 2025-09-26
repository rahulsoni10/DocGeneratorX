import { Typography, Button, Box } from "@mui/material";

interface FileUploadProps {
  label: string;
  onFileSelect: (files: File[]) => void;
  accept?: string;
  error?: string;
  fullWidth?: boolean;
  onClick?: () => void;
}

export const FileUpload = ({
  label,
  onFileSelect,
  accept,
  error,
  fullWidth = false,
  onClick,
}: FileUploadProps) => {
  return (
    <Box display="flex" flexDirection="column" gap={0.5}>
      <Button
        variant="outlined"
        component="label"
        fullWidth={fullWidth}
        onClick={onClick}
      >
        {label}
        <input
          type="file"
          hidden
          multiple
          accept={accept}
          onChange={(e) => {
            if (!e.target.files) return;
            onFileSelect(Array.from(e.target.files));
          }}
        />
      </Button>
      {error && (
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold", color: "#f28b82" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};
