import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import { Button } from "@mui/material";

const DailyHarvestTable = ({ columns, data, onRowClick, actions }) => {
  return (
    <>
      <TableContainer component={Paper} id="day-schedule-table">
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field}>{column.headerName}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No harvests scheduled for this date
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={`${row.id}-${index}`}>
                  <TableCell>{row.planted_commodity || "-"}</TableCell>
                  <TableCell>{row.harvest_date.split("T")[0]}</TableCell>
                  <TableCell>{row.growerBlockId || "-"}</TableCell>
                  <TableCell>{row.growerBlockName || "-"}</TableCell>
                  <TableCell>{row.planned_bins || "0"}</TableCell>
                  <TableCell>{row.bins_received}</TableCell>
                  <TableCell>{row.forkliftContractorName || "-"}</TableCell>
                  <TableCell>{row.deliver_to || "-"}</TableCell>
                  <TableCell>{row.packed_by || "-"}</TableCell>
                  <TableCell>{row.pool || "-"}</TableCell>
                  <TableCell>{row.ranch || "-"}</TableCell>
                  {actions && actions.length > 0 && (
                  <TableCell>
                    {actions.map((action, index) => (
                    <Button 
                        key={index}
                        variant={action.variant || "contained"}
                        color={action.color || "primary"}
                        onClick={() => action.onClick(row)}
                        sx={{
                            marginRight:1,
                            fontSize: ".8rem",
                            padding: "4px 8px",
                        }}
                        >
                        Receive Bins
                    </Button>
                    ))}
                  </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DailyHarvestTable;
