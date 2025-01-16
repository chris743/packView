// WeekdayPicker.js
import React, { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import dayjs from "dayjs";

const WeekdayPicker = ({ selectedDates = [], onSelectDates, weekStart }) => {
  const [currentWeek, setCurrentWeek] = useState(dayjs(weekStart).startOf("week"));
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const datesObject = selectedDates.reduce((acc, { date, estimated_bins }) => {
      acc[date] = estimated_bins || 0;
      return acc;
    }, {});
    setSelected(datesObject);
  }, [selectedDates]);

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

    if (bins === 0) {
      delete updatedSelection[date];
    }

    setSelected(updatedSelection);

    // Convert to array format and pass directly
    const updatedArray = Object.entries(updatedSelection).map(([key, val]) => ({
      date: key,
      estimated_bins: val,
    }));
    onSelectDates(updatedArray);
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
              border: `1px solid ${isActive ? "#90caf9" : "#99999980"}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ fontSize: "12px", fontWeight: "bold", mb: 0.5 }}>
              {day}
            </Box>
            <TextField
              type="number"
              value={binsValue}
              onChange={(e) => handleBinsChange(formattedDate, e.target.value)}
              InputProps={{
                inputProps: { step: 50, min: 0, style: { padding: "6px 8px" } },
              }}
              variant="outlined"
              sx={{
                width: "75px",
                "& .MuiOutlinedInput-root": {
                  padding: "4px",
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