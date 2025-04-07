import React, { useState, useEffect } from "react";
import { Box, useTheme, IconButton, Button, Menu, MenuItem } from "@mui/material";
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

  useEffect(() => {
    setRows(data || []);
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

  const handleRowOrderChange = () => {
    const sortedIds = apiRef.current.getSortedRowIds(); // this gives the current visual order
    const reorderedRows = sortedIds.map((id, index) => {
      const row = rows.find((r) => r.id === id);
      return { ...row, row_order: index };
    });
  
    setRows(reorderedRows);
    onReorder?.(reorderedRows);
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
  
    // Detect status change to "In Process"
    if (
      newRow.run_status !== oldRow.run_status &&
      newRow.run_status === "In process" &&
      !newRow.batch
    ) {
      const batchInput = window.prompt("Enter batch number for this run:");
      if (batchInput) {
        updatedRow.batch_id = batchInput;
        updatedRow.time_started = new Date().toISOString();
      } else {
        // Cancel update if no batch entered
        return oldRow;
      }
    }

    if (
      newRow.run_status !== oldRow.run_status &&
      newRow.run_status === "Complete" &&
      !newRow.batch_id
    ) {
      updatedRow.time_completed = new Date().toISOString();
      console.log(`Scheduling tag file import for batch: ${newRow.batch}`);
      setTimeout(() => {
      importTagFile(newRow); // 👈 define this function below
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
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
    onClick={() => {
      const newRow = { id: `temp-${uuidv4()}`, 
        row_order: rows.length, 
        ...Object.fromEntries(columns.map((col) => [col.field, ""]))
      };
      setRows((prevRows) => [newRow, ...prevRows]);

      const reordered = [newRow, ...rows].map((row, index) => ({
        ...row,
        row_order: index,
      }));
      setRows(reordered);
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
        experimentalFeatures={{ newEditingApi: true }}
        onProcessRowUpdateError={(error) => console.error("Row update failed:", error)}
        getRowId={(row) => row.id}
        disableSelectionOnClick
        initialState={{
          sorting: {
            sortModel: [{ field: "row_order", sort: "asc" }],
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
        onClick={() => {
          setContextMenu(null);
          setConfirmOpen(true);
        }}
      >
        Delete Row
    </MenuItem>
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
