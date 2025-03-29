import React, { useState, useEffect } from 'react';
import {
    fetchData,
    editData,
    createData,
    deleteData
} from '../api/api';

import ModalForm from '../components/ModalForm';
import EditableTable from '../components/EditableTable';

import DeleteOutline from "@mui/icons-material/DeleteOutline";

import { Box, Button, IconButton } from '@mui/material';

import {DatePicker} from '@mui/x-date-pickers/DatePicker';

const endpoint = 'commodities'

const TableTestPage = () => {
    const [data, setData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentCommodity, setCurrentCommodity] = useState(null);

    const loadData = async () => {
        const data = await fetchData(endpoint);
        console.log(data);
        setData(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (updatedRow) => {
        if(!updatedRow.id) {
            // Create new commodity
            await createData(endpoint, updatedRow);
        } else {
            // Edit existing commodity
            await editData(endpoint, updatedRow.id, updatedRow);
        }
        loadData();
    }

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleDelete = async (row) => {
        await deleteData(endpoint, row.id);
        loadData();
    }

    const columns = [
        { field: 'BlockID', headerName: 'BlockID', editable: true },
        { field: 'blockName', headerName: 'BlockName', editable: true },
        { field: 'commodity', headerName: 'Commodity', editable: true },
        { field: 'variety', headerName: 'Variety', editable: true },
        { field: 'pool', headerName: 'Pool', editable: true },
        { field: 'pick_date', headerName: 'Pick Date', editable: true },
        { field: 'bin_count', headerName: 'Bin Count', editable: true },
        { field: 'location', headerName: 'Location', editable: true },
    ];

    const actions =[
        {
            label: 'Delete',
            color:'error',
            onClick: handleDelete,
            icon: <DeleteOutline />,
        },
    ]

    return (
        <div>
            <h2>Process Line Run Plan</h2>
            <Box>

            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenModal()}
                sx={{ marginBottom: 2 }}
            >
                Add Run
            </Button>
            <DatePicker
                label="Pick Date"
                value={new Date()}
                onChange={(date) => console.log(date)}
                />
            </Box>
           
            <EditableTable columns={columns} saveFunction={handleSave} actions={actions}/>
            <ModalForm
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={currentCommodity}
                modalType = 'Add/Edit Commodity'
                fields={[
                    { name: 'name', label: 'Description' },
                    { name: 'avgCtnPrice', label: 'Average Price', type: 'number' },
                    { name: 'stdCtnCost', label: 'Standard Cost', type: 'number' },
                    { name: 'packingCharge', label: 'Pack Charge', type: 'number' },
                    { name: 'profitPerBag', label: 'Profit / Bag', type: 'number' },
                    { name: 'promo', label: 'Marketing Charge', type: 'number' },
                ]}
            />
        </div>
    );
};

export default TableTestPage;
