import { Chip, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface FileChipProps {
  file: File;
  index: number;
  prefix: string;
  onDelete: (index: number) => void;
  color?: "primary" | "secondary";
}

export const FileChip = ({
  file,
  index,
  prefix,
  onDelete,
  color = "primary",
}: FileChipProps) => {
  const theme = useTheme();

  return (
    <Chip
      key={`${prefix}-${file.name}-${index}`}
      label={file.name}
      onDelete={() => onDelete(index)}
      color={color}
      size="small"
      deleteIcon={<CloseIcon sx={{ fontSize: 18 }} />}
      sx={{
        fontWeight: 600,
        fontSize: 14,
        maxWidth: 320,
        bgcolor: theme.palette[color].main,
        color: theme.palette[color].contrastText,
        borderRadius: "9999px",
        height: 32,
        px: 1.5,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        "& .MuiChip-deleteIcon": {
          color: theme.palette[color].contrastText,
          "&:hover": { color: theme.palette[color].dark },
        },
      }}
    />
  );
};
