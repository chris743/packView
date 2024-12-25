import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "@mui/material/styles";

// Register the required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, title, xLabel, yLabel }) => {
  const theme = useTheme(); // Access the current theme

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: xLabel, // Label for the dataset
        data: Object.values(data),
        backgroundColor: theme.palette.primary.main, // Bars color based on theme
        borderColor: theme.palette.primary.dark, // Border for bars
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y", // Makes the bars horizontal
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: theme.palette.text.primary, // Dynamic title color
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xLabel,
          color: theme.palette.text.primary, // Dynamic axis label color
          font: {
            size: 14,
          },
        },
        ticks: {
          color: theme.palette.text.secondary, // Dynamic tick color
        },
        grid: {
          color: theme.palette.divider, // Grid line color
        },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: yLabel,
          color: theme.palette.text.primary, // Dynamic axis label color
          font: {
            size: 14,
          },
        },
        ticks: {
          color: theme.palette.text.secondary, // Dynamic tick color
        },
        grid: {
          color: theme.palette.divider, // Grid line color
        },
      },
    },
  };

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.palette.mode === "dark"
          ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
          : "0px 4px 10px rgba(0, 0, 0, 0.1)",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
