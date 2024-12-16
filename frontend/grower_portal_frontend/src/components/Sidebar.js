import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material//Group';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
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
            <List>
                <ListItem button component="a" href="/">
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    {/* Conditionally show text based on collapse state */}
                    {!isCollapsed && <ListItemText primary="Dashboard" />}
                </ListItem>
                <ListItem button component="a" href="/commodities">
                    <ListItemIcon>
                        <InventoryIcon />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary="Commodities" />}
                </ListItem>
                <ListItem button component="a" href="/growers">
                    <ListItemIcon>
                        <GroupIcon />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary="Growers" />}
                </ListItem>
                
            </List>
        </Drawer>
    );
};

export default Sidebar;
