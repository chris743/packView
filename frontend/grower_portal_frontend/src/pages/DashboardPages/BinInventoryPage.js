import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { fetchChartData } from "../../api/api";

const binInventoryEndpoint = "bin-inventory";
const associatedRecordsEndpoint = "associated-records";

const GRADE_ORDER = ["EXP FANCY", "EXP CHOICE", "FANCY", "CHOICE", "STANDARD", "JUICE"];
const TABLE_ORDER = ["NAVEL", "MANDARIN", "LEMON","CARA CARA", "GRAPEFRUIT", "BLOOD","MINNEOLA", "PUMMELO"]; // Predefined order for tables

const BinInventory = () => {
  const theme = useTheme();
  const [tableData, setTableData] = useState({});
  const [commodityColumns, setCommodityColumns] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [associatedRecords, setAssociatedRecords] = useState([]);
  const [error, setError] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const preparePivotData = (data) => {
    const uniqueCommodities = [...new Set(data.map((row) => row.commodity_id))];
    const groupedData = {};
    const columnsByCommodity = {};

    uniqueCommodities.forEach((commodity) => {
      const commodityData = data.filter((row) => row.commodity_id === commodity);
      const uniqueSizes = [...new Set(commodityData.map((row) => row.size_id))].sort((a, b) => a - b);
      const uniqueGrades = [...new Set(commodityData.map((row) => row.grade_id.toUpperCase()))].sort(
        (a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b)
      );

      groupedData[commodity] = uniqueGrades.map((grade) => {
        const row = { id: grade, grade_id: grade };
        uniqueSizes.forEach((size) => {
          row[size] = 0;
        });
        return row;
      });

      commodityData.forEach((row) => {
        const gradeRow = groupedData[commodity].find((r) => r.grade_id === row.grade_id.toUpperCase());
        if (gradeRow && row.size_id) {
          gradeRow[row.size_id] =
            (gradeRow[row.size_id] || 0) + (Math.round(row.total_quantity) || 0);
        }
      });

      columnsByCommodity[commodity] = [
        { field: "grade_id", headerName: "Grade", width: 150 },
        ...uniqueSizes.map((size) => ({
          field: size,
          headerName: `Size ${size}`,
          width: 100,
          align: "center",
          headerAlign: "center",
        })),
      ];
    });

    setCommodityColumns(columnsByCommodity);
    return groupedData;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchChartData(binInventoryEndpoint);
        const groupedData = preparePivotData(data);
        setTableData(groupedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data.");
      }
    };

    fetchData();
  }, []);

  const renderTables = () => {
    if (!Object.keys(tableData).length) {
      return <Typography color="error">No data available.</Typography>;
    }
  
    const sortedTableData = Object.entries(tableData).sort(
      ([a], [b]) => TABLE_ORDER.indexOf(a) - TABLE_ORDER.indexOf(b)
    );
  
    return sortedTableData.map(([commodity, data]) => (
      <Box
        key={commodity}
        sx={{
          mb: 1,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          overflow: "hidden",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            p: 1,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {commodity}
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Grade</TableCell>
                {commodityColumns[commodity]
                  .filter((col) => col.field !== "grade_id")
                  .map((col) => (
                    <TableCell key={col.field} align="center" sx={{ fontWeight: "bold" }}>
                      {col.headerName}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={row.grade_id}
                  sx={{
                    backgroundColor: row.grade_id === "EXP FANCY" ? theme.palette.action.selected : "inherit",
                  }}
                >
                  <TableCell>{row.grade_id}</TableCell>
                  {commodityColumns[commodity]
                    .filter((col) => col.field !== "grade_id")
                    .map((col) => (
                      <TableCell key={col.field} align="center">
                        {row[col.field]}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    ));
  };

  const renderModalContent = () => {
    if (associatedRecords.length === 0) {
      return <Typography>No records found.</Typography>;
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {Object.keys(associatedRecords[0]).map((key) => (
                <TableCell key={key}>{key}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {associatedRecords.map((record, idx) => (
              <TableRow key={idx}>
                {Object.values(record).map((value, i) => (
                  <TableCell key={i}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "1400px",
        mx: "auto",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        renderTables()
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: "90%",
            maxWidth: 1000,
            maxHeight: "90vh",
            overflow: "auto",
            p: 3,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {modalTitle}
          </Typography>
          <TableContainer>{renderModalContent()}</TableContainer>
          <Box sx={{ mt: 0, textAlign: "right" }}>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default BinInventory;
