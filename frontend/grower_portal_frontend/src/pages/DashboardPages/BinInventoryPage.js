import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";
import { fetchChartData } from "../../api/api";

const binInventoryEndpoint = "bin-inventory";
const associatedRecordsEndpoint = "associated-records";

const BinInventory = () => {
  const [tableData, setTableData] = useState({});
  const [commodityColumns, setCommodityColumns] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [associatedRecords, setAssociatedRecords] = useState([]);
  const [error, setError] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const GRADE_ORDER = ["EXP FANCY", "EXP CHOICE", "FANCY", "CHOICE", "STANDARD", "JUICE"];

  const handleCellClick = async (params, commodity) => {
    const { field: size_id, row: { grade_id } } = params;

    if (size_id === "grade_id") return; // Ignore clicks on the grade column

    try {
      const cleanedSize = size_id ? String(size_id).replace("/", "").padStart(3, "0") : null; // Clean size
      const data = await fetchChartData(`${associatedRecordsEndpoint}?commodity=${commodity}&grade=${grade_id}&size=${cleanedSize}`);
      setAssociatedRecords(data);
      setModalTitle(`Records for ${commodity} - ${grade_id} - Size ${size_id}`);
      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching associated records:", err);
      setAssociatedRecords([]);
    }
  };

  const preparePivotData = (data) => {
    const uniqueCommodities = [...new Set(data.map((row) => row.commodity_id))];
    const groupedData = {};
    const columnsByCommodity = {};

    uniqueCommodities.forEach((commodity) => {
      const commodityData = data.filter((row) => row.commodity_id === commodity);

      const uniqueSizes = [...new Set(commodityData.map((row) => row.size_id))].sort((a, b) => a - b);
      const uniqueGrades = [...new Set(commodityData.map((row) => row.grade_id.toUpperCase()))];

      groupedData[commodity] = uniqueGrades.map((grade) => {
        const row = { id: grade, grade_id: grade };
        uniqueSizes.forEach((size) => {
          row[size] = 0;
        });
        return row;
      });

      commodityData.forEach((row) => {
        const gradeRow = groupedData[commodity].find(
          (r) => r.grade_id === row.grade_id.toUpperCase()
        );
        if (gradeRow && row.size_id) {
          gradeRow[row.size_id] = (gradeRow[row.size_id] || 0) + (row.total_quantity || 0);
        }
      });

      groupedData[commodity] = groupedData[commodity].sort(
        (a, b) => GRADE_ORDER.indexOf(a.grade_id) - GRADE_ORDER.indexOf(b.grade_id)
      );

      columnsByCommodity[commodity] = [
        { field: "grade_id", headerName: "Grade", width: 150 },
        ...uniqueSizes.map((size) => ({
          field: size,
          headerName: `Size ${size}`,
          width: 100,
        })),
      ];
    });

    setCommodityColumns(columnsByCommodity);
    return groupedData;
  };

  const closeModal = () => {
    setModalOpen(false);
    setAssociatedRecords([]); // Reset records
    setModalTitle(""); // Reset title
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
    const commodities = Object.keys(tableData);

    if (!commodities.length) {
      return <Typography color="error">No data available.</Typography>;
    }

    return commodities.map((commodity) => (
      <Box key={commodity} sx={{ padding: "10px", border: "1px solid #ddd" }}>
        <Typography variant="h6" gutterBottom>
          Commodity: {commodity}
        </Typography>
        <DataGrid
          rows={tableData[commodity]}
          columns={commodityColumns[commodity]} // Use commodity-specific columns
          autoHeight
          disableSelectionOnClick
          hideFooter // Remove footer
          onCellClick={(params) => handleCellClick(params, commodity)} // Handle cell clicks
        />
      </Box>
    ));
  };

  const renderModalContent = () => {
    if (associatedRecords.length === 0) {
      return <Typography>No records found.</Typography>;
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {Object.keys(associatedRecords[0]).map((key) => (
                <TableCell key={key}>{key}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {associatedRecords.map((record, index) => (
              <TableRow key={index}>
                {Object.values(record).map((value, idx) => (
                  <TableCell key={idx}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Bin Inventory
      </Typography>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)", // Two columns
            gap: "20px", // Spacing between grid items
          }}
        >
          {renderTables()}
        </Box>
      )}

      {/* Modal for Associated Records */}
      <Modal
        open={modalOpen}
        onClose={closeModal} // Close modal and reset state
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Paper sx={{ padding: "20px", maxWidth: "80%", maxHeight: "80%", overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            {modalTitle}
          </Typography>
          {renderModalContent()}
          <Box sx={{ textAlign: "right", marginTop: "20px" }}>
            <Button variant="contained" color="primary" onClick={closeModal}>
              Close
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default BinInventory;
