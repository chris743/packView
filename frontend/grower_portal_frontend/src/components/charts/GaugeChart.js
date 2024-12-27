import React, { useState, useEffect } from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { useTheme } from "@mui/material/styles";

const GaugeChart = ({ title, data, style }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [capacityLimit, setCapacityLimit] = useState(0);
  const theme = useTheme(); // Access the current theme

  useEffect(() => {
    if (data && data.capacities && data.capacities[style]) {
      setCurrentValue(data.capacities[style].currentValue);
      setCapacityLimit(data.capacities[style].capacityLimit);
    } else {
      console.error("Invalid data or style not found:", data);
    }
  }, [data, style]); // Rerun whenever data or style changes

  const gaugeValue =
    capacityLimit > 0 ? Math.round((currentValue / capacityLimit) * 100) : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "400px", // Increased height for better spacing
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.palette.mode === "dark"
          ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
          : "0px 4px 10px rgba(0, 0, 0, 0.1)",
        transition: "background-color 0.3s, color 0.3s",
        color: theme.palette.text.primary,
      }}
    >
      <h1 style={{ marginBottom: "20px", fontSize: "1.8rem" }}>{title}</h1>
      <Gauge
        value={gaugeValue}
        startAngle={-110}
        endAngle={110}
        sx={{
          width: "100%", // Ensures it scales with container
          height: "300px", // Increased height for a larger gauge
          maxWidth: "400px", // Increased maximum width
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 50, // Larger font for the value
            fill: theme.palette.text.primary, // Dynamic text color
            transform: "translate(0px, 0px)",
          },
          [`& .${gaugeClasses.arc}`]: {
            stroke: theme.palette.primary.main, // Arc color
          },
          [`& .${gaugeClasses.backgroundArc}`]: {
            stroke: theme.palette.divider, // Background arc color
          },
        }}
        text={({ value }) => `${value}%`}
      />
      <div style={{ marginTop: "10px", fontSize: "1.2rem", fontWeight: "bold" }}>
        {`${currentValue} / ${capacityLimit}`}
      </div>
    </div>
  );
};

export default GaugeChart;
