import React, { useState, useEffect } from "react";
import { Box, TextField, Paper, Fab, Menu, MenuItem } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DailyHarvestTable from "../components/DailyHarvestTable";
import { fetchData, createData} from "../api/api";
import ModalForm from "../components/ModalForm";

const DaySchedulePage = () => {
  const [harvestData, setHarvestData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filteredData, setFilteredData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDataByDate();
  }, [harvestData, selectedDate]);

  const loadData = async () => {
    try {
      const response = await fetchData("planned-harvests");
      setHarvestData(response);
    } catch (error) {
      console.error("Error fetching harvest data:", error);
    }
  };

  const filterDataByDate = () => {
    const filtered = harvestData.reduce((acc, harvest) => {
      // Find if any date in the dates array matches the selected date
      const matchingDate = harvest.dates.find(
        (dateEntry) => dateEntry.date === selectedDate
      );
  
      if (matchingDate) {
        // Calculate total bins received for the selected date
        const binsReceivedForDate = harvest.receivings
          .filter(
            (receiving) =>
              receiving.harvest === harvest.id && // Ensure matching harvest ID
              receiving.date === selectedDate // Ensure matching date
          )
          .reduce((sum, receiving) => sum + (receiving.qty_received || 0), 0);
  
        // Add the filtered row to the data
        acc.push({
          ...harvest,
          harvest_date: matchingDate.date,
          planned_bins: matchingDate.estimated_bins,
          bins_received: binsReceivedForDate, // Add calculated bins received
        });
      }
      return acc;
    }, []);
  
    setFilteredData(filtered);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleOpenModal = (row) => {
    setModalOpen(true);
    setCurrentRow(row); // Set the current row for editing
    console.log(row);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const handleSave = async (data) => {
    try {
      // Normalize `data` to always be an array
      const normalizedData = Array.isArray(data) ? data : [data];
  
      console.log("Normalized Data:", normalizedData);
  
      // Ensure `currentRow` is valid
      if (!currentRow || typeof currentRow !== "object" || !currentRow.id) {
        console.error("Invalid `currentRow`:", currentRow);
        return;
      }
  
      // Map the normalized data to the required structure
      const mappedData = normalizedData.map((item) => ({
        harvest: currentRow.id, // Use the current row's ID
        receipt_id: item.receipt_id, // Map receipt ID
        qty_received: item.quantity, // Map bins received
      }));
  
      console.log("Mapped Data for API Submission:", mappedData);
  
      // Send each item individually
      for (const item of mappedData) {
        try {
          await createData("receivings", item); // Send one object at a time
          console.log("Saved item:", item);
        } catch (error) {
          console.error("Error saving item:", item, error);
        }
      }
  
      console.log("All receivings saved successfully.");
      handleCloseModal(); // Close the modal on success
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Commodity",
      "Date",
      "Block ID",
      "Block Name",
      "Est. Bins",
      "Fork",
      "Receiver",
      "Packer",
      "Pool",
      "Ranch",
    ];

    const csvData = filteredData.map((item) => [
      item.planted_commodity || "",
      item.harvest_date.split("T")[0],
      item.growerBlockId || "",
      item.growerBlockName || "",
      item.planned_bins || "0",
      item.forkliftContractorName || "",
      item.deliver_to || "",
      item.packed_by || "",
      item.pool || "",
      item.ranch || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Schedule_${selectedDate}.csv`;
    link.click();
    handleCloseMenu();
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const columns = [
    { field: "planted_commodity", headerName: "Commodity" },
    { field: "harvest_date", headerName: "Date" },
    { field: "growerBlockId", headerName: "Block ID" },
    { field: "growerBlockName", headerName: "Block Name" },
    { field: "planned_bins", headerName: "Est. Bins" },
    { field: "bins_received", headerName: "Received"},
    { field: "forkliftContractorName", headerName: "Fork" },
    { field: "deliver_to", headerName: "Receiver" },
    { field: "packed_by", headerName: "Packer" },
    { field: "pool", headerName: "Pool" },
    { field: "ranch", headerName: "Ranch" },
    { field: "", headerName: "" },
  ];

  const actions = [
    {
      label: "Receive Bins",
      color: "secondary",
      onClick: (row) => handleOpenModal(row),
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Select Date"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <DailyHarvestTable
        columns={columns}
        data={filteredData}
        actions={actions}
      />

      <ModalForm 
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initalData={currentRow}
        modalType='Log Receiving'
        fields={[
            {name: 'receipt_id', label: 'Receipt'},
            {name: 'quantity', label: 'Bins'},
        ]}
      />

      <Fab
        color="primary"
        aria-label="save"
        onClick={handleOpenMenu}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <SaveIcon />
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleExportCSV}>Export as CSV</MenuItem>
      </Menu>
    </Box>
  );
};

export default DaySchedulePage;
