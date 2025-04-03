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

import { Button, IconButton } from '@mui/material';
const endpoint = 'commodities'

const CommoditiesPage = () => {
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
        { field: 'id', headerName: 'Name', editable: true },
        { field: 'avgCtnPrice', headerName: 'Average Price', editable: true, minWidth: 120 },
        { field: 'stdCtnCost', headerName: 'Standard Cost', editable: true, minWidth: 120 },
        { field: 'packingCharge', headerName: 'Pack Charge', editable: true, minWidth: 120 },
        { field: 'profitPerBag', headerName: 'Profit / Bag', editable: true, minWidth: 120 },
        { field: 'promo', headerName: 'Marketing Charge', editable: true, minWidth: 150 },
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
            <h2>Commodities</h2>

            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenModal()}
                sx={{ marginBottom: 2 }}
            >
                Add Commodity
            </Button>
           
            <EditableTable columns={columns} data={data} saveFunction={handleSave} actions={actions}/>
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

export default CommoditiesPage;
