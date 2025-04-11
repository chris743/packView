import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Box,
    Collapse,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home'
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import ListSubheader from '@mui/material/ListSubheader';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ParkIcon from '@mui/icons-material/Park';
import BuildIcon from '@mui/icons-material/Build';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsIcon from '@mui/icons-material/Settings';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [dashboardsOpen, setDashboardsOpen] = useState(false);
    const [maintinenceOpen, setMaintinenceOpen] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleDashboards = () => {
        setDashboardsOpen(!dashboardsOpen);
    };

    const toggleMaintinence = () => {
        setMaintinenceOpen(!maintinenceOpen);
    };
    return (
    
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: isCollapsed ? 60 : 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: isCollapsed ? 60 : 240,
                    boxSizing: 'border-box',
                    transition: 'width 0s',
                },
            }}
        >
            {/* Toggle Button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: isCollapsed ? 'center' : 'flex-end',
                    padding: '8px',
                }}
            >
                <IconButton onClick={toggleSidebar}>
                    <MenuIcon />
                </IconButton>
            </Box>

            {/* Sidebar Content */}
            <List
                subheader={!isCollapsed && <ListSubheader>Menu</ListSubheader>}
            >
                <ListItem button component="a" href="/" sx={{ textDecoration: "none", color: "inherit" }}>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary="Home" />}
                </ListItem>

                <ListItem button component="a" href="/harvest-plan" sx={{ textDecoration: "none", color: "inherit" }}>
                    <ListItemIcon>
                        <AgricultureIcon />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary="Harvest Plan" />}
                </ListItem>

                <ListItem button component="a" href="/process-plan" sx={{ textDecoration: "none", color: "inherit" }}>
                    <ListItemIcon>
                        <PrecisionManufacturingIcon />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary="Process Plan" />}
                </ListItem>
                <ListItem button component="a" href="/analysis/label-printing" sx={{ textDecoration: "none", color: "inherit" }}>
                    <ListItemIcon>
                        <BrandingWatermarkIcon />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary="Bin Labeling" />}
                </ListItem>

                {/* Dashboards Dropdown */}
                <ListItem button onClick={toggleDashboards}>
                    <ListItemIcon>
                        <AnalyticsIcon />
                    </ListItemIcon>
                    {!isCollapsed && (
                        <ListItemText primary="Dashboards" />
                    )}
                    {!isCollapsed && (dashboardsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItem>
                <Collapse in={dashboardsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem button component="a" href="/analysis/capacity" sx={{ pl: 4, textDecoration: "none", color: "inherit" }}>
                            <AccessTimeFilledIcon style={{ paddingRight: "5px"}}/>
                            {!isCollapsed && <ListItemText primary="Capacity" />}
                        </ListItem>
                        <ListItem button component="a" href="/analysis/bin-inventory" sx={{ pl: 4, textDecoration: "none", color: "inherit" }}>
                            <InventoryIcon style={{ paddingRight: "5px"}}/>
                            {!isCollapsed && <ListItemText primary="Inventory" />}
                        </ListItem>
                        <ListItem button component="a" href="/analysis/order-analysis" sx={{ pl: 4, textDecoration: "none", color: "inherit" }}>
                            <ShowChartIcon style={{ paddingRight: "5px"}}/>
                            {!isCollapsed && <ListItemText primary="Orders" />}
                        </ListItem>
                    </List>
                </Collapse>
                {/*Maintinence Dropdow*/}
                <ListItem button onClick={toggleMaintinence}>
                    <ListItemIcon>
                        <BuildIcon />
                    </ListItemIcon>
                    {!isCollapsed && (
                        <ListItemText primary="Maintinence" />
                    )}
                    {!isCollapsed && (maintinenceOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItem>
                <Collapse in={maintinenceOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem button component="a" href="/growers" sx={{ pl: 4, textDecoration: "none", color: "inherit" }}>
                            <GroupIcon style={{ paddingRight: "5px"}}/>
                            {!isCollapsed && <ListItemText primary="Growers" />}
                        </ListItem>
                        <ListItem button component="a" href="/commodities" sx={{ pl: 4, textDecoration: "none", color: "inherit" }}>
                            <ParkIcon style={{ paddingRight: "5px"}}/>
                            {!isCollapsed && <ListItemText primary="Commodities" />}
                        </ListItem>
                    </List>
                </Collapse>
                <ListItem button component="a" href="/settings" sx={{ textDecoration: "none", color: "inherit" }}>
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary="Settings" />}
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;
