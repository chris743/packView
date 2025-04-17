import React, { useState, useMemo } from "react";
import {
  Box, Button, Checkbox, FormControlLabel, Paper, TextField, Typography, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const defaultColumns = {
  block: true,
  grower: true,
  pool: true,
  size: true,
  grade: true,
  total_weight_lb: true,
  total_count: true,
  avg_weight_per_piece: true
};

const AveragePackoutReport = () => {
  const [visibleCols, setVisibleCols] = useState(defaultColumns);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [poolFilter, setPoolFilter] = useState("");
  const [data, setData] = useState([]);

  const handleColToggle = (col) => {
    setVisibleCols(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const loadData = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (blockFilter) params.append("block", blockFilter);
      if (poolFilter) params.append("pool", poolFilter);

      const response = await axios.get(`http://localhost:8000/data/reports/average-packout?${params.toString()}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to load report data", error);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesBlock = blockFilter ? row.block === blockFilter : true;
      const matchesPool = poolFilter ? row.pool === poolFilter : true;
      return matchesBlock && matchesPool;
    });
  }, [data, blockFilter, poolFilter]);

  const condensedData = useMemo(() => {
    const condensedKeys = Object.keys(defaultColumns).filter(
      key => visibleCols[key] && !["total_weight_lb", "total_count", "avg_weight_per_piece"].includes(key)
    );

    const groupedMap = new Map();

    filteredData.forEach((row, index) => {
      const condensedKey = condensedKeys.map(key => row[key] ?? "").join("|") || "Ungrouped";
      if (!groupedMap.has(condensedKey)) {
        groupedMap.set(condensedKey, {
          id: index,
          ...row,
          total_weight_lb: 0,
          total_count: 0
        });
      }
      const entry = groupedMap.get(condensedKey);
      entry.total_weight_lb += row.total_weight_lb || 0;
      entry.total_count += row.total_count || 0;
    });

    const condensed = Array.from(groupedMap.values());
    condensed.forEach(row => {
      const count = row.total_count;
      row.avg_weight_per_piece = count ? +(row.total_weight_lb / count).toFixed(2) : null;
    });

    return condensed;
  }, [filteredData, visibleCols]);

  const exportToCSV = () => {
    const exportData = condensedData.map(row => {
      const result = {};
      Object.keys(defaultColumns).forEach(key => {
        if (visibleCols[key]) result[key] = row[key];
      });
      return result;
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Packout Report");
    XLSX.writeFile(workbook, "packout_report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const headers = Object.keys(defaultColumns).filter(key => visibleCols[key]);
    const body = condensedData.map(row => headers.map(h => row[h]));
    autoTable(doc, { head: [headers], body });
    doc.save("packout_report.pdf");
  };

  const columns = Object.keys(defaultColumns).filter(key => visibleCols[key]).map(key => ({
    field: key,
    headerName: key.replace(/_/g, " ").toUpperCase(),
    flex: 1,
    sortable: true
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Average Packout Report
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Block ID"
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          />
          <TextField
            label="Pool ID"
            value={poolFilter}
            onChange={(e) => setPoolFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          />
          <Button variant="contained" onClick={loadData}>Run Report</Button>
          <Button variant="outlined" onClick={exportToCSV}>Export CSV</Button>
          <Button variant="outlined" onClick={exportToPDF}>Export PDF</Button>
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Show/Hide Columns:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {Object.keys(defaultColumns).map(col => (
              <FormControlLabel
                key={col}
                control={<Checkbox checked={visibleCols[col]} onChange={() => handleColToggle(col)} />}
                label={col}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={condensedData.map((row, idx) => ({ id: idx, ...row }))}
          columns={columns}
          disableRowSelectionOnClick
          autoHeight={false}
          sortingOrder={["asc", "desc"]}
        />
      </Paper>
    </Box>
  );
};

export default AveragePackoutReport;