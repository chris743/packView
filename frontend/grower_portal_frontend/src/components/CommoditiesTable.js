import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import { fetchCommodities } from '../api/api';

const CommoditiesTable = () => {
    const [commodities, setCommodities] = useState([]);

    useEffect(() => {
        const getCommodities = async () => {
            try {
                const data = await fetchCommodities();
                console.log(data);
                setCommodities(data);
            } catch (error) {
                console.error('Error fetching commodities:', error);
            }
        };

        getCommodities();
    }, []);

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Average Price</TableCell>
                        <TableCell>Carton Cost</TableCell>
                        <TableCell>Carton Weight</TableCell>
                        <TableCell>Pack Charge</TableCell>
                        <TableCell>Marketing Charge</TableCell>
                        <TableCell>Carton Weight</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {commodities.map((commodity) => (
                        <TableRow key={commodity.id}>
                            <TableCell>{commodity.name}</TableCell>
                            <TableCell>{commodity.avgCtnPrice}</TableCell>
                            <TableCell>{commodity.stdCtnCost}</TableCell>
                            <TableCell>{commodity.standardCtnWeight}</TableCell>
                            <TableCell>{commodity.packingCharge}</TableCell>
                            <TableCell>{commodity.promo}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default CommoditiesTable;
