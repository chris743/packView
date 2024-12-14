import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Box,
} from '@mui/material';


const ReusableTable = ({ columns, data, actions }) => {
    return (
        <Box sx={{ overflowX: 'auto' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {/* Render Column Headers */}
                        {columns.map((column) => (
                            <TableCell key={column.field}>{column.headerName}</TableCell>
                        ))}
                        {/* Render Action Header if actions are provided */}
                        {actions && actions.length > 0 && <TableCell>Actions</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Render Data Rows */}
                    {data.map((row) => (
                        <TableRow key={row.id}>
                            {columns.map((column) => (
                                <TableCell key={column.field}>
                                    {row[column.field]}
                                </TableCell>
                            ))}
                            {/* Render Action Buttons */}
                            {actions && actions.length > 0 && (
                                <TableCell>
                                    {actions.map((action, index) => (
                                        <Button
                                            key={index}
                                            variant={action.variant || 'contained'}
                                            color={action.color || 'primary'}
                                            onClick={() => action.onClick(row)}
                                            sx={{ marginRight: 1 }}
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default ReusableTable;
