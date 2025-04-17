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
import ReceivingPage from "./pages/ReceivingPage";
import DaySchedulePage from "./pages/DaySchedulePage";
import TableTestPage from "./pages/EditableTableTest";
import ProcessPlanPage from "./pages/ProcessPlanPage";
import { LicenseInfo } from '@mui/x-license-pro';
import SettingsPage from "./pages/SettingsPage";
import RunDetailsPage from "./pages/RunDetailsPage";
import ScannerDashboardPage from "./pages/BinTaggingPage";
import AveragePackoutReportPage from "./pages/Report Pages/AveragePackoutReport";
import ReportsDashboard from "./pages/Report Pages/ReportsDashboard";

LicenseInfo.setLicenseKey('6e791cd789df32edae46947575147663Tz0xMTA1MDMsRT0xNzc0NzQyMzk5MDAwLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1RMy0yMDI0LEtWPTI=');


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
              <Route path="/daily-harvest-plan" element={<DaySchedulePage/>} />
              <Route path="/receiving" element={<ReceivingPage />} />
              <Route path="/analysis/capacity" element={<CapacityPage />} />
              <Route path="/analysis/bin-inventory" element={<BinInventory />} />
              <Route path="/analysis/order-analysis" element={<OrdersAnalysis />} />
              <Route path="/analysis/label-printing" element={<ScannerDashboardPage/>} />
              <Route path="/Test" element={<TableTestPage/>} />
              <Route path="/process-plan" element={<ProcessPlanPage/>} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/runs/:runId" element={<RunDetailsPage />} />
              <Route path="/reports" element={<ReportsDashboard />} />
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
