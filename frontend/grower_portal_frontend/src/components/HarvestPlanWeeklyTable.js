import React, {useState} from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";

const DailyHarvestTable = ({ columns, topheader, data, onRowClick }) => {
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

    Object.keys(groupedData).forEach((commodity) => {
        groupedData[commodity].sort((a, b) => (new Date(a.harvest_date) - new Date (b.harvest_date)))
    })
    return groupedData;
  }

  const calculateTotals = (rows = data) => {
    const totals = {};
    columns.forEach((column) => {
      if (["est_bins", "bins_received", "sun", "mon", "tue", "wed", "thu", "fri", "sat"].includes(column.field)) {
        totals[column.field] = rows.reduce((sum, row) => sum + (row[column.field] || 0), 0);
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
                        ...rowStyles,
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
          <TableRow sx={{
            backgroundColor: theme.palette.grey[400],
          }}>
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
                    )
                )
            }

          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
   
    </>
  );
};

export default DailyHarvestTable;