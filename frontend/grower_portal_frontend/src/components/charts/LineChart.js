import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ data, title }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.datasets[0].data,
        borderColor: "#0288d1",
        backgroundColor: "rgba(2, 136, 209, 0.2)",
        tension: 0.4, // Smooth line
        pointRadius: 3, // Small data points
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to adjust with container
    plugins: {
      legend: { display: false }, // Hide the legend
      title: { display: true, text: title, font: { size: 18 } },
    },
    scales: {
      x: { title: { display: true, text: "Date", font: { size: 14 } } },
      y: { title: { display: true, text: "Total Order Quantity", font: { size: 14 } } },
    },
  };

  return (
    <div style={{ width: "100%", height: "400px" }}> {/* Ensures full width and adjustable height */}
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
