import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import RunItem from './weekly_view_Components/RunItem';
import DayColumn from './weekly_view_Components/DayColumn';
import EditRunModal from './weekly_view_Components/EditRunModal';
/**
 * A weekly calendar view component for production runs with drag and drop support
 * 
 * @param {Object} props
 * @param {Array} props.data - All production run data
 * @param {string} props.weekStart - ISO date string for the week's start date (Sunday)
 * @param {Array} props.blocks - Available blocks for selection in edit modal
 * @param {function} props.onRunUpdate - Function called when a run is updated (e.g., date changed)
 * @param {function} props.onRunClick - Function called when a run is clicked for editing
 * @param {function} props.onReorder - Function called when runs are reordered within a day
 * @param {function} props.onAddNew - Function called when add button is clicked for a date
 */
const WeeklyCalendarView = ({ 
  data = [], 
  weekStart,
  blocks = [],
  onRunUpdate, 
  onRunClick,
  onReorder,
  onAddNew
}) => {
  const theme = useTheme();
  const [weekDays, setWeekDays] = useState([]);
  const [groupedRuns, setGroupedRuns] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [overDay, setOverDay] = useState(null);
  
  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Find active item when dragging
  const activeRun = activeId ? findRunById(activeId) : null;
  
  function findRunById(id) {
    for (const dateKey in groupedRuns) {
      const run = groupedRuns[dateKey].find(item => item.id === id);
      if (run) return run;
    }
    return null;
  }
  
  // Handler for opening the edit modal for an existing run
  const handleOpenEditModal = (run) => {
    setSelectedRun(run);
    setEditModalOpen(true);
  };
  
  // Handler for opening the edit modal for a new run
  const handleOpenNewRunModal = (date) => {
    // Create a template for a new run with the date prefilled
    const newRun = {
      id: `temp-${Date.now()}`, // Temporary ID
      run_date: date,
      bins: 0,
      run_status: "Not Started",
      location: "",
      notes: "",
      pool: "",
      row_order: groupedRuns[date]?.length || 0
    };
    
    setSelectedRun(newRun);
    setEditModalOpen(true);
  };
  
  // Handler for closing the edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedRun(null);
  };
  
  // Handler for saving edits or creating new runs
  const handleSaveRun = (updatedRun) => {
    if (!updatedRun) return;
    
    // Close the modal first for better UX
    setEditModalOpen(false);
    
    // Check if this is a new run (has a temp ID) or an existing one
    const isNewRun = updatedRun.id.toString().startsWith('temp-');
    
    if (isNewRun) {
      // For new runs, we have two options:
      // 1. Call onAddNew, which might switch to daily view
      // 2. Call onRunUpdate directly with the complete data
      
      // We'll pass the run directly to onRunUpdate to stay in weekly view
      if (onRunUpdate) {
        // Remove the temp ID - backend will assign a real one
        const { id, ...runData } = updatedRun;
        
        // Send to parent for creation through the API
        onRunUpdate(runData);
      }
    } else if (onRunUpdate) {
      // For existing runs, update with all fields
      onRunUpdate(updatedRun);
    }
  };
  
  // Initialize week days based on weekStart
  useEffect(() => {
    console.log("Week start:", weekStart);
    
    try {
      // Convert to date object, ensuring UTC handling
      const startDateObj = new Date(weekStart);
      console.log("Start date object:", startDateObj);
      
      if (isNaN(startDateObj.getTime())) {
        console.error("Invalid weekStart date:", weekStart);
        return;
      }
      
      const days = [];
      
      // Generate array of 7 days starting from weekStart (Sunday)
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDateObj);
        currentDate.setDate(startDateObj.getDate() + i);
        
        // Format as YYYY-MM-DD to ensure consistency
        // Use UTC methods to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        days.push({
          date: dateString,
          displayDate: currentDate.toLocaleDateString('en-US', {
            weekday: 'short', 
            month: 'short', 
            day: 'numeric'
          }),
          dayOfWeek: currentDate.getDay()  // 0 = Sunday, 1 = Monday, etc.
        });
        
        console.log(`Day ${i}: ${dateString} (${currentDate.toDateString()})`);
      }
      
      setWeekDays(days);
    } catch (error) {
      console.error("Error setting up week days:", error);
    }
  }, [weekStart]);
  
  // Group runs by date 
  useEffect(() => {
    if (!data.length || !weekDays.length) return;
    
    const grouped = {};
    
    // Create a map of date strings to their corresponding day objects
    // And initialize the grouped results with empty arrays
    const dateMap = {};
    weekDays.forEach(day => {
      dateMap[day.date] = day;
      grouped[day.date] = [];
    });
        
    // Create a map of dayOfWeek to date - this will help fix date skew issues
    const dowToDateMap = {};
    weekDays.forEach(day => {
      // Convert the date string to an object to get day of week
      const dateObj = new Date(day.date + "T00:00:00");
      const dow = dateObj.getDay(); // 0 = Sunday
      dowToDateMap[dow] = day.date;
    });
        
    // Group runs by date with enhanced debugging
    let matches = 0;
    let dayOfWeekMatches = 0;
    let reformatMatches = 0;
    let mismatches = 0;
    
    data.forEach(run => {
      try {
        const runDate = run.run_date;
        if (!runDate) {
          mismatches++;
          return;
        }
                
        // Try direct match first
        if (dateMap[runDate]) {
          console.log(`✓ Direct match found for ${runDate}`);
          grouped[runDate].push({...run});
          matches++;
          return;
        }
        
        // Try reformatting using consistent date format
        try {
          // Parse the date correctly
          const dateParts = runDate.split("-");
          if (dateParts.length !== 3) {
            throw new Error("Invalid date format");
          }
          
          // Create date using year-month-day 
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // 0-based months
          const day = parseInt(dateParts[2]);
          
          // Create date object in browser's timezone
          const dateObj = new Date(year, month, day);
          
          // This will give us day of week (0 = Sunday)
          const dayOfWeek = dateObj.getDay(); 
          
          // Get the week day that matches this day of week
          const matchingDate = dowToDateMap[dayOfWeek];
          
          if (matchingDate) {
            console.log(`✓ Matched ${runDate} to day of week ${dayOfWeek} => ${matchingDate}`);
            grouped[matchingDate].push({...run, run_date: matchingDate});
            dayOfWeekMatches++;
            return;
          }
        } catch (err) {
          console.error(`Error handling date ${runDate}:`, err);
        }
        
        // If still no match, try more aggressive date parsing
        try {
          const dateObj = new Date(runDate);
          if (!isNaN(dateObj.getTime())) {
            // Get the formatted date string
            const formattedDate = dateObj.toISOString().slice(0, 10);
            
            // Try direct match with formatted date
            if (dateMap[formattedDate]) {
              console.log(`✓ Matched after reformatting: ${runDate} => ${formattedDate}`);
              grouped[formattedDate].push({...run, run_date: formattedDate});
              reformatMatches++;
              return;
            }
            
            // Try matching by day of week as a last resort
            const dayOfWeek = dateObj.getDay();
            const matchingDate = dowToDateMap[dayOfWeek];
            
            if (matchingDate) {
              console.log(`✓ Last resort: matched ${runDate} to day of week ${dayOfWeek} => ${matchingDate}`);
              grouped[matchingDate].push({...run, run_date: matchingDate});
              dayOfWeekMatches++;
              return;
            }
          }
        } catch (err) {
          console.error(`Failed to parse date ${runDate}:`, err);
        }
        
        // If we got here, we couldn't match
        console.log(`✗ Failed to match run ${run.id} with date ${runDate}`);
        mismatches++;
      } catch (err) {
        console.error(`Unexpected error processing run:`, err);
        mismatches++;
      }
    });
    
    console.log(`Grouping complete: Direct matches: ${matches}, DoW matches: ${dayOfWeekMatches}, Reformat matches: ${reformatMatches}, Mismatches: ${mismatches}`);
    
    // Sort runs in each day by row_order
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const aOrder = a.row_order !== undefined && a.row_order !== null ? a.row_order : 999999;
        const bOrder = b.row_order !== undefined && b.row_order !== null ? b.row_order : 999999;
        return aOrder - bOrder;
      });
      console.log(`${date}: ${grouped[date].length} runs`);
    });
    
    setGroupedRuns(grouped);
  }, [data, weekDays, weekStart]);
  
  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };
  
  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // Reset the over day state
    setOverDay(null);
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    if (active.id !== over.id) {
      // Find source run and date
      let sourceDate = null;
      let sourceIndex = -1;
      let sourceRun = null;
      
      // Find where this run currently is
      for (const date in groupedRuns) {
        const foundIndex = groupedRuns[date].findIndex(item => item.id === active.id);
        if (foundIndex >= 0) {
          sourceDate = date;
          sourceIndex = foundIndex;
          sourceRun = groupedRuns[date][foundIndex];
          break;
        }
      }
      
      if (!sourceDate) {
        console.error(`Could not find source for run ${active.id}`);
        setActiveId(null);
        return;
      }
      
      // Check if we're over another run - find its container date
      let destDate = null;
      let destIndex = -1;
      
      // Try to find which day contains the target run
      for (const date in groupedRuns) {
        const foundIndex = groupedRuns[date].findIndex(item => item.id === over.id);
        if (foundIndex >= 0) {
          destDate = date;
          destIndex = foundIndex;
          break;
        }
      }
      
      // Check if we're directly over a day container
      if (!destDate) {
        // Check direct match on day.date
        const dayMatch = weekDays.find(day => day.date === over.id);
        if (dayMatch) {
          destDate = dayMatch.date;
          destIndex = groupedRuns[destDate]?.length || 0;
        }
        // Check if we're over a placeholder
        else if (over.id && String(over.id).startsWith('placeholder-')) {
          // Extract the date from the placeholder ID
          const placeholderId = String(over.id);
          const dateId = placeholderId.replace('placeholder-', '');
          
          if (weekDays.find(day => day.date === dateId)) {
            destDate = dateId;
            destIndex = groupedRuns[destDate]?.length || 0;
            console.log(`Dropping onto placeholder for ${dateId}`);
          }
        }
        // Check data attributes on over element
        else if (over.data && over.data.current && over.data.current.node) {
          const node = over.data.current.node;
          const droppableId = node.getAttribute('data-droppable-id') || 
                             node.getAttribute('data-day-id');
          
          if (droppableId && weekDays.find(day => day.date === droppableId)) {
            destDate = droppableId;
            destIndex = groupedRuns[destDate]?.length || 0;
          }
        }
      }
      
      // If we found a destination
      if (destDate) {
        console.log(`Moving run from ${sourceDate} to ${destDate}`);
        
        // Create a copy of the grouped runs
        const newGroupedRuns = { ...groupedRuns };
        
        // Handle reordering within the same day
        if (sourceDate === destDate) {
          newGroupedRuns[sourceDate] = arrayMove(
            newGroupedRuns[sourceDate], 
            sourceIndex, 
            destIndex
          );
          
          // Update row_order values
          const updatedRuns = newGroupedRuns[sourceDate].map((run, index) => ({
            ...run,
            row_order: index  // Update row_order to match new position
          }));
          
          newGroupedRuns[sourceDate] = updatedRuns;
          setGroupedRuns(newGroupedRuns);
          
          // Call onReorder with the updated runs to save row_order to database
          if (onReorder) {
            // Create a filtered array with only the necessary fields for the database update
            const rowsToUpdate = updatedRuns.filter(run => 
              run.id && !String(run.id).startsWith('temp-')
            ).map(run => ({
              id: run.id,
              row_order: run.row_order
            }));
            
            console.log('Saving reordered rows to database:', rowsToUpdate);
            if (rowsToUpdate.length > 0) {
              onReorder(updatedRuns);
            }
          }
        } 
        // Handle moving between days
        else {
          // Remove from source day
          const [movedRun] = newGroupedRuns[sourceDate].splice(sourceIndex, 1);
          
          // Update the run's date
          const updatedRun = { 
            ...movedRun, 
            run_date: destDate 
          };
          
          // Initialize destination array if it doesn't exist
          if (!newGroupedRuns[destDate]) {
            newGroupedRuns[destDate] = [];
          }
          
          // Add to destination day
          if (destIndex >= newGroupedRuns[destDate].length || destIndex < 0) {
            newGroupedRuns[destDate].push(updatedRun);
          } else {
            newGroupedRuns[destDate].splice(destIndex, 0, updatedRun);
          }
          
          // Update row_order values for both days
          const updatedSourceRuns = newGroupedRuns[sourceDate].map((run, index) => ({
            ...run,
            row_order: index
          }));
          
          const updatedDestRuns = newGroupedRuns[destDate].map((run, index) => ({
            ...run,
            row_order: index
          }));
          
          newGroupedRuns[sourceDate] = updatedSourceRuns;
          newGroupedRuns[destDate] = updatedDestRuns;
          
          setGroupedRuns(newGroupedRuns);
          
          // Call onRunUpdate with the updated run
          if (onRunUpdate) {
            console.log(`Updating run ${updatedRun.id} date to ${destDate}`);
            
            // Ensure we include all required fields for the API
            const runToUpdate = {
              ...movedRun,  // Start with all original fields
              id: movedRun.id,
              run_date: destDate,
              row_order: updatedDestRuns.findIndex(r => r.id === updatedRun.id)
            };
            
            // Ensure grower_block_id is properly set
            if (movedRun["grower_block.block_id"] && !runToUpdate.grower_block_id) {
              runToUpdate.grower_block_id = movedRun["grower_block.block_id"];
            }
            
            console.log("Complete run data to update:", runToUpdate);
            onRunUpdate(runToUpdate);
          }
          
          // Call onReorder for both affected days
          if (onReorder) {
            // Filter out temp IDs from both arrays and ensure row_order is properly set
            const rowsToUpdate = [...updatedSourceRuns, ...updatedDestRuns]
              .filter(run => run.id && !String(run.id).startsWith('temp-'))
              .map(run => ({
                id: run.id,
                row_order: run.row_order
              }));
            
            console.log('Saving row order updates after day change:', rowsToUpdate);
            if (rowsToUpdate.length > 0) {
              onReorder([...updatedSourceRuns, ...updatedDestRuns]);
            }
          }
        }
      }
    }
    
    setActiveId(null);
  };
  
  // Handle drag over
  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setOverDay(null);
      return;
    }
    
    console.log(`Drag over - active: ${active.id}, over:`, over);
    
    // First check if we're directly over a day column
    const dayMatch = weekDays.find(day => day.date === over.id);
    if (dayMatch) {
      setOverDay(dayMatch.date);
      return;
    }
    
    // Check if we're over a placeholder
    if (over.id && String(over.id).startsWith('placeholder-')) {
      // Extract the date from the placeholder ID
      const placeholderId = String(over.id);
      const dateId = placeholderId.replace('placeholder-', '');
      
      if (weekDays.find(day => day.date === dateId)) {
        setOverDay(dateId);
        console.log(`Over placeholder for ${dateId}`);
        return;
      }
    }
    
    // Next, check if over.id is a run, and find which day it belongs to
    for (const date in groupedRuns) {
      if (groupedRuns[date].some(run => run.id === over.id)) {
        setOverDay(date);
        return;
      }
    }
    
    // Check for data-droppable-id attribute
    if (over.data && over.data.current && over.data.current.node) {
      const node = over.data.current.node;
      const droppableId = node.getAttribute('data-droppable-id');
      if (droppableId && weekDays.find(day => day.date === droppableId)) {
        setOverDay(droppableId);
        return;
      }
    }
    
    setOverDay(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      // Ensure droppable ids are properly tracked
      id="calendar-dnd-context"
    >
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Grid container spacing={1}>
          {weekDays.map(day => (
            <Grid item xs={12} sm={6} md={12/7} key={day.date}>
              <DayColumn 
                day={day}
                id={day.date}
                runs={groupedRuns[day.date] || []}
                onEditRun={handleOpenEditModal}
                onAddRun={handleOpenNewRunModal}
                isOver={overDay === day.date}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <DragOverlay>
        {activeId && activeRun ? (
          <Box
            sx={{
              width: 'auto',
              opacity: 0.8,
              transform: 'rotate(3deg)',
            }}
          >
            <RunItem run={activeRun} />
          </Box>
        ) : null}
      </DragOverlay>
      
      {/* Edit Run Modal */}
      <EditRunModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        run={selectedRun}
        onSave={handleSaveRun}
        blocks={blocks}
      />
    </DndContext>
  );
};

export default WeeklyCalendarView;