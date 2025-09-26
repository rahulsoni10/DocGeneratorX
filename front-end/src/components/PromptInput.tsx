import { TextField, Box } from "@mui/material";

interface PromptInputProps {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: boolean;
  helperText?: string;
}

export const PromptInput = ({
  value,
  onChange,
  error,
  helperText,
}: PromptInputProps) => {
  return (
    <Box position="relative">
      <TextField
        fullWidth
        multiline
        maxRows={12}
        minRows={6}
        name="prompt"
        label="Additional Content"
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        sx={{
          "& label.Mui-error": {
            color: "#f28b82",
          },
          "& .MuiFormHelperText-root.Mui-error": {
            color: "#f28b82",
            fontWeight: "bold",
          },
          "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#f28b82",
            },
        }}
      />
    </Box>
  );
};
