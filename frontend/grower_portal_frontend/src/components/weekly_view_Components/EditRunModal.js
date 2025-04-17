import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Typography
} from '@mui/material';

/**
 * Modal for editing or creating run details
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to call when closing the modal
 * @param {Object} props.run - The run data to edit
 * @param {function} props.onSave - Function to call when saving changes
 * @param {Array} props.blocks - Available blocks for selection
 * @param {string} props.mode - 'edit' or 'create', affects title and button text
 */
const EditRunModal = ({ open, onClose, run, onSave, blocks = [] }) => {
  // Determine if this is a new run from the run ID
  const isNewRun = run && run.id && run.id.toString().startsWith('temp-');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form data when run changes
  useEffect(() => {
    if (run) {
      // Clone run object to avoid direct modification
      setFormData({
        ...run,
        grower_block_id: run["grower_block.block_id"] || (run.grower_block?.block_id) || "",
        bins: run.bins || 0,
        run_date: run.run_date || "",
        pick_date: run.pick_date || "",
        run_status: run.run_status || "Not Started",
        location: run.location || "",
        notes: run.notes || "",
        pool: run.pool || "",
        row_order: run.row_order || 0,
      });
    }
  }, [run]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  // Validate form before saving
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.grower_block_id) {
      newErrors.grower_block_id = "Block is required";
    }
    
    if (!formData.bins || formData.bins <= 0) {
      newErrors.bins = "Bins must be greater than 0";
    }
    
    if (!formData.run_date) {
      newErrors.run_date = "Run date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      // Clean up the payload before saving
      const payload = { ...formData };
      
      // Ensure grower_block_id is always a string or number, not an object
      if (typeof payload.grower_block_id === 'object' && payload.grower_block_id !== null) {
        payload.grower_block_id = payload.grower_block_id.block_id;
      }
      
      // Ensure numeric fields are numbers
      payload.bins = Number(payload.bins);
      if (payload.row_order !== undefined) {
        payload.row_order = Number(payload.row_order);
      }
      
      console.log("Saving run with payload:", payload);
      
      // Pass to parent for saving
      onSave(payload);
    }
  };

  // Find selected block details
  const selectedBlock = React.useMemo(() => {
    if (!formData.grower_block_id || !blocks || blocks.length === 0) return null;
    
    // Ensure we're comparing the right types (string vs number)
    const blockId = String(formData.grower_block_id);
    const found = blocks.find(b => String(b.block_id) === blockId);
    
    console.log("Selected block:", found, "for ID:", blockId);
    return found || null;
  }, [blocks, formData.grower_block_id]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {isNewRun ? 'Add Production Run' : 'Edit Production Run'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Block Selection */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={blocks}
              getOptionLabel={(option) => {
                if (!option) return '';
                return `${option.block_id} — ${option.name} — ${option["ranch.grower.name"] || ""}`;
              }}
              isOptionEqualToValue={(option, value) => 
                String(option?.block_id) === String(value?.block_id)
              }
              value={selectedBlock}
              onChange={(_, newValue) => {
                if (newValue) {
                  // We need to update multiple fields when a block is selected
                  const updates = {
                    // The actual ID field that will be submitted
                    grower_block_id: newValue.block_id,
                    
                    // Related fields for display
                    "grower_block.block_id": newValue.block_id,
                    "grower_block.name": newValue.name || "",
                    "grower_block.ranch.name": newValue["ranch.name"] || "",
                    "grower_block.ranch.grower.name": newValue["ranch.grower.name"] || "",
                    "grower_block.variety.id": newValue["variety.id"] || "",
                    "grower_block.variety.commodity.id": newValue["variety.commodity.id"] || ""
                  };
                  
                  // Update the form data with all fields
                  setFormData(prev => ({
                    ...prev,
                    ...updates
                  }));
                } else {
                  // Clear the block-related fields if cleared
                  setFormData(prev => ({
                    ...prev,
                    grower_block_id: "",
                    "grower_block.block_id": "",
                    "grower_block.name": "",
                    "grower_block.ranch.name": "",
                    "grower_block.ranch.grower.name": "",
                    "grower_block.variety.id": "",
                    "grower_block.variety.commodity.id": ""
                  }));
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Block" 
                  error={!!errors.grower_block_id}
                  helperText={errors.grower_block_id}
                  required
                />
              )}
            />
          </Grid>

          {/* Bins */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bins"
              type="number"
              value={formData.bins || ""}
              onChange={(e) => handleChange("bins", Number(e.target.value))}
              error={!!errors.bins}
              helperText={errors.bins}
              required
            />
          </Grid>

          {/* Run Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Run Date"
              type="date"
              value={formData.run_date || ""}
              onChange={(e) => handleChange("run_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors.run_date}
              helperText={errors.run_date}
              required
            />
          </Grid>

          {/* Pick Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pick Date"
              type="date"
              value={formData.pick_date || ""}
              onChange={(e) => handleChange("pick_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.run_status || "Not Started"}
                onChange={(e) => handleChange("run_status", e.target.value)}
                label="Status"
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In process">In Process</MenuItem>
                <MenuItem value="Hold">Hold</MenuItem>
                <MenuItem value="Complete">Complete</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </Grid>

          {/* Pool */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pool ID"
              value={formData.pool || ""}
              onChange={(e) => handleChange("pool", e.target.value)}
            />
          </Grid>

          {/* Batch ID (read-only) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Batch ID"
              value={formData.batch_id || ""}
              InputProps={{ readOnly: true }}
              disabled
              helperText="Automatically assigned"
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          {/* Summary Info */}
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">
              {selectedBlock ? (
                <>
                  <strong>Grower:</strong> {selectedBlock["ranch.grower.name"] || "Unknown"}<br />
                  <strong>Ranch:</strong> {selectedBlock["ranch.name"] || "Unknown"}<br />
                  <strong>Variety:</strong> {selectedBlock["variety.id"] || "Unknown"}<br />
                  <strong>Commodity:</strong> {selectedBlock["variety.commodity.id"] || "Unknown"}
                </>
              ) : "No block selected"}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
        >
          {isNewRun ? 'Create Run' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditRunModal;