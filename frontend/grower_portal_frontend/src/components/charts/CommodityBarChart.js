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

const CommodityBarChart = ({ data, title, xLabel, yLabel }) => {
  const theme = useTheme();

  // Transform the data
  const transformedData = {
    chart: {
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 1,
        },
      ],
    },
  };

  const chartData = {
    labels: transformedData.chart.labels,
    datasets: transformedData.chart.datasets,
  };

  const options = {
    responsive: true,
    indexAxis: "x", // Make bars horizontal (out of the x-axis)
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title || "",
        color: theme.palette.text.primary,
        font: { size: 16, weight: "bold" },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xLabel,
          color: theme.palette.text.primary,
          font: { size: 14 },
        },
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.divider },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: yLabel,
          color: theme.palette.text.primary,
          font: { size: 14 },
        },
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.divider },
      },
    },
  };

  return (
    <div
      style={{
        padding: "0px",
        borderRadius: "12px",
        backgroundColor: theme.palette.background.paper,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
            : "0px 4px 10px rgba(0, 0, 0, 0.1)",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CommodityBarChart;
