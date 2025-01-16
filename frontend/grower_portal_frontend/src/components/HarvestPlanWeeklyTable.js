import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";

const WeeklyHarvestTable = ({ columns, topheader, data, onRowClick }) => {
  const theme = useTheme();

  const headerStyles = {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[300],
    color: theme.palette.text.primary,
    fontWeight: "bold",
    textAlign: "center",
  };

  // Calculate planned bins as sum of daily columns
  const calculatePlannedBins = (row) => {
    return ["sun", "mon", "tue", "wed", "thu", "fri"].reduce(
      (sum, day) => sum + (row[day] || 0),
      0
    );
  };

  // Calculate balance as planned - received
  const calculateBalance = (row) => {
    const planned = calculatePlannedBins(row);
    const received = row.bins_received || 0;
    var balance = received - planned;
    return balance;
  };

  const groupByCommodity = () => {
    const groupedData = {};
    data.forEach((row) => {
      const commodity = row.commodity || "Other";
      if (!groupedData[commodity]) {
        groupedData[commodity] = [];
      }
      // Add planned_bins and balance calculations for each row
      const planned_bins = calculatePlannedBins(row);
      groupedData[commodity].push({
        ...row,
        planned_bins,
        balance: calculateBalance(row),
      });
    });

    Object.keys(groupedData).forEach((commodity) => {
      groupedData[commodity].sort(
        (a, b) => new Date(a.harvest_date) - new Date(b.harvest_date)
      );
    });
    return groupedData;
  };

  const calculateTotals = (rows = data) => {
    const totals = {};
    columns.forEach((column) => {
      if (
        [
          "estimated_bins",
          "bins_received",
          "sun",
          "mon",
          "tue",
          "wed",
          "thu",
          "fri",
          "sat",
          "planned_bins",
          "balance",
        ].includes(column.field)
      ) {
        totals[column.field] = rows.reduce((sum, row) => {
          if (column.field === "planned_bins") {
            return sum + calculatePlannedBins(row);
          }
          if (column.field === "balance") {
            return sum + calculateBalance(row);
          }
          return sum + (row[column.field] || 0);
        }, 0);
      } else if (["grower_block_name"].includes(column.field)) {
        totals[column.field] = "TOTALS";
      } else {
        totals[column.field] = "";
      }
    });
    return totals;
  };

  // Calculate grand totals for all data
  const grandTotals = calculateTotals();

  const commodityColors = {
    navel: "#FFA500", // Orange
    lemon: "#FFFF00", // Yellow
    cara: "#FF1493", // Dark Pink
    blood: "#FF0000", // Red
    grapefruit: "#FFB6C1", // Light Pink
    mandarin: '#741ca3' //purple
  };

  const groupedData = groupByCommodity();

  const rowStyles = {
    padding: "4px 8px", // Reduce padding
    fontSize: "0.75rem", // Smaller font size for rows
    lineHeight: "1rem", // Reduce line height
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="dense table">
          <TableHead>
            {/* Header row with spanning columns */}
            <TableRow>
              {topheader.map((topheader) => (
                <TableCell
                  key={topheader.field}
                  style={headerStyles}
                  colSpan={topheader.span}
                >
                  {topheader.headerName}
                </TableCell>
              ))}
            </TableRow>

            {/* Header row for individual column names */}
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field} style={headerStyles}>
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groupedData).map(([commodity, rows], index) => (
              <React.Fragment key={commodity}>
                {/* Commodity Rows */}
                {rows.map((row, rowIndex) => (
                  <TableRow
                    key={row.id || rowIndex}
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => onRowClick(row)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        sx={{
                          ...rowStyles,
                          color: theme.palette.text.primary,
                          textAlign: "center",
                          backgroundColor:
                            column.field === "commodity"
                              ? commodityColors[commodity.toLowerCase()] ||
                                "transparent"
                              : "transparent",
                          color:
                            column.field === "commodity"
                              ? "black"
                              : "automatic",
                        }}
                      >
                        {column.field === "planned_bins"
                          ? calculatePlannedBins(row)
                          : column.field === "balance"
                          ? calculateBalance(row)
                          : row[column.field] || ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow
                  sx={{
                    backgroundColor:
                      commodityColors[commodity.toLowerCase()] ||
                      theme.palette.grey[300],
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      sx={{
                        ...rowStyles,
                        color: "black",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {calculateTotals(rows)[column.field]}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Blank Row */}
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.field} />
                  ))}
                </TableRow>
              </React.Fragment>
            ))}
            <TableRow
              sx={{
                backgroundColor: theme.palette.grey[400],
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {grandTotals[column.field]}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default WeeklyHarvestTable;
