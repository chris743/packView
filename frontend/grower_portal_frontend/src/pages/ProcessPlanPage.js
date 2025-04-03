import React, { useEffect, useState } from 'react';
import { 
    fetchData,
    editData,
    createData,
    deleteData,
    saveRowOrder
} from '../api/api';

import EditableTable from '../components/EditableTable';
import { Select, MenuItem, TextField, Box, Button, Paper, Table, TableBody, TableRow, TableData, TableCell, Autocomplete } from '@mui/material';
import Popper from "@mui/material/Popper"

const endpoint = "production-runs";

const ProcessPlanPage = () => {
    const [data, setData] = useState([]);
    const [blocks, setBlocks] = useState([]);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));


    const loadData = async () => {
        const data = await fetchData(endpoint);
        const blocks = await fetchData("blocks");
        setBlocks(blocks);
        setData(data.sort((a, b) => a.row_order - b.row_order));
    };

    useEffect(() => {
        loadData();
        const tvMode = localStorage.getItem("tvMode") === "true";
        if (!tvMode) return;

        const interval = setInterval(() => {
            console.log("refreshing")
            loadData();
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    const flattnedData = data.map(item => flattenObject(item));
    const filteredData = flattnedData.filter(item => item.run_date === selectedDate);

    const { start: weekStart, end: weekEnd } = getCurrentWeekRange();

    const weeklyData = flattnedData.filter((row) => {
        const runDate = row.run_date || row.pick_date;
        return runDate >= weekStart && runDate <= weekEnd;
    });


    const handleSave = async (updatedRow) => {
        console.log("Saving row:", updatedRow);
        const payload = {
          grower_block_id: updatedRow["grower_block.block_id"] || null,  // ✅ use .id now
          "grower_block.block_id": updatedRow["grower_block.block_id"] || null,
          bins: updatedRow.bins || null,
          run_date: selectedDate,
          pick_date: updatedRow.pick_date || null,
          location: updatedRow.location || "",
          notes: updatedRow.notes || "",
          pool: updatedRow.pool || null,
          row_order: updatedRow.row_order || null,
          run_status: updatedRow.run_status || "Not Started"
        };
        console.log(JSON.stringify(payload));
      
        if (!payload.bins || !payload.run_date) {
          alert("Grower block, bins, and run date are required.");
          return;
        }
      
        if (!updatedRow.id || updatedRow.id.toString().startsWith("temp-")) {
            const {id, ...cleaned } = payload;
            await createData(endpoint, payload);
            loadData();
        } else {
            await editData(endpoint, updatedRow.id, payload);
        }
      
        await loadData();
      };

      function flattenObject(obj, prefix = '', result = {}) {
        for (const key in obj) {
          if (
            typeof obj[key] === 'object' &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            // ✅ Add .id for related fields
            if ('id' in obj[key]) {
              result[`${prefix}${key}.id`] = obj[key].id;
            }
            flattenObject(obj[key], `${prefix}${key}.`, result);
          } else {
            result[`${prefix}${key}`] = obj[key];
          }
        }
        console.log(result);
        return result;
      }

    const handleReorder = async (reorderedRows) => {
        try {
            await saveRowOrder(endpoint, reorderedRows);
            console.log('Row order saved successfully');
        } catch (error) {
            console.error('Error saving row order:', error);
        }
    }
    const handleDelete = async (id) => {
        console.log("Deleting row with ID:", id);
        await deleteData(endpoint, id);
        loadData();
    };

    const changeDateBy = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        const iso = newDate.toISOString().slice(0, 10);
        setSelectedDate(iso);
      };

    function getCurrentWeekRange() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
        const monday = new Date(today);
        const sunday = new Date(today);
      
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
        sunday.setDate(monday.getDate() + 6);
      
        return {
          start: monday.toISOString().slice(0, 10),
          end: sunday.toISOString().slice(0, 10),
        };
      }
    const CustomPopper = (props) => (
        <Popper
          {...props}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 6],
              },
            },
          ]}
          style={{ width: 400 }} // 👈 make this whatever width you want
        />
      );
      
    const summaryByCommodity = filteredData.reduce((acc, row) => {
        const commodity = row["grower_block.variety.commodity.id"] || "Unknown";
        const bins = parseFloat(row.bins) || 0;
      
        if (!acc[commodity]) {
          acc[commodity] = 0;
        }
        acc[commodity] += bins;
      
        return acc;
      }, {});

    const weeklySummary = weeklyData.reduce((acc, row) => {
        const commodity = row["grower_block.variety.commodity.id"] || "Unknown";
        const bins = parseFloat(row.bins) || 0;
      
        if (!acc[commodity]) {
          acc[commodity] = 0;
        }
        acc[commodity] += bins;
      
        return acc;
      }, {});
      
      
      
      return (
        <>
            <div style={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
                {/* Left: Title + Date Picker */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <h1 style={{ marginBottom: "1rem" }}>Process Plan</h1>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <label>Run Date:</label>
                    <TextField
                        type="date"
                        size="small"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <Button variant="outlined" onClick={() => changeDateBy(-1)}>
                        Prev. Day
                    </Button>
                    <Button variant="outlined" onClick={() => changeDateBy(1)}>
                        Next Day
                    </Button>
                    </div>
                </div>

                {/* Right: Day & Week summaries */}
                <div style={{ display: "flex", flexDirection: "row", gap: "1rem", marginLeft: "2rem" }}>
                    {/* Day Summary */}
                    <Paper style={{ padding: "1rem", minWidth: "200px" }}>
                    <strong>Day Summary:</strong>
                    <Table size="small">
                        <TableBody>
                        {Object.entries(summaryByCommodity).map(([commodity, total]) => (
                            <TableRow key={commodity}>
                            <TableCell>{commodity}</TableCell>
                            <TableCell>{total}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </Paper>

                    {/* Week Summary */}
                    <Paper style={{ padding: "1rem", minWidth: "200px" }}>
                    <strong>Week Summary:</strong>
                    <Table size="small">
                        <TableBody>
                        {Object.entries(weeklySummary).map(([commodity, total]) => (
                            <TableRow key={commodity}>
                            <TableCell>{commodity}</TableCell>
                            <TableCell>{total}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </Paper>
                </div>
                </div>

                <EditableTable
                    data={filteredData}
                    actions={[]}
                    onSave={async (updatedRow) => {
                        await handleSave(updatedRow);
                    }}
                    onDelete={handleDelete}
                    columns={[
                        { field: 'grower_block.ranch.grower.name', headerName: 'Grower Name', editable: false, width: 200 },
                        { field: 'grower_block.name', headerName: 'Grower Name', editable: false, width: 250 },
                        { field: 'grower_block.variety.commodity.id', headerName: 'Commodity', editable: false },
                        { field: 'grower_block.variety.id', headerName: 'Variety', editable: false },
                        {
                            field: 'grower_block.block_id',
                            headerName: 'Block',
                            editable: true,
                            width: 100,
                            renderEditCell: (params) => {
                              const selectedId = params.value || "";
                              const selectedBlock = blocks.find(b => String(b.block_id) === String(selectedId));
                          
                              return (
                                <Autocomplete
                                  fullWidth
                                  size="small"
                                  options={blocks}
                                  getOptionLabel={(option) =>
                                    `${option.block_id} — ${option.name} — ${option["ranch.grower.name"]}`
                                  }
                                  value={selectedBlock || null}
                                  isOptionEqualToValue={(option, value) => option.block_id === value.block_id}
                                  slots={{
                                    popper: CustomPopper,
                                  }}
                                  onChange={(_, newValue) => {
                                    if (newValue) {
                                      params.api.setEditCellValue({
                                        id: params.id,
                                        field: "grower_block.block_id",
                                        value: newValue.block_id,
                                      });
                          
                                      // Update dependent fields
                                      params.api.updateRows([{
                                        ...params.row,
                                        "grower_block.block_id": newValue.block_id,
                                        "grower_block.name": newValue.name,
                                        "grower_block.ranch.name": newValue["ranch.name"],
                                        "grower_block.ranch.grower.name": newValue["ranch.grower.name"],
                                        "grower_block.variety.id": newValue["variety.id"],
                                        "grower_block.variety.commodity.id": newValue["variety.commodity.id"],
                                      }]);
                                    }
                                  }}
                                  renderInput={(params) => (
                                    <TextField {...params} label="Select Block" />
                                  )}
                                />
                              );
                            }
                          },

                        { field: 'pool', headerName: 'Pool ID', editable: true },
                        {
                            field: "pick_date",
                            headerName: "Pick Date",
                            editable: true,
                            renderEditCell: (params) => {
                              const value = params.value || "";
                              return (
                                <TextField
                                  type="date"
                                  value={value}
                                  onChange={(e) => {
                                    const formatted = new Date(e.target.value).toISOString().slice(0, 10);
                                    params.api.setEditCellValue({
                                      id: params.id,
                                      field: "pick_date", // must match your column field name
                                      value: formatted,
                                    }); // <-- optional 2nd param can be used
                                  }}
                                  size="small"
                                  fullWidth
                                />
                              );
                            }
                          },
                        { field: 'bins', headerName: 'Bins', editable: true },
                        { field: 'location', headerName: 'Location', editable: true },
                        {
                            field: "run_status",
                            headerName: "Status",
                            editable: true,
                            width: 160,
                            renderCell: (params) => {
                              const value = params.value;
                              const dotStyle = {
                                height: 10,
                                width: 10,
                                borderRadius: "50%",
                                display: "inline-block",
                                marginRight: 8,
                              };
                          
                              const getStatusIcon = () => {
                                switch (value) {
                                  case "In process":
                                    return <span style={{ ...dotStyle, backgroundColor: "green" }} />;
                                  case "Hold":
                                    return <span style={{ ...dotStyle, backgroundColor: "red" }} />;
                                  case "Complete":
                                    return (
                                      <span style={{ color: "green", marginRight: 8 }}>
                                        ✅
                                      </span>
                                    );
                                  default:
                                    return <span style={{ ...dotStyle, backgroundColor: "gray" }} />;
                                }
                              };
                          
                              return (
                                <span>
                                  {getStatusIcon()}
                                  {value || "Not started"}
                                </span>
                              );
                            },
                            renderEditCell: (params) => (
                              <Select
                                value={params.value || "Not started"}
                                fullWidth
                                size="small"
                                onChange={(e) => {
                                  params.api.setEditCellValue({
                                    id: params.id,
                                    field: "run_status",
                                    value: e.target.value,
                                  });
                                }}
                              >
                                <MenuItem value="Not started">Not started</MenuItem>
                                <MenuItem value="In process">In process</MenuItem>
                                <MenuItem value="Hold">Hold</MenuItem>
                                <MenuItem value="Complete">Complete</MenuItem>
                              </Select>
                            ),
                          },
                          { field: 'notes', headerName: 'Notes', editable: true }
                      ]}
                    onReorder={handleReorder}
                    blockOption = {blocks}
                />
        </>
    
    )
}

export default ProcessPlanPage;
