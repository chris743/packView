import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title }) => {
  // Generate unique colors based on the theme
  const themeColors = [
    "#4caf50", // Green
    "#2196f3", // Blue
    "#ff9800", // Orange
    "#f44336", // Red
    "#9c27b0", // Purple
    "#00bcd4", // Cyan
    "#ffeb3b", // Yellow
    "#795548", // Brown
    "#607d8b", // Blue Grey
    "#3f51b5", // Indigo
  ];

  // Ensure the colors array matches the number of data points
  const backgroundColor =
    data.datasets[0].data.length > themeColors.length
      ? data.datasets[0].data.map((_, index) => themeColors[index % themeColors.length])
      : themeColors.slice(0, data.datasets[0].data.length);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.datasets[0].data,
        backgroundColor,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart resizing
    plugins: {
      legend: {
        position: "left", // Legend on the left side
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "300px", // Increased height for a larger chart
        width: "100%", // Ensure it takes up the full width of the parent container
      }}
    >
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
