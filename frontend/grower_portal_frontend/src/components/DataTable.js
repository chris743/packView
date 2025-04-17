import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  Button,
  TextField,
  InputAdornment,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Enhanced table component with sorting, filtering, and pagination
 * 
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Data rows
 * @param {Array} props.actions - Action button definitions
 * @param {string} props.title - Table title
 * @param {boolean} props.enableSearch - Whether to show search input
 * @param {boolean} props.enablePagination - Whether to enable pagination
 * @param {function} props.onRowClick - Row click handler
 * @param {Object} props.sx - Additional styles to apply
 */
const DataTable = ({
  columns = [],
  data = [],
  actions = [],
  title = null,
  enableSearch = true,
  enablePagination = true,
  onRowClick = null,
  sx = {}
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState(null);
  const [order, setOrder] = useState("asc");

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter and sort data
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    
    return Object.keys(row).some((key) => {
      const value = row[key];
      return value !== null && 
        value !== undefined && 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort data if orderBy is set
  const sortedData = React.useMemo(() => {
    if (!orderBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue === null || aValue === undefined) return order === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined) return order === "asc" ? 1 : -1;
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      const aString = aValue.toString().toLowerCase();
      const bString = bValue.toString().toLowerCase();
      return order === "asc" 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    });
  }, [filteredData, orderBy, order]);

  // Apply pagination if enabled
  const paginatedData = enablePagination
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedData;

  return (
    <Paper
      sx={{
        borderRadius: "8px",
        boxShadow: theme.palette.mode === "dark"
          ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
          : "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        ...sx
      }}
    >
      {/* Table header with search and title */}
      {(title || enableSearch) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {title && <Typography variant="h6">{title}</Typography>}
          
          {enableSearch && (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ ml: "auto", minWidth: 200 }}
            />
          )}
        </Box>
      )}

      {/* Table container */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sortDirection={orderBy === column.field ? order : false}
                  sx={{
                    backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    textAlign: column.align || "left",
                    whiteSpace: "nowrap",
                    ...(column.width && { width: column.width })
                  }}
                >
                  <TableSortLabel
                    active={orderBy === column.field}
                    direction={orderBy === column.field ? order : "asc"}
                    onClick={() => handleRequestSort(column.field)}
                    hideSortIcon={!column.sortable}
                  >
                    {column.headerName}
                  </TableSortLabel>
                </TableCell>
              ))}
              
              {actions && actions.length > 0 && (
                <TableCell
                  sx={{
                    backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    textAlign: "center",
                    width: actions.length * 100,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions && actions.length ? 1 : 0)}
                  sx={{ 
                    textAlign: "center", 
                    py: 3 
                  }}
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    cursor: onRowClick ? "pointer" : "default",
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
                        textAlign: column.align || "left",
                      }}
                    >
                      {column.renderCell 
                        ? column.renderCell(row) 
                        : row[column.field]}
                    </TableCell>
                  ))}
                  
                  {actions && actions.length > 0 && (
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant || "contained"}
                          color={action.color || "primary"}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          size="small"
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {enablePagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default DataTable;