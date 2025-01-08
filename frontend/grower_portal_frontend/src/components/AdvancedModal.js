import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  IconButton,
  Autocomplete,
} from "@mui/material";
import TabView from "./TabView";
import GrowerBlockSearch from "./GrowerBlockSearch";
import WeekdayPicker from "./WeekdayPicker";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchData, createData, editData, deleteData } from "../api/api";

const AdvancedModal = ({ open, onClose, rowData, onSave, weekStart }) => {
  const [formData, setFormData] = useState(rowData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [pools, setPools] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [haulers, setHaulers] = useState([]);
  const [blockSearchOpen, setBlockSearchOpen] = useState(false);

  // Fetch dropdown data
  const loadDropdownData = async () => {
    try {
      const [blocksData, laborData, haulerData, poolsData] = await Promise.all([
        fetchData("blocks"),
        fetchData("labor_contractors"),
        fetchData("trucking_contractors"),
        fetchData("pools"),
      ]);
      setBlocks(blocksData);
      setContractors(laborData);
      setHaulers(haulerData);
      setPools(poolsData);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setError("Failed to load dropdown data. Please try again.");
    }
  };

  // Initialize data on modal open
  useEffect(() => {
    loadDropdownData();
    setFormData(rowData || {});
  }, [rowData]);

  // Handle changes in form fields
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDaySelect = (selectedDate) => {
    const dateOnly = new Date(selectedDate).toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
    setFormData({ ...formData, harvest_date: dateOnly });
  };

  const allowedFields = [
    "id",
    "name",
    "grower_block",
    "planned_bins",
    "contractor",
    "harvesting_rate",
    "hauler",
    "hauling_rate",
    "pool_id",
    "harvest_date",
  ];

  const sanitizeFormData = (formData) => {
    return Object.keys(formData)
      .filter((key) => allowedFields.includes(key)) // Include only allowed fields
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {});
  };

  const handleDelete = async () => {
    if (rowData?.id) {
      setLoading(true);
      try {
        await deleteData("planned-harvests", rowData.id);
        onClose();
      } catch (err) {
        console.error("Error deleting record:", err);
        setError("Failed to delete the record. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const sanitizedData = sanitizeFormData(formData);

    try {
      if (sanitizedData.id) {
        await editData("planned-harvests", sanitizedData.id, sanitizedData);
      } else {
        console.log(sanitizedData);
        await createData("planned-harvests", sanitizedData);
      }
      onSave(sanitizedData); // Update parent table
      onClose(); // Close modal
    } catch (err) {
      console.error("Error saving data:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generalTabContent = (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {/* Grower Block Dropdown and Search */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
        <Autocomplete
          sx={{ width: "50%" }}
          options={blocks || []}
          getOptionLabel={(option) =>
            option.block_id && option.name
              ? `${option.block_id}-${option.name}`
              : ""
          }
          value={blocks.find((block) => block.id === formData.grower_block) || null}
          onChange={(event, newValue) => {
            setFormData({ ...formData, grower_block: newValue ? newValue.id : null });
          }}
          renderInput={(params) => (
            <TextField {...params} label="Grower Block" variant="outlined" fullWidth />
          )}
        />
        <IconButton onClick={() => setBlockSearchOpen(true)} aria-label="Search Block">
          <SearchIcon />
        </IconButton>
      </Box>
      <GrowerBlockSearch
        open={blockSearchOpen}
        onClose={() => setBlockSearchOpen(false)}
        onSelectBlock={(blockId) => handleChange("grower_block", blockId)}
      />

      {/* Other General Fields */}
      <TextField
        label="Planned Bins"
        sx={{ width: "50%" }}
        type="number"
        value={formData.planned_bins || ""}
        onChange={(e) => handleChange("planned_bins", Number(e.target.value))}
        fullWidth
      />
      <Autocomplete
        sx={{ width: "50%" }}
        options={pools || []}
        getOptionLabel={(option) => option.id || ""}
        value={pools.find((pool) => pool.id === formData.pool) || null}
        onChange={(event, newValue) => {
          setFormData({ ...formData, pool: newValue ? newValue.id : null });
        }}
        renderInput={(params) => <TextField {...params} label="Pool" variant="outlined" />}
      />
      <WeekdayPicker
        selectedDate={formData.harvest_date}
        onSelectDate={handleDaySelect}
        weekStart={weekStart}
      />
      <TextField
        label="Notes"
        value={formData.notes || ""}
        onChange={(e) => handleChange("notes", e.target.value)}
        fullWidth
        multiline
        rows={4}
      />
    </Box>
  );

  const resourcesTabContent = (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      <TextField
        label="Contractor"
        value={formData.contractor || ""}
        onChange={(e) => handleChange("contractor", e.target.value)}
        select
        fullWidth
      >
        {contractors.map((contractor) => (
          <MenuItem key={contractor.id} value={contractor.id}>
            {contractor.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Harvesting Rate"
        type="number"
        value={formData.harvesting_rate || ""}
        onChange={(e) => handleChange("harvesting_rate", parseFloat(e.target.value))}
        fullWidth
      />
      <TextField
        label="Hauler"
        value={formData.hauler || ""}
        onChange={(e) => handleChange("hauler", e.target.value)}
        select
        fullWidth
      >
        {haulers.map((hauler) => (
          <MenuItem key={hauler.id} value={hauler.id}>
            {hauler.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Hauling Rate"
        type="number"
        value={formData.hauling_rate || ""}
        onChange={(e) => handleChange("hauling_rate", parseFloat(e.target.value))}
        fullWidth
      />
    </Box>
  );

  const tabs = [
    { label: "General", content: generalTabContent },
    { label: "Resources", content: resourcesTabContent },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {formData.id ? "Edit Harvest Plan" : "New Harvest Plan"}
        </Typography>
        <TabView tabs={tabs} />
        {error && <Typography color="error">{error}</Typography>}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={!rowData?.id}
          >
            DELETE
          </Button>
          <Box>
            <Button onClick={onClose} sx={{ mr: 2 }} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AdvancedModal;
