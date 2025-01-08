import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import dayjs from "dayjs";

const WeekdayPicker = ({ selectedDate, onSelectDate, weekStart }) => {
  const [currentWeek, setCurrentWeek] = useState(dayjs(weekStart).startOf("week"));

  useEffect(() => {
    if (weekStart) {
      setCurrentWeek(dayjs(weekStart).startOf("week"));
    }
  }, [weekStart]);

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) =>
      currentWeek.add(i, "day").format("ddd, MMM D")
    );
  };

  const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
      {getWeekDays().map((day, index) => {
        const dateForDay = currentWeek.add(index, "day");
        return (
          <Button
            key={index}
            variant={formatDate(selectedDate) === dateForDay.format("YYYY-MM-DD") ? "contained" : "outlined"}
            color="primary"
            sx={{
              flex: 1,
              m: 0.5,
              height: 60,
              textTransform: "none",
              fontSize: "14px",
              fontWeight: formatDate(selectedDate) === dateForDay.format("YYYY-MM-DD") ? "bold" : "normal",
            }}
            onClick={() => onSelectDate(dateForDay.toISOString())}
          >
            {day}
          </Button>
        );
      })}
    </Box>
  );
};

export default WeekdayPicker;
