import React, { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import dayjs from "dayjs";
import { NoEncryption } from "@mui/icons-material";

const WeekdayPicker = ({ selectedDates = {}, onSelectDates, weekStart }) => {
  const [currentWeek, setCurrentWeek] = useState(dayjs(weekStart).startOf("week"));
  const [selected, setSelected] = useState(selectedDates);

  useEffect(() => {
    if (weekStart) {
      setCurrentWeek(dayjs(weekStart).startOf("week"));
    }
  }, [weekStart]);

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) =>
      currentWeek.add(i, "day").format("ddd, MM/D")
    );
  };

  const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

  const handleBinsChange = (date, value) => {
    const bins = parseInt(value, 10) || 0;
    const updatedSelection = { ...selected, [date]: bins };

    // Remove the date from selection if bins are 0 or null
    if (bins === 0) {
      delete updatedSelection[date];
    }

    setSelected(updatedSelection);
    onSelectDates(updatedSelection);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, gap: 1 }}>
      {getWeekDays().map((day, index) => {
        const dateForDay = currentWeek.add(index, "day");
        const formattedDate = formatDate(dateForDay);
        const binsValue = selected[formattedDate] || 0;
        const isActive = binsValue > 0;

        return (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              p: 0.5,
              border: `2px solid ${isActive ? "blue" : "lightgray"}`,
              borderRadius: 2,
              
            }}
          >
            <Box sx={{ fontSize: "12px", fontWeight: "bold", mb: 0.5 }}>
              {day}
            </Box>
            <TextField
              type="number"
              value={binsValue}
              onChange={(e) =>
                handleBinsChange(formattedDate, e.target.value)
              }
              InputProps={{
                inputProps: { step: 50, min: 0, style: { padding: "6px 8px" } },
              }}
              variant="outlined"
              sx={{
                width: "60px",
                "& .MuiOutlinedInput-root": {
                  padding: "4px", // Reduce padding for compact size
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default WeekdayPicker;
