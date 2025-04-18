import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Button, Alert, Divider } from "@mui/material";
import { API_URL, editData, fetchChartData, fetchData, printerScannerData } from "../api/api";
import DiagnosticsStatusButton from "../components/DiagnosticsStatusButton";
import PrinterDiagnostics from "../components/PrinterDiagnostics";
import ReusableTable from "../components/ReusableTable";
import axios from "axios";

/**
 * BinTaggingPage component for monitoring bin tagging operations and scanner/printer status
 * Shows current production run information, crane statuses, and outlet verification
 */
const BinTaggingPage = () => {
  const [outletStatuses, setOutletStatuses] = useState([]);
  const [timeTick, setTimeTick] = useState(Date.now());
  const [runBanner, setRunBanner] = useState("");
  const [runplantoday, setRunplantoday] = useState([]);
  const [modalIndex, setModalIndex] = useState(null);
  const [diagnostics, setDiagnostics] = useState({ scanners: {}, printers: {} });
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  // Function to load data from API endpoints
  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load outlet dashboard data for bin tagging statuses
      const outletStatuses = await fetchChartData("outlet-dashboard");
      
      // Load today's production runs
      const runplanraw = await fetchData("production-runs");
      const todaydata = runplanraw.filter(run => run.run_date === today);
      const runplantoday = todaydata.map((item) => flattenObject(item));
      
      setRunplantoday(runplantoday);
      setOutletStatuses(outletStatuses);
    } catch (error) {
      console.error("Error loading bin tagging data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function to flatten nested objects into dot notation
  function flattenObject(obj, prefix = '', result = {}) {
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
        flattenObject(obj[key], `${prefix}${key}.`, result);
      } else {
        result[`${prefix}${key}`] = obj[key];
      }
    }
    return result;
  }

  // Table columns configuration for the run plan
  const runPlanTableColumns = [
    { field: 'grower_block.ranch.grower.name', headerName: 'Grower', editable: false, width: 200 },
    { field: 'grower_block.name', headerName: 'Block Name', editable: false, width: 250 },
    { field: 'grower_block.variety.commodity.id', headerName: 'Commodity', editable: false },
    { field: 'grower_block.variety.id', headerName: 'Variety', editable: false },
    { field: 'grower_block.block_id', headerName: 'Block ID', width: 100 },
    { field: 'pool', headerName: 'Pool ID', editable: false },
    { field: "pick_date", headerName: "Pick Date", editable: false },
    { field: 'bins', headerName: 'Bins', editable: false },
    { field: 'location', headerName: 'Location', editable: false },
    { 
      field: "run_status",
      headerName: "Status",
      renderCell: (params) => {
        const value = params.value;
        const dotStyle = {
          height: 10,
          width: 10,
          borderRadius: "50%",
          display: "inline-block",
          marginRight: 8,
        };
    
        let color = "gray";
        if (value === "In process") color = "green";
        else if (value === "Hold") color = "red";
        else if (value === "Complete") color = "blue";
    
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ ...dotStyle, backgroundColor: color }} />
            <span>{value || "Not Started"}</span>
          </Box>
        );
      },
    },
  ];

  // Define crane groups and their associated outlets
  const craneGroups = {
    Crane1: ["BF1", "BF2", "BF3", "BF4", "BF5"],
    Crane2: ["BF6", "BF7", "BF8", "BF9", "BF10"],
    Crane3: ["BF11", "BF12", "BF13", "BF14", "BF15"],
    Crane4: ["BF16", "BF17", "BF18", "BF19", "BF20"],
  };

  // Filter and sort BF outlets only
  const bfOutletsOnly = outletStatuses
    .filter((item) => /^BF([1-9]|1[0-9]|20)$/.test(item.outlet))
    .sort((a, b) => {
      const getNumber = (outlet) => parseInt(outlet.replace("BF", ""), 10);
      return getNumber(a.outlet) - getNumber(b.outlet);
    });

  // Group outlets by crane
  const groupedOutlets = Object.entries(craneGroups).map(([crane, outlets]) => {
    return {
      crane,
      outlets: bfOutletsOnly.filter((item) => outlets.includes(item.outlet)),
    };
  });

  // Get recent outlets sorted by timestamp
  const getRecentOutlets = (outlets, count = 3) => {
    return outlets
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, count);
  };

  // Sort tags by timestamp for tracking changes
  const sortedTags = [...bfOutletsOnly]
    .filter((item) => item.pack_id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const currentTag = sortedTags[0];
  const previousTag = sortedTags[1];

  // Check if block has changed between current and previous tag
  const blockChanged = currentTag?.block_id && previousTag?.block_id 
    && currentTag.block_id !== previousTag.block_id;

  // Get the most recent tag for current run display
  const mostRecentTag = sortedTags[0];

  // Calculate crane statuses based on recent verification
  const craneStatuses = Object.entries(craneGroups).map(([crane, outlets]) => {
    const matching = outletStatuses.filter((item) => outlets.includes(item.outlet));
    const recent = getRecentOutlets(matching, 3);
    
    const last = recent[0];
    const scanCount = recent.filter((item) => item.verified).length;
    
    let statusColor = "success"; // green
    if (scanCount === 0) {
      statusColor = "error"; // red
    } else if (!last?.verified) {
      statusColor = "warning"; // yellow
    }
    
    return {
      crane,
      color: statusColor,
      lastOutlet: last?.outlet || "—",
      lastScanTime: last?.timestamp || null,
    };
  });

  // Format time since in a human-readable format
  const timeSince = (timestamp) => {
    if (!timestamp) return "—";
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m ago`;
  };
  
  // Initial data load and refresh interval
  useEffect(() => {
    // Load data immediately
    loadData();
    
    // Start data refresh interval
    const dataInterval = setInterval(() => {
      loadData();
    }, 5000);
  
    // Start timeTick for live "time since" updates
    const interval = setInterval(() => {
      setTimeTick(Date.now());
    }, 1000);

    // Cleanup intervals on unmount
    return () => {
      clearInterval(interval);
      clearInterval(dataInterval);
    };
  }, []); // only run once at mount

  // Load and refresh diagnostics data for scanners and printers
  useEffect(() => {
    const loadDiagnostics = async () => {
      try {
        const data = await printerScannerData();
        setDiagnostics(data);
      } catch (error) {
        console.error("Error loading diagnostics:", error);
      }
    };
  
    loadDiagnostics();
    const interval = setInterval(loadDiagnostics, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Monitor for block changes to update run statuses
  useEffect(() => {
    if (!blockChanged) return;
  
    const checkRunPlan = async () => {
      try {
        console.log("Block change detected, checking run plan...");
        const runPlan = await fetchData("production-runs");
  
        // Find run matching the current block ID
        const matchingRun = runPlan.find(
          (run) => run.grower_block_id === currentTag.block_id
        );
  
        if (!matchingRun) {
          setRunBanner("🚨 The current block is not in the run plan");
          return;
        }
  
        // Find any run that's currently in process
        const inProcessRun = runPlan.find((run) => run.run_status === "In process");
  
        // Update run statuses using the correct API endpoint
        if (inProcessRun && inProcessRun.id !== matchingRun.id) {
          // Mark previous run as complete
          await editData("production-runs", inProcessRun.id, { 
            ...inProcessRun,
            run_status: "Complete" 
          });
        }
  
        // Mark new run as in process
        await editData("production-runs", matchingRun.id, { 
          ...matchingRun,
          run_status: "In process" 
        });
        
        setRunBanner(""); // Clear banner if successful
        
        // Refresh data to show updated statuses
        await loadData();
      } catch (error) {
        console.error("Error updating run statuses:", error);
        setRunBanner("⚠️ Error updating run status");
      }
    };
  
    checkRunPlan();
  }, [blockChanged, currentTag]);
  
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Bin Tagging Dashboard
      </Typography>
      
      {/* Current Run Information */}
      {mostRecentTag ? (
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            marginBottom: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Current Run
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="body2"><strong>Block:</strong> {mostRecentTag.block_id}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="body2"><strong>Commodity:</strong> {mostRecentTag.commodity}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Typography variant="body2"><strong>Last Tag:</strong> {mostRecentTag.tag_id || "—"}</Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Typography variant="body2"><strong>Last Scan:</strong> {timeSince(mostRecentTag.timestamp)}</Typography>
            </Grid>
          </Grid>
          
          {/* Warning banner if there's an issue */}
          {runBanner && (
            <Alert 
              severity="warning" 
              sx={{ mt: 2 }}
            >
              {runBanner}
            </Alert>
          )}
        </Paper>
      ) : (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
        >
          No tag data available. Waiting for first scan.
        </Alert>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Crane Status
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {/* Crane Status Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {groupedOutlets.map((group) => {
          const crane = craneStatuses.find(c => c.crane === group.crane);
          return (
            <Grid item xs={12} sm={6} md={3} key={group.crane}>
              <Box sx={{ position: "relative" }}>
                <Paper
                  sx={{
                    padding: 2,
                    mb: 1,
                    borderLeft: `6px solid`,
                    color: 'black',
                    borderColor:
                      crane?.color === "success"
                        ? "green"
                        : crane?.color === "warning"
                          ? "goldenrod"
                          : "red",
                    backgroundColor:
                      crane?.color === "success"
                        ? "#e6ffed"
                        : crane?.color === "warning"
                          ? "#fff9db"
                          : "#ffe6e6",
                    position: "relative"
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{crane?.crane}</Typography>
                    
                    {/* Diagnostics Button */}
                    {diagnostics?.scanners && diagnostics?.printers && (
                      <DiagnosticsStatusButton
                        index={Number(group.crane.slice(-1)) - 1}
                        scannerId={`crane_${group.crane.slice(-1)}`}
                        printerId={`printer_${group.crane.slice(-1)}`}
                        scanner={diagnostics.scanners[`crane_${group.crane.slice(-1)}`]}
                        printer={diagnostics.printers[`printer_${group.crane.slice(-1)}`]}
                        onClick={setModalIndex}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2"><strong>Last Outlet:</strong> {crane?.lastOutlet}</Typography>
                  <Typography variant="body2"><strong>Time Since:</strong> {timeSince(crane?.lastScanTime)}</Typography>
                </Paper>
              </Box>

              {/* Outlet Status Grid */}
              <Grid container spacing={1}>
                {group.outlets.map((item) => (
                  <Grid item xs={2.4} key={item.outlet}>
                    <Paper
                      sx={{
                        padding: 1,
                        color: "black",
                        borderLeft: `4px solid ${item.verified ? "green" : "red"}`,
                        backgroundColor: item.verified ? "#e6ffed" : "#ffe6e6",
                        height: "100%",
                      }}
                    >
                      <Typography variant="subtitle2">{item.outlet}</Typography>
                      <Typography variant="caption" display="block">
                        {item.size || "—"} {item.grade || "—"}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          );
        })}
      </Grid>

      {/* Today's Run Plan */}
      <Typography variant="h5" gutterBottom>
        Today's Run Plan
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <ReusableTable 
        columns={runPlanTableColumns} 
        data={runplantoday} 
        actions={[]}
        title="Process Plan"
        noDataText={isLoading ? "Loading..." : "No runs scheduled for today"}
      />
      
      {/* Diagnostics Modal */}
      <PrinterDiagnostics
        isOpen={modalIndex !== null}
        onClose={() => setModalIndex(null)}
        index={modalIndex}
      />
    </Box>
  );
};

export default BinTaggingPage;