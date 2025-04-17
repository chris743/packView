import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

/**
 * DateSelector - A reusable component for date selection with navigation
 * 
 * @param {Object} props
 * @param {string} props.selectedDate - The currently selected date (YYYY-MM-DD format)
 * @param {function} props.onDateChange - Function called when date changes
 * @param {string} props.label - Label for the date field
 * @param {Object} props.sx - Additional styles to apply
 */
const DateSelector = ({ 
  selectedDate, 
  onDateChange, 
  label = "Date:", 
  sx = {} 
}) => {
  // Helper function to change date by specified number of days
  const changeDateBy = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const iso = newDate.toISOString().slice(0, 10);
    onDateChange(iso);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, ...sx }}>
      <Typography variant="body1">{label}</Typography>
      <TextField
        type="date"
        size="small"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        inputProps={{ "aria-label": label }}
      />
      <Button 
        variant="outlined" 
        onClick={() => changeDateBy(-1)}
      >
        Prev. Day
      </Button>
      <Button 
        variant="outlined" 
        onClick={() => changeDateBy(1)}
      >
        Next Day
      </Button>
    </Box>
  );
};

export default DateSelector;