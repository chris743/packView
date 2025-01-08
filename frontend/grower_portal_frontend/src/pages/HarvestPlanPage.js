import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button } from '@mui/material';
import { fetchData, editData } from '../api/api';

const formatDate = (date) => date.toISOString().split('T')[0];

const parseDate = (dateStr) => new Date(dateStr);

const getCurrentWeek = () => {
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay),
  };
};

const HarvestPlan = () => {
  const [data, setData] = useState([]);
  const [week, setWeek] = useState(getCurrentWeek());
  const [blocks, setBlocks] = useState([]);
  const [editRows, setEditRows] = useState([]);


  useEffect(() => {
    loadData();
    loadBlocks();
  }, [week]);

  const loadData = async () => {
    try {
      const result = await fetchData(`planned-harvests?week=${week.start}`);
      const sanitizedData = result.map((item) => ({
        ...item,
        days: item.days || {
          sun: 0,
          mon: 0,
          tues: 0,
          wed: 0,
          thurs: 0,
          fri: 0,
          sat: 0,
        },
      }));
      setData(sanitizedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const toggleEditMode = (rowId) => {
    setEditRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId) // Remove from edit mode
        : [...prev, rowId] // Add to edit mode
    );
  };

  const loadBlocks = async () => {
    try {
      const result = await fetchData('blocks');
      setBlocks(result);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleEdit = (rowId, field, value) => {
    const updatedData = data.map((row) => {
      if (row.id === rowId) {
        if (field === 'grower_block') {
          // Find the selected block
          const selectedBlock = blocks.find((b) => b.block_id === value);
          return {
            ...row,
            grower_block: value,
            ranch: selectedBlock?.ranch?.name || '',
            commodity: selectedBlock?.planted_commodity || '', // Update commodity
          };
        } else {
          return {
            ...row,
            [field]: value,
          };
        }
      }
      return row;
    });
    setData(updatedData);
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        data.map((item) => editData('planned-harvests', item.id, item))
      );
      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: null,
      commodity: '',
      ranch: '',
      block: '',
      planned_bins: 0,
      days: {
        sun: 0,
        mon: 0,
        tues: 0,
        wed: 0,
        thurs: 0,
        fri: 0,
        sat: 0,
      },
    };
    setData([...data, newRow]);
  };

  const renderCommodityRows = (commodityData) => {
    return commodityData.map((block) => (
      <TableRow key={block.id || Math.random()}>
        <TableCell>{block.planted_commodity || 'N/A'}</TableCell>
        <TableCell>{block.ranch || 'N/A'}</TableCell>
        <TableCell>
          <Select
            value={block.grower_block || ''}
            onChange={(e) => handleEdit(block.id, 'grower_block', e.target.value)}
          >
            {blocks.map((b) => (
              <MenuItem key={b.block_id} value={b.block_id}>
                {b.name} ({b.ranch?.name || 'No Ranch'})
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell>
          <TextField
            type="number"
            value={block.planned_bins || 0}
            onChange={(e) => handleEdit(block.id, 'planned_bins', parseInt(e.target.value, 10))}
          />
        </TableCell>
        {['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'].map((day) => (
          <TableCell key={day}>
            <TextField
              type="number"
              value={block.days?.[day] || 0}
              onChange={(e) => {
                const newValue = parseInt(e.target.value, 10) || 0;
                handleEdit(block.id, `days.${day}`, newValue);
              }}
            />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const renderEmptyRow = () => (
    <TableRow style={{ backgroundColor: 'transparent' }}>
      {Array(10) // Assuming 10 columns in the table
        .fill(null)
        .map((_, index) => (
          <TableCell key={index} style={{ border: 'none' }}></TableCell>
        ))}
    </TableRow>
  );

  const getTotalsRow = (commodityData) => {
    const totals = commodityData.reduce(
      (acc, block) => {
        acc.planned_bins += block.planned_bins;
        ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'].forEach((day) => {
          acc[day] += block.days[day] || 0;
        });
        return acc;
      },
      { planned_bins: 0, sun: 0, mon: 0, tues: 0, wed: 0, thurs: 0, fri: 0, sat: 0 }
    );

    return (
      <TableRow style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
        <TableCell colSpan={2}>Total</TableCell>
        <TableCell>{totals.planned_bins}</TableCell>
        {['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'].map((day) => (
          <TableCell key={day}>{totals[day]}</TableCell>
        ))}
      </TableRow>
    );
  };


  const changeWeek = (direction) => {
    const start = new Date(week.start);
    const newStart = new Date(start.setDate(start.getDate() + direction * 7));
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + 6);
    setWeek({
      start: newStart.toISOString().split('T')[0],
      end: newEnd.toISOString().split('T')[0],
    });
  };

  const groupedData = data.reduce((acc, row) => {
    if (!acc[row.planted_commodity]) acc[row.planted_commodity] = [];
    acc[row.planted_commodity].push(row);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Button onClick={() => changeWeek(-1)}>Previous Week</Button>
        <h2>Harvest Plan ({week.start} - {week.end})</h2>
        <Button onClick={() => changeWeek(1)}>Next Week</Button>
      </div>

      <Button
        variant="contained"
        color="secondary"
        style={{ marginBottom: '20px' }}
        onClick={handleAddRow}
      >
        Add Row
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Commodity</TableCell>
              <TableCell>Ranch</TableCell>
              <TableCell>Block</TableCell>
              <TableCell>Planned Bins</TableCell>
              {['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'].map((day) => (
                <TableCell key={day}>{day}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.keys(groupedData).map((commodity) => (
              <React.Fragment key={commodity}>
                {renderCommodityRows(groupedData[commodity])}
                {getTotalsRow(groupedData[commodity])}
                {renderEmptyRow()} {/* Add empty row after totals */}
              </React.Fragment>
            ))}
            {getTotalsRow(data)}
          </TableBody>;
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: '20px' }}
        onClick={handleSave}
      >
        Save Changes
      </Button>
    </div>
  );
};

export default HarvestPlan;
