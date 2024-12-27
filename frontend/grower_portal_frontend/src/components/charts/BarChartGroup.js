import React from "react";
import CommodityBarChart from "./CommodityBarChart"; // Reuse your existing BarChart component.

const BarChartGroup = ({ barChartsData }) => {
  // Updated transform function to use label/value naming
  const transformData = (chartData) => {
    const { labels, datasets } = chartData.chart;
    return labels.map((label, index) => ({
      label: label,
      value: datasets[0].data[index]
    }));
  };
  

  return (
    <div className="flex flex-wrap justify-around p-4">
      {barChartsData?.map((chartData, index) => (
        <CommodityBarChart
          key={index}
          data={transformData(chartData)}
          title={`${chartData.commodity}`}
          yLabel="Order Quantity"
        />
      ))}
    </div>
  );
};
export default BarChartGroup;
