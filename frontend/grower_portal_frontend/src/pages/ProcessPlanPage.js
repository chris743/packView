import React, { useEffect, useState } from 'react';
import { 
    fetchData,
    editData,
    createData,
    deleteData,
    saveRowOrder
} from '../api/api';

import EditableTable from '../components/EditableTable';
import { Select, MenuItem, TextField, Box } from '@mui/material';

const endpoint = "production-runs";

const ProcessPlanPage = () => {
    const [data, setData] = useState([]);
    const [blocks, setBlocks] = useState([]);

    const loadData = async () => {
        const data = await fetchData(endpoint);
        const blocks = await fetchData("blocks");
        setBlocks(blocks);
        setData(data.sort((a, b) => a.row_order - b.row_order));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (updatedRow) => {
        const payload = {
          grower_block_id: updatedRow["grower_block.block_id"] || null,  // ✅ use .id now
          "grower_block.block_id": updatedRow["grower_block.block_id"] || null,
          bins: updatedRow.bins || null,
          run_date: updatedRow.pick_date || "2025-03-28",
          location: updatedRow.location || "",
          notes: updatedRow.notes || "",
          pool: updatedRow.pool || null,
          row_order: updatedRow.row_order || null,
        };
        console.log(JSON.stringify(payload));
      
        if (!payload.bins || !payload.run_date) {
          alert("Grower block, bins, and run date are required.");
          return;
        }
      
        if (!updatedRow.id) {
          await createData(endpoint, payload);
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
        return result;
      }
      

    const flattnedData = data.map(item => flattenObject(item));
    const flattenedBlocks = blocks.map(item => flattenObject(item));

    const handleReorder = async (reorderedRows) => {
        try {
            await saveRowOrder(endpoint, reorderedRows);
            console.log('Row order saved successfully');
        } catch (error) {
            console.error('Error saving row order:', error);
        }
    }
      
    return (
        <div style={{display: "flex", width: '100%'}}>
            <div style={{flex: 3, paddingRight: '1rem'}}>
                <h1>Process Plan</h1>
                <EditableTable
                    data={flattnedData}
                    actions={[]}
                    onSave={async (updatedRow) => {
                        await handleSave(updatedRow);
                    }}
                    columns={[
                        { field: 'grower_block.ranch.grower.name', headerName: 'Grower Name', editable: false },
                        { field: 'grower_block.ranch.name', headerName: 'Ranch Name', editable: false },
                        { field: 'grower_block.planted_variety.commodity.name', headerName: 'Commodity', editable: false },
                        { field: 'grower_block.planted_variety.name', headerName: 'Variety', editable: false },
                        {
                            field: 'grower_block.block_id',
                            headerName: 'Block',
                            editable: true,
                          
                            // ✅ Show dropdown in edit mode
                            renderEditCell: (params) => {
                              const selectedId = params.value || "";
                              const selectedBlock = flattenedBlocks.find((b) => String(b.block_id) === String(selectedId));
                          
                              return (
                                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                  <Select
                                    fullWidth
                                    size="small"
                                    value={selectedId}
                                    renderValue={(value) => {
                                      const selected = flattenedBlocks.find(b => String(b.block_id) === String(value));
                                      return selected
                                        ? `${selected.block_id} — ${selected.name} — ${selected["ranch.grower.name"]}`
                                        : <em style={{ color: '#999' }}>Select a Block</em>;
                                    }}
                                    onChange={(e) => {
                                      const selected = flattenedBlocks.find((b) => b.block_id === e.target.value);
                                      if (selected) {
                                        // ✅ Update the value used for this field
                                        params.api.setEditCellValue({
                                          id: params.id,
                                          field: "grower_block.block_id",
                                          value: selected.block_id,
                                        });
                          
                                        // ✅ Update dependent fields
                                        params.api.updateRows([{
                                          ...params.row,
                                          "grower_block.block_id": selected.block_id,
                                          "grower_block.name": selected.name,
                                          "grower_block.ranch.name": selected["ranch.name"],
                                          "grower_block.ranch.grower.name": selected["ranch.grower.name"],
                                          "grower_block.planted_variety.name": selected["planted_variety.name"],
                                          "grower_block.planted_variety.commodity.name": selected["planted_variety.commodity.name"]
                                        }]);
                                      }
                                    }}
                                  >
                                    {flattenedBlocks.map((block) => (
                                      <MenuItem key={block.block_id} value={block.block_id}>
                                        {block.block_id} — {block.name} — {block["ranch.grower.name"]}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </Box>
                              );
                            }
                          },

                        { field: 'pool', headerName: 'Pool ID', editable: true },
                        {
                          field: 'pick_date',
                          headerName: 'Pick Date',
                          editable: true,
                          renderEditCell: (params) => (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                              <TextField
                                type="date"
                                value={params.value || ""}
                                onChange={(e) => {
                                  params.api.setEditCellValue({
                                    id: params.block_id,
                                    field: "pick_date",
                                    value: e.target.value,
                                  });
                                }}
                                fullWidth
                                size="small"
                              />
                            </Box>
                          )
                        },
                        { field: 'bins', headerName: 'Bins', editable: true },
                        { field: 'location', headerName: 'Location', editable: true },
                        { field: 'notes', headerName: 'Notes', editable: true }
                      ]}
                    onReorder={handleReorder}
                    blockOption = {blocks}
                />
            </div>
            <div style={{ flex: 1 }}>
                <h2>Export Needs</h2>

            </div>
        </div>
    )
}

export default ProcessPlanPage;
