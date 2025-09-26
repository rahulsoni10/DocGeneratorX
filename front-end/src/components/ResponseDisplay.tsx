import { Box, Typography, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ResponseDisplayProps {
  loading: boolean;
  response: string;
}

export const ResponseDisplay = ({
  loading,
  response,
}: ResponseDisplayProps) => {
  return (
    <Box>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flex={1}
        >
          <CircularProgress />
        </Box>
      ) : response ? (
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
      ) : (
        <Typography variant="body2" color="text.secondary">
          Submit the form to see the AI's response here.
        </Typography>
      )}
    </Box>
  );
};
