import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  TextField,
  createTheme,
  ThemeProvider,
  Avatar,
  Divider,
  LinearProgress,
} from "@mui/material";
import { useFormik } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FileUpload } from "./components/FileUpload";
import { ResponseDisplay } from "./components/ResponseDisplay";
import { DropDown } from "./components/DropDown";
import { TemplateFileSelector } from "./components/TemplateFileSelector";
import {
  validateForm,
  validateArchitectureFiles,
} from "./utils/formUtils";
import type { FormValues } from "./utils/formUtils";
import { handleApiError } from "./utils/errorUtils";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

// Compact theme with smaller components
const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(0, 188, 255)',
      light: 'rgba(0, 188, 255, 0.1)',
      dark: 'rgb(0, 150, 204)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'rgb(31, 189, 129)',
      light: 'rgba(31, 189, 129, 0.1)',
      dark: 'rgb(25, 151, 103)',
      contrastText: '#ffffff',
    },
    success: {
      main: 'rgb(138, 211, 42)',
      light: 'rgba(138, 211, 42, 0.1)',
      dark: 'rgb(110, 169, 33)',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    grey: {
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          '&.MuiPaper-elevation4': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
  },
});


interface GeneratedFile {
  fileName: string;
  status: string;
  downloadUrl: string;
}

const App = () => {
  const [workflowFiles, setWorkflowFiles] = useState<File[]>([]);
  const [workflowError, setWorkflowError] = useState<string>("");
  const [packageName, setPackageName] = useState<string>("");
  const [promptFiles, setPromptFiles] = useState<File[]>([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string>("");
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [selectedTemplateFiles, setSelectedTemplateFiles] = useState<string[]>([]);

  interface CallLog {
    timestamp: string;
    service: string;
    message: string;
    type: 'info' | 'success' | 'error';
  }

  const promptFileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (taskId && !wsConnection) {
      const ws = new WebSocket(`ws://localhost:8000/api/ws/progress/${taskId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnection(ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Handle call logs
        if (data.type === 'call_log') {
          setCallLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            service: data.service,
            message: data.message,
            type: data.logType || 'info'
          }]);
        }
        
        // Handle final response
        if (data.type === 'final_response') {
          setResponse(data.message);
          setLoading(false);
          setCallLogs([]); // Clear logs when done
        }
        
        // Handle file completion (legacy support)
        if (data.fileName && data.downloadUrl) {
          setGeneratedFiles(prev => {
            const exists = prev.some(file => file.fileName === data.fileName);
            if (!exists) {
              return [...prev, {
                fileName: data.fileName,
                status: data.status,
                downloadUrl: data.downloadUrl
              }];
            }
            return prev;
          });
          
          // Show toast notification
          if (data.status === 'done') {
            toast.success(`${data.fileName} generated successfully!`);
          }
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnection(null);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    return () => {
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
      }
    };
  }, [taskId]);

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const formik = useFormik<FormValues>({
    initialValues: { prompt: "" },
    validate: (values) => validateForm(values, packageName),
    onSubmit: async (values, { resetForm }) => {
      if (!packageName) return;

      setLoading(true);
      setResponse("");
      setGeneratedFiles([]);

      try {
        let processFlow = "";
        
        if (workflowFiles.length > 0) {
          const firstWorkflowFile = workflowFiles[0];
          if (firstWorkflowFile.type.startsWith('image/')) {
            processFlow = await convertFileToBase64(firstWorkflowFile);
          }
        }

        const requestBody = {
          folder_name: packageName,
          user_prompt: values.prompt || "",
          process_flow: processFlow,
          selected_files: selectedTemplateFiles.length > 0 ? selectedTemplateFiles : null
        };

        const response = await fetch(`${BASE_URL}api/template/fill`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error("Failed to start template processing");
        }

        const data = await response.json();
        setTaskId(data.task_id);
        setResponse("");
        setCallLogs([]); // Clear previous logs

      } catch (error) {
        console.error("Error:", error);
        setResponse("Something went wrong while starting template processing.");
        setLoading(false);
      }

      resetForm();
      setWorkflowFiles([]);
      setPackageName("");
      setPromptFiles([]);
      setWorkflowError("");
    },
    validateOnChange: false,
    validateOnBlur: false,
  });

  const updatePromptFiles = (newFiles: File[]) => {
    setPromptFiles((prev) => [...prev, ...newFiles]);
  };

  const saveFiles = async () => {
    if (promptFiles.length === 0) return;

    try {
      setLoading(true);
      const formData = new FormData();
      promptFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(`${BASE_URL}api/pdf/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload files");
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setPromptFiles([]);
    } catch (error) {
      setResponse(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileName: string, downloadUrl: string) => {
      const a = document.createElement("a");
    // Remove leading slash from downloadUrl to avoid double slash with BASE_URL
    const cleanDownloadUrl = downloadUrl.startsWith('/') ? downloadUrl.substring(1) : downloadUrl;
    a.href = `${BASE_URL}${cleanDownloadUrl}`;
    a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    generatedFiles.forEach(file => {
      if (file.downloadUrl) {
        handleDownload(file.fileName, file.downloadUrl);
      }
    });
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ 
        display: "flex", 
        height: "100vh", 
        gap: 2,
        p: 1.5,
        backgroundColor: 'background.default',
      }}>
        {/* Left Panel */}
        <Paper
          elevation={4}
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 2.5,
            gap: 2,
            overflowY: "auto",
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          {/* Header */}
<Box 
  display="flex" 
  flexDirection="column"
  alignItems="center" 
  justifyContent="center" 
  gap={1.5} 
  mb={2}
>
  <Avatar
    src="/Bayer-Logo.svg"
    alt="Bayer Logo"
    sx={{ 
                width: 108,
      height: 108,
      '& img': {
        objectFit: 'contain',
      }
    }}
  />
  <Typography
    sx={{
      background: 'linear-gradient(45deg, rgb(0, 188, 255) 0%, rgb(31, 189, 129) 50%, rgb(138, 211, 42) 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontWeight: 600,
      textAlign: 'center',
      fontSize: '1.4rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    }}
  >
    Bayer Compliance Agent
  </Typography>
</Box>
          <Divider sx={{ mb: 1 }} />


          {/* Loading Progress */}
          {loading && (
            <LinearProgress 
              sx={{ 
                mb: 1, 
                height: 3,
                borderRadius: 1,
                background: 'rgba(0, 188, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, rgb(0, 188, 255) 0%, rgb(31, 189, 129) 50%, rgb(138, 211, 42) 100%)',
                }
              }} 
            />
          )}

          {/* Error Display */}
          {"templateFiles" in formik.errors &&
            typeof formik.errors.templateFiles === "string" &&
            formik.errors.templateFiles && (
              <Paper sx={{ p: 1.5, bgcolor: 'error.light', color: 'error.contrastText', mb: 1 }}>
                <Typography variant="body2" fontWeight="bold" fontSize="0.85rem">
                  {formik.errors.templateFiles}
                </Typography>
              </Paper>
            )}

          {/* Workflow Files Chips */}
          {workflowFiles.length > 0 && (
            <Box mb={1}>
              <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                Process/Workflow Files:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {workflowFiles.map((file, i) => (
                  <Chip
                    key={`workflow-${file.name}-${i}`}
                    label={file.name}
                    size="small"
                    onDelete={() =>
                      setWorkflowFiles((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    sx={{
                      background: 'linear-gradient(45deg, rgb(0, 188, 255) 0%, rgb(31, 189, 129) 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 26,
                      '& .MuiChip-deleteIcon': {
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { color: 'white' },
                        fontSize: 16,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Upload Process/Workflow */}
          <FileUpload
            label="Upload Process/Workflow"
            accept=".png,.svg,.jpg,.jpeg,.pdf"
            onFileSelect={(files) => {
              setWorkflowError("");
              const invalidFiles = validateArchitectureFiles(files);
              if (invalidFiles.length > 0) {
                setWorkflowError(
                  "Only .png, .svg, .jpg, .jpeg, .pdf files are supported."
                );
                return;
              }
              setWorkflowFiles((prev) => [...prev, ...files]);
            }}
            error={workflowError}
            fullWidth
          />

          {/* Select Package Dropdown */}
          <DropDown
            selectedTemplate={packageName}
            onSelect={(name) => {
              setPackageName(name);
              setSelectedTemplateFiles([]); // Reset selected files when package changes
            }}
          />

          {/* Template File Selector */}
          {packageName && (
            <TemplateFileSelector
              folderName={packageName}
              onFilesSelected={setSelectedTemplateFiles}
              selectedFiles={selectedTemplateFiles}
            />
          )}

          {/* Content Files Section */}
          <Box>
            {promptFiles.length > 0 && (
              <Box mb={1}>
                <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                  Content Files:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {promptFiles.map((file, i) => (
                    <Chip
                      key={`content-${file.name}-${i}`}
                      label={file.name}
                      size="small"
                      onDelete={() =>
                        setPromptFiles((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      deleteIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 26,
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { color: 'white' },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Additional Content Text Field */}
            <TextField
              fullWidth
              multiline
              maxRows={4}
              minRows={2}
              name="prompt"
              label="Additional Content"
              placeholder="Enter any additional instructions..."
              value={formik.values.prompt}
              onChange={formik.handleChange}
              error={Boolean(formik.errors.prompt)}
              helperText={formik.errors.prompt}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.9rem',
                },
              }}
            />

            <input
              type="file"
              ref={promptFileInputRef}
              style={{ display: "none" }}
              onChange={(e) => {
                if (!e.target.files) return;
                updatePromptFiles(Array.from(e.target.files));
              }}
              multiple
            />
          </Box>

          {/* Action Buttons */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Button
              variant="contained"
              size="medium"
              type="submit"
              disabled={loading}
              startIcon={loading ? undefined : <CloudUploadIcon sx={{ fontSize: 18 }} />}
              sx={{
                background: 'linear-gradient(45deg, rgb(0, 188, 255) 0%, rgb(31, 189, 129) 100%)',
                py: 1,
                fontSize: '0.9rem',
              }}
            >
              {loading ? "Generating..." : "Generate GXP Compliant Documents"}
            </Button>

            <Button
              variant="outlined"
              size="medium"
              onClick={() => promptFileInputRef.current?.click()}
              startIcon={<CloudUploadIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderColor: 'success.main',
                color: 'success.main',
                fontSize: '0.9rem',
                py: 1,
                '&:hover': {
                  borderColor: 'success.dark',
                  bgcolor: 'success.light',
                },
              }}
            >
              Upload Content Files
            </Button>

            <Button
              variant="contained"
              size="medium"
              onClick={saveFiles}
              disabled={loading || promptFiles.length === 0}
              startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: 'success.main',
                fontSize: '0.9rem',
                py: 1,
                '&:hover': { bgcolor: 'success.dark' },
              }}
            >
              Save Content
            </Button>
          </Box>
        </Paper>

        {/* Right Panel */}
        <Paper
          elevation={4}
          sx={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            p: 2.5,
            overflowY: "auto",
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          }}
        >
          <Typography 
            variant="h6"
            sx={{ 
              mb: 2,
              background: 'linear-gradient(45deg, rgb(31, 189, 129) 0%, rgb(138, 211, 42) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 600,
              fontSize: '1.3rem',
            }}
          >
            AI Response & Progress
          </Typography>

          <ResponseDisplay loading={loading} response={response} callLogs={callLogs} />

          {/* Generated Files List */}
          {generatedFiles.length > 0 && (
            <Box mt={2}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem' }}>
                Generated Files ({generatedFiles.length})
              </Typography>
              {/* Simple file list without progress bars */}
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1, p: 1 }}>
                {generatedFiles.map((file, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1,
                      borderBottom: index < generatedFiles.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {file.fileName}
                      </Typography>
                    </Box>
                    {file.downloadUrl && (
                      <Button
                        size="small"
                        startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleDownload(file.fileName, file.downloadUrl!)}
                        sx={{ minWidth: 'auto' }}
                      >
                        Download
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
              
              {generatedFiles.length > 0 && (
            <Button
              variant="contained"
              size="medium"
              startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
                  onClick={handleDownloadAll}
              sx={{
                    mt: 2,
                alignSelf: "flex-start",
                background: 'linear-gradient(45deg, rgb(31, 189, 129) 0%, rgb(138, 211, 42) 100%)',
                py: 1,
                px: 2,
                fontSize: '0.9rem',
              }}
            >
                  Download All Files
            </Button>
              )}
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
};

export default App;