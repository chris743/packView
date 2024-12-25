import React from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";

const StatCard = ({ label, total, percent }) => {
  const theme = useTheme(); // Access the current theme

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <Card
      sx={{
        flex: "1 1 calc(33.333% - 20px)", // 1/3 width minus spacing
        margin: "10px",
        textAlign: "center",
        backgroundColor: "background.paper",
        color: "text.primary",
        boxShadow: theme.palette.mode === "dark" ? "0px 4px 10px rgba(0, 0, 0, 0.3)" : "0px 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h4" color="primary" sx={{ margin: "10px 0" }}>
          {formatNumber(total)}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {percent}%
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;
