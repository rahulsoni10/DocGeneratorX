import { Box, Typography, CircularProgress, Button, Collapse } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";

interface CallLog {
  timestamp: string;
  service: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface ResponseDisplayProps {
  loading: boolean;
  response: string;
  callLogs?: CallLog[];
}

export const ResponseDisplay = ({
  loading,
  response,
  callLogs = [],
}: ResponseDisplayProps) => {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <Box>
      {loading ? (
        <Box>
          {/* Loading spinner */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
            mb={2}
          >
            <CircularProgress />
          </Box>

          {/* Call Logs Section */}
          {callLogs.length > 0 && (
            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={showLogs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowLogs(!showLogs)}
                sx={{ mb: 1 }}
              >
                {showLogs ? 'Hide Processing Logs' : 'Show Processing Logs'}
              </Button>

              <Collapse in={showLogs}>
                <Box
                  sx={{
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    p: 2,
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Processing Logs:
                  </Typography>
                  {callLogs.map((log, index) => (
                    <Box key={index} sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        [{log.timestamp}] {log.service}: {log.message}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          {/* Response Message */}
          {response && (
            <Box
              display="flex"
              alignItems="flex-start"
              gap={1}
              p={2}
              bgcolor="background.paper"
              borderRadius={2}
              boxShadow={1}
              whiteSpace="pre-wrap"
              sx={{ wordBreak: "break-word" }}
            >
              <CheckCircleIcon color="success" sx={{ mt: 0.5 }} />
              {response}
            </Box>
          )}

          {/* Default message when no response */}
          {!response && (
            <Typography variant="body2" color="text.secondary">
              Submit the form to see the AI's response here.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
