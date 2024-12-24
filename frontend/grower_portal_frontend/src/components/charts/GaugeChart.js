import React, { useState, useEffect } from "react";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { fetchChartData } from '../../api/api';
import axios from 'axios';
import { Button } from '@mui/material';


const GaugeChart = ({endpoint, offset}) => {
    const [currentValue, setCurrentValue] = useState(0);
    const [capacityLimit, setCapacityLimit] = useState(0);

    const loadData = async () => {
        const data = await fetchChartData(endpoint);
        setCurrentValue(data.currentValue)
        setCapacityLimit(data.capacityLimit)
    };

    useEffect(() => {
        loadData();
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <h1 style={{ marginBottom: '20px' }}>{endpoint}</h1>
            <Gauge
                value={currentValue / capacityLimit * 100}
                startAngle={-110}
                endAngle={110}
                sx={{
                    width: '100%', // Ensures the gauge scales properly
                    maxWidth: '300px',
                    [`& .${gaugeClasses.valueText}`]: {
                        fontSize: 40,
                        transform: 'translate(0px, 0px)',
                    },
                }}
                text={({ value, valueMax }) => `${value}%`}
            />
        </div>
    );
};

export default GaugeChart;
