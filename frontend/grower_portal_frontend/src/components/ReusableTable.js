import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  useTheme,
} from "@mui/material";

const ReusableTable = ({ columns, data, actions }) => {
  const theme = useTheme(); // Access the current theme

  return (
    <Box
      sx={{
        overflowX: "auto",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "8px",
        boxShadow: theme.palette.mode === "dark"
          ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
          : "0px 4px 10px rgba(0, 0, 0, 0.1)",
        padding: 2,
        marginBottom: 2,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {/* Render Column Headers */}
            {columns.map((column) => (
              <TableCell
                key={column.field}
                sx={{
                  backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                  color: theme.palette.text.primary,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {column.headerName}
              </TableCell>
            ))}
            {/* Render Action Header if actions are provided */}
            {actions && actions.length > 0 && (
              <TableCell
                sx={{
                  backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                  color: theme.palette.text.primary,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Render Data Rows */}
          {data.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              sx={{
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    color: theme.palette.text.primary,
                    textAlign: "center",
                  }}
                >
                  {row[column.field]}
                </TableCell>
              ))}
              {/* Render Action Buttons */}
              {actions && actions.length > 0 && (
                <TableCell
                  sx={{
                    textAlign: "center",
                  }}
                >
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "contained"}
                      color={action.color || "primary"}
                      onClick={() => action.onClick(row)}
                      sx={{
                        marginRight: 1,
                        fontSize: "0.8rem",
                        padding: "4px 8px",
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ReusableTable;
