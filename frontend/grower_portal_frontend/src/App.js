import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CommoditiesPage from './pages/CommoditiesPage';
import GrowersPage from './pages/GrowersPage';
import RanchesPage from './pages/RanchesPage';
import GrowerDetailPage from './pages/GrowerDetailPage';

const App = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
            <div style={{ flex: 1, marginLeft: isSidebarCollapsed ? '0px' : '0px' }}>
                <Navbar />
                <div style={{ padding: '20px' }}>
                <Router>
                  <Routes>
                    <Route path="/" element={<CommoditiesPage /> }/>
                    <Route path="/commodities" element={<CommoditiesPage />} />
                    <Route path="/growers" element={<GrowersPage />} />
                    <Route path="/growers/:growerId" element={<GrowerDetailPage />} />
                    <Route path="/ranches" element={<RanchesPage />} />
                  </Routes>
                </Router>
                </div>
            </div>
        </div>
    );
};

export default App;
