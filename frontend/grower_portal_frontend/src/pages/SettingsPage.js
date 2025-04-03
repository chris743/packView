import React, { useState, useEffect } from "react";
import { Switch, FormControlLabel, Typography, Box, Paper } from "@mui/material";

const SettingsPage = () => {
  const [tvMode, setTvMode] = useState(() => {
    // Load from localStorage on first render
    return localStorage.getItem("tvMode") === "true";
  });

  useEffect(() => {
    // Save to localStorage when tvMode changes
    localStorage.setItem("tvMode", tvMode);
  }, [tvMode]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Paper elevation={3} sx={{ p: 2, maxWidth: 400 }}>
        <FormControlLabel
          control={
            <Switch
              checked={tvMode}
              onChange={(e) => setTvMode(e.target.checked)}
            />
          }
          label="TV Mode (auto-refresh every 60s)"
        />
      </Paper>
    </Box>
  );
};

export default SettingsPage;
