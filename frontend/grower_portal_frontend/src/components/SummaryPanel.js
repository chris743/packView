import React from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableRow, 
  TableCell 
} from '@mui/material';

/**
 * SummaryPanel - A reusable component for displaying summary data in a table
 * 
 * @param {Object} props
 * @param {string} props.title - The panel title
 * @param {Object} props.data - Object containing key-value pairs to display
 * @param {Object} props.sx - Additional styles to apply
 */
const SummaryPanel = ({ title, data, sx = {} }) => (
  <Paper sx={{ padding: 2, minWidth: 200, ...sx }}>
    <Typography variant="subtitle1" fontWeight="bold" mb={1}>{title}</Typography>
    <Table size="small">
      <TableBody>
        {Object.entries(data).map(([key, value]) => (
          <TableRow key={key}>
            <TableCell>{key}</TableCell>
            <TableCell align="right">{value}</TableCell>
          </TableRow>
        ))}
        {Object.keys(data).length === 0 && (
          <TableRow>
            <TableCell colSpan={2} align="center">No data available</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Paper>
);

export default SummaryPanel;