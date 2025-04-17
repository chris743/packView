import React, { useState, useEffect } from "react";
import { Box, useTheme, IconButton, Button, Menu, MenuItem, Select } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useGridApiRef } from '@mui/x-data-grid-pro';
import {v4 as uuidv4} from 'uuid';
import { WindowSharp } from "@mui/icons-material";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";


const EditableTable = ({
  columns = [],
  data = [],
  onSave,
  actions = [],
  onReorder,
  onDelete,
  onViewDetails,
}) => {
  const theme = useTheme();
  const [rows, setRows] = useState(data || []);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [density, setDensity] = useState(() => {
    return localStorage.getItem("tableDensity") || "compact";
  });
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);



  useEffect(() => {
    // Ensure data is sorted by row_order before setting rows
    const sortedData = [...(data || [])].sort((a, b) => {
      // Default to a large number if row_order is missing
      const aOrder = a.row_order !== undefined ? a.row_order : 999999;
      const bOrder = b.row_order !== undefined ? b.row_order : 999999;
      return aOrder - bOrder;
    });
    setRows(sortedData);
  }, [data]);

  const apiRef = useGridApiRef();

  const columnsWithActions = [
    ...columns,
    ...(actions.length > 0
      ? [{
          field: "actions",
          headerName: "Actions",
          sortable: false,
          width: 120,
          disableClickEventBubbling: true,
          renderCell: (params) => (
            <strong>
              {actions.map((action, index) => (
                <IconButton
                  key={index}
                  onClick={() => action.onClick(params.row)}
                  sx={{ color: action.color }}
                >
                  {action.icon}
                </IconButton>
              ))}
            </strong>
          ),
        }]
      : []),
  ];

  const handleRowOrderChange = (params) => {
    // Get the new row order from the drag-and-drop action
    const { targetIndex, oldIndex } = params;
    console.log(`Row moved from index ${oldIndex} to index ${targetIndex}`);

    // Create a copy of current rows
    const updatedRows = [...rows];
    
    // Move the row from oldIndex to targetIndex
    const [movedRow] = updatedRows.splice(oldIndex, 1);
    updatedRows.splice(targetIndex, 0, movedRow);
    
    // Update row_order values for all rows
    const reorderedRows = updatedRows.map((row, index) => ({
      ...row,
      row_order: index
    }));
    
    // Update the rows state with the new order
    setRows(reorderedRows);
    
    // Call the onReorder callback if provided
    onReorder?.(reorderedRows);
    
    // Log the new order for debugging
    console.log("New row order:", reorderedRows.map(r => ({ id: r.id, order: r.row_order })));
  };

  const importTagFile = async (row) => {
    try {
      console.log("🔄 Running tag file import for:", row.batch);
  
      // This could call your API endpoint
      const response = await fetch(`/api/import-tag/${row.batch}/`, {
        method: "POST",
      });
  
      if (!response.ok) {
        throw new Error("Failed to import tag file.");
      }
  
      const result = await response.json();
      console.log("✅ Tag file imported:", result);
    } catch (error) {
      console.error("❌ Error importing tag file:", error);
    }
  };  

  const handleRowUpdate = async (newRow, oldRow) => {
    let updatedRow = { ...newRow };
  
    // Detect status change to "In Process" - just set time without prompting for batch
    if (
      newRow.run_status !== oldRow.run_status &&
      newRow.run_status === "In process"
    ) {
      updatedRow.time_started = new Date().toISOString();
      // No batch prompt - will be set by the auto-update mechanism
    }

    // Detect status change to "Complete"
    if (
      newRow.run_status !== oldRow.run_status &&
      newRow.run_status === "Complete"
    ) {
      updatedRow.time_completed = new Date().toISOString();
      
      // Only schedule tag import if we have a batch
      if (updatedRow.batch_id) {
        console.log(`Scheduling tag file import for batch: ${updatedRow.batch_id}`);
        setTimeout(() => {
          importTagFile(updatedRow);
        }, 10 * 60 * 1000); // 10 minutes in milliseconds
      }
    }
    
    try {
      await onSave(updatedRow);
      return updatedRow;
    } catch (error) {
      console.error("Failed to save row:", error);
      return oldRow;
    }
  };
  

  return (
    <>
    <Button 
    variant="contained"
    color="primary"
    data-testid="add-line-button"
    onClick={() => {
      // Create new row with highest row_order value (add to bottom)
      const maxRowOrder = rows.length > 0 
        ? Math.max(...rows.map(row => row.row_order !== undefined ? row.row_order : 0)) + 1 
        : 0;
      
      const newRow = { 
        id: `temp-${uuidv4()}`, 
        row_order: maxRowOrder, 
        run_date: new Date().toISOString().slice(0, 10), // Default to today or use selected date
        ...Object.fromEntries(columns.map((col) => [col.field, ""]))
      };
      
      // Add new row to end of list, preserving sort order
      setRows((prevRows) => [...prevRows, newRow].sort((a, b) => {
        const aOrder = a.row_order !== undefined ? a.row_order : 999999;
        const bOrder = b.row_order !== undefined ? b.row_order : 999999;
        return aOrder - bOrder;
      }));
    }}
    sx={{ m: 1 }}
  >
    Add Line
  </Button>
    <Box
            sx={{
              overflowX: "auto",
              backgroundColor: theme.palette.background.paper,
              borderRadius: "8px",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
                  : "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
      <DataGridPro
        apiRef={apiRef}
        rows={rows}
        columns={columnsWithActions}
        editMode="row"
        processRowUpdate={handleRowUpdate}
        rowReordering
        onRowOrderChange={handleRowOrderChange}
        density={density}
        experimentalFeatures={{ newEditingApi: true }}
        onProcessRowUpdateError={(error) => console.error("Row update failed:", error)}
        getRowId={(row) => row.id}
        disableSelectionOnClick
        disableColumnFilter={true}
        initialState={{
          sorting: {
            sortModel: [{ field: "row_order", sort: "asc" }],
          },
          columns: {
            columnVisibilityModel: {
              // Hide the ID column
              id: false,
            },
          },
        }}
        components={{
          Row: (props) => (
            <div
              {...props}
              style={{
                ...props.style,
                cursor: 'move',
              }}
            />
          ),
        }}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'move',
          },
        }}
        slotProps={{
          row: {
            onContextMenu: (event) => {
              event.preventDefault();
              const rowID = (event.currentTarget.getAttribute("data-id"));

              const rowData = rows.find((row) => row.id === rowID);

              setSelectedRow(rowID);
              setContextMenu({
                mouseX: event.clientX + 2,
                mouseY: event.clientY - 6,
              });
          }
        }}}
      />
    </Box>
    <Menu
      open={contextMenu !== null}
      onClose={() => setContextMenu(null)}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem
        onClick={() => {
          setContextMenu(null);
          console.log(selectedRow);
          onViewDetails?.(selectedRow);
          
        }}
      >
        View Details
      </MenuItem>

      <MenuItem
        onMouseEnter={(e) => {
          setSubmenuAnchorEl(e.currentTarget);
          setSubmenuOpen(true);
        }}
        onMouseLeave={() => {
          setTimeout(() => setSubmenuOpen(false), 300);
        }}
      >
        Density
      </MenuItem>


      <MenuItem
        onClick={() => {
          setContextMenu(null);
          setConfirmOpen(true);
        }}
      >
        Delete Row
    </MenuItem>
    </Menu>

    <Menu
      anchorEl={submenuAnchorEl}
      open={submenuOpen}
      onClose={() => setSubmenuOpen(false)}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      MenuListProps={{
        onMouseEnter: () => setSubmenuOpen(true),
        onMouseLeave: () => setSubmenuOpen(false),
      }}
    >
      {["standard", "comfortable", "compact"].map((option) => (
        <MenuItem
          key={option}
          selected={option === density}
          onClick={() => {
            setDensity(option);
            localStorage.setItem("tableDensity", option);
            setSubmenuOpen(false);
            setContextMenu(null);
          }}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </MenuItem>
      ))}
    </Menu>



    <Dialog
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete this row? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmOpen(false)} color="primary">
      Cancel
    </Button>
    <Button
      onClick={() => {
        setConfirmOpen(false);
        if (selectedRow) {
          onDelete?.(selectedRow);
        }
      }}
      color="error"
      variant="contained"
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>
    </>
  );
};

export default EditableTable;
