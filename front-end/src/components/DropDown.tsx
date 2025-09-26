import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";

interface Option {
  value: string;
  label: string;
}

const options: Option[] = [
  { value: "GSOP_2028", label: "GSOP 2028" },
  { value: "GSOP_2003", label: "GSOP 2003" },
];

interface DropDownProps {
  onSelect: (templateName: string) => void;
  selectedTemplate: string;
}

export const DropDown: React.FC<DropDownProps> = ({
  onSelect,
  selectedTemplate,
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    onSelect(value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Select Package</InputLabel>
      <Select
        value={selectedTemplate}
        onChange={handleChange}
        label="Select Package"
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
