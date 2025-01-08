import React, {useState} from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";

const ScheduleTable = ({ columns, topheader, data, onRowClick }) => {
  const theme = useTheme();

  const headerStyles = {
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[300],
    color: theme.palette.text.primary,
    fontWeight: "bold",
    textAlign: "center",
  };

  const groupByCommodity = () => {
    const groupedData ={};
    data.forEach((row) => {
        const commodity = row.commodity || "Other";
        if (!groupedData[commodity]) {
            groupedData[commodity] =[];
        }
        groupedData[commodity].push(row);
    });
    return groupedData;
  }

  const calculateTotals = () => {
    const totals = {};
    columns.forEach((column) => {
        if (["est_bins", "bins_received", "sun", "mon", "tue", "wed", "thu", "fri", "sat"].includes(column.field)) {
            totals[column.field] = data.reduce((sum, row) => sum + (row[column.field] || 0), 0);
        } else if (["grower_block_name"].includes(column.field)){
            totals[column.field] = "TOTALS"
        }
        else {
            totals[column.field] = "";
        }
    });
    return totals;
  }

  const commodityColors = {
    navel: "#FFA500", // Orange
    lemon: "#FFFF00", // Yellow
    cara: "#FF1493", // Dark Pink
    blood: "#FF0000", // Red
    grapefruit: "#FFB6C1", // Light Pink
  };

  const groupedData = groupByCommodity();

  return (
    <>
    <TableContainer component={Paper}>
      <Table size="small" aria-label="dense table">
        <TableHead>
          {/* Header row with spanning columns */}
          <TableRow>
            {topheader.map((topheader) => (
                <TableCell key={topheader.field} style={headerStyles} colSpan={topheader.span}>
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
                        color: theme.palette.text.primary,
                        textAlign: "center",
                        backgroundColor: column.field === "commodity"
                          ? commodityColors[commodity.toLowerCase()] || "transparent"
                          : "transparent", // Color only the "commodity" column
                        color: column.field === "commodity" ? "black" : "automatic",
                      }}
                    >
                      {row[column.field] || ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* Totals Row */}
              <TableRow
                sx={{
                  backgroundColor: commodityColors[commodity.toLowerCase()] || theme.palette.grey[300],
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
        </TableBody>
      </Table>
    </TableContainer>
   
    </>
  );
};

export default ScheduleTable;