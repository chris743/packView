import React from "react";
import BarChart from "./BarChart"; // Reuse your existing BarChart component.

const BarChartGroup = ({ barChartsData }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
      {barChartsData.map((chartData, index) => (
        <BarChart
          key={index}
          data={chartData.data}
          title={`Size Distribution for ${chartData.commodity}`}
          xLabel="Size"
          yLabel="Total Order Quantity"
        />
      ))}
    </div>
  );
};

export default BarChartGroup;
