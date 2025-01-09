import React, { useState, useEffect } from "react";
import { fetchData } from "../api/api";
import ScheduleTable from "../components/HarvestPlanWeeklyTable";
import { Button, Box, Fab, Menu, MenuItem } from "@mui/material";
import AdvancedModal from "../components/HarvestPlanModal";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import SaveIcon from "@mui/icons-material/Save";


const endpoint = "planned-harvests";

const TestPage = () => {
  const [data, setData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf("week"));
  const [ selectedRow, setSelectedRow ] = useState(null);
  const [ anchorEl, setAnchorEl ] = useState(null);

  const loadData = async () => {
    const apiData = await fetchData(endpoint);
    setData(apiData);
  };

  const handleSave = (updatedRow) => {
    // Save the updated data (optional API call here)
    setData((prevData) =>
        prevData.map((row) =>
          row.id === updatedRow.id ? updatedRow : row
        )
      );
      setSelectedRow(null); // Close the modal
  };

  useEffect(() => {
    loadData();
  }, []);

  const transformData = (apiData) => {
    const getDayColumn = (date) => {
      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const dayIndex = new Date(date).getDay();
      return days[dayIndex];
    };

    return apiData.map((item) => {
      const dayColumn = getDayColumn(item.harvest_date);

      const row = {
        id: item.id,
        commodity: item.planted_commodity,
        ranch_name: item.ranch,
        growerBlockName: item.growerBlockName,
        planned_bins: item.planned_bins,
        size: item.size,
        bins_received: item.received_bins,
        sun: null,
        mon: null,
        tue: null,
        wed: null,
        thu: null,
        fri: null,
        sat: null,
        balance: item.planned_bins - item.received_bins || 0,
        grower_block: item.grower_block,
        harvest_date: item.harvest_date,
        pool: item.pool,
        hauler: item.hauler,
        hauling_rate: item.hauling_rate,
        contractor: item.contractor,
        harvesting_rate: item.harvesting_rate,
        forklift_contractor: item.forklift_contractor,
        forklift_rate: item.forklift_rate,
        notes_general: item.notes_general,
      };

      row[dayColumn] = item.planned_bins;
      return row;
    });
  };

  const getCurrentWeekData = () => {
    const startOfWeek = currentWeek.toDate();
    const endOfWeek = currentWeek.add(6, "day").toDate();

    const filteredData = data.filter((item) => {
      const harvestDate = new Date(item.harvest_date);
      return harvestDate >= startOfWeek && harvestDate <= endOfWeek;
    });

    return transformData(filteredData);
  };

  const handleDownloadPDF = async () => {
    const tableElement = document.getElementById("schedule-table");
  
    // Save original background color
    const originalBackgroundColor = tableElement.style.backgroundColor;
  
    // Set background color to white
    tableElement.style.backgroundColor = "#ffffff";
  
    // Generate PDF
    const canvas = await html2canvas(tableElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF("landscape");
    const imgWidth = pdf.internal.pageSize.getWidth(); // Full width of the PDF page
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
  
    // Adjust image position to remove margins
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Schedule_${currentWeek.format("YYYY-MM-DD")}.pdf`);
  
    // Revert to original background color
    tableElement.style.backgroundColor = originalBackgroundColor;
  };

  const handleExportExcel = () => {
    const currentWeekData = getCurrentWeekData();

    // Map data to Excel-compatible format
    const excelData = currentWeekData.map((item) => ({
      Commodity: item.planted_commodity,
      Ranch: item.ranch,
      Block: item.growerBlockName,
      "Planned Bins": item.planned_bins,
      Size: item.size,
      "Bins Received": item.received_bins,
      Sun: item.sun || 0,
      Mon: item.mon || 0,
      Tue: item.tue || 0,
      Wed: item.wed || 0,
      Thu: item.thu || 0,
      Fri: item.fri || 0,
      Sat: item.sat || 0,
      Balance: item.planned_bins - item.received_bins || 0,
    }));

    // Create a workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");

    // Save the workbook as an .xlsx file
    XLSX.writeFile(workbook, `Schedule_${currentWeek.format("YYYY-MM-DD")}.xlsx`);
  };

  const handleRowClick = (row) =>{
    setSelectedRow(row);
  };

  const handleWeekChange = (direction) => {
    setCurrentWeek((prevWeek) =>
      direction === "prev"
        ? prevWeek.subtract(7, "day")
        : prevWeek.add(7, "day")
    );
  };

  const columns = [
    { field: "commodity", headerName: "commodity"},
    { field: "ranch_name", headerName: "Ranch" },
    { field: "growerBlockName", headerName: "Block" },
    { field: "planned_bins", headerName: "Est. Bins" },
    { field: "size", headerName: "Size" },
    { field: "bins_received", headerName: "Bins Received" },
    { field: "sun", headerName: "Sun" },
    { field: "mon", headerName: "Mon" },
    { field: "tue", headerName: "Tue" },
    { field: "wed", headerName: "Wed" },
    { field: "thu", headerName: "Thu" },
    { field: "fri", headerName: "Fri" },
    { field: "sat", headerName: "Sat" },
    { field: "balance", headerName: "Balance" },
  ];

  const topHeaderColumns = [
    { field: 'commodity', headerName: "", span: 1 },
    { field: 'text', headerName: "Projected Weekly Harvest Schedule", span: 5 },
    { field: "sun", headerName: currentWeek.format("DD-MMM"), span: 1},
    { field: "mon", headerName: currentWeek.add(1, "day").format("DD-MMM"), span: 1 },
    { field: "tue", headerName: currentWeek.add(2, "day").format("DD-MMM"), span: 1 },
    { field: "wed", headerName: currentWeek.add(3, "day").format("DD-MMM"), span: 1 },
    { field: "thu", headerName: currentWeek.add(4, "day").format("DD-MMM"), span: 1 },
    { field: "fri", headerName: currentWeek.add(5, "day").format("DD-MMM"), span: 1 },
    { field: "sat", headerName: currentWeek.add(6, "day").format("DD-MMM"), span: 1 },
    { field: "blank", headerName: " ", span: 1 },

  ]

  const modalClose = () => {
    setSelectedRow(null);
    loadData();
  }

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      {/* Navigation Buttons */}
      <Box display="flex" flex-direction="row" justifyContent="space-between">
        <Box display="flex" justifyContent="flex-start" mb={2}>
            <Button variant="outlined" onClick={handleRowClick} > New Line </Button>
        </Box>
        <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button onClick={() => handleWeekChange("prev")}>Previous Week</Button>
            <Button onClick={() => handleWeekChange("next")}>Next Week</Button>
        </Box>
      </Box>

      {/* Schedule Table */}
      <Box id="schedule-table">
        <ScheduleTable 
        data={getCurrentWeekData()} 
        columns={columns} 
        topheader={topHeaderColumns} 
        weekStart={currentWeek.toISOString()}
        onRowClick={handleRowClick}
        />
      </Box>

    {/* Advanced Modal */}
    {selectedRow && (
    <AdvancedModal
        open={Boolean(selectedRow)}
        onClose={modalClose}
        rowData={selectedRow}
        onSave={handleSave}
        weekStart={currentWeek.toISOString()}
    />
      )}

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

export default TestPage;


