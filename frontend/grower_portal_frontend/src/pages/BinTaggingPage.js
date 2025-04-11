import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Chip } from "@mui/material";
import axios from "axios";
import {editData, fetchChartData, fetchData} from "../api/api";

import ReusableTable from "../components/ReusableTable";

const ScannerDashboardPage = () => {
    const [outletStatuses, setOutletStatuses] = useState([]);
    const [timeTick, setTimeTick] = useState(Date.now());
    const [runBanner, setRunBanner] = useState("");
    const [runplantoday, setRunplantoday] = useState([]);

    const today = new Date().toISOString().slice(0, 10);

    const actions = []
    const loadData = async () => {
        const outletStatuses = await fetchChartData("outlet-dashboard");
        const runplanraw = await fetchData("production-runs");
        const todaydata = runplanraw.filter(run => run.run_date === today);
        const runplantoday = todaydata.map((item) => flattenObject(item));
        setRunplantoday(runplantoday);
        setOutletStatuses(outletStatuses);
    }
    function flattenObject(obj, prefix = '', result = {}) {
        for (const key in obj) {
          if (
            typeof obj[key] === 'object' &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            // ✅ Add .id for related fields
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
    const runplantablecolumns = [
        {field: 'grower_block.ranch.grower.name', headerName: 'Grower Name', editable: false, width: 200 },
        {field: 'grower_block.name', headerName: 'Grower Name', editable: false, width: 250 },
        {field: 'grower_block.variety.commodity.id', headerName: 'Commodity', editable: false },
        {field: 'grower_block.variety.id', headerName: 'Variety', editable: false },
        {field: 'grower_block.block_id',headerName: 'Block', width: 100},             
        {field: 'pool', headerName: 'Pool ID', editable: false },
        {field: "pick_date", headerName: "Pick Date", editable: true,},
        {field: 'bins', headerName: 'Bins', editable: true },
        {field: 'location', headerName: 'Location', editable: true },
        {field: "run_status",headerName: "Status",},
        ]
    const craneGroups = {
        Crane1: ["BF1", "BF2", "BF3", "BF4", "BF5"],
        Crane2: ["BF6", "BF7", "BF8", "BF9", "BF10"],
        Crane3: ["BF11", "BF12", "BF13", "BF14", "BF15"],
        Crane4: ["BF16", "BF17", "BF18", "BF19", "BF20"],
      };

    const bfOutletsOnly = outletStatuses
      .filter((item) => /^BF([1-9]|1[0-9]|20)$/.test(item.outlet))
      .sort((a, b) => {
        const getNumber = (outlet) => parseInt(outlet.replace("BF", ""), 10);
        return getNumber(a.outlet) - getNumber(b.outlet);
      });
    

    const groupedOutlets = Object.entries(craneGroups).map(([crane, outlets]) => {
        return {
            crane,
            outlets: bfOutletsOnly.filter((item) => outlets.includes(item.outlet)),
        };
    });

    const getRecentOutlets = (outlets, count = 3) => {
    return outlets
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, count);
    };

    const sortedTags = [...bfOutletsOnly]
    .filter((item) => item.pack_id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const currentTag = sortedTags[0];
    const previousTag = sortedTags[1];

    const blockChanged = currentTag?.block_id && previousTag?.block_id 
    && currentTag.block_id !== previousTag.block_id;

    const mostRecentTag = [...bfOutletsOnly]
    .filter((item) => item.pack_id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    
    const craneStatuses = Object.entries(craneGroups).map(([crane, outlets]) => {
    const matching = outletStatuses.filter((item) => outlets.includes(item.outlet));
    const recent = getRecentOutlets(matching, 3);
    
    const last = recent[1];
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

    const timeSince = (timestamp) => {
        if (!timestamp) return "—";
        const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const mins = Math.floor(seconds / 60);
        return `${mins}m ago`;
      };
    
      useEffect(() => {
        // Start data refresh interval
        const dataInterval = setInterval(() => {
          loadData();
        }, 5000);
      
        // Start timeTick for live "time since"
        const interval = setInterval(() => {
          setTimeTick(Date.now());
        }, 1000);
      
        // Cleanup intervals on unmount
        return () => {
          clearInterval(interval);
          clearInterval(dataInterval);
        };
      }, []); // only run once at mount
      
      useEffect(() => {
        const sortedTags = [...outletStatuses]
          .filter((item) => item.pack_id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
        const currentTag = sortedTags[0];
        const previousTag = sortedTags[1];
      
        const blockChanged =
          currentTag?.block_id &&
          previousTag?.block_id &&
          currentTag.block_id !== previousTag.block_id;
      
        console.log("Block changed:", blockChanged);
        if (!blockChanged) return;

        console.log("Block changed, checking run plan...");
      
        const checkRunPlan = async () => {
          try {
            console.log("Checking run plan...");
            const today = new Date().toISOString().slice(0, 10);
            const runPlan = await fetchData("production-runs");
      
            const matchingRun = runPlan.find(
              (run) => run.block_id === currentTag.block_id
            );
      
            if (!matchingRun) {
              setRunBanner("🚨 The current run is not in the run plan");
              return;
            }
      
            const inProcessRun = runPlan.find((run) => run.status === "in_process");
      
            if (inProcessRun && inProcessRun.id !== matchingRun.id) {
              await axios.patch(`/api/runs/${inProcessRun.id}`, { status: "complete" });
            }
      
            await axios.patch(`/api/runs/${matchingRun.id}`, { status: "in_process" });
            setRunBanner(""); // Clear if all good
          } catch (error) {
            console.log("Error checking run plan:", error);
            console.error("Error checking run plan:", error);
          }
        };
      
        checkRunPlan();
      }, [outletStatuses]);
      

    
    return (
    <Box sx={{ padding: 2 }}>
    <Typography variant="h4" gutterBottom>
        BF1–BF20 Label Verification
    </Typography>
    {mostRecentTag && (
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
        </Grid>
        {runBanner && (
        <Paper
            sx={{
            padding: 2,
            mb: 2,
            backgroundColor: "#fff4e5",
            borderLeft: "6px solid orange",
            }}
        >
            <Typography variant="body1" sx={{ color: "#cc6600" }}>
            ⚠️ {runBanner}
            </Typography>
        </Paper>
        )}

    </Paper>
    )}
    {/* Crane Header Row */}
    <Grid container spacing={2}>
    {groupedOutlets.map((group) => {
        const crane = craneStatuses.find(c => c.crane === group.crane);
        return (
        <Grid item xs={12} sm={6} md={3} key={group.crane}>
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
            }}
            >
            <Typography variant="h6">{crane?.crane}</Typography>
            <Typography variant="body2">
                <strong>Last Outlet:</strong> {crane?.lastOutlet}
            </Typography>
            <Typography variant="body2">
                <strong>Time Since:</strong> {timeSince(crane?.lastScanTime)}
            </Typography>
            </Paper>

            {/* Horizontally render outlets */}
            <Grid container spacing={1}>
            {group.outlets.map((item) => (
                <Grid item xs={2.4} key={item.outlet}> {/* 5 boxes = 5 * 2.4 = 12 */}
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
                    <Typography variant="caption">
                    {item.size} {item.grade}
                    </Typography>
                </Paper>
                </Grid>
            ))}
            </Grid>
        </Grid>
        );
    })}
    </Grid>
    <ReusableTable columns={runplantablecolumns} data={runplantoday} actions={actions}/>

    </Box>
    
    );
};

export default ScannerDashboardPage;