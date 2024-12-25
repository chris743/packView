import React, { useState, useEffect } from "react";
import PieChart from "../../components/charts/PieChart";
import BarChartGroup from "../../components/charts/BarChartGroup";
import LineChart from "../../components/charts/LineChart";
import StatCardGroup from "../../components/charts/StatCardGroup";
import { fetchChartData } from "../../api/api";

const OrdersAnalysisPage = () => {
  const [pieChartData, setPieChartData] = useState(null);
  const [barChartsData, setBarChartsData] = useState([]);
  const [lineChartData, setLineChartData] = useState(null);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // Fetch data for all charts and stats
    const fetchData = async () => {
      try {
        const data = await fetchChartData("orders-dashboard");
        setPieChartData(data.commodityPieChart);
        setBarChartsData(data.sizeBarCharts);
        setLineChartData(data.orderQuantityLineChart);
        setStats([
          { label: "Total Shipping Today", total: data.totalShippingToday },
          { label: "Total Shipping Season", total: data.totalShippingSeason },
          { label: "Total Day-Of Orders", total: data.totalDayOf },
          { label: "Total Assigned Day-Of", total: data.totalAssignedDayOf },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Orders Analysis</h2>
      {pieChartData && <PieChart data={pieChartData} title="Commodity Distribution" />}
      {barChartsData.length > 0 && <BarChartGroup barChartsData={barChartsData} />}
      {lineChartData && <LineChart data={lineChartData} title="Total Order Quantity Over Time" />}
      <StatCardGroup stats={stats} />
    </div>
  );
};

export default OrdersAnalysisPage;
