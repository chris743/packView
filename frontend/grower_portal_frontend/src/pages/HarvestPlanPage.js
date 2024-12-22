import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button } from '@mui/material';
import { fetchData, editData } from '../api/api';

const getCurrentWeek = () => {
  const today = new Date();
  const start = new Date(today.setDate(today.getDate() - today.getDay()));
  const end = new Date(today.setDate(today.getDate() + 6));
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

const HarvestPlan = () => {
  const [data, setData] = useState([]);
  const [week, setWeek] = useState(getCurrentWeek());
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    loadData();
    loadBlocks();
  }, [week]);

  const loadData = async () => {
    try {
      const result = await fetchData(`planned-harvests?week=${week.start}`);
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const loadBlocks = async () => {
    try {
      const result = await fetchData('blocks');
      setBlocks(result);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleEdit = (rowIndex, field, value) => {
    console.log("value changed");
    const updatedData = [...data];
    
    // Update the selected field
    updatedData[rowIndex][field] = value;
  
    // Automatically update commodity and ranch when block is selected
    if (field === 'block') {
      const selectedBlock = blocks.find((b) => b.block_id === value);
      if (selectedBlock) {
        updatedData[rowIndex].commodity = selectedBlock.planted_commodity?.name || '';
        updatedData[rowIndex].ranch = selectedBlock.ranch?.name || '';
      } else {
        updatedData[rowIndex].commodity = '';
        updatedData[rowIndex].ranch = '';
      }
    }
  
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
    return commodityData.map((block, index) => (
      <TableRow key={index}>
        <TableCell>{block.commodity}</TableCell>
        <TableCell>{block.ranch}</TableCell>
        <TableCell>
          <Select
            value={block.block || ''}
            onChange={(e) => handleEdit(index, 'block', e.target.value)}
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
            value={block.planned_bins}
            onChange={(e) => handleEdit(index, 'planned_bins', e.target.value)}
          />
        </TableCell>
        {['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'].map((day) => (
          <TableCell key={day}>
            <TextField
              type="number"
              value={block.days[day] || ''}
              onChange={(e) => handleEdit(index, day, e.target.value)}
            />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

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
      <TableRow style={{ fontWeight: 'bold' }}>
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
    if (!acc[row.commodity]) acc[row.commodity] = [];
    acc[row.commodity].push(row);
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
                <TableRow>
                  <TableCell colSpan={10} style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {commodity}
                  </TableCell>
                </TableRow>
                {renderCommodityRows(groupedData[commodity])}
                {getTotalsRow(groupedData[commodity])}
              </React.Fragment>
            ))}
            {getTotalsRow(data)}
          </TableBody>
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
