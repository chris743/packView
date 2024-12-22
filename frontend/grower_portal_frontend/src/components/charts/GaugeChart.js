import React, { useState } from "react";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { fetchData } from '../../api/api';
import axios from 'axios';
import { Button } from '@mui/material';

const GaugeChart = ({endpoint, data, offset}) => {
 
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <h1 style={{ marginBottom: '20px' }}>CHART</h1>
            <Gauge
                value={75}
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
