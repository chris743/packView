import React, { useState } from "react";
import { Box, MenuItem, Select, Typography, Paper } from "@mui/material";
import AveragePackoutReport from "./AveragePackoutReport";

const ReportsDashboard = () => {
  const [selectedReport, setSelectedReport] = useState("average-packout");
  const [reportData, setReportData] = useState([]);

  const loadAveragePackout = async () => {
    try {
      const response = await fetch("/api/reports/average-packout");
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error("Failed to load Average Packout report", err);
    }
  };

  const renderReport = () => {
    switch (selectedReport) {
      case "average-packout":
        return <AveragePackoutReport data={reportData} onRunReport={loadAveragePackout} />;
      default:
        return <Typography>Select a report from the dropdown</Typography>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Select Report</Typography>
        <Select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
          <MenuItem value="average-packout">Average Packout Report</MenuItem>
          {/* Add other reports here as new components */}
        </Select>
      </Paper>

      {renderReport()}
    </Box>
  );
};

export default ReportsDashboard;