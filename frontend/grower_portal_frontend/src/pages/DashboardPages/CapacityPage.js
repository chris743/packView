import React, { useState, useEffect } from "react";
import GaugeChart from "../../components/charts/GaugeChart";
import ReusableTable from "../../components/ReusableTable";
import StatCard from "../../components/charts/StatCard";
import { fetchChartData } from "../../api/api";
import BarChart from "../../components/charts/BarChart";
import { fontSize, minHeight } from "@mui/system";

const gaugeEndpoint = "capacity-all";
const top5endpoint = "top-5";
const statsEndpoint = "weekly-stats";
const chartEndpoint = "capacity-bar-charts";

const Dashboard = () => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date

  

  const [gauge, setGauge] = useState(null);

  const loadGaugeData = async () => {
    try {
        const data = await fetchChartData(gaugeEndpoint);
        setGauge(data);
    } catch (error) {
        console.log(error);
    };
  }

  const [topProducts, setTopProducts] = useState({
    giro: [],
    fox: [],
    vex: [],
    bulk: [],
  });
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      const data = await fetchChartData(statsEndpoint);
      setStats(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadTopProducts = async () => {
    try {
      const data = await fetchChartData(top5endpoint);
      setTopProducts(data);
    } catch (error) {
      console.error("Error loading top products:", error);
    }
  };

  const loadChartData = async () => {
    try {
      const data = await fetchChartData(chartEndpoint);
      console.log("Fetched Chart Data:", data); // Debug API response
      setChartData(data); // Update state
    } catch (err) {
      setError("Failed to load chart data");
      console.error("Error loading chart data:", err);
    }
  };

  const fetchAll = () => {
    loadTopProducts();
    loadStats();
    loadChartData();
    loadGaugeData();
  };

  useEffect(() => {
    fetchAll();

    const interval = setInterval(fetchAll, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("Updated Chart Data:", chartData); // Log updated chartData
  }, [chartData]);

  const columns = [
    { field: "product_name", headerName: "Product", flex: 1 },
    { field: "total_order_quantity", headerName: "Qty.", flex: 1 },
  ];

  const renderBarChart = (data, title, xLabel, yLabel) => {
    if (!data || Object.keys(data).length === 0) {
      return <div>No data available for {title}</div>;
    }
    return <BarChart data={data} title={title} xLabel={xLabel} yLabel={yLabel} />;
  };

  const renderCards = (style) => {
    if (!stats || !stats[style]) {
      return <div>Loading...</div>;
    }

    return (
      <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
        <StatCard
          label={`Today`}
          total={stats[style].total_today}
          percent={stats[style].percent_today.toFixed(1)}
        />
        <StatCard
          label={`This Week`}
          total={stats[style].total_this_week}
          percent={stats[style].percent_this_week.toFixed(1)}
        />
        <StatCard
          label={`Last Week`}
          total={stats[style].total_last_week}
          percent={stats[style].percent_last_week.toFixed(1)}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Giro */}
        <div style={{ textAlign: "center" }}>
          <GaugeChart title="Giro Capacity" data={gauge} style="giro" />
          <div style={{marginTop:"10px"}}>
          <ReusableTable columns={columns} data={topProducts.giro} />
          </div>
          <div>
            {renderCards("giro")}
            {renderBarChart(chartData?.giro, "Giro Bags by Size", "Total Bags", "Bag Size")}
          </div>
        </div>
        {/* Fox */}
        <div style={{ textAlign: "center" }}>
          <GaugeChart title="Fox Capacity" data={gauge} style="fox" />
          <div style={{ marginTop:"10px"}}>
          <ReusableTable columns={columns} data={topProducts.fox} />
          </div>
          <div>
            {renderCards("fox")}
            {renderBarChart(chartData?.fox, "Fox Bags by Size", "Total Bags", "Bag Size")}
          </div>
        </div>
        {/* Vex */}
        <div style={{ textAlign: "center" }}>
          <GaugeChart title="Vexar Capacity" data={gauge} style="vex" />
          <div style={{ marginTop:"10px"}}>
          <ReusableTable columns={columns} data={topProducts.vex} />
          </div>
          <div>
            {renderCards("vex")}
            {renderBarChart(chartData?.vex, "Vex Bags by Size", "Total Bags", "Bag Size")}
          </div>
        </div>
        {/* Bulk */}
        <div style={{ textAlign: "center" }}>
          <GaugeChart title="Bulk Capacity" data={gauge} style="bulk" />
          <div style={{ marginTop:"10px"}}>
          <ReusableTable columns={columns} data={topProducts.bulk} />
          </div>
          <div>
            {renderCards("bulk")}
            {renderBarChart(chartData?.bulk, "Bulk Quantity by Method ID", "Quantity","Style")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
