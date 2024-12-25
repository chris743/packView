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
import OrdersAnalysisPage from "./pages/DashboardPages/OrdersAnalysisPage";
import { useThemeContext, ThemeContextProvider } from "./context/ThemeContext";

const AppContent = () => {
  const { isDarkMode } = useThemeContext();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          transition: "margin 0.3s",
        }}
      >
        <Navbar />
        <Box sx={{ padding: "20px" }}>
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
              <Route path="/analysis/orders-analysis" element={<OrdersAnalysisPage />} />
            </Routes>
          </Router>
        </Box>
      </Box>
    </Box>
  );
};

const App = () => (
  <ThemeContextProvider>
    <CssBaseline />
    <AppContent />
  </ThemeContextProvider>
);

export default App;
