import React from "react";
import StatCard from "./OrderStatCard";

const StatCardGroup = ({ stats }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          total={stat.total}
          additionalText={stat.additionalText}
        />
      ))}
    </div>
  );
};

export default StatCardGroup;
