import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableRunItem from './SortableRunItem';

// Container for a day's runs
const DayColumn = ({ day, runs, onEditRun, onAddRun, id, isOver = false }) => {
  const theme = useTheme();
  const isEmpty = !runs || runs.length === 0;

  const { setNodeRef } = useDroppable({
    id: id,
  });
  
  return (
    <Paper
      elevation={isOver ? 3 : 1}
      ref={setNodeRef}
      id={`day-column-${id}`}
      data-droppable-id={id}
      data-day-id={id}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        mb: 2,
        transition: 'all 0.2s ease-in-out',
        border: isOver ? `2px solid ${theme.palette.primary.main}` : 'none',
        backgroundColor: isOver ? 'rgba(25, 118, 210, 0.04)' : theme.palette.background.paper,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: 1,
        p: 1,
        mb: 1
      }}>
        <Typography variant="subtitle2">
          {day.displayDate}
        </Typography>
        <Tooltip title="Add new run">
          <IconButton 
            size="small" 
            onClick={() => onAddRun && onAddRun(day.date)}
            sx={{ 
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
          </IconButton>
        </Tooltip>
      </Box>
      
      
    
      
      <Box
        sx={{
          minHeight: 200,
          flex: 1,
          p: 1,
          borderRadius: 1,
          border: isEmpty ? `3px dashed ${isOver ? theme.palette.primary.main : theme.palette.divider}` : 'none',
          backgroundColor: isEmpty && isOver ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          transition: 'all 0.2s ease',
        }}
        data-droppable-id={id}
      >
        <SortableContext 
          items={runs.map(run => run.id)} 
          strategy={verticalListSortingStrategy}
          id={id}
        >
          {runs.map(run => (
            <SortableRunItem 
              key={run.id} 
              id={run.id} 
              run={run} 
              onEditClick={onEditRun} 
            />
          ))}
        </SortableContext>
        
        {isEmpty && (
          <Box 
            sx={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              border: isOver ? `3px dashed ${theme.palette.primary.main}` : `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              backgroundColor: isOver ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
            data-droppable-id={id}
          >
            {isOver ? (
              <>
                <Box 
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(25, 118, 210, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>+</Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  Drop Here
                </Typography>
              </>
            ) : (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  textAlign: 'center'
                }}
              >
                No runs scheduled
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      {/* Droppable placeholder at the bottom - visible when dragging */}
    </Paper>
  );
};

export default DayColumn;