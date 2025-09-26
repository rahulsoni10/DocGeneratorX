import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface GeneratedFile {
  fileName: string;
  status: string;
  downloadUrl: string;
}

interface FileProgressListProps {
  files: GeneratedFile[];
  onDownload: (fileName: string, downloadUrl: string) => void;
}

export const FileProgressList: React.FC<FileProgressListProps> = ({
  files,
  onDownload,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <CheckCircleIcon color="disabled" />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'done':
        return (
          <Chip
            label="Completed"
            size="small"
            color="success"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        );
      case 'error':
        return (
          <Chip
            label="Error"
            size="small"
            color="error"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        );
      default:
        return (
          <Chip
            label="Processing"
            size="small"
            color="default"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        );
    }
  };

  return (
    <Box>
      <List sx={{ maxHeight: 300, overflow: 'auto' }}>
        {files.map((file, index) => (
          <ListItem
            key={index}
            sx={{
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1,
              mb: 1,
              bgcolor: 'background.paper',
            }}
          >
            <ListItemIcon>
              {getStatusIcon(file.status)}
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="medium">
                    {file.fileName}
                  </Typography>
                  {getStatusChip(file.status)}
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {file.status === 'done' ? 'Ready for download' : 'Processing...'}
                </Typography>
              }
            />
            
            {file.status === 'done' && file.downloadUrl && (
              <IconButton
                size="small"
                onClick={() => onDownload(file.fileName, file.downloadUrl)}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
      
      {files.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          No files generated yet
        </Typography>
      )}
    </Box>
  );
};
