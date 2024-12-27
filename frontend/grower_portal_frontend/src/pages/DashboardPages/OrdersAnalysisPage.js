import React, { useState, useEffect } from "react";
import PieChart from "../../components/charts/PieChart";
import BarChartGroup from "../../components/charts/BarChartGroup";
import LineChart from "../../components/charts/LineChart";
import StatCardGroup from "../../components/charts/StatCardGroup";
import { fetchChartData } from "../../api/api";

const OrdersAnalysis = () => {
  const [pieChartData, setPieChartData] = useState(null);
  const [barChartsData, setBarChartsData] = useState([]);
  const [lineChartData, setLineChartData] = useState(null);
  const [stats, setStats] = useState([]);

  useEffect(() => {
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

    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Top Left: Pie Chart */}

        {/* Top Right: Bar Charts */}
        <div
          style={{
            flex: "1 1 65%",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {barChartsData.map((barChartData, index) => (
            <div
              key={index}
            >
              <BarChartGroup barChartsData={[barChartData]} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {/* Line Chart: 50% Width */}
        <div style={{ flex: "1 1 70%", minWidth: "300px" }}>
          {lineChartData && (
            <div style={{ height: "300px", overflow: "hidden" }}>
              <LineChart data={lineChartData} title="Total Order Quantity Over Time" />
            </div>
          )}
        </div>
        {/* Pie Chart: 50% Width */}
        <div style={{ flex: "1 1 30%", minWidth: "300px" }}>
          {pieChartData && (
            <div style={{ height: "300px", overflow: "hidden" }}>
              <PieChart data={pieChartData} title="Commodity Distribution" />
            </div>
          )}
        </div>
        </div>
      {/* Below Line Chart: Info Cards */}
      <div style={{ marginTop: "20px" }}>
        <StatCardGroup stats={stats} />
      </div>
    </div>
  );
};

export default OrdersAnalysis;
