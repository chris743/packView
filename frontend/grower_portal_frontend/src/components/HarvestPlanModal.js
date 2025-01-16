// HarvestPlanModal.js
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

const HarvestPlanModal = ({ open, onClose, rowData, onSave, weekStart }) => {
  const [formData, setFormData] = useState(rowData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [pools, setPools] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [haulers, setHaulers] = useState([]);
  const [fork, setFork] = useState([]);
  const [blockSearchOpen, setBlockSearchOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState(rowData?.dates || []);

  // Fetch dropdown data
  const loadDropdownData = async () => {
    try {
      const [blocksData, poolsData, contractorsData] = await Promise.all([
        fetchData("blocks"),
        fetchData("pools"),
        fetchData('field-contractors'),
      ]);
      const trucking_contractors = contractorsData.filter(
        (contractor) => contractor.provides_trucking);
      const picking_contractors = contractorsData.filter(
        (contractor) => contractor.provides_picking);
      const forklift_contractors = contractorsData.filter(
        (contractor) => contractor.provides_forklift);
      setBlocks(blocksData);
      setPools(poolsData);
      setHaulers(trucking_contractors);
      setContractors(picking_contractors);
      setFork(forklift_contractors);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setError("Failed to load dropdown data. Please try again.");
    }
  };

  // Initialize data on modal open
  useEffect(() => {
    loadDropdownData();
    setFormData(rowData || {});
    setSelectedDates(rowData?.dates || []);
  }, [rowData]);

  // Handle changes in form fields
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectDates = (dates) => {
    setSelectedDates(dates);
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
    "pool",
    "harvest_date",
    "notes_general",
    "forklift_contractor",
    "forklift_rate",
  ];

  const sanitizeFormData = (formData, selectedDates) => {
    const sanitized = Object.keys(formData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {});
    
    sanitized.dates = selectedDates;
    return sanitized;
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

    try {
      const sanitizedData = sanitizeFormData(formData, selectedDates);
      
      if (sanitizedData.id) {
        await editData("planned-harvests", sanitizedData.id, sanitizedData);
      } else {
        console.log(JSON.stringify(sanitizedData));
        await createData("planned-harvests", sanitizedData);
      }
      
      onSave(sanitizedData);
      onClose();
    } catch (err) {
      console.error("Error saving data:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generalTabContent = (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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
        selectedDates={selectedDates}
        onSelectDates={handleSelectDates}
        weekStart={weekStart}
      />
      <TextField
        label="Notes"
        value={formData.notes_general || ""}
        onChange={(e) => handleChange("notes_general", e.target.value)}
        fullWidth
        multiline
        rows={4}
      />
    </Box>
  );

  const resourcesTabContent = (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      <Box sx={{ display:"flex", flexDirection: "row", gap: 2, width: '100%'}}>
        <TextField
          label="Labor Contractor"
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
      </Box>
      <Box sx={{ display:"flex", flexDirection: "row", gap: 2, width: '100%'}}>
        <TextField
          label="Trucking Contractor"
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
          label="Trucking Rate"
          type="number"
          value={formData.hauling_rate || ""}
          onChange={(e) => handleChange("hauling_rate", parseFloat(e.target.value))}
          fullWidth
        />
      </Box>
      <Box sx={{ display:"flex", flexDirection: "row", gap: 2, width: '100%'}}>
        <TextField
          label="Forklift Contractor"
          value={formData.forklift_contractor || ""}
          onChange={(e) => handleChange("forklift_contractor", e.target.value)}
          select
          fullWidth
        >
          {fork.map((fork) => (
            <MenuItem key={fork.id} value={fork.id}>
              {fork.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Forklift Rate"
          type="number"
          value={formData.forklift_rate || ""}
          onChange={(e) => handleChange("forklift_rate", parseFloat(e.target.value))}
          fullWidth
        />
      </Box>
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
          width: 700,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 3,
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

export default HarvestPlanModal;