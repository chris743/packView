import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import ReusableTable from '../components/ReusableTable';
import ModalForm from '../components/ModalForm';
import {
    fetchData,
    editData,
    createData,
    deleteData
} from '../api/api';

const endpoint = 'commodities'

const CommoditiesPage = () => {
    const [commodities, setCommodities] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentCommodity, setCurrentCommodity] = useState(null);

    const loadCommodities = async () => {
        const data = await fetchData(endpoint);
        setCommodities(data);
    };

    useEffect(() => {
        loadCommodities();
    }, []);

    const handleOpenModal = (commodity = null) => {
        setCurrentCommodity(commodity);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentCommodity(null);
        setModalOpen(false);
    };

    const handleSave = async (data) => {
        if (currentCommodity) {
            // Edit existing commodity
            await editData(endpoint, currentCommodity.id, data);
        } else {
            // Create new commodity
            await createData(endpoint, data);
        }
        loadCommodities();
    };

    const handleDelete = async (row) => {
        await deleteData(endpoint, row.id);
        loadCommodities();
    };

    const columns = [
        { field: 'name', headerName: 'Description' },
        { field: 'avgCtnPrice', headerName: 'Average Price' },
        { field: 'stdCtnCost', headerName: 'Standard Cost' },
        { field: 'packingCharge', headerName: 'Pack Charge' },
        { field: 'profitPerBag', headerName: 'Profit / Bag' },
        { field: 'promo', headerName: 'Marketing Charge' },
    ];

    const actions = [
        {
            label: 'Edit',
            color: 'secondary',
            onClick: (row) => handleOpenModal(row),
        },
        {
            label: 'Delete',
            color: 'error',
            onClick: handleDelete,
        },
    ];

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
            <ReusableTable columns={columns} data={commodities} actions={actions} />
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
