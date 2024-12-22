import React, { useEffect, useState } from "react";
import {  } from "react-chartjs-2";
import axios from "axios";

const DonutChart = ({ apiEndpoint, capacityLimit, offset }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [chartData, setChartData] = useState({
    labels: ["Used", "Remaining"],
    datasets: [
      {
        data: [0, 100],
        backgroundColor: ["#36A2EB", "#FFCE56"],
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiEndpoint);

        // Ensure response has data and proper structure
        const value = response?.data?.currentValue || 0;

        setCurrentValue(value);

        // Calculate the percentage with offset
        const percentage = Math.max(((value / capacityLimit) * 100) - offset, 0);

        // Update the chart data
        setChartData({
          labels: ["Used", "Remaining"],
          datasets: [
            {
              data: [percentage, 100 - percentage],
              backgroundColor: ["#36A2EB", "#FFCE56"],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data for DonutChart:", error);
      }
    };

    fetchData();
  }, [apiEndpoint, capacityLimit, offset]);

  return (
    <div style={{ width: "300px", margin: "0 auto" }}>
      <Doughnut data={chartData} />
      <p style={{ textAlign: "center" }}>Current Value: {currentValue}</p>
    </div>
  );
};

export default DonutChart;
