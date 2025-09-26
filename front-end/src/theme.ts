import { createTheme, alpha } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3282B8", // primary blue
      light: "#4FA1D4",
      dark: "#0F4C75",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#BBE1FA", // light blue
      light: "#E0F4FF",
      dark: "#8EBED9",
      contrastText: "#1B262C",
    },
    background: {
      default: "#1B262C", // dark base
      paper: "#0F4C75", // dark card/paper
    },
    text: {
      primary: "#BBE1FA", // light text
      secondary: "#3282B8", // secondary accent
      disabled: alpha("#BBE1FA", 0.5),
    },
    divider: alpha("#BBE1FA", 0.12),
    success: {
      main: "#4CAF50",
      light: "#C8E6C9",
      dark: "#2E7D32",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#F44336",
      light: "#FFCDD2",
      dark: "#C62828",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#FF9800",
      light: "#FFE0B2",
      dark: "#E65100",
      contrastText: "#1B262C",
    },
    info: {
      main: "#3282B8",
      light: "#4FA1D4",
      dark: "#0F4C75",
      contrastText: "#FFFFFF",
    },
    grey: {
      50: "#F9F9F9",
      100: "#ECEFF1",
      200: "#CFD8DC",
      300: "#B0BEC5",
      400: "#90A4AE",
      500: "#78909C",
      600: "#546E7A",
      700: "#37474F",
      800: "#263238",
      900: "#1B262C",
    },
  },
  typography: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: "#BBE1FA" },
    h5: { fontWeight: 600, color: "#BBE1FA" },
    subtitle2: { fontWeight: 600, color: "#3282B8" },
    button: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@import":
          "url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap')",
        body: {
          backgroundColor: "#1B262C",
          color: "#BBE1FA",
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#0F4C75",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 25px rgba(0,0,0,0.4)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 600,
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          backgroundColor: "#3282B8",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#1B262C",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          borderColor: "#BBE1FA",
          color: "#BBE1FA",
          "&:hover": {
            backgroundColor: alpha("#BBE1FA", 0.15),
            borderColor: "#BBE1FA",
            color: "#BBE1FA",
            borderWidth: 2,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: alpha("#BBE1FA", 0.05),
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#3282B8",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#3282B8",
              borderWidth: 2,
            },
          },
          "& .MuiInputLabel-root": {
            color: "#BBE1FA",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#3282B8",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          "&:hover": { backgroundColor: alpha("#3282B8", 0.08) },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#E0F4FF",
          "&.Mui-focused": {
            color: "#3282B8",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E0F4FF",
            borderRadius: 8,
            fontWeight: 600,
            borderWidth: 2
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E0F4FF",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E0F4FF",
          },
        },
      },
    },

  },
});

export default theme;
