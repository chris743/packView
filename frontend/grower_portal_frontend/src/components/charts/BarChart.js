import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";

const BarChart = ({ apiEndpoint, today }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiEndpoint);
        const data = response.data; // Adjust based on the API structure

        const labels = data.map((item) => item.size);
        const values = data.map((item) => item.total_quantity);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Total Quantity",
              data: values,
              backgroundColor: "#36A2EB",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiEndpoint, today]);

  return <Bar data={chartData} />;
};

export default BarChart;
