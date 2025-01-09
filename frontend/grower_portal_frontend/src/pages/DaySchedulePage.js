import React, { useState, useEffect } from "react";
import { fetchData } from "../api/api";
import DailyHarvestTable from "../components/HarvestPlanDailyTable";
import { Box, Button, Menu, MenuItem, Fab, TextField } from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import SaveIcon from "@mui/icons-material/Save";
import dayjs from "dayjs";

const endpoint = "planned-harvests";

const DaySchedulePage = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [filteredData, setFilteredData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDataByDate();
  }, [data, selectedDate]);

  const loadData = async () => {
    try {
      const apiData = await fetchData(endpoint);
      setData(apiData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filterDataByDate = () => {
    const filtered = data.filter(
      (item) => dayjs(item.harvest_date).format("YYYY-MM-DD") === selectedDate
    );
    setFilteredData(filtered);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleDownloadPDF = async () => {
    const tableElement = document.getElementById("day-schedule-table");

    const originalBackgroundColor = tableElement.style.backgroundColor;
    tableElement.style.backgroundColor = "#ffffff";

    const canvas = await html2canvas(tableElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape");
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Schedule_${selectedDate}.pdf`);

    tableElement.style.backgroundColor = originalBackgroundColor;
    handleCloseMenu();
  };

  const handleExportExcel = () => {
    const excelData = filteredData.map((item) => ({
      Commodity: item.planted_commodity || "N/A",
      Ranch: item.ranch || "N/A",
      Block: item.growerBlockName || "N/A",
      "Planned Bins": item.planned_bins || 0,
      Size: item.size || "N/A",
      "Bins Received": item.received_bins || 0,
      Balance: item.planned_bins - item.received_bins || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DaySchedule");

    XLSX.writeFile(workbook, `Schedule_${selectedDate}.xlsx`);
    handleCloseMenu();
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const columns = [
    { field: "commodity", headerName: "Commodity"},
    { field: "harvest_date", headerName: "Date"},
    { field: "growerBlockId", headerName: "Block ID" },
    { field: "growerBlockName", headerName: "Block Name" },
    { field: "planned_bins", headerName: "Est. Bins" },
    { field: "hauler", headerName: "Haul" },
    { field: "forklift_contractor", headerName: "Fork" },
    { field: "contractor", headerName: "Pick" },
    { field: "deliver_to", headerName: "Receiver" },
    { field: "packed_by", headerName: "Packer"},
    { field: "pool", headerName: "Pool"},
    { field: "grower_red", fieldName: "Rep"},
    { field: "bins_received", headerName: "Bins Received" },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Select Date"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box id="day-schedule-table">
        <DailyHarvestTable
          data={filteredData}
          columns={columns}
          weekStart={selectedDate} // Not used here but required by ScheduleTable
        />
      </Box>

      {/* Sticky Save Button */}
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

      {/* Dropdown Menu */}
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
        <MenuItem onClick={handleDownloadPDF}>Export as PDF</MenuItem>
        <MenuItem onClick={handleExportExcel}>Export as Excel</MenuItem>
      </Menu>
    </Box>
  );
};

export default DaySchedulePage;
