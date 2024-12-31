import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import CommoditiesPage from "./pages/CommoditiesPage";
import GrowersPage from "./pages/GrowersPage";
import GrowerDetailPage from "./pages/GrowerDetailPage";
import RanchesPage from "./pages/RanchesPage";
import HarvestPlanPage from "./pages/HarvestPlanPage";
import CapacityPage from "./pages/DashboardPages/CapacityPage";
import BinInventory from "./pages/DashboardPages/BinInventoryPage";
import OrdersAnalysis from "./pages/DashboardPages/OrdersAnalysisPage";
import { useThemeContext, ThemeContextProvider } from "./context/ThemeContext";
import './App.css'

const AppContent = () => {
  const { isDarkMode } = useThemeContext();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="scrollhost">
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        overflow: "hidden", // Hide scrollbars
      }}
    >
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          transition: "margin 0.3s",
          overflow: "auto", // Allow scrolling
          "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar for WebKit browsers
          "-ms-overflow-style": "none", // Hide scrollbar for Internet Explorer/Edge
          "scrollbar-width": "none", // Hide scrollbar for Firefox
        }}
      >
        <Navbar />
        <Box sx={{ padding: "20px", className:"scrollhost"}}>
          <Router>
            <Routes>
              <Route path="/" element={<CommoditiesPage />} />
              <Route path="/commodities" element={<CommoditiesPage />} />
              <Route path="/growers" element={<GrowersPage />} />
              <Route path="/growers/:growerId" element={<GrowerDetailPage />} />
              <Route path="/ranches" element={<RanchesPage />} />
              <Route path="/harvest-plan" element={<HarvestPlanPage />} />
              <Route path="/analysis/capacity" element={<CapacityPage />} />
              <Route path="/analysis/bin-inventory" element={<BinInventory />} />
              <Route path="/analysis/order-analysis" element={<OrdersAnalysis />} />
            </Routes>
          </Router>
        </Box>
      </Box>
    </Box>
    </div>
  );
};

const App = () => (
  <ThemeContextProvider>
    <CssBaseline />
    <AppContent />
  </ThemeContextProvider>
);

export default App;
