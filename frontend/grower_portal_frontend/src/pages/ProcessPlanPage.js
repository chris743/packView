import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography,
  Grid,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Modal,
} from '@mui/material';
import Popper from "@mui/material/Popper";
import { fetchData, editData, createData, deleteData, saveRowOrder } from '../api/api';
import EditableTable from '../components/EditableTable';
import SummaryPanel from '../components/SummaryPanel';
import DateSelector from '../components/DateSelector';
import WeeklyCalendarView from '../components/WeeklyCalendarView';
import PrintableTable from '../components/PrintableTable';
import batchSyncService from '../utils/batchSync';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import ViewListIcon from '@mui/icons-material/ViewList';
import PrintIcon from '@mui/icons-material/Print';
// Import print styles
import '../styles/print.css';
import '../styles/printButton.css';

const endpoint = "production-runs";

// Custom Popper component for autocomplete
const CustomPopper = (props) => (
  <Popper
    {...props}
    modifiers={[
      {
        name: 'offset',
        options: {
          offset: [0, 6],
        },
      },
    ]}
    style={{ width: 400 }}
  />
);

// Date utility functions
const dateUtils = {
  // Format date to YYYY-MM-DD consistently
  formatDate(date) {
    if (!date) return null;
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.error("Invalid date:", date);
        return null;
      }
      return dateObj.toISOString().slice(0, 10);
    } catch (err) {
      console.error("Error formatting date:", err);
      return null;
    }
  },
  
  getCurrentWeekRange() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const sunday = new Date(today);
    const saturday = new Date(today);
    
    // Go back to Sunday (start of week)
    sunday.setDate(today.getDate() - dayOfWeek);
    
    // Go forward to Saturday (end of week)
    saturday.setDate(sunday.getDate() + 6);
    
    return {
      start: this.formatDate(sunday),
      end: this.formatDate(saturday),
    };
  },
  
  getWeekRangeForDate(date) {
    if (!date) {
      console.error("getWeekRangeForDate called with invalid date:", date);
      return this.getCurrentWeekRange();
    }
    
    try {
      const selectedDate = new Date(date);
      if (isNaN(selectedDate.getTime())) {
        console.error("Invalid date in getWeekRangeForDate:", date);
        return this.getCurrentWeekRange();
      }
      
      const dayOfWeek = selectedDate.getDay(); // 0 (Sun) - 6 (Sat)
      const sunday = new Date(selectedDate);
      const saturday = new Date(selectedDate);
      
      // Go back to Sunday (start of week)
      sunday.setDate(selectedDate.getDate() - dayOfWeek);
      
      // Go forward to Saturday (end of week)
      saturday.setDate(sunday.getDate() + 6);
      
      const formattedStart = this.formatDate(sunday);
      const formattedEnd = this.formatDate(saturday);
      
      console.log(`Week range for ${date}: ${formattedStart} to ${formattedEnd}`);
      
      return {
        start: formattedStart,
        end: formattedEnd,
      };
    } catch (err) {
      console.error("Error in getWeekRangeForDate:", err);
      return this.getCurrentWeekRange();
    }
  }
};

// Data transformation utilities
const dataUtils = {
  flattenObject(obj, prefix = '', result = {}) {
    for (const key in obj) {
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        // Add .id for related fields
        if ('id' in obj[key]) {
          result[`${prefix}${key}.id`] = obj[key].id;
        }
        this.flattenObject(obj[key], `${prefix}${key}.`, result);
      } else {
        result[`${prefix}${key}`] = obj[key];
      }
    }
    return result;
  },
  
  summarizeByProperty(data, property, binsField = 'bins') {
    return data.reduce((acc, row) => {
      const key = row[property] || "Unknown";
      const bins = parseFloat(row[binsField]) || 0;
      
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += bins;
      
      return acc;
    }, {});
  }
};

const ProcessPlanPage = () => {
  const [data, setData] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [allRunData, setAllRunData] = useState([]);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [inputValue, setInputValue] = React.useState('');

  // No need for print modal state anymore with the simpler approach
  const navigate = useNavigate();

  // Load all data needed
  const loadData = async () => {
    try {
      const runsData = await fetchData(endpoint);
      const blocksData = await fetchData("blocks");
      
      // Sort by row_order, handling null/undefined values
      const sortedRuns = [...runsData].sort((a, b) => {
        const aOrder = a.row_order !== undefined && a.row_order !== null 
          ? a.row_order 
          : 999999;
        const bOrder = b.row_order !== undefined && b.row_order !== null 
          ? b.row_order 
          : 999999;
        return aOrder - bOrder;
      });
      
      setBlocks(blocksData);
      setData(sortedRuns);
      
      // Flatten all run data for efficient filtering, maintaining sort order
      const flattened = sortedRuns.map(item => dataUtils.flattenObject(item));
      setAllRunData(flattened);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Effect for initial data loading, refresh timer, and batch sync
  useEffect(() => {
    loadData();
    
    // Start the batch sync service
    batchSyncService.start((error) => {
      console.error("Batch sync error in ProcessPlanPage:", error);
      // Reload data after errors to ensure we have latest state
      loadData();
    });
    
    // Set up refresh interval if in TV mode
    const tvMode = localStorage.getItem("tvMode") === "true";
    let dataRefreshInterval = null;
    
    if (tvMode) {
      dataRefreshInterval = setInterval(() => {
        loadData();
      }, 6000);
    }

    // Clean up function
    return () => {
      // Clean up data refresh interval
      if (dataRefreshInterval) {
        clearInterval(dataRefreshInterval);
      }
      
      // Stop batch sync service when component unmounts
      batchSyncService.stop();
    };
  }, []);

  // Filter data for selected date
  const filteredData = useMemo(() => 
    allRunData.filter(item => item.run_date === selectedDate),
    [allRunData, selectedDate]
  );

  // Get weekly data based on the selected date (not just current week)
  const { start: weekStart, end: weekEnd } = useMemo(() => 
    dateUtils.getWeekRangeForDate(selectedDate),
    [selectedDate]
  );
  
  const weeklyData = useMemo(() => {
    console.log("Filtering data for week view, data count:", allRunData.length);
    console.log(`Week range: ${weekStart} to ${weekEnd}`);
    
    // Format all dates consistently
    const formattedData = allRunData.map(row => {
      // Get the run date, or fall back to pick date
      const originalDate = row.run_date || row.pick_date;
      
      if (!originalDate) return row;
      
      try {
        // Standardize the date format to YYYY-MM-DD
        const dateObj = new Date(originalDate);
        const formattedDate = dateObj.toISOString().slice(0, 10);
        
        // Return a new object with the formatted date
        return {
          ...row,
          run_date: formattedDate
        };
      } catch (err) {
        console.error(`Error formatting date ${originalDate}:`, err);
        return row;
      }
    });
    
    // Filter to current week
    const filtered = formattedData.filter((row) => {
      const runDate = row.run_date;
      
      // Skip rows without dates
      if (!runDate) return false;
      
      // Check if the run date is in the current week
      const isInWeek = runDate >= weekStart && runDate <= weekEnd;
      
      if (isInWeek) {
        console.log(`Run ${row.id} with date ${runDate} is in week range`);
      }
      
      return isInWeek;
    });
    
    console.log(`Weekly data count: ${filtered.length}`);
    if (filtered.length > 0) {
      console.log("Sample dates:", filtered.slice(0, 3).map(row => `${row.id}: ${row.run_date}`));
    }
    
    return filtered;
  }, [allRunData, weekStart, weekEnd]);
  
  // Handle changing view mode
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Handle printing
  const handlePrint = () => {
    console.log("Print button clicked");
    // Add a small delay to ensure the print container is ready
    setTimeout(() => {
      console.log("Triggering print dialog");
      window.print();
    }, 100);
  };

  // Calculate summaries
  const dailySummary = useMemo(() => 
    dataUtils.summarizeByProperty(filteredData, "grower_block.variety.commodity.id"),
    [filteredData]
  );
  
  const weeklySummary = useMemo(() => 
    dataUtils.summarizeByProperty(weeklyData, "grower_block.variety.commodity.id"),
    [weeklyData]
  );

  // Event handlers
  const handleViewDetails = (id) => {
    navigate(`/runs/${id}`);
  };

  const handleDateChange = (newDate) => {
    // Format the date consistently
    const formattedDate = dateUtils.formatDate(newDate);
    console.log(`Date changed: ${newDate} → ${formattedDate}`);
    
    if (formattedDate) {
      setSelectedDate(formattedDate);
    } else {
      console.error("Invalid date selected:", newDate);
    }
  };

  const handleSave = async (updatedRow) => {
    console.log("Saving row:", updatedRow);
    
    // Build payload with required fields
    const payload = {
      grower_block_id: updatedRow["grower_block.block_id"] || null,
      "grower_block.block_id": updatedRow["grower_block.block_id"] || null,
      bins: updatedRow.bins || null,
      run_date: updatedRow.run_date || selectedDate, // Use the run's date if available, otherwise selected date
      pick_date: updatedRow.pick_date || null,
      location: updatedRow.location || "",
      notes: updatedRow.notes || "",
      pool: updatedRow.pool || null,
      row_order: updatedRow.row_order || null,
      run_status: updatedRow.run_status || "Not Started",
      batch_id: updatedRow.batch_id || null,
    };
  
    // Validate required fields
    if (!payload.bins || !payload.run_date) {
      alert("Grower block, bins, and run date are required.");
      return;
    }
  
    try {
      // Create or update based on ID
      if (!updatedRow.id || updatedRow.id.toString().startsWith("temp-")) {
        await createData(endpoint, payload);
      } else {
        await editData(endpoint, updatedRow.id, payload);
      }
      
      await loadData();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleReorder = async (reorderedRows) => {
    try {
      console.log('Received reordered rows:', reorderedRows);
      
      // Ensure each row has valid id and row_order
      const validRows = reorderedRows.filter(row => 
        row.id && !String(row.id).startsWith('temp-') && 
        row.row_order !== undefined && row.row_order !== null
      );
      
      if (validRows.length === 0) {
        console.log('No valid rows to reorder');
        return;
      }
      
      // Extract only the needed fields for the API call
      const rowsToUpdate = validRows.map(row => ({
        id: row.id,
        row_order: row.row_order
      }));
      
      console.log('Saving row order for rows:', rowsToUpdate);
      await saveRowOrder(endpoint, rowsToUpdate);
      console.log('Row order saved successfully');
      
      // Reload data to ensure UI reflects the backend state
      await loadData();
    } catch (error) {
      console.error('Error saving row order:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to save row order. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteData(endpoint, id);
      await loadData();
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  // Table columns configuration
  const tableColumns = [
    { field: 'grower_block.ranch.grower.name', headerName: 'Grower Name', editable: false, width: 200 },
    { field: 'grower_block.name', headerName: 'Block Name', editable: false, width: 250 },
    { field: 'grower_block.variety.commodity.id', headerName: 'Commodity', editable: false },
    { field: 'grower_block.variety.id', headerName: 'Variety', editable: false },
    {
      field: 'grower_block.block_id',
      headerName: 'Block',
      editable: true,
      width: 100,
      renderEditCell: (params) => {
        const selectedId = params.value || "";
        const selectedBlock = blocks.find(b => String(b.block_id) === String(selectedId));

        const handleBlur = () => {
          if (!selectedBlock && blocks.length > 0) {
            const match = blocks.find(option =>
              `${option.block_id} — ${option.name} — ${option["ranch.grower.name"]}`
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            );
      
            if (match) {
              params.api.setEditCellValue({
                id: params.id,
                field: "grower_block.block_id",
                value: match.block_id,
              });
      
              params.api.updateRows([{
                ...params.row,
                "grower_block.block_id": match.block_id,
                "grower_block.name": match.name,
                "grower_block.ranch.name": match["ranch.name"],
                "grower_block.ranch.grower.name": match["ranch.grower.name"],
                "grower_block.variety.id": match["variety.id"],
                "grower_block.variety.commodity.id": match["variety.commodity.id"],
              }]);
            }
          }
        };
    
        return (
          <Autocomplete
            fullWidth
            size="small"
            options={blocks}
            onBlur={handleBlur}
            getOptionLabel={(option) =>
              `${option.block_id} — ${option.name} — ${option["ranch.grower.name"]}`
            }
            value={selectedBlock || null}
            isOptionEqualToValue={(option, value) => option.block_id === value.block_id}
            slots={{
              popper: CustomPopper,
            }}
            onChange={(_, newValue) => {
              if (newValue) {
                params.api.setEditCellValue({
                  id: params.id,
                  field: "grower_block.block_id",
                  value: newValue.block_id,
                });
    
                // Update dependent fields
                params.api.updateRows([{
                  ...params.row,
                  "grower_block.block_id": newValue.block_id,
                  "grower_block.name": newValue.name,
                  "grower_block.ranch.name": newValue["ranch.name"],
                  "grower_block.ranch.grower.name": newValue["ranch.grower.name"],
                  "grower_block.variety.id": newValue["variety.id"],
                  "grower_block.variety.commodity.id": newValue["variety.commodity.id"],
                }]);
              }
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Block" />
            )}
          />
        );
      }
    },
    { field: 'pool', headerName: 'Pool ID', editable: true },
    {
      field: "pick_date",
      headerName: "Pick Date",
      editable: true,
      renderEditCell: (params) => {
        const value = params.value || "";
        return (
          <TextField
            type="date"
            value={value}
            onChange={(e) => {
              const formatted = new Date(e.target.value).toISOString().slice(0, 10);
              params.api.setEditCellValue({
                id: params.id,
                field: "pick_date",
                value: formatted,
              });
            }}
            size="small"
            fullWidth
          />
        );
      }
    },
    { field: 'bins', headerName: 'Bins', editable: true },
    { field: 'location', headerName: 'Location', editable: true },
    {
      field: "run_status",
      headerName: "Status",
      editable: true,
      width: 160,
      renderCell: (params) => {
        const value = params.value;
        const dotStyle = {
          height: 10,
          width: 10,
          borderRadius: "50%",
          display: "inline-block",
          marginRight: 8,
        };
    
        const getStatusIcon = () => {
          switch (value) {
            case "In process":
              return <span style={{ ...dotStyle, backgroundColor: "green" }} />;
            case "Hold":
              return <span style={{ ...dotStyle, backgroundColor: "red" }} />;
            case "Complete":
              return (
                <span style={{ color: "green", marginRight: 8 }}>
                  ✅
                </span>
              );
            default:
              return <span style={{ ...dotStyle, backgroundColor: "gray" }} />;
          }
        };
    
        return (
          <span>
            {getStatusIcon()}
            {value || "Not started"}
          </span>
        );
      },
      renderEditCell: (params) => (
        <Select
          value={params.value || "Not started"}
          fullWidth
          size="small"
          onChange={(e) => {
            params.api.setEditCellValue({
              id: params.id,
              field: "run_status",
              value: e.target.value,
            });
          }}
        >
          <MenuItem value="Not started">Not started</MenuItem>
          <MenuItem value="In process">In process</MenuItem>
          <MenuItem value="Hold">Hold</MenuItem>
          <MenuItem value="Complete">Complete</MenuItem>
        </Select>
      ),
    },
    { 
      field: 'notes', 
      headerName: 'Notes', 
      editable: true,
      flex: 1,
      width: 200,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: "normal", 
          wordWrap: "break-word", 
          lineHeight: "1.4rem" 
        }}>
          {params.value}
        </div>
      )
    }
  ];

  // Handle both updates and creates from the weekly view
  const handleRunUpdate = async (updatedRun) => {
    try {
      console.log("Run update/create payload:", updatedRun);
      
      // Convert date format if needed - ensure YYYY-MM-DD format
      const formattedDate = dateUtils.formatDate(updatedRun.run_date);
      console.log(`Formatted date: ${formattedDate}`);
      
      // Build a complete payload with all required fields
      const payload = {
        run_date: formattedDate,
        row_order: updatedRun.row_order !== undefined ? updatedRun.row_order : 0,
        grower_block_id: updatedRun.grower_block_id || updatedRun["grower_block.block_id"],
        bins: updatedRun.bins || 0,
        run_status: updatedRun.run_status || "Not Started",
        location: updatedRun.location || "",
        notes: updatedRun.notes || "",
        pool: updatedRun.pool || "",
        pick_date: updatedRun.pick_date || null
      };
      
      console.log("Final API payload:", payload);
      
      // Check if this is a create (no ID) or update operation
      if (updatedRun.id && !updatedRun.id.toString().startsWith('temp-')) {
        // Update existing run
        await editData(endpoint, updatedRun.id, payload);
      } else {
        // Create new run
        await createData(endpoint, payload);
      }
      
      // Reload data - but stay in weekly view
      await loadData();
    } catch (error) {
      console.error("Error saving run:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        alert(`Error saving run: ${JSON.stringify(error.response.data)}`);
      } else {
        alert(`Error saving run: ${error.message}`);
      }
    }
  };
  
  // Create a new run for a specific date (from weekly view)
  const handleAddNewRun = (date) => {
    // Option 1: Stay in weekly view if called from WeeklyCalendarView's modal
    if (viewMode === 'weekly') {
      // The modal will handle the creation directly
      // No need to do anything here - WeeklyCalendarView will call handleRunUpdate
      console.log(`Creating new run for date ${date} directly in weekly view`);
      return;
    }
    
    // Option 2: Traditional flow (legacy support)
    // Set the selected date to the day user clicked on
    setSelectedDate(date);
    
    // Switch to daily view to use the existing Add Line functionality
    setViewMode('daily');
    
    // After a short delay, trigger the "Add Line" button click
    setTimeout(() => {
      const addButton = document.querySelector('button[data-testid="add-line-button"]');
      if (addButton) {
        addButton.click();
      }
    }, 100);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section with Title, Date Selector, and View Toggle */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Process Plan
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Print button - only show in daily view */}
              {viewMode === 'daily' && (
                <>
                  {/* Material UI Button */}
                  <Tooltip title="Print Process Plan">
                    <Button
                      onClick={handlePrint}
                      variant="outlined"
                      size="small"
                      startIcon={<PrintIcon />}
                      className="print-button no-print" // Won't show during printing
                      sx={{ mr: 1 }}
                    >
                      Print
                    </Button>
                  </Tooltip>
                </>
              )}
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="small"
                className="no-print" // Won't show during printing
              >
                <ToggleButton value="daily" aria-label="daily view">
                  <Tooltip title="Daily View">
                    <ViewListIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="weekly" aria-label="weekly view">
                  <Tooltip title="Weekly Calendar View">
                    <CalendarViewWeekIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          
          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={handleDateChange}
            label={viewMode === 'weekly' ? "Week Starting:" : "Run Date:"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <SummaryPanel 
              title="Day Summary" 
              data={dailySummary} 
            />
            <SummaryPanel 
              title={`Week Summary (${weekStart} to ${weekEnd})`} 
              data={weeklySummary} 
            />
          </Box>
        </Grid>
      </Grid>

      {/* Content Section - Show either table or weekly calendar based on viewMode */}
      {viewMode === 'daily' ? (
        <EditableTable
          data={filteredData}
          actions={[]}
          onSave={handleSave}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          columns={tableColumns}
          onReorder={handleReorder}
          blockOption={blocks}
        />
      ) : (
        <WeeklyCalendarView
          data={weeklyData}
          weekStart={weekStart}
          blocks={blocks}
          onRunUpdate={handleRunUpdate}
          onRunClick={handleViewDetails}
          onReorder={handleReorder}
          onAddNew={handleAddNewRun}
        />
      )}
      
      {/* Printable content - Hidden until print is triggered */}
      <PrintableTable
        data={filteredData}
        columns={tableColumns}
        date={selectedDate}
        summary={dailySummary}
      />
    </Box>
  );
};

export default ProcessPlanPage;