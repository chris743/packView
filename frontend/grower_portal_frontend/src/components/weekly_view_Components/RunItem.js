import React from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';

const RunItem = ({ run, onEditClick }) => {
  const theme = useTheme();
  
  // Extract required data for the compact display
  const blockId = run["grower_block.block_id"] || 
                  (run.grower_block?.block_id) || 
                  "Unknown";
  const blockName = run["grower_block.name"] ||
                  (run.grower_block?.name) || 
                  "Unknown";

  const commodity = run["grower_block.variety.commodity.id"] || 
                   (run.grower_block?.variety?.commodity?.id) || 
                   "Unknown";
  const bins = run.bins || 0;
  
  // Determine status color
  let statusColor = theme.palette.grey[500]; // Default
  if (run.run_status === "In process") {
    statusColor = theme.palette.success.main;
  } else if (run.run_status === "Hold") {
    statusColor = theme.palette.error.main;
  } else if (run.run_status === "Complete") {
    statusColor = theme.palette.info.main;
  }
  
  return (
    <Box
      sx={{
        p: 1,
        mb: 1,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: 1,
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: `4px solid ${statusColor}`,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        position: 'relative'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" fontWeight="bold">
          {blockId} - {blockName}
        </Typography>
        <Tooltip title="Edit">
          <IconButton 
            size="small" 
            onClick={() => onEditClick && onEditClick(run)}
            sx={{ position: 'absolute', top: 2, right: 2 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Chip 
          label={`${bins} bins`} 
          size="small" 
          variant="outlined"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
        <Chip 
          label={commodity} 
          size="small"
          color="primary"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </Box>
      {run.batch_id && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: theme.palette.text.secondary }}>
          Batch: {run.batch_id}
        </Typography>
      )}
    </Box>
  );
};

export default RunItem;