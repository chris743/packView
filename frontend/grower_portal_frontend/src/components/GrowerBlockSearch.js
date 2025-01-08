import React, { useState, useEffect } from "react";
import { Modal, Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import axios from "axios";
import { fetchData } from "../api/api";

const BlockSearch = ({ open, onClose, onSelectBlock }) => {
  const [growers, setGrowers] = useState([]);
  const [ranches, setRanches] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedGrower, setSelectedGrower] = useState(null);
  const [selectedRanch, setSelectedRanch] = useState(null);

  // Fetch all growers when the component mounts
  const fetchGrowers = async () => {
    const growersData = await fetchData("growers");
    setGrowers(growersData)
  }

  useEffect(() => {
    fetchGrowers();
  }, []);

  const handleGrowerSelect = async (growerId) => {
    setSelectedGrower(growerId);
    setRanches([]);
    setBlocks([]);
    setSelectedRanch(null);

    try {
      const response = await fetchData(`ranches/?grower=${growerId}`);
      setRanches(response);
    } catch (err) {
      console.error("Error fetching ranches:", err);
    }
  };

  const handleRanchSelect = async (ranchId) => {
    setSelectedRanch(ranchId);
    setBlocks([]);

    try {
      const response = await fetchData(`blocks/?ranch=${ranchId}`);
      setBlocks(response);
    } catch (err) {
      console.error("Error fetching blocks:", err);
    }
  };

  const handleBlockSelect = (blockId) => {
    onSelectBlock(blockId); // Emit the selected block to the parent
    onClose(); // Close the modal
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Search Blocks
        </Typography>

        {/* Grower Dropdown */}
        <TextField
          label="Grower"
          value={selectedGrower || ""}
          onChange={(e) => handleGrowerSelect(e.target.value)}
          fullWidth
          margin="normal"
          select
        >
          {growers.map((grower) => (
            <MenuItem key={grower.id} value={grower.id}>
              {`${grower.grower_id}-${grower.name}`}
            </MenuItem>
          ))}
        </TextField>
        {/* Ranch Dropdown */}
        <TextField
          label="Ranch"
          value={selectedRanch || ""}
          onChange={(e) => handleRanchSelect(e.target.value)}
          fullWidth
          margin="normal"
          select
          disabled={!selectedGrower}
        >
          {ranches.map((ranch) => (
            <MenuItem key={ranch.id} value={ranch.id}>
              {ranch.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Block Dropdown */}
        <TextField
          label="Block"
          value=""
          onChange={(e) => handleBlockSelect(e.target.value)}
          fullWidth
          margin="normal"
          select
          disabled={!selectedRanch}
        >
          {blocks.map((block) => (
            <MenuItem key={block.id} value={block.id}>
              {block.name}
            </MenuItem>
          ))}
        </TextField>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button onClick={onClose} sx={{ mr: 2 }}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BlockSearch;
