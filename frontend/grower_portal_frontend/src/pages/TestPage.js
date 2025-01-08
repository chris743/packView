import React, { useState, useEffect } from "react";
import { fetchData } from "../api/api";
import ScheduleTable from "../components/ScheduleTable";
import { Button, Box } from "@mui/material";
import AdvancedModal from "../components/AdvancedModal";
import dayjs from "dayjs";

const endpoint = "planned-harvests";

const TestPage = () => {
  const [data, setData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf("week"));
  const [ selectedRow, setSelectedRow ] = useState(null);

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
      <ScheduleTable data={getCurrentWeekData()} 
      columns={columns} 
      topheader={topHeaderColumns} 
      weekStart={currentWeek.toISOString()}
      onRowClick={handleRowClick}
      />

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
    </Box>
  );
};

export default TestPage;
