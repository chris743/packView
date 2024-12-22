import React from "react";
import GaugeChart from "../../components/charts/GaugeChart";

const Dashboard = () => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date


  return (
    <div>
      <h2>Dashboard</h2>
      <h5>{today}</h5>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <GaugeChart />
        </div>
    </div>
  );
};

export default Dashboard;
