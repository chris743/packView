import React from "react";
import GaugeChart from "../../components/charts/GaugeChart";

const Dashboard = () => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      <h5>{today}</h5>
      {/* Container for the gauge charts */}
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap" }}>
        <GaugeChart endpoint="giro-capacity" />
        <GaugeChart endpoint="fox-capacity" />
        <GaugeChart endpoint="vexar-capacity" />
        <GaugeChart endpoint="bulk-capacity" />
      </div>
    </div>
  );
};

export default Dashboard;
