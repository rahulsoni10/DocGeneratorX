import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { GSOP_PACKAGE_FILES, getFileDisplayNames, type GSOPPackageName } from "../enums/gsopPackages";

interface TemplateFile {
  filename: string;
  size_bytes: number;
  size_mb: number;
  modified: number;
}

interface TemplateFileSelectorProps {
  folderName: string;
  onFilesSelected: (selectedFiles: string[]) => void;
  selectedFiles: string[];
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

export const TemplateFileSelector: React.FC<TemplateFileSelectorProps> = ({
  folderName,
  onFilesSelected,
  selectedFiles,
}) => {
  const [availableFiles, setAvailableFiles] = useState<TemplateFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (folderName) {
      // Use enum-based files for GSOP packages, otherwise load from API
      if (folderName in GSOP_PACKAGE_FILES) {
        loadEnumFiles(folderName as GSOPPackageName);
      } else {
        loadTemplateFiles();
      }
    }
  }, [folderName]);

  const loadEnumFiles = (packageName: GSOPPackageName) => {
    setLoading(true);
    setError("");
    
    try {
      const fileDisplayNames = getFileDisplayNames(packageName);
      const enumFiles: TemplateFile[] = fileDisplayNames.map((file, index) => ({
        filename: file.value,
        size_bytes: 1024 * 1024, // Mock 1MB size
        size_mb: 1.0,
        modified: Date.now() - (index * 86400000) // Mock modification dates
      }));
      
      setAvailableFiles(enumFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enum files");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateFiles = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${BASE_URL}api/template/list-templates/${folderName}`);
      if (!response.ok) {
        throw new Error("Failed to load template files");
      }
      
      const data = await response.json();
      setAvailableFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const selectedFilesArray = typeof value === 'string' ? value.split(',') : value;
    onFilesSelected(selectedFilesArray);
  };

  const handleSelectAll = () => {
    const allFilenames = availableFiles.map(file => file.filename);
    onFilesSelected(allFilenames);
  };

  const handleSelectNone = () => {
    onFilesSelected([]);
  };

  if (!folderName) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Select Template Files
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Typography variant="body2" color="text.secondary">
          Loading template files...
        </Typography>
      )}

      {availableFiles.length > 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectAll}
              disabled={loading}
            >
              Select All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectNone}
              disabled={loading}
            >
              Select None
            </Button>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Template Files</InputLabel>
            <Select
              multiple
              value={selectedFiles}
              onChange={handleFileSelection}
              label="Template Files"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableFiles.map((file) => (
                <MenuItem key={file.filename} value={file.filename}>
                  <Checkbox checked={selectedFiles.indexOf(file.filename) > -1} />
                  <ListItemText
                    primary={file.filename}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedFiles.length === 0 
              ? "All template files will be processed"
              : `${selectedFiles.length} of ${availableFiles.length} files selected`
            }
          </Typography>
        </>
      )}
    </Box>
  );
};
