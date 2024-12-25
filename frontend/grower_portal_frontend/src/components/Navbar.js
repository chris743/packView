import React from "react";
import { AppBar, Toolbar, Typography, Switch } from "@mui/material";
import { useThemeContext } from "../context/ThemeContext";

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useThemeContext();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Cobblestone Fruit Company
        </Typography>
        <Typography variant="body1" sx={{ marginRight: 2 }}>
          {isDarkMode ? "Dark Mode" : "Light Mode"}
        </Typography>
        <Switch checked={isDarkMode} onChange={toggleDarkMode} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
