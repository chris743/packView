import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';

const TabView = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box>
            <Tabs value={activeTab} onChange={handleChange}>
                {tabs.map((tab, index) => (
                    <Tab key={index} label={tab.label} />
                ))}
            </Tabs>
            <Box sx={{ marginTop: 3 }}>
                {tabs[activeTab]?.content}
            </Box>
        </Box>
    );
};

export default TabView;
